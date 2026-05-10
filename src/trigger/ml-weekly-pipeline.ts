/**
 * ml-weekly-pipeline — Trigger.dev scheduled task
 *
 * Full pipeline run every Sunday at 2am CT (8am UTC / CST offset).
 * Order: ingest all sources → rebuild conversion_v2 parquet → dbt run
 *
 * Designed to run in `trigger dev` (local) mode where the Python/dbt
 * environment is available alongside the TypeScript worker.
 *
 * Manual trigger: use the Trigger.dev dashboard or `trigger run ml-weekly-pipeline`.
 */

import { schedules, task } from "@trigger.dev/sdk/v3";
import { spawnSync, SpawnSyncReturns } from "child_process";

const WEBSITE_ROOT = process.cwd();
const ML_ROOT = `${WEBSITE_ROOT}/ml`;
const DBT_PROJECT = `${ML_ROOT}/dbt/uncle_mays`;

interface StepResult {
  step: string;
  ok: boolean;
  durationMs: number;
  output: string;
}

function runCmd(
  cmd: string,
  args: string[],
  opts: { cwd?: string; timeoutMs?: number } = {}
): { ok: boolean; output: string; durationMs: number } {
  const t0 = Date.now();
  const result: SpawnSyncReturns<string> = spawnSync(cmd, args, {
    cwd: opts.cwd ?? WEBSITE_ROOT,
    encoding: "utf-8",
    timeout: opts.timeoutMs ?? 600_000,
    shell: process.platform === "win32",
    env: { ...process.env },
  });

  const output = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
  const durationMs = Date.now() - t0;
  const ok = result.status === 0 && !result.error;

  if (ok) {
    console.log(`[ml-weekly-pipeline] OK (${durationMs}ms): ${cmd} ${args.join(" ")}`);
  } else {
    console.error(`[ml-weekly-pipeline] FAIL (${durationMs}ms): ${cmd} ${args.join(" ")}`);
    console.error(output || result.error?.message);
  }

  return { ok, output, durationMs };
}

/** Verify Python environment is reachable before doing real work. */
function checkPython(): boolean {
  const r = spawnSync("python", ["-c", "import ml.ingest._common; print('ok')"], {
    cwd: WEBSITE_ROOT,
    encoding: "utf-8",
    shell: process.platform === "win32",
    env: { ...process.env },
  });
  return r.status === 0;
}

/** Run the full ingest + dataset build via run_pipeline.py */
async function runIngestAndParquet(): Promise<StepResult[]> {
  const steps: StepResult[] = [];

  // Full pipeline (all sources except slow/quota-heavy ones on weekly cadence)
  const r = runCmd(
    "python",
    [
      "-m",
      "ml.run_pipeline",
      // Apollo pulls ~3k contacts; keep it on the weekly run.
      // BigQuery GA4 uses API quota; include weekly.
    ],
    { timeoutMs: 900_000 } // 15 min for full ingest
  );
  steps.push({ step: "run_pipeline", ...r });

  return steps;
}

/** Run dbt in the uncle_mays project directory. */
async function runDbt(): Promise<StepResult[]> {
  const steps: StepResult[] = [];

  // dbt deps first (idempotent; ensures packages are up-to-date)
  const deps = runCmd("dbt", ["deps"], { cwd: DBT_PROJECT, timeoutMs: 120_000 });
  steps.push({ step: "dbt_deps", ...deps });

  if (!deps.ok) {
    // dbt deps failure is non-fatal — packages may already be installed.
    console.warn("[ml-weekly-pipeline] dbt deps failed (non-fatal); continuing to dbt run.");
  }

  const run = runCmd("dbt", ["run", "--profiles-dir", ML_ROOT + "/dbt"], {
    cwd: DBT_PROJECT,
    timeoutMs: 600_000, // 10 min
  });
  steps.push({ step: "dbt_run", ...run });

  if (run.ok) {
    // Run dbt test after successful run.
    const test = runCmd("dbt", ["test", "--profiles-dir", ML_ROOT + "/dbt"], {
      cwd: DBT_PROJECT,
      timeoutMs: 300_000,
    });
    steps.push({ step: "dbt_test", ...test });
  }

  return steps;
}

