/**
 * logrocket-daily-ingest — Trigger.dev scheduled task
 *
 * Runs every day at 15:00 UTC (10am CDT / 9am CST) — after the Galileo
 * daily briefing task fires at 14:00 UTC, giving Galileo time to finish
 * processing before we poll for session summaries.
 *
 * Pipeline:
 *   1. python -m ml.ingest.logrocket   — pull Galileo answers + sessions
 *   2. python -m ml.ingest.bigquery_logrocket_loader  — parquet → BQ
 *   3. python -m ml.ingest.bigquery_galileo_fix_tracking — sync fix tickets
 *
 * The task runs in `trigger dev` (local) mode where the Python venv is
 * available at WEBSITE_ROOT/ml/.venv.
 *
 * On failure: logs are in the Trigger.dev dashboard. The daily briefing email
 * still fires independently (galileo-daily-briefing.ts) — this task only
 * handles the BQ persistence layer.
 *
 * Phase 5 delivery (UNC-1217, 2026-05-19):
 *   logrocket_raw.sessions        — 0 rows (REST API 404; Galileo-derived summary TBD)
 *   logrocket_galileo.briefings   — 1 row/prompt/day, status=completed, verbatim answer
 *   logrocket_galileo.fix_tracking — 68 Galileo/LR Paperclip issues, refresh daily
 *   logrocket_galileo.briefings_with_fix_status — CTO "already fixed?" SQL view
 */

import { schedules } from "@trigger.dev/sdk/v3";
import { spawnSync } from "child_process";
import { join } from "path";

const WEBSITE_ROOT = join(__dirname, "..", "..");

function runPy(
  args: string[],
  description: string,
  timeoutMs = 900_000
): { ok: boolean; output: string; durationMs: number } {
  const t0 = Date.now();
  const result = spawnSync("python", args, {
    cwd: WEBSITE_ROOT,
    encoding: "utf-8",
    timeout: timeoutMs,
    shell: process.platform === "win32",
    env: { ...process.env },
  });

  const output = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
  const durationMs = Date.now() - t0;
  const ok = result.status === 0 && !result.error;

  if (ok) {
    console.log(`[logrocket-daily-ingest] OK (${durationMs}ms): ${description}`);
  } else {
    console.error(`[logrocket-daily-ingest] FAIL (${durationMs}ms): ${description}`);
    console.error(output || result.error?.message);
  }
  return { ok, output, durationMs };
}

export const logrocketDailyIngest = schedules.task({
  id: "logrocket-daily-ingest",
  // PAUSED 2026-05-28: LogRocket sub paused for ~2 weeks. Restore by uncommenting
  // the cron line below and redeploying Trigger. Manual trigger still works.
  // cron: "0 15 * * *",
  // Galileo polls up to 30×20s per prompt × 3 prompts = 30 min max, plus BQ writes.
  maxDuration: 3600,
  run: async () => {
    const started = Date.now();
    const results: Array<{ step: string; ok: boolean; durationMs: number; output: string }> = [];

    // Step 1: Pull Galileo answers + sessions
    const ingest = runPy(
      ["-m", "ml.ingest.logrocket"],
      "logrocket ingest (Galileo MCP + sessions)",
      2700_000 // 45 min ceiling
    );
    results.push({ step: "ingest", ...ingest });

    // Step 2: Load parquets to BigQuery
    const bqLoad = runPy(
      ["-m", "ml.ingest.bigquery_logrocket_loader"],
      "bigquery logrocket loader"
    );
    results.push({ step: "bq_load", ...bqLoad });

    // Step 3: Sync fix tracking from Paperclip
    const fixSync = runPy(
      ["-m", "ml.ingest.bigquery_galileo_fix_tracking"],
      "galileo fix tracking sync"
    );
    results.push({ step: "fix_sync", ...fixSync });

    const totalMs = Date.now() - started;
    const failed = results.filter((r) => !r.ok);

    console.log(
      `[logrocket-daily-ingest] Done in ${totalMs}ms. ` +
        `${results.length - failed.length}/${results.length} steps OK.`
    );

    if (failed.length > 0) {
      throw new Error(
        `${failed.length} step(s) failed: ${failed.map((r) => r.step).join(", ")}. ` +
          `Check Trigger.dev logs for details.`
      );
    }

    return {
      durationMs: totalMs,
      steps: results.map(({ step, ok, durationMs }) => ({ step, ok, durationMs })),
    };
  },
});
