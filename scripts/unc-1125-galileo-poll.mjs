// Poll an in-flight Galileo chat by chatID, with retry on transient socket errors.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const cfg = JSON.parse(fs.readFileSync(path.join(os.homedir(), ".claude", "logrocket-config.json"), "utf8"));
const PAT = cfg.pat;
const MCP_URL = cfg.mcp_url || "https://mcp.logrocket.com/mcp";
const chatID = process.argv[2];
if (!chatID) {
  console.error("usage: node unc-1125-galileo-poll.mjs <chatID>");
  process.exit(1);
}

const query = "LAYER-3 RECHECK (UNC-1125, May 15-16 LogRocket fix batch).";

async function mcpCallRetry(params, requestId, attempts = 4) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(MCP_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAT}`,
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
          Connection: "close",
        },
        body: JSON.stringify({ jsonrpc: "2.0", id: requestId, method: "tools/call", params }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text().catch(() => "")}`);
      const raw = await res.text();
      const dataLines = raw.split("\n").filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim()).filter(Boolean);
      if (dataLines.length === 0) return JSON.parse(raw);
      return JSON.parse(dataLines[dataLines.length - 1]);
    } catch (e) {
      lastErr = e;
      console.log(`  retry ${i + 1}/${attempts} after error:`, e.message || e);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  throw lastErr;
}

function extract(envelope) {
  const content = envelope.result?.content ?? [];
  let text = "";
  let status;
  let chat = envelope.result?.chatID;
  for (const item of content) {
    if (item.type !== "text" || typeof item.text !== "string") continue;
    let parsed;
    try { parsed = JSON.parse(item.text); } catch { text = (text ? text + "\n\n" : "") + item.text; continue; }
    if (parsed.status === "completed" || parsed.status === "thinking") status = parsed.status;
    if (parsed.chatID) chat = parsed.chatID;
    if (Array.isArray(parsed.messages)) {
      for (const m of parsed.messages) {
        const body = m.messageContent ?? m.text ?? m.content;
        if (body) text = (text ? text + "\n\n" : "") + body;
      }
    } else if (parsed.text) {
      text = (text ? text + "\n\n" : "") + parsed.text;
    }
  }
  return { text, status, chat };
}

let text = "";
let status = "thinking";
let cid = chatID;
const MAX_POLLS = 30;
const POLL_INTERVAL_MS = 20_000;

for (let polls = 1; polls <= MAX_POLLS && status === "thinking"; polls++) {
  await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  console.log(`poll ${polls}...`);
  let env;
  try {
    env = await mcpCallRetry({ name: "use_logrocket", arguments: { query, chatID: cid, pollForResult: true } }, polls + 100);
  } catch (e) {
    console.error("fatal poll error:", e.message || e);
    break;
  }
  if (env.error) { console.error("MCP error:", env.error); break; }
  const step = extract(env);
  if (step.text) text = (text ? text + "\n\n" : "") + step.text;
  if (step.status) status = step.status;
  if (step.chat) cid = step.chat;
  console.log("  status:", status, "text len:", text.length);
}

const linkRegex = /https?:\/\/[^\s)\]]+/g;
const links = [...new Set(text.match(linkRegex) ?? [])];

console.log("\n=== FINAL ===");
console.log("status:", status);
console.log("chatID:", cid);
console.log("links count:", links.length);
console.log("--- TEXT ---");
console.log(text);
console.log("--- LINKS ---");
for (const l of links) console.log(l);