// ---------------------------------------------------------------------------
// Scheduled task: every Sunday at 2am CT = 0 8 * * 0 (UTC, CST offset)
// When daylight saving is in effect (CDT = UTC-5) this fires at 3am CDT,
// which is acceptable. Adjust to "0 7 * * 0" in summer if precision matters.
// ---------------------------------------------------------------------------
export const mlWeeklyPipeline = schedules.task({
  id: "ml-weekly-pipeline",
  /** Sunday 2am CT (CST = UTC-6 → 8am UTC). */
  cron: "0 8 * * 0",
  /** Full pipeline can take up to 25 min. */
  maxDuration: 1800,

  run: async () => {
    const runStart = Date.now();
    console.log(`[ml-weekly-pipeline] Starting full weekly pipeline at ${new Date().toISOString()}`);

    if (!checkPython()) {
      throw new Error(
        "Python environment not available — task must run in `trigger dev` local mode."
      );
    }

    const allSteps: StepResult[] = [];
    let pipelineFailed = false;

    // Step 1: Ingest all sources + rebuild conversion_v2 parquet
    console.log("[ml-weekly-pipeline] Phase 1: ingest + parquet rebuild");
    const ingestSteps = await runIngestAndParquet();
    allSteps.push(...ingestSteps);

    const ingestOk = ingestSteps.every((s) => s.ok || s.step === "checkout_store");
    if (!ingestOk) {
      console.error("[ml-weekly-pipeline] Ingest/parquet phase failed. Skipping dbt.");
      pipelineFailed = true;
    }

    // Step 2: dbt run (only if ingest succeeded)
    if (!pipelineFailed) {
      console.log("[ml-weekly-pipeline] Phase 2: dbt run");
      const dbtSteps = await runDbt();
      allSteps.push(...dbtSteps);

      const dbtRunStep = dbtSteps.find((s) => s.step === "dbt_run");
      if (dbtRunStep && !dbtRunStep.ok) {
        pipelineFailed = true;
      }
    }

    const totalMs = Date.now() - runStart;
    const summary = {
      success: !pipelineFailed,
      totalDurationMs: totalMs,
      completedAt: new Date().toISOString(),
      steps: allSteps.map((s) => ({
        step: s.step,
        ok: s.ok,
        durationMs: s.durationMs,
      })),
    };

    console.log(
      `[ml-weekly-pipeline] Finished in ${(totalMs / 1000).toFixed(1)}s. ` +
        `Success: ${summary.success}. Steps: ${allSteps.map((s) => `${s.step}=${s.ok ? "OK" : "FAIL"}`).join(", ")}`
    );

    if (pipelineFailed) {
      throw new Error(
        `Weekly pipeline failed. Check step logs. Steps: ${allSteps
          .filter((s) => !s.ok)
          .map((s) => s.step)
          .join(", ")}`
      );
    }

    return summary;
  },
});

// ---------------------------------------------------------------------------
// Manual backfill task — trigger via dashboard for ad-hoc full pipeline runs.
// ---------------------------------------------------------------------------
export const mlPipelineBackfill = task({
  id: "ml-pipeline-backfill",
  maxDuration: 1800,

  run: async (payload?: { skipDbt?: boolean; skipApollo?: boolean; skipBq?: boolean }) => {
    if (!checkPython()) {
      throw new Error("Python environment not available — run in `trigger dev` local mode.");
    }

    const { skipDbt = false, skipApollo = false, skipBq = false } = payload ?? {};

    const pipelineArgs = ["-m", "ml.run_pipeline"];
    if (skipApollo) pipelineArgs.push("--skip-apollo");
    if (skipBq) pipelineArgs.push("--skip-bq");

    const ingest = runCmd("python", pipelineArgs, { timeoutMs: 900_000 });

    if (!ingest.ok) {
      throw new Error("Ingest/parquet phase failed — check logs.");
    }

    if (skipDbt) {
      return { success: true, skippedDbt: true };
    }

    const dbtSteps = await runDbt();
    const dbtOk = dbtSteps.find((s) => s.step === "dbt_run")?.ok ?? false;
    if (!dbtOk) {
      throw new Error("dbt run failed — check logs.");
    }

    return {
      success: true,
      dbtSteps: dbtSteps.map((s) => ({ step: s.step, ok: s.ok })),
    };
  },
});
