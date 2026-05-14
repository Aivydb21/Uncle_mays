import { schedules } from "@trigger.dev/sdk/v3";
import { askGalileo } from "../lib/galileo";
import { INCIDENT_PROMPT } from "./_galileo-prompts";
import { sendInternalAlert } from "../lib/email/resend";

/**
 * Galileo incident alert.
 *
 * Runs every 30 minutes to check for critical user experience issues on
 * unclemays.com. If Galileo identifies anything urgent, sends an immediate
 * email alert to Anthony and posts a Paperclip task for triage.
 *
 * Flow:
 *   1. Ask Galileo to diagnose any active incidents in the last 30 minutes.
 *   2. If Galileo flags something critical (determined by severity keywords
 *      in the response), send an immediate alert email.
 *   3. Return the structured payload for BigQuery journaling (Phase 5).
 *
 * Severity detection: We look for keywords like "critical", "urgent", "broken",
 * "failing", "blocked", "down" in Galileo's response. If none are found AND
 * the response is generic (< 200 chars), we skip alerting (no incident).
 *
 * Required env (Trigger.dev project):
 *   LOGROCKET_PAT      = "pat:<org>:<app>:<token>"
 *   RESEND_API_KEY     = existing
 *   RESEND_FROM_EMAIL  = existing
 *   PAPERCLIP_API_URL  = http://localhost:3100/api (or production URL)
 *   PAPERCLIP_COMPANY_ID = company UUID
 */
export const galileoIncidentAlert = schedules.task({
  id: "galileo-incident-alert",
  // Every 30 minutes
  cron: "*/30 * * * *",
  run: async () => {
    const started = Date.now();
    const timestamp = new Date().toISOString();

    // Query time window: last 30 minutes (matches cron interval)
    const queryWithContext = `${INCIDENT_PROMPT.text}\n\nTime window: last 30 minutes only. If there are no urgent issues, respond with "No critical incidents detected in the last 30 minutes."`;

    let result;
    try {
      result = await askGalileo(queryWithContext, {
        promptVersion: INCIDENT_PROMPT.version,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // Send alert about the monitoring failure itself
      await sendInternalAlert({
        subject: `[Galileo Alert] Monitoring system error`,
        html: `<p>The galileo-incident-alert task failed to query Galileo:</p><pre>${escapeHtml(message)}</pre><p>Timestamp: ${timestamp}</p>`,
        text: `Galileo monitoring error: ${message}\n\nTimestamp: ${timestamp}`,
        tags: [
          { name: "type", value: "galileo_incident_monitoring_error" },
          { name: "timestamp", value: timestamp },
        ],
      });
      return {
        timestamp,
        status: "monitoring_error",
        error: message,
        durationMs: Date.now() - started,
      };
    }

    // Determine severity
    const responseText = result.text.toLowerCase();
    const severityKeywords = [
      "critical",
      "urgent",
      "broken",
      "failing",
      "failed",
      "blocked",
      "down",
      "error spike",
      "high severity",
      "major issue",
      "immediately",
    ];
    const isCritical = severityKeywords.some((kw) => responseText.includes(kw));
    const isGenericNoIncident =
      result.text.length < 200 &&
      (responseText.includes("no critical incidents") ||
        responseText.includes("no urgent issues") ||
        responseText.includes("no incidents detected"));

    if (!isCritical || isGenericNoIncident) {
      // No actionable incident — log but don't alert
      return {
        timestamp,
        status: "no_incident",
        text: result.text,
        links: result.links,
        chatID: result.chatID,
        durationMs: Date.now() - started,
      };
    }

    // Critical incident detected — send alert
    const html = renderHtml(timestamp, result.text, result.links);
    const text = renderText(timestamp, result.text, result.links);

    await sendInternalAlert({
      subject: `[Galileo Alert] Critical incident detected on unclemays.com`,
      html,
      text,
      tags: [
        { name: "type", value: "galileo_incident_alert" },
        { name: "timestamp", value: timestamp },
        { name: "severity", value: "critical" },
      ],
    });

    // TODO (Phase 5): Post to Paperclip as a task assigned to CTO
    // This requires PAPERCLIP_API_URL and PAPERCLIP_COMPANY_ID env vars
    // and a POST to /api/companies/{companyId}/issues with assigneeAgentId

    return {
      timestamp,
      status: "incident_detected",
      severity: "critical",
      text: result.text,
      links: result.links,
      chatID: result.chatID,
      durationMs: Date.now() - started,
    };
  },
});

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderHtml(timestamp: string, text: string, links: string[]): string {
  const body = escapeHtml(text).replace(/\n/g, "<br>");
  const linkSection = links.length
    ? `<h2 style="font-size:15px;margin:20px 0 8px;color:#111">Session Links</h2>
       <ul style="font-size:13px;color:#666;margin:0;padding-left:20px">
         ${links.map((url) => `<li><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></li>`).join("")}
       </ul>`
    : "";

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:680px;margin:0 auto">
      <div style="background:#dc2626;color:white;padding:12px 16px;border-radius:4px;margin-bottom:16px">
        <h1 style="font-size:18px;margin:0">⚠️ Critical Incident Alert</h1>
        <p style="font-size:13px;margin:4px 0 0;opacity:0.95">Detected at ${escapeHtml(timestamp)}</p>
      </div>
      <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:14px;margin-bottom:16px">
        <h2 style="font-size:15px;margin:0 0 8px;color:#111">Galileo Diagnosis</h2>
        <div style="font-size:14px;color:#111;line-height:1.55">${body}</div>
      </div>
      ${linkSection}
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
      <p style="font-size:12px;color:#888">
        Generated by <code>galileo-incident-alert</code> (Trigger.dev).
        Runs every 30 minutes. Severity detected via keyword matching.
      </p>
    </div>
  `;
}

function renderText(timestamp: string, text: string, links: string[]): string {
  const linkSection = links.length ? `\n\nSession Links:\n${links.map((u) => `  - ${u}`).join("\n")}` : "";
  return `⚠️ CRITICAL INCIDENT ALERT\n\nDetected at: ${timestamp}\n\nGalileo Diagnosis:\n${text}${linkSection}\n\n---\nGenerated by galileo-incident-alert (Trigger.dev)`;
}
