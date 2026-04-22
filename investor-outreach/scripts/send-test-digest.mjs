/**
 * Local test runner for morning IR digest.
 * Run from Desktop/um_website/investor-outreach:
 *   node scripts/send-test-digest.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUSINESS_ROOT = path.resolve(__dirname, "..", "..");
const SEGMENTS_DIR = path.join(BUSINESS_ROOT, "investor-outreach", "segments");
const DIGEST_TO = "anthony@unclemays.com";

const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;

async function getGmailAccessToken() {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GMAIL_CLIENT_ID,
      client_secret: GMAIL_CLIENT_SECRET,
      refresh_token: GMAIL_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("No access token: " + JSON.stringify(data));
  return data.access_token;
}

async function readActivationQueue(limit = 10) {
  const file = path.join(SEGMENTS_DIR, "activation-queue.csv");
  const raw = await fs.readFile(file, "utf8");
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length <= 1) return [];
  const header = lines[0].split(",");
  const idx = (k) => header.indexOf(k);
  return lines.slice(1, limit + 1).map((row) => {
    const cells = row.split(",");
    return {
      segment: cells[idx("segment")] ?? "",
      name: cells[idx("name")] ?? "",
      firm: cells[idx("firm")] ?? "",
      score: cells[idx("score")] ?? "",
      entry_path: cells[idx("entry_path")] ?? "",
      warm_path: cells[idx("warm_path")] ?? "",
      thesis_one_liner: cells[idx("thesis_one_liner")] ?? "",
      next_action: cells[idx("next_action")] ?? "",
    };
  });
}

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function main() {
  if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN) {
    throw new Error("Set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN");
  }

  console.log("Getting Gmail access token...");
  const accessToken = await getGmailAccessToken();
  console.log("Token obtained:", accessToken.slice(0, 20) + "...");

  console.log("Reading activation queue from:", SEGMENTS_DIR);
  const targets = await readActivationQueue(10);
  console.log("Loaded", targets.length, "activation targets");

  const isoDate = new Date().toISOString().slice(0, 10);
  const subject = `IR Briefing -- ${isoDate} -- 0 revivals, 0 warm, ${targets.length} new targets`;

  const targetsRows = targets
    .map(
      (t) =>
        `<tr>
          <td style="padding:6px;border-bottom:1px solid #eee">${escapeHtml(t.segment)}</td>
          <td style="padding:6px;border-bottom:1px solid #eee">${escapeHtml(t.score)}</td>
          <td style="padding:6px;border-bottom:1px solid #eee"><strong>${escapeHtml(t.name)}</strong></td>
          <td style="padding:6px;border-bottom:1px solid #eee">${escapeHtml(t.firm)}</td>
          <td style="padding:6px;border-bottom:1px solid #eee">${escapeHtml(t.warm_path || t.entry_path)}</td>
          <td style="padding:6px;border-bottom:1px solid #eee">${escapeHtml(t.next_action)}</td>
        </tr>`
    )
    .join("");

  const html = `<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#222;max-width:780px;margin:0 auto;padding:16px">
<h1 style="font-size:20px;margin:0 0 4px">IR Briefing -- ${isoDate}</h1>
<div style="color:#666;font-size:13px;margin-bottom:18px">
  Day 1-3 kickoff digest. First-run test from local script (confirming Gmail send + activation queue end-to-end).
  Reply APPROVE {contact_id} to authorize any outbound sends shown in future digests.
</div>

<h2 style="font-size:16px;margin-top:20px">Revive Today (0)</h2>
<p><em>No revival drafts yet. dormantThreadRevivalNow requires Gmail OAuth on Trigger.dev cloud.
Next step: set GMAIL_TOKEN env vars are confirmed working -- trigger dormantThreadRevivalNow from Trigger.dev dashboard to generate first revival drafts.</em></p>

<h2 style="font-size:16px;margin-top:20px">Warm Replies (last 24h)</h2>
<p><em>Live warm reply scan will run in tomorrows Trigger.dev-hosted digest.</em></p>

<h2 style="font-size:16px;margin-top:20px">Today's Top 10 Activation Targets</h2>
<table style="border-collapse:collapse;width:100%;font-size:13px">
  <thead><tr>
    <th style="text-align:left;padding:6px;border-bottom:1px solid #ccc">Seg</th>
    <th style="text-align:left;padding:6px;border-bottom:1px solid #ccc">Score</th>
    <th style="text-align:left;padding:6px;border-bottom:1px solid #ccc">Name</th>
    <th style="text-align:left;padding:6px;border-bottom:1px solid #ccc">Firm</th>
    <th style="text-align:left;padding:6px;border-bottom:1px solid #ccc">Entry / Warm Path</th>
    <th style="text-align:left;padding:6px;border-bottom:1px solid #ccc">Next Action</th>
  </tr></thead>
  <tbody>${targetsRows}</tbody>
</table>

<hr style="margin-top:24px;border:none;border-top:1px solid #eee">
<div style="color:#888;font-size:12px">
  Day 1-3 kickoff status: Contact files: 131 (0 lint errors). Activation queue: 131 rows (120 S3-S6).
  Firecrawl enrichment: 44 files enriched (47/150 credits used).
  Trigger.dev: deployed v20260419.1 -- morningIRDigest + dormantThreadRevival registered.
  This first digest was fired locally. Scheduled daily delivery starts tomorrow at 08:00 CT.
</div>
</body></html>`;

  console.log("Sending digest to", DIGEST_TO, "...");

  const raw = [
    `To: ${DIGEST_TO}`,
    `From: Uncle May's IR <invest@unclemays.com>`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=utf-8",
    "",
    html,
  ].join("\r\n");

  const encoded = Buffer.from(raw).toString("base64url");

  const sendRes = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw: encoded }),
    }
  );

  const result = await sendRes.json();
  if (result.id) {
    console.log("SUCCESS -- Message ID:", result.id);
    console.log("Subject:", subject);
    console.log("Sent to:", DIGEST_TO);
  } else {
    console.error("FAILED:", JSON.stringify(result, null, 2));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
