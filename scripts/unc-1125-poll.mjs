// Poll the already-triggered Galileo recheck run.
import { runs, configure } from "@trigger.dev/sdk/v3";

const SECRET = process.env.TRIGGER_SECRET_KEY;
if (!SECRET) {
  console.error("TRIGGER_SECRET_KEY missing");
  process.exit(1);
}
configure({ secretKey: SECRET });

const runId = process.argv[2] || "run_cmpbb2q6w4lre0iocgj3mwp99";
const deadline = Date.now() + 10 * 60_000;
let last;
while (Date.now() < deadline) {
  last = await runs.retrieve(runId);
  console.log(new Date().toISOString(), "status:", last.status);
  if (["COMPLETED", "FAILED", "CANCELED", "CRASHED", "SYSTEM_FAILURE", "TIMED_OUT"].includes(last.status)) {
    break;
  }
  await new Promise((res) => setTimeout(res, 8000));
}

console.log("Final status:", last?.status);
console.log("=== OUTPUT ===");
console.log(JSON.stringify(last?.output, null, 2));
