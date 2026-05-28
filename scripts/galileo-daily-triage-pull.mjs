#!/usr/bin/env node
/**
 * Galileo Daily Triage — pull-side replacement for the Trigger.dev push path.
 *
 * Background (UNC-1336, UNC-1393): the Trigger.dev `galileo-daily-briefing`
 * task previously POSTed a triage issue to Paperclip at the end of every run.
 * That direction is fragile — Trigger.dev's hosted workers cannot reliably
 * reach this machine's Tailscale Funnel, so missed days (5/18, 5/21-5/24,
 * 5/26-5/28) silently dropped or alert-emailed only.
 *
 * This script is the pull-side handler. It is invoked from inside a CTO
 * heartbeat (the `Galileo daily triage pull` routine fires once a day,
 * creating an execution issue assigned to the CTO; the heartbeat shells out
 * here). It:
 *   1. Calls Trigger.dev's REST API to list completed `galileo-daily-briefing`
 *      runs in the last LOOKBACK_HOURS (default 48).
 *   2. Picks the most recent run.
 *   3. Checks Paperclip for an existing `Triage Galileo Daily Briefing —
 *      {YYYY-MM-DD}` issue for that run's briefing date.
 *   4. If absent, creates it locally with the same shape the old
 *      `createCtoPaperclipTask` block emitted (title, labels, description).
 *
 * Env required:
 *   TRIGGER_SECRET_KEY      — read from .env if not in process env
 *   PAPERCLIP_API_URL       — e.g. http://paperclip.taila8b3ff.ts.net:3100
 *   PAPERCLIP_API_KEY       — short-lived run JWT (heartbeat injects)
 *   PAPERCLIP_COMPANY_ID    — Uncle May's company UUID
 *   PAPERCLIP_CTO_AGENT_ID  — fallback only; defaults to known CTO id
 *
 * Optional:
 *   LOOKBACK_HOURS          — default 48
 *   PAPERCLIP_RUN_ID        — passed through as X-Paperclip-Run-Id audit header
 *   DRY_RUN=1               — print what would be created, do nothing
 *
 * Exit codes:
 *   0 — created a new triage issue, or the issue for that date already exists
 *   2 — no completed briefing run in the lookback window (nothing to triage)
 *   3 — auth / network / API error
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const CTO_AGENT_ID_DEFAULT = "3f827c01-38a9-435b-826c-64192188a8cb";

function loadDotenvKey(name) {
  if (process.env[name]) return;
  const candidates = [
    path.resolve(process.cwd(), ".env"),
    "C:/Users/Anthony/Desktop/um_website/.env",
  ];
  for (const file of candidates) {
    if (!existsSync(file)) continue;
    const body = readFileSync(file, "utf8");
    for (const line of body.split(/\r?\n/)) {
      const idx = line.indexOf("=");
      if (idx < 0) continue;
      if (line.slice(0, idx).trim() === name) {
        process.env[name] = line.slice(idx + 1).trim();
        return;
      }
    }
  }
}

loadDotenvKey("TRIGGER_SECRET_KEY");

const TRIGGER_SECRET = process.env.TRIGGER_SECRET_KEY;
const TRIGGER_API = process.env.TRIGGER_API_URL || "https://api.trigger.dev";
const PAPERCLIP_API = process.env.PAPERCLIP_API_URL;
const PAPERCLIP_KEY = process.env.PAPERCLIP_API_KEY;
const COMPANY_ID = process.env.PAPERCLIP_COMPANY_ID;
const CTO_AGENT_ID = process.env.PAPERCLIP_CTO_AGENT_ID || CTO_AGENT_ID_DEFAULT;
const RUN_ID = process.env.PAPERCLIP_RUN_ID;
const DRY_RUN = process.env.DRY_RUN === "1";

function fail(code, msg) {
  console.error(msg);
  process.exit(code);
}

if (!TRIGGER_SECRET) fail(3, "TRIGGER_SECRET_KEY missing");
if (!PAPERCLIP_API) fail(3, "PAPERCLIP_API_URL missing");
if (!PAPERCLIP_KEY) fail(3, "PAPERCLIP_API_KEY missing");
if (!COMPANY_ID) fail(3, "PAPERCLIP_COMPANY_ID missing");

const lookbackHours = Number(process.env.LOOKBACK_HOURS || 48);
const sinceMs = Date.now() - lookbackHours * 3600 * 1000;

async function triggerGet(p) {
  const r = await fetch(`${TRIGGER_API}${p}`, {
    headers: { Authorization: `Bearer ${TRIGGER_SECRET}` },
  });
  if (!r.ok) {
    const body = await r.text().catch(() => "");
    throw new Error(`Trigger API ${r.status} ${p}: ${body.slice(0, 200)}`);
  }
  return r.json();
}

async function paperclip(method, p, body) {
  const headers = {
    Authorization: `Bearer ${PAPERCLIP_KEY}`,
    "Content-Type": "application/json",
  };
  if (RUN_ID) headers["X-Paperclip-Run-Id"] = RUN_ID;
  const r = await fetch(`${PAPERCLIP_API}/api${p}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`Paperclip ${method} ${p}: ${r.status} ${txt.slice(0, 200)}`);
  }
  return r.json();
}

// ---------- Pull latest run ----------

const listParams = new URLSearchParams({
  "filter[taskIdentifier]": "galileo-daily-briefing",
  "filter[status]": "COMPLETED",
  "page[size]": "10",
});
let list;
try {
  list = await triggerGet(`/api/v1/runs?${listParams.toString()}`);
} catch (err) {
  fail(3, `Could not list Trigger runs: ${err.message}`);
}
const recent = (list?.data || []).filter((r) => {
  const t = new Date(r.createdAt).getTime();
  return Number.isFinite(t) && t >= sinceMs;
});
if (recent.length === 0) {
  fail(
    2,
    `No completed galileo-daily-briefing runs in the last ${lookbackHours}h.`
  );
}
recent.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
const latestId = recent[0].id;

let full;
try {
  // Trigger.dev split: list is /api/v1/runs, retrieve is /api/v3/runs/{id}.
  full = await triggerGet(`/api/v3/runs/${latestId}`);
} catch (err) {
  fail(3, `Could not retrieve run ${latestId}: ${err.message}`);
}
const output = full.output || {};
const briefingDate =
  output.date || new Date(full.createdAt).toISOString().slice(0, 10);
const answers = output.answers || [];

// ---------- Check for existing triage issue ----------

const wantedTitle = `Triage Galileo Daily Briefing — ${briefingDate}`;
let existing = null;
try {
  const search = await paperclip(
    "GET",
    `/companies/${COMPANY_ID}/issues?q=${encodeURIComponent(wantedTitle)}&limit=10`
  );
  const items = Array.isArray(search)
    ? search
    : search.data || search.issues || [];
  existing = items.find((i) => i.title === wantedTitle) || null;
} catch (err) {
  fail(3, `Paperclip search failed: ${err.message}`);
}

if (existing) {
  console.log(
    JSON.stringify(
      {
        result: "exists",
        briefingDate,
        runId: latestId,
        issue: { id: existing.id, identifier: existing.identifier, status: existing.status },
      },
      null,
      2
    )
  );
  process.exit(0);
}

// ---------- Build description (matches old push-side format) ----------

function buildDescription() {
  const sections = answers
    .map((a) => {
      const links = (a.links || []).length
        ? `\n\n**Session Links:**\n${a.links.map((u) => `- ${u}`).join("\n")}`
        : "";
      let banner = "";
      if (a.status === "completed_no_terminal") {
        banner = `\n\n> **Note:** Galileo finished without a prose answer for this prompt — it answered via the chart-builder. Cited sessions: ${(a.citedSessions || []).length || 0}. Metrics referenced: ${(a.metricIds || []).length || 0}.\n`;
      } else if (a.status !== "completed") {
        banner = `\n\n> **Warning:** Galileo did not reach a terminal answer for this prompt (status: \`${a.status}\`). Do NOT act on the content below as a finding. Re-run \`galileo-on-demand\` with promptId \`${a.promptId}\` when Galileo is available.\n`;
      }
      const body =
        a.status === "thinking" || a.status === "error"
          ? "_(No terminal answer — Galileo timed out, errored, or is still thinking)_"
          : a.text || "_(empty)_";
      return `### ${a.promptId}\n${banner}\n**Galileo's Answer:**\n\n${body}${links}`;
    })
    .join("\n\n---\n\n");

  return `# Galileo Daily Briefing — ${briefingDate}

You (CTO) are the primary owner of LogRocket-driven fixes. Triage the briefing below and ship immediately — no CEO or board approval required for fixes Galileo recommends.

For each issue Galileo flags:
1. **Triage** — engineering fix, copy/UX, marketing-adjacent, or no action.
2. **Ship the fix in the same turn.** Funnel and non-funnel paths both auto-ship under the LogRocket lane.
3. **Soft-notify the CRO** via a one-line Paperclip comment when the change touches \`/\`, \`/shop\`, \`/checkout/*\`, \`/order-success\`, \`/subscribe/*\`, ad-landing variants, or analytics/pixel wiring.
4. **Pull revenue impact yourself** when you need it: call \`galileo-on-demand\` directly.

Do not paraphrase Galileo's findings — cite session URLs and preserve Galileo's language in PR descriptions and any follow-up tasks.

---

${sections}

---

**Source:** \`galileo-daily-briefing\` Trigger.dev run [\`${latestId}\`] — pulled by \`galileo-daily-triage-pull.mjs\` per [UNC-1393](/UNC/issues/UNC-1393).`;
}

const payload = {
  title: wantedTitle,
  description: buildDescription(),
  assigneeAgentId: CTO_AGENT_ID,
  status: "todo",
  priority: "high",
  labels: ["galileo", "daily-briefing", "revenue-impact"],
};

if (DRY_RUN) {
  console.log(
    JSON.stringify(
      {
        result: "dry_run",
        briefingDate,
        runId: latestId,
        titleWouldBe: wantedTitle,
        descriptionBytes: payload.description.length,
        answerStatuses: answers.map((a) => `${a.promptId}:${a.status}`),
      },
      null,
      2
    )
  );
  process.exit(0);
}

let created;
try {
  created = await paperclip("POST", `/companies/${COMPANY_ID}/issues`, payload);
} catch (err) {
  fail(3, `Paperclip create failed: ${err.message}`);
}

console.log(
  JSON.stringify(
    {
      result: "created",
      briefingDate,
      runId: latestId,
      issue: {
        id: created.id,
        identifier: created.identifier,
        status: created.status,
      },
    },
    null,
    2
  )
);
process.exit(0);
