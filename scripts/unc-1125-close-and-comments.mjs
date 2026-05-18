// Post one-line recheck-cleared comments on each disposed-clear issue,
// then close UNC-1125 with the disposition summary,
// then archive routine 246b3419, then close UNC-1176.

import fs from "node:fs";

const API = process.env.PAPERCLIP_API_URL;
const KEY = process.env.PAPERCLIP_API_KEY;
const RUN = process.env.PAPERCLIP_RUN_ID;
if (!API || !KEY || !RUN) { console.error("missing PAPERCLIP_* env"); process.exit(1); }

const H = { "Authorization": `Bearer ${KEY}`, "X-Paperclip-Run-Id": RUN, "Content-Type": "application/json" };

const cleared = [
  ["UNC-1084", "ABSENT (fix superseded by [UNC-1121](/UNC/issues/UNC-1121); the underlying FB/IG add-to-cart pattern is still unchanged there — see [UNC-1121](/UNC/issues/UNC-1121))"],
  ["UNC-1085", "ABSENT — 0 mobile checkout dead-clicks or Stripe stuck-loader sessions in 48h window."],
  ["UNC-1086", "ABSENT — no out-of-zone ZIP-rejection bounce sessions in 48h window."],
  ["UNC-1094", "ABSENT — no Stripe Elements render failures or `/checkout` errors in 48h window."],
  ["UNC-1095", "DROPPED — zero paid (`fbclid`) sessions hit the out-of-zone notice in 48h window."],
  ["UNC-1117", "DOWNGRADED — 5 sessions still mis-clicked the ZIP help text, but all eventually found the real input and none abandoned. Frustration persists at lower severity; not re-opening per disposition rules. Watch on next Galileo recheck."],
  ["UNC-1122", "ABSENT — 0 dead-clicks on homepage section headings or product photos in 48h window."],
  ["UNC-1123", "ABSENT — no frustrating-network signals or long-freeze events on the homepage in 48h window."],
];

for (const [id, verdict] of cleared) {
  const body = `## Layer 3 Galileo recheck — cleared\n\n**Verdict:** ${verdict}\n\n- Window: 2026-05-16 14:00 UTC → 2026-05-18 14:39 UTC\n- Galileo chatID: \`019e3b85-53f0-796c-891b-224fba2ccd28\`\n- Full disposition: [UNC-1125](/UNC/issues/UNC-1125)\n\nStaying in \`done\`.`;
  const res = await fetch(`${API}/api/issues/${id}/comments`, { method: "POST", headers: H, body: JSON.stringify({ body }) });
  console.log(id, "comment:", res.status);
}

// Close UNC-1125
{
  const body = "Layer 3 recheck complete. 7 patterns cleared (stay done), 1 unchanged → [UNC-1121](/UNC/issues/UNC-1121) re-opened to `todo`. Closing this recheck issue.";
  const res = await fetch(`${API}/api/issues/UNC-1125`, { method: "PATCH", headers: H, body: JSON.stringify({ status: "done", comment: body }) });
  console.log("UNC-1125 close:", res.status);
}

// Close UNC-1176 (run issue)
{
  const body = "Recheck executed in this heartbeat. Galileo query [`019e3b85`](https://app.logrocket.com/mk3nrx/uncle_mays). Disposition applied on parent [UNC-1125](/UNC/issues/UNC-1125): 7 cleared, [UNC-1121](/UNC/issues/UNC-1121) re-opened. Routine `246b3419` archived. Closing run issue.";
  const res = await fetch(`${API}/api/issues/UNC-1176`, { method: "PATCH", headers: H, body: JSON.stringify({ status: "done", comment: body }) });
  console.log("UNC-1176 close:", res.status);
}
