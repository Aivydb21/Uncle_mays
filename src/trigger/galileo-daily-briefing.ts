import { schedules } from "@trigger.dev/sdk/v3";
import { askGalileo, type GalileoResult } from "../lib/galileo";
import { DAILY_BRIEFING_PROMPTS, type GalileoPrompt } from "./_galileo-prompts";
import { sendInternalAlert } from "../lib/email/resend";

/**
 * Galileo daily briefing.
 *
 * Runs every day at 07:00 America/Chicago (12:00 UTC during CDT, 13:00 UTC
 * during CST — cron expression below targets 12:00 UTC year-round so the
 * briefing lands at 07:00 CDT in summer and 06:00 CST in winter; close
 * enough for a daily report and avoids DST coordination).
 *
 * Flow:
 *   1. Ask Galileo the 3 fixed daily prompts (see _galileo-prompts.ts).
 *   2. Email the verbatim answers to Anthony via sendInternalAlert.
 *   3. Return the structured payload so it can later be journaled to
 *      BigQuery `logrocket_galileo.briefings` (Phase 5).
 *
 * No agent paraphrasing — the email body is Galileo's verbatim text. The
 * CTO Paperclip agent is the primary recipient: it triages and ships
 * LogRocket-driven fixes immediately, and soft-notifies the CRO when a
 * fix touches active marketing or advertising surfaces.
 *
 * Required env (Trigger.dev project env, NOT just Vercel):
 *   LOGROCKET_PAT      = "pat:<org>:<app>:<token>"
 *   RESEND_API_KEY     = existing
 *   RESEND_FROM_EMAIL  = existing
 *   PAPERCLIP_API_URL  = http://localhost:3100/api (or production URL)
 *   PAPERCLIP_API_KEY  = API key for creating issues
 *   PAPERCLIP_COMPANY_ID = company UUID
 *   PAPERCLIP_CTO_AGENT_ID = CTO agent UUID (3f827c01-38a9-435b-826c-64192188a8cb)
 */
