/**
 * ml-parquet-rebuild — Trigger.dev task
 *
 * Runs Stripe ingest (if requested) then rebuilds the conversion_v2 parquet.
 * Designed to run in `trigger dev` (local) mode where the Python environment
 * is available alongside the TypeScript worker.
 *
 * Trigger paths:
 *   - Manually via Trigger.dev dashboard / API
 *   - From stripe-purchase-sync when new payments are detected
 *   - From ml-weekly-pipeline as part of the full Sunday run
 */

import { task } from "@trigger.dev/sdk/v3";
import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";

// Resolve relative to this file so the path is correct regardless of
// the directory trigger dev is started from (UNC-1118).
const WEBSITE_ROOT = join(__dirname, "..", "..");
const ML_ROOT = join(WEBSITE_ROOT, "ml");

export interface ParquetRebuildPayload {
  /** Re-run Stripe ingest before rebuilding. Defaults to true. */
  runStripeIngest?: boolean;
  /** Also re-run checkout_store ingest (fast; default true). */
  runCheckoutStore?: boolean;
  /** Payment intent ID that triggered this rebuild (for logging). */
  triggeredByPaymentIntentId?: string;
}

function runPy(args: string[], description: string): { ok: boolean; output: string } {
  const result = spawnSync("python", args, {
    cwd: WEBSITE_ROOT,
    encoding: "utf-8",
    timeout: 300_000, // 5 min per step
    shell: process.platform === "win32",
    env: { ...process.env },
  });

  const output = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();

  if (result.status !== 0 || result.error) {
    console.error(`[ml-parquet-rebuild] FAIL: ${description}`);
    console.error(output || result.error?.message);
    return { ok: false, output };
  }

  console.log(`[ml-parquet-rebuild] OK: ${description}`);
  if (output) console.log(output);
  return { ok: true, output };
}

export const mlParquetRebuild = task({
  id: "ml-parquet-rebuild",
  /** Parquet rebuild can take up to 5min (Stripe pull + dataset build). */
  maxDuration: 360,

  run: async (payload: ParquetRebuildPayload = {}) => {
    const {
      runStripeIngest = true,
      runCheckoutStore = true,
      triggeredByPaymentIntentId,
    } = payload;

    // Verify Python + ml package are reachable before doing real work.
    const pyCheck = spawnSync("python", ["-c", "import ml.ingest._common; print('ok')"], {
      cwd: WEBSITE_ROOT,
      encoding: "utf-8",
      shell: process.platform === "win32",
      env: { ...process.env },
    });
    if (pyCheck.status !== 0) {
      const msg =
        "Python environment not available — task must run in `trigger dev` local mode. " +
        (pyCheck.stderr?.trim() || pyCheck.error?.message || "");
      console.error(`[ml-parquet-rebuild] ${msg}`);
      throw new Error(msg);
    }

    console.log(
      `[ml-parquet-rebuild] Starting rebuild.` +
        (triggeredByPaymentIntentId
          ? ` Triggered by PI ${triggeredByPaymentIntentId}.`
          : "")
    );

    const steps: { ok: boolean; step: string; output: string }[] = [];

    if (runCheckoutStore) {
      const r = runPy(
        ["-c", "from ml.ingest import checkout_store; checkout_store.extract()"],
        "checkout_store ingest"
      );
      steps.push({ step: "checkout_store", ...r });
      if (!r.ok) {
        // Non-fatal: checkout store is a best-effort enrichment.
        console.warn("[ml-parquet-rebuild] checkout_store failed (non-fatal); continuing.");
      }
    }

    if (runStripeIngest) {
      const r = runPy(
        ["-c", "from ml.ingest import stripe as s; s.extract()"],
        "stripe ingest"
      );
      steps.push({ step: "stripe_ingest", ...r });
      if (!r.ok) {
        // Fatal: can't rebuild without fresh Stripe data.
        return { success: false, steps, error: "Stripe ingest failed" };
      }
    }

    // Build the conversion_v2 dataset.
    const build = runPy(
      ["-c", "from ml.features import build_dataset; out = build_dataset.build(); print(f'output={out}')"],
      "build_dataset (conversion_v2)"
    );
    steps.push({ step: "build_dataset", ...build });

    if (!build.ok) {
      return { success: false, steps, error: "build_dataset failed" };
    }

    // Extract output path from stdout for the return value.
    const match = build.output.match(/output=(.+\.parquet)/);
    const outputPath = match?.[1] ?? "unknown";

    console.log(`[ml-parquet-rebuild] Done. Output: ${outputPath}`);
    return { success: true, outputPath, steps };
  },
});
