import { schedules, task } from "@trigger.dev/sdk/v3";
import { refreshAccessToken, whoami } from "../lib/instagram";
import { sendInternalAlert } from "../lib/email/resend";

function formatExpiry(secondsFromNow: number): string {
  const expiryMs = Date.now() + secondsFromNow * 1000;
  return new Date(expiryMs).toISOString().slice(0, 10);
}

async function refreshAndNotify(triggerLabel: string) {
  const account = await whoami();
  const result = await refreshAccessToken();
  const expiryDate = formatExpiry(result.expires_in);
  const refreshedAt = new Date().toISOString().slice(0, 10);

  const subject = `Instagram token refreshed (${triggerLabel}) — paste new value into Vercel + Trigger.dev`;
  const text = [
    `The Instagram API token for @${account.username} was just refreshed.`,
    ``,
    `New expiry: ${expiryDate} (60 days from ${refreshedAt})`,
    `Token type: ${result.token_type}`,
    `Permissions: ${result.permissions ?? "(unchanged)"}`,
    ``,
    `ACTION REQUIRED — update INSTAGRAM_ACCESS_TOKEN in BOTH:`,
    `  1. Vercel project "uncle-mays" (Production + Preview)`,
    `  2. Trigger.dev project env vars`,
    ``,
    `New token (paste verbatim, no echo/trailing newline):`,
    ``,
    result.access_token,
    ``,
    `Also update ~/.claude/instagram-config.json:`,
    `  "access_token": "${result.access_token}"`,
    `  "token_issued_at": "${refreshedAt}"`,
    `  "token_expires_at": "${expiryDate}"`,
    ``,
    `If you miss this rotation, the previous token still works for ~30 more days (60-day rolling buffer). Next scheduled refresh: 1st of next month, 09:00 CT.`,
  ].join("\n");

  const html = `
    <p>The Instagram API token for <strong>@${account.username}</strong> was just refreshed.</p>
    <p><strong>New expiry:</strong> ${expiryDate} (60 days from ${refreshedAt})<br>
    <strong>Token type:</strong> ${result.token_type}<br>
    <strong>Permissions:</strong> ${result.permissions ?? "(unchanged)"}</p>
    <p><strong>ACTION REQUIRED</strong> &mdash; update <code>INSTAGRAM_ACCESS_TOKEN</code> in BOTH:</p>
    <ol>
      <li>Vercel project <code>uncle-mays</code> (Production + Preview)</li>
      <li>Trigger.dev project env vars</li>
    </ol>
    <p>New token (paste verbatim, no echo / trailing newline):</p>
    <pre style="background:#f4f4f4;padding:12px;font-family:monospace;word-break:break-all;white-space:pre-wrap;">${result.access_token}</pre>
    <p>Also update <code>~/.claude/instagram-config.json</code> with the new token, <code>token_issued_at: ${refreshedAt}</code>, and <code>token_expires_at: ${expiryDate}</code>.</p>
    <p style="color:#666;font-size:13px;">If you miss this rotation, the previous token still works for ~30 more days (60-day rolling buffer). Next scheduled refresh: 1st of next month, 09:00 CT.</p>
  `;

  await sendInternalAlert({
    subject,
    html,
    text,
    tags: [
      { name: "type", value: "instagram_token_refresh" },
      { name: "trigger", value: triggerLabel },
    ],
  });

  return {
    username: account.username,
    refreshedAt,
    expiryDate,
    expiresInSeconds: result.expires_in,
    permissions: result.permissions,
  };
}

export const instagramTokenRefresh = schedules.task({
  id: "instagram-token-refresh",
  // 1st of every month at 09:00 America/Chicago (14:00 UTC during CDT, 15:00 UTC during CST)
  cron: "0 14 1 * *",
  run: async () => {
    console.log("Running scheduled Instagram token refresh...");
    return refreshAndNotify("scheduled");
  },
});

export const instagramTokenRefreshNow = task({
  id: "instagram-token-refresh-now",
  run: async () => {
    console.log("Running manual Instagram token refresh...");
    return refreshAndNotify("manual");
  },
});