export const galileoDailyBriefing = schedules.task({
  id: "galileo-daily-briefing",
  // PAUSED 2026-05-28: LogRocket sub paused for ~2 weeks. Restore by uncommenting
  // the cron line below and redeploying Trigger. Task body is intact and still
  // works on manual trigger.
  // cron: "0 14 * * *",
  // Override the project-wide 60s default. The briefing must complete and
  // post to Paperclip every day even if Galileo is slow — getting the
  // information pull is the whole point. Generous 1h ceiling per CEO
  // directive (2026-05-16: "give as much time as needed").
  maxDuration: 3600,
  run: async () => {
    const started = Date.now();

    // Run all 3 Galileo prompts in parallel so the wall time is bounded by
    // the slowest single query, not the sum. Each prompt independently
    // tolerates failure so a single Galileo error doesn't kill the briefing.
    const answers = await Promise.all(
      DAILY_BRIEFING_PROMPTS.map(async (prompt) => {
        try {
          const result = await askGalileo(prompt.text, { promptVersion: prompt.version });
          return { prompt, result };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return {
            prompt,
            result: {
              status: "error" as const,
              text: `Error querying Galileo: ${message}`,
              links: [],
              citedSessions: [],
              metricIds: [],
              rawMessages: [],
              durationMs: 0,
              promptVersion: prompt.version,
            } satisfies GalileoResult,
          };
        }
      })
    );

    const todayIso = new Date().toISOString().slice(0, 10);
    const html = renderHtml(todayIso, answers);
    const text = renderText(todayIso, answers);

    await sendInternalAlert({
      subject: `[Galileo Daily Briefing] ${todayIso} — unclemays.com`,
      html,
      text,
      tags: [
        { name: "type", value: "galileo_daily_briefing" },
        { name: "date", value: todayIso },
      ],
    });

    // Alert the CTO when any prompt did not reach a terminal answer — these
    // rows are incomplete and should not be treated as Galileo's findings.
    // `completed_no_terminal` is a *finished* run that answered via the
    // chart-builder (citedSessions + metricIds are populated) — it's a valid
    // disposition signal, not an "incomplete" failure. Only flag truly
    // unfinished runs (status === "thinking" or "error").
    const incompletePrompts = answers.filter(
      ({ result }) => result.status !== "completed" && result.status !== "completed_no_terminal"
    );
    if (incompletePrompts.length > 0) {
      const names = incompletePrompts.map(({ prompt, result }) => `${prompt.id} (${result.status})`).join(", ");
      await sendInternalAlert({
        subject: `[Galileo Alert] ${todayIso} — ${incompletePrompts.length} prompt(s) did NOT complete`,
        html: `<p>The following Galileo prompts did not reach a terminal answer on ${todayIso}:</p><ul>${incompletePrompts.map(({ prompt, result }) => `<li><strong>${prompt.id}</strong> — status: <code>${result.status}</code></li>`).join("")}</ul><p>These briefing rows contain Galileo meta-narration, not findings. The daily briefing email was sent but these sections should be disregarded until re-queried.</p>`,
        text: `Galileo alert for ${todayIso}:\n\nThe following prompts did not complete: ${names}.\n\nThese rows contain Galileo meta-narration, not findings.`,
        tags: [
          { name: "type", value: "galileo_incomplete_alert" },
          { name: "date", value: todayIso },
        ],
      });
    }

    // Create a Paperclip task for the CTO to triage and ship
    await createCtoPaperclipTask(todayIso, answers);

    return {
      date: todayIso,
      durationMs: Date.now() - started,
      answers: answers.map(({ prompt, result }) => ({
        promptId: prompt.id,
        promptVersion: prompt.version,
        status: result.status,
        text: result.text,
        links: result.links,
        chatID: result.chatID,
        queryDurationMs: result.durationMs,
      })),
    };
  },
});

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderHtml(date: string, answers: Array<{ prompt: GalileoPrompt; result: GalileoResult }>): string {
  const sections = answers
    .map(({ prompt, result }) => {
      const body = esc(result.text).replace(/\n/g, "<br>");
      const links = result.links.length
        ? `<p style="font-size:13px;color:#666;margin-top:8px">Cited links: ${result.links
            .map((u) => `<a href="${esc(u)}">${esc(u)}</a>`)
            .join(" · ")}</p>`
        : "";
      return `
        <section style="margin-bottom:28px;border-left:3px solid #2563eb;padding-left:14px">
          <h2 style="font-size:15px;margin:0 0 6px;color:#111">${esc(prompt.id)} <span style="font-weight:400;color:#666">(${esc(prompt.version)})</span></h2>
          <p style="font-size:13px;color:#444;margin:0 0 10px"><em>${esc(prompt.text)}</em></p>
          <div style="font-size:14px;color:#111;line-height:1.55">${body}</div>
          ${links}
        </section>`;
    })
    .join("\n");

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:680px;margin:0 auto">
      <h1 style="font-size:20px;color:#111;margin:0 0 6px">Galileo Daily Briefing — ${esc(date)}</h1>
      <p style="font-size:13px;color:#666;margin:0 0 24px">
        Verbatim from Galileo AI on unclemays.com. The CTO agent triages and
        ships LogRocket-driven fixes immediately; the CRO is consulted via
        soft-notify when a fix touches marketing or advertising. Do not
        paraphrase or filter — Galileo is the source of truth.
      </p>
      ${sections}
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
      <p style="font-size:12px;color:#888">
        Generated by <code>galileo-daily-briefing</code> (Trigger.dev).
        Prompts versioned in <code>src/trigger/_galileo-prompts.ts</code>.
      </p>
    </div>
  `;
}

function renderText(date: string, answers: Array<{ prompt: GalileoPrompt; result: GalileoResult }>): string {
  const sections = answers
    .map(({ prompt, result }) =>
      [
        `# ${prompt.id} (${prompt.version})`,
        `Prompt: ${prompt.text}`,
        ``,
        result.text,
        result.links.length ? `\nLinks: ${result.links.join(" ")}` : "",
      ].join("\n")
    )
    .join("\n\n---\n\n");
  return `Galileo Daily Briefing — ${date}\n\n${sections}\n`;
}

