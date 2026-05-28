#!/usr/bin/env node
/**
 * Pull the latest galileo-daily-briefing run from Trigger.dev for triage.
 *
 * Replaces the push-from-Trigger model (UNC-1336/UNC-1393): instead of
 * Trigger.dev posting a Paperclip issue at the end of the briefing run
 * (which fails whenever this machine is unreachable at the cron moment),
 * the CTO Paperclip routine pulls the run output and creates the triage
 * issue locally.
 *
 * Uses the Trigger.dev v3 REST API directly (not the SDK) because the SDK
 * trips a libuv assertion on Windows clean exit (Node 22 + @trigger.dev/sdk v3).
 *
 * Reads TRIGGER_SECRET_KEY from process env or um_website/.env.
 *
 * Output: JSON to stdout with shape:
 *   {
 *     "run": { "id", "status", "createdAt", "finishedAt", "taskIdentifier" },
 *     "briefingDate": "YYYY-MM-DD",
 *     "answers": [ ...verbatim Galileo answers from the run output ],
 *     "durationMs": number
 *   }
 *
 * Exit codes (consumers should also validate stdout is JSON-parseable):
 *   0 — found a completed run, output JSON
 *   2 — no completed run in the lookback window
 *   3 — auth / network / API error
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

function loadDotenv() {
  if (process.env.TRIGGER_SECRET_KEY) return;
  const candidates = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "..", "um_website", ".env"),
    "C:/Users/Anthony/Desktop/um_website/.env",
  ];
  for (const file of candidates) {
    if (!existsSync(file)) continue;
    const body = readFileSync(file, "utf8");
    for (const line of body.split(/\r?\n/)) {
      const m = line.match(/^TRIGGER_SECRET_KEY=(.+)$/);
      if (m) {
        process.env.TRIGGER_SECRET_KEY = m[1].trim();
        return;
      }
    }
  }
}

loadDotenv();
const SECRET = process.env.TRIGGER_SECRET_KEY;
if (!SECRET) {
  console.error("TRIGGER_SECRET_KEY not set in env or um_website/.env");
  process.exit(3);
}

const API = process.env.TRIGGER_API_URL || "https://api.trigger.dev";
const lookbackHours = Number(process.env.LOOKBACK_HOURS || 48);
const sinceMs = Date.now() - lookbackHours * 3600 * 1000;

async function api(pathSuffix) {
  const url = `${API}${pathSuffix}`;
  if (process.env.DEBUG) console.error("[debug] GET", url);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${SECRET}` },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Trigger API ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

try {
  // v3 runs list: filter by task identifier and status.
  // https://trigger.dev/docs/management/runs/list
  const params = new URLSearchParams({
    "filter[taskIdentifier]": "galileo-daily-briefing",
    "filter[status]": "COMPLETED",
    "page[size]": "10",
  });
  const list = await api(`/api/v1/runs?${params.toString()}`);
  const all = list?.data || [];
  const recent = all.filter((r) => {
    const t = new Date(r.createdAt).getTime();
    return Number.isFinite(t) && t >= sinceMs;
  });

  if (recent.length === 0) {
    console.error(
      `No completed galileo-daily-briefing runs in the last ${lookbackHours}h (saw ${all.length} total in latest page).`
    );
    process.exit(2);
  }

  recent.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const latestStub = recent[0];

  // Hydrate full run to get output payload.
  // Retrieve detail uses /api/v3 (Trigger.dev split paths: list=v1, retrieve=v3).
  const full = await api(`/api/v3/runs/${latestStub.id}`);
  const output = full.output || {};

  const payload = {
    run: {
      id: full.id,
      status: full.status,
      createdAt: full.createdAt,
      finishedAt: full.finishedAt,
      taskIdentifier: full.taskIdentifier,
    },
    briefingDate:
      output.date || new Date(full.createdAt).toISOString().slice(0, 10),
    durationMs: output.durationMs,
    answers: output.answers || [],
  };

  process.stdout.write(JSON.stringify(payload, null, 2) + "\n");
  process.exit(0);
} catch (err) {
  console.error("trigger api error:", err?.message || err);
  process.exit(3);
}
