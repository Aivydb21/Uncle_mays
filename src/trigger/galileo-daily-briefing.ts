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
  // 14:00 UTC daily — ~09:00 CDT (summer) / 08:00 CST (winter). Shifted from
  // 12:00 UTC on 2026-05-16 so the Tailscale-hosted Paperclip API is up when
  // the briefing posts the CTO task.
  cron: "0 14 * * *",
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
              rawMessages: [],
              durationMs: 0,
              promptVersion: prompt.version,
            },
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
    console.warn(
      "Skipping Paperclip task creation: PAPERCLIP_* env vars not fully configured"
    );
    return;
  }

  // Build the task description with briefing summary
  const description = buildPaperclipDescription(date, answers);

  try {
    const response = await fetch(`${apiUrl}/companies/${companyId}/issues`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: `Triage Galileo Daily Briefing — ${date}`,
        description,
        assigneeAgentId: ctoAgentId,
        status: "todo",
        priority: "high",
        labels: ["galileo", "daily-briefing", "revenue-impact"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error(
        `Failed to create Paperclip task for CTO: ${response.status} ${errorText}`
      );
    } else {
      const issue = await response.json();
      console.log(`Created Paperclip task for CTO: ${issue.identifier || issue.id}`);
    }
  } catch (err) {
    console.error(`Error creating Paperclip task:`, err);
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
      return `### ${prompt.id}\n\n**Prompt:** ${prompt.text}\n\n**Galileo's Answer:**\n\n${result.text}${links}`;
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