/**
 * Create a Paperclip issue for the CTO to triage the Galileo briefing and
 * ship LogRocket-driven fixes immediately.
 *
 * Failures here used to swallow silently with `console.error`, which is how
 * UNC-1336 caught 5 missing-day triage gaps (5/18, 5/21–5/24) before anyone
 * noticed. We now retry once and escalate via internal alert email when the
 * call fails, so a Paperclip-side outage never silently kills the triage
 * loop again.
 */
async function createCtoPaperclipTask(
  date: string,
  answers: Array<{ prompt: GalileoPrompt; result: GalileoResult }>
): Promise<void> {
  const apiUrl = process.env.PAPERCLIP_API_URL;
  const apiKey = process.env.PAPERCLIP_API_KEY;
  const companyId = process.env.PAPERCLIP_COMPANY_ID;
  const ctoAgentId = process.env.PAPERCLIP_CTO_AGENT_ID;

  if (!apiUrl || !apiKey || !companyId || !ctoAgentId) {
    const missing = [
      !apiUrl && "PAPERCLIP_API_URL",
      !apiKey && "PAPERCLIP_API_KEY",
      !companyId && "PAPERCLIP_COMPANY_ID",
      !ctoAgentId && "PAPERCLIP_CTO_AGENT_ID",
    ]
      .filter(Boolean)
      .join(", ");
    console.warn(
      `Skipping Paperclip task creation: env vars not configured: ${missing}`
    );
    await sendInternalAlert({
      subject: `[Galileo Briefing] ${date} — Paperclip task SKIPPED (env vars missing)`,
      html: `<p>The daily Galileo briefing ran and the briefing email was sent, but no Paperclip triage task was created because the following env vars are not configured in Trigger.dev: <code>${esc(missing)}</code>.</p><p>Triage the Galileo answers manually from this morning's briefing email until the env is fixed.</p>`,
      text: `Galileo briefing ${date}: Paperclip task SKIPPED — env vars missing: ${missing}. Triage manually from the briefing email.`,
      tags: [
        { name: "type", value: "galileo_paperclip_skip" },
        { name: "date", value: date },
      ],
    }).catch((alertErr) => console.error("sendInternalAlert (skip) failed:", alertErr));
    return;
  }

  // Build the task description with briefing summary
  const description = buildPaperclipDescription(date, answers);
  const body = JSON.stringify({
    title: `Triage Galileo Daily Briefing — ${date}`,
    description,
    assigneeAgentId: ctoAgentId,
    status: "todo",
    priority: "high",
    labels: ["galileo", "daily-briefing", "revenue-impact"],
  });

  const maxAttempts = 3;
  let lastErr = "";
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(`${apiUrl}/companies/${companyId}/issues`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body,
      });
      if (response.ok) {
        const issue = await response.json();
        console.log(`Created Paperclip task for CTO: ${issue.identifier || issue.id} (attempt ${attempt})`);
        return;
      }
      lastErr = `HTTP ${response.status}: ${await response.text().catch(() => "")}`;
    } catch (err) {
      lastErr = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    }
    if (attempt < maxAttempts) {
      // Linear backoff: 5s, 10s. Galileo briefing isn't time-critical to the
      // second; we'd rather wait than miss the task.
      await new Promise((r) => setTimeout(r, attempt * 5_000));
    }
  }

  // All attempts failed — escalate loudly so the missing-day gap is visible
  // the day it happens, not in a retrospective audit a week later.
  console.error(`Failed to create Paperclip task after ${maxAttempts} attempts: ${lastErr}`);
  try {
    await sendInternalAlert({
      subject: `[Galileo Briefing] ${date} — Paperclip task creation FAILED`,
      html: `<p>The daily Galileo briefing ran successfully and the briefing email was sent, but the CTO Paperclip task could not be created after ${maxAttempts} attempts.</p><p><strong>Last error:</strong> <code>${esc(lastErr)}</code></p><p>Likely cause: <code>PAPERCLIP_API_URL</code> (<code>${esc(apiUrl)}</code>) is not reachable from Trigger.dev's hosted workers, or the API key is rejected. Triage the Galileo answers manually from the briefing email until this is fixed.</p>`,
      text: `Galileo briefing ${date}: Paperclip task creation FAILED after ${maxAttempts} attempts. Last error: ${lastErr}. Likely cause: PAPERCLIP_API_URL (${apiUrl}) unreachable from Trigger.dev workers, or auth rejected. Triage manually from the briefing email.`,
      tags: [
        { name: "type", value: "galileo_paperclip_fail" },
        { name: "date", value: date },
      ],
    });
  } catch (alertErr) {
    // Last-ditch — at this point both Paperclip and Resend are unreachable.
    // Trigger.dev's run log will still carry the console.error trail.
    console.error("sendInternalAlert (fail) also failed:", alertErr);
  }
}

