/**
 * ml-freshness-alert — Trigger.dev scheduled task
 *
 * Runs every 6 hours in `trigger dev` local mode (requires Python).
 * Checks ml/data/raw/ parquet mtimes via ml.ingest.freshness_check,
 * sends a Gmail alert if any source exceeds its staleness threshold.
 *
 * Suppression: re-alerts at most once per 24h for the same set of stale sources.
 * State file: ml/data/freshness_alert_state.json
 */

import { schedules } from "@trigger.dev/sdk/v3";
import { spawnSync } from "child_process";
import { join } from "path";
import { readFileSync, writeFileSync, existsSync } from "fs";

const WEBSITE_ROOT = join(__dirname, "..", "..");
const ML_ROOT = join(WEBSITE_ROOT, "ml");
const STATE_FILE = join(ML_ROOT, "data", "freshness_alert_state.json");
const ALERT_TO = "anthony@unclemays.com";
const RESUPPRESS_HOURS = 24;

interface FreshnessResult {
  source: string;
  last_updated: string | null;
  age_hours: number | null;
  threshold_hours: number;
  cadence: string;
  status: string;
}

interface AlertState {
  last_alert_at: string;
  stale_sources: string[];
}

function runFreshnessCheck(): { results: FreshnessResult[]; violations: FreshnessResult[] } | null {
  const r = spawnSync("python", ["-m", "ml.ingest.freshness_check", "--json"], {
    cwd: WEBSITE_ROOT,
    encoding: "utf-8",
    timeout: 30_000,
    shell: process.platform === "win32",
    env: { ...process.env },
  });
  if (r.status !== 0) {
    console.error("[ml-freshness-alert] freshness_check failed:", r.stderr || r.error?.message);
    return null;
  }
  return JSON.parse(r.stdout);
}

function loadState(): AlertState | null {
  if (!existsSync(STATE_FILE)) return null;
  try {
    return JSON.parse(readFileSync(STATE_FILE, "utf-8"));
  } catch {
    return null;
  }
}

function saveState(state: AlertState) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function isSuppressed(violations: FreshnessResult[], state: AlertState | null): boolean {
  if (!state) return false;
  const hoursSinceLast = (Date.now() - new Date(state.last_alert_at).getTime()) / 3_600_000;
  if (hoursSinceLast >= RESUPPRESS_HOURS) return false;
  const currentKeys = violations.map((v) => v.source).sort().join(",");
  const lastKeys = [...state.stale_sources].sort().join(",");
  return currentKeys === lastKeys;
}

async function getGmailAccessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GMAIL_CLIENT_ID!,
      client_secret: process.env.GMAIL_CLIENT_SECRET!,
      refresh_token: process.env.GMAIL_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  return data.access_token as string;
}

async function sendGmailAlert(accessToken: string, htmlBody: string): Promise<void> {
  const subject = "[Uncle May's] Pipeline freshness alert — stale data sources detected";
  const raw = [
    `To: ${ALERT_TO}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=utf-8",
    "",
    htmlBody,
  ].join("\r\n");

  const encoded = btoa(unescape(encodeURIComponent(raw)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ raw: encoded }),
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(`Gmail send failed: ${JSON.stringify(result)}`);
  }
}

function buildHtml(violations: FreshnessResult[], now: string): string {
  const rows = violations
    .map((v) => {
      const age = v.age_hours != null ? `${v.age_hours.toFixed(1)}h` : "—";
      const last = v.last_updated ? v.last_updated.replace("T", " ").slice(0, 16) + " UTC" : "never";
      return `<tr>
        <td style="padding:4px 8px;font-family:monospace">${v.source}</td>
        <td style="padding:4px 8px">${last}</td>
        <td style="padding:4px 8px;color:#c00;font-weight:bold">${age}</td>
        <td style="padding:4px 8px">${v.threshold_hours}h</td>
        <td style="padding:4px 8px;color:#c00;font-weight:bold">${v.status}</td>
      </tr>`;
    })
    .join("\n");

  return `<html><body style="font-family:sans-serif;color:#222">
<h2 style="color:#c00">Pipeline Freshness Alert</h2>
<p>Checked at: <strong>${now}</strong></p>
<p>${violations.length} source(s) exceeded their staleness threshold:</p>
<table border="1" cellspacing="0" style="border-collapse:collapse;font-size:13px">
  <thead style="background:#f5f5f5">
    <tr>
      <th style="padding:4px 8px">Source</th>
      <th style="padding:4px 8px">Last Updated</th>
      <th style="padding:4px 8px">Age</th>
      <th style="padding:4px 8px">Threshold</th>
      <th style="padding:4px 8px">Status</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>
<p style="margin-top:16px;font-size:12px;color:#666">
  Re-alert suppressed for ${RESUPPRESS_HOURS}h if same sources remain stale.<br>
  To recover: run <code>python -m ml.ingest.&lt;source&gt;</code> from um_website/.
</p>
</body></html>`;
}

export const mlFreshnessAlert = schedules.task({
  id: "ml-freshness-alert",
  // PAUSED 2026-05-28: schedule cap free-up during LogRocket mothball. This task
  // monitors BQ table staleness, and the logrocket_* tables it watches won't
  // refresh during the pause anyway. Restore by uncommenting the cron line
  // below and redeploying Trigger.
  // cron: "0 */6 * * *",
  maxDuration: 60,

  run: async () => {
    const now = new Date().toISOString();
    console.log(`[ml-freshness-alert] Checking pipeline freshness at ${now}`);

    if (
      spawnSync("python", ["-c", "import ml.ingest._common; print('ok')"], {
        cwd: WEBSITE_ROOT,
        encoding: "utf-8",
        shell: process.platform === "win32",
        env: { ...process.env },
      }).status !== 0
    ) {
      throw new Error("Python environment not available — task must run in `trigger dev` local mode.");
    }

    const check = runFreshnessCheck();
    if (!check) {
      throw new Error("freshness_check.py failed to produce output");
    }

    const { violations } = check;

    if (violations.length === 0) {
      console.log("[ml-freshness-alert] All sources fresh. No alert needed.");
      return { ok: true, violations: 0 };
    }

    console.log(
      `[ml-freshness-alert] ${violations.length} violation(s): ${violations.map((v) => v.source).join(", ")}`
    );

    const state = loadState();
    if (isSuppressed(violations, state)) {
      const hoursSince = ((Date.now() - new Date(state!.last_alert_at).getTime()) / 3_600_000).toFixed(1);
      console.log(`[ml-freshness-alert] Alert suppressed (same sources, last alert ${hoursSince}h ago).`);
      return { ok: true, violations: violations.length, suppressed: true };
    }

    // Send alert
    const accessToken = await getGmailAccessToken();
    await sendGmailAlert(accessToken, buildHtml(violations, now));

    saveState({ last_alert_at: now, stale_sources: violations.map((v) => v.source) });

    console.log(`[ml-freshness-alert] Alert sent to ${ALERT_TO}.`);
    return { ok: true, violations: violations.length, alerted: true };
  },
});
