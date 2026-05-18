// Direct Galileo MCP call for UNC-1125 Layer 3 recheck.
// Bypasses Trigger.dev so the long polling window (up to 10 min) is allowed.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const cfgPath = path.join(os.homedir(), ".claude", "logrocket-config.json");
const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
const PAT = cfg.pat;
const MCP_URL = cfg.mcp_url || "https://mcp.logrocket.com/mcp";

if (!PAT) {
  console.error("PAT missing in logrocket-config.json");
  process.exit(1);
}

async function mcpCall(method, params, requestId = 1) {
  const res = await fetch(MCP_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAT}`,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: requestId, method, params }),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text().catch(() => "")}`);
  }
  const raw = await res.text();
  const dataLines = raw.split("\n").filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim()).filter(Boolean);
  if (dataLines.length === 0) return JSON.parse(raw);
  return JSON.parse(dataLines[dataLines.length - 1]);
}

function extract(envelope) {
  const content = envelope.result?.content ?? [];
  let text = "";
  let status;
  let chatID = envelope.result?.chatID;
  for (const item of content) {
    if (item.type !== "text" || typeof item.text !== "string") continue;
    let parsed;
    try {
      parsed = JSON.parse(item.text);
    } catch {
      text = (text ? text + "\n\n" : "") + item.text;
      continue;
    }
    if (parsed.status === "completed" || parsed.status === "thinking") status = parsed.status;
    if (parsed.chatID) chatID = parsed.chatID;
    if (Array.isArray(parsed.messages)) {
      for (const m of parsed.messages) {
        const body = m.messageContent ?? m.text ?? m.content;
        if (body) text = (text ? text + "\n\n" : "") + body;
      }
    } else if (parsed.text) {
      text = (text ? text + "\n\n" : "") + parsed.text;
    }
  }
  return { text, status, chatID };
}

const query = `
LAYER-3 RECHECK (UNC-1125, May 15-16 LogRocket fix batch).

For unclemays.com in the last 48 hours (since ~2026-05-16 14:00 UTC), evaluate each
previously flagged frustration pattern below. For each, classify status as one of:
ABSENT / DROPPED / DOWNGRADED / UNCHANGED / RISING vs the original flagging window
(2026-05-15 and 2026-05-16). Cite a representative session URL for any pattern still present.

Patterns:
1. Add-to-cart silently failing inside FB/IG in-app browsers (UNC-1084 / UNC-1121).
2. Mobile checkout dead-click + Stripe stuck loader on /checkout (UNC-1085).
3. NYC user adds many items then bounces on ZIP rejection — out-of-zone funnel waste (UNC-1086 / UNC-1095).
4. Blank Stripe Elements payment slot at /checkout (UNC-1094).
5. Out-of-zone paid traffic learning the delivery constraint too late (UNC-1095).
6. Dead-clicks on the "Enter a valid ZIP to see delivery cost" summary text (UNC-1117).
7. Homepage dead-taps on section headings + product photos (UNC-1122).
8. 20-minute frozen homepage caused by Airtable upstream hang (UNC-1123).

For each: one short line — pattern name, status verdict, count of affected sessions in the 48h window, and (if still present) a session URL.
Finish with one sentence on whether the May 15-16 fix batch overall landed.
`.trim();

console.log("Sending Galileo query...");
const started = Date.now();
let initial = await mcpCall("tools/call", { name: "use_logrocket", arguments: { query } });
if (initial.error) {
  console.error("MCP error:", initial.error);
  process.exit(2);
}
let { text, status, chatID } = extract(initial);
console.log("initial status:", status, "chatID:", chatID);

let polls = 0;
const MAX_POLLS = 30;
while (status === "thinking" && chatID && polls < MAX_POLLS) {
  await new Promise((r) => setTimeout(r, 20_000));
  polls += 1;
  console.log(`poll ${polls}...`);
  const next = await mcpCall("tools/call", { name: "use_logrocket", arguments: { query, chatID, pollForResult: true } }, polls + 1);
  if (next.error) {
    console.error("poll error:", next.error);
    break;
  }
  const step = extract(next);
  if (step.text) text = (text ? text + "\n\n" : "") + step.text;
  if (step.status) status = step.status;
  if (step.chatID) chatID = step.chatID;
  console.log("  status:", status);
}

const linkRegex = /https?:\/\/[^\s)\]]+/g;
const links = [...new Set(text.match(linkRegex) ?? [])];
const durationMs = Date.now() - started;

console.log("\n=== FINAL ===");
console.log("status:", status);
console.log("durationMs:", durationMs);
console.log("chatID:", chatID);
console.log("links count:", links.length);
console.log("--- TEXT ---");
console.log(text);
console.log("--- LINKS ---");
for (const l of links) console.log(l);