function buildPaperclipDescription(
  date: string,
  answers: Array<{ prompt: GalileoPrompt; result: GalileoResult }>
): string {
  const sections = answers
    .map(({ prompt, result }) => {
      const links = result.links.length
        ? `\n\n**Session Links:**\n${result.links.map((u) => `- ${u}`).join("\n")}`
        : "";
      // Three distinct banner cases (UNC-1383):
      //   completed              → no banner, render verbatim text
      //   completed_no_terminal  → Galileo finished but answered via charts —
      //                            surface the structured signal (sessions +
      //                            metric IDs) so the CTO can disposition
      //                            without scraping URLs from the narration
      //   thinking/error         → truly incomplete, do not act on it
      const sessionsLine = result.citedSessions.length
        ? `\n- Cited sessions: ${result.citedSessions.length}`
        : "\n- Cited sessions: 0";
      const metricsLine = result.metricIds.length
        ? `\n- Metrics built/referenced: ${result.metricIds.length} (${result.metricIds.join(", ")})`
        : "\n- Metrics built/referenced: 0";
      let statusBanner = "";
      if (result.status === "completed_no_terminal") {
        statusBanner = `\n\n> **Note:** Galileo finished without a prose answer for this prompt — it answered via the chart-builder. The narration below is meta-narration; the structured signal is:${sessionsLine}${metricsLine}\n`;
      } else if (result.status !== "completed") {
        statusBanner = `\n\n> **Warning:** Galileo did not reach a terminal answer for this prompt (status: \`${result.status}\`). The content below is incomplete — do NOT act on it as a finding. Re-run \`galileo-on-demand\` with promptId \`${prompt.id}\` when Galileo is available.\n`;
      }
      const answerBody =
        result.status === "thinking" || result.status === "error"
          ? "_(No terminal answer — Galileo timed out, errored, or is still thinking)_"
          : result.text || "_(empty)_";
      return `### ${prompt.id}\n\n**Prompt:** ${prompt.text}${statusBanner}\n\n**Galileo's Answer:**\n\n${answerBody}${links}`;
    })
    .join("\n\n---\n\n");

  return `# Galileo Daily Briefing — ${date}

You (CTO) are the primary owner of LogRocket-driven fixes. Triage the briefing below and ship immediately — no CEO or board approval required for fixes Galileo recommends.

For each issue Galileo flags:
1. **Triage** — engineering fix, copy/UX, marketing-adjacent, or no action.
2. **Ship the fix in the same turn.** Funnel and non-funnel paths both auto-ship under the LogRocket lane.
3. **Soft-notify the CRO** via a one-line Paperclip comment when the change touches \`/\`, \`/shop\`, \`/checkout/*\`, \`/order-success\`, \`/subscribe/*\`, ad-landing variants, or analytics/pixel wiring. CRO can flag/revert if it conflicts with an active campaign.
4. **Pull revenue impact yourself** when you need it: call \`galileo-on-demand\` directly. No need to route through the Decision Scientist.

Do not paraphrase Galileo's findings — cite session URLs and preserve Galileo's language in PR descriptions and any follow-up tasks.

---

${sections}

---

**Source:** \`galileo-daily-briefing\` Trigger.dev task (scheduled 12:00 UTC daily)`;
}
