// One-shot Galileo Layer 3 recheck for UNC-1125 (May 15-16 LogRocket fix batch).
// Runs galileo-on-demand once with a consolidated query covering all 9 patterns.
// Output is printed for the CTO to attach to the recheck issue.

import { tasks, runs, configure } from "@trigger.dev/sdk/v3";

const SECRET = process.env.TRIGGER_SECRET_KEY;
if (!SECRET) {
  console.error("TRIGGER_SECRET_KEY missing");
  process.exit(1);
}

configure({ secretKey: SECRET });

const query = `
LAYER-3 RECHECK (UNC-1125, May 15-16 LogRocket fix batch).

For unclemays.com in the **last 48 hours** (since 2026-05-16 14:00 UTC), evaluate each
of the previously flagged frustration patterns below. For each pattern, classify it
as ABSENT, DROPPED, DOWNGRADED, UNCHANGED, or RISING vs the original flagging window
(2026-05-15 / 2026-05-16). Cite a representative session URL or chat link for any
pattern that is still present.

Patterns:
1. Add-to-cart silently failing inside FB/IG in-app browsers (UNC-1084 / UNC-1121).
2. Mobile checkout dead-click + Stripe stuck loader on /checkout (UNC-1085).
3. NYC user adds many items then bounces on ZIP rejection — out-of-zone funnel waste (UNC-1086 / UNC-1095).
4. Blank Stripe Elements payment slot at /checkout (UNC-1094).
5. Out-of-zone paid traffic learning the delivery constraint too late (UNC-1095).
6. Dead-clicks on the "Enter a valid ZIP to see delivery cost" summary text (UNC-1117).
7. Homepage dead-taps on section headings + product photos (UNC-1122).
8. 20-minute frozen homepage caused by Airtable upstream hang (UNC-1123).

For each: one line — pattern name, status verdict, and (if still present) a session URL.
Conclude with one sentence: overall, did the May 15-16 fix batch land?
`.trim();

const handle = await tasks.trigger("galileo-on-demand", {
  query,
  originatingAgentId: "3f827c01-38a9-435b-826c-64192188a8cb",
  originatingTaskId: "UNC-1125",
});

console.log("Triggered run:", handle.id);
console.log("Polling for completion (max 6 min)...");

const deadline = Date.now() + 6 * 60_000;
let last;
while (Date.now() < deadline) {
  const r = await runs.retrieve(handle.id);
  last = r;
  if (["COMPLETED", "FAILED", "CANCELED", "CRASHED", "SYSTEM_FAILURE", "TIMED_OUT"].includes(r.status)) {
    break;
  }
  await new Promise((res) => setTimeout(res, 5000));
}

console.log("Final status:", last?.status);
console.log("=== OUTPUT ===");
console.log(JSON.stringify(last?.output, null, 2));
