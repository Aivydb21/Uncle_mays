import { schedules } from "@trigger.dev/sdk/v3";

/**
 * CEO daily digest.
 *
 * Spec: notes/ceo-digest-spec-2026-05-16.md
 *
 * Runs daily at 12:00 UTC (~07:00 CDT / 06:00 CST). Pulls the trailing 24h of
 * agent activity from GitHub + Paperclip + Mailchimp and posts a single
 * Paperclip task to the CEO so the at-will ship lane stays observable
 * without re-introducing pre-ship approval gates.
 *
 * Sections (v1):
 *   1. Shipped         — merged PRs + Mailchimp sends in the last 24h
 *   2. Issues opened   — Paperclip issues created in the last 24h
 *   3. Stalled >24h    — open Paperclip issues with no activity for >24h
 *   4. Pending approvals — open net-new spend approvals awaiting CEO action
 *
 * Required env (Trigger.dev project env):
 *   GITHUB_TOKEN          — fine-grained PAT with read access to Aivydb21/Uncle_mays
 *   PAPERCLIP_API_URL     — e.g. http://localhost:3100/api
 *   PAPERCLIP_API_KEY     — Paperclip API key
 *   PAPERCLIP_COMPANY_ID  — 4feca4d1-108b-4905-b16a-ed9538c6f9ef
 *   PAPERCLIP_CEO_AGENT_ID — 204674de-ee80-43d7-9930-bd81b1737d1f
 *   MAILCHIMP_API_KEY     — existing
 */

const REPO_OWNER = "Aivydb21";
const REPO_NAME = "Uncle_mays";
const COMPANY_ID = "4feca4d1-108b-4905-b16a-ed9538c6f9ef";
const CEO_AGENT_ID = "204674de-ee80-43d7-9930-bd81b1737d1f";

interface MergedPR {
  number: number;
  title: string;
  url: string;
  author: string;
  mergedAt: string;
}

interface PaperclipIssue {
  id: string;
  identifier?: string;
  title: string;
  status: string;
  priority?: string;
  createdAt: string;
  updatedAt: string;
  assignee?: { name?: string } | null;
  url?: string;
  labels?: string[];
}

interface PaperclipApproval {
  id: string;
  title: string;
  amount?: number | string;
  status: string;
  createdAt: string;
  requestedBy?: string;
  url?: string;
}

interface MailchimpCampaign {
  id: string;
  settings?: { subject_line?: string; title?: string };
  send_time?: string;
  emails_sent?: number;
}

interface SectionResult<T> {
  items: T[];
  error?: string;
}

export const ceoDailyDigest = schedules.task({
  id: "ceo-daily-digest",
  // 14:00 UTC = 09:00 CDT (summer) / 08:00 CST (winter). Working hours so
  // the Tailscale-hosted Paperclip API on the CEO's laptop is reachable.
  // Runs 7 days a week per CEO directive (2026-05-16).
  cron: "0 14 * * *",
  // Generous ceiling per CEO directive (2026-05-16): completing the daily
  // information pull matters more than wall time. 1h is more than enough
  // headroom for GitHub + Mailchimp + Paperclip queries even on slow days.
  maxDuration: 3600,
  run: async () => {
    const now = new Date();
    const windowStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const stalledCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const todayIso = now.toISOString().slice(0, 10);

    const [shippedPRs, mailchimpSends, openedIssues, stalledIssues, approvals] =
      await Promise.all([
        safe(() => fetchMergedPRs(windowStart)),
        safe(() => fetchMailchimpCampaigns(windowStart)),
        safe(() => fetchOpenedIssues(windowStart)),
        safe(() => fetchStalledIssues(stalledCutoff)),
        safe(() => fetchPendingApprovals()),
      ]);

    const counts = {
      shipped: shippedPRs.items.length + mailchimpSends.items.length,
      issues: openedIssues.items.length,
      stalled: stalledIssues.items.length,
      approvals: approvals.items.length,
    };

    const description = renderDescription({
      date: todayIso,
      shippedPRs,
      mailchimpSends,
      openedIssues,
      stalledIssues,
      approvals,
    });

    const title = `[CEO Digest] ${todayIso} — ${counts.shipped} shipped, ${counts.issues} opened, ${counts.stalled} stalled, ${counts.approvals} pending`;

    await createCeoTask(title, description);

    return {
      date: todayIso,
      counts,
      errors: {
        shippedPRs: shippedPRs.error,
        mailchimpSends: mailchimpSends.error,
        openedIssues: openedIssues.error,
        stalledIssues: stalledIssues.error,
        approvals: approvals.error,
      },
    };
  },
});

async function safe<T>(fn: () => Promise<T[]>): Promise<SectionResult<T>> {
  try {
    return { items: await fn() };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Digest section failed:", message);
    return { items: [], error: message };
  }
}

// --- Section 1a: merged GitHub PRs ---

async function fetchMergedPRs(since: Date): Promise<MergedPR[]> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN not set");

  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls?state=closed&sort=updated&direction=desc&per_page=50`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);

  const prs = (await res.json()) as Array<{
    number: number;
    title: string;
    html_url: string;
    user: { login: string };
    merged_at: string | null;
  }>;

  return prs
    .filter((pr) => pr.merged_at && new Date(pr.merged_at) >= since)
    .map((pr) => ({
      number: pr.number,
      title: pr.title,
      url: pr.html_url,
      author: pr.user.login,
      mergedAt: pr.merged_at!,
    }));
}

// --- Section 1b: Mailchimp campaigns sent ---

async function fetchMailchimpCampaigns(since: Date): Promise<MailchimpCampaign[]> {
  const key = process.env.MAILCHIMP_API_KEY;
  if (!key) throw new Error("MAILCHIMP_API_KEY not set");
  const dc = key.split("-")[1];
  if (!dc) throw new Error("MAILCHIMP_API_KEY missing datacenter suffix");

  const url = `https://${dc}.api.mailchimp.com/3.0/campaigns?status=sent&since_send_time=${encodeURIComponent(since.toISOString())}&count=50&sort_field=send_time&sort_dir=DESC`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Basic ${Buffer.from(`anystring:${key}`).toString("base64")}`,
    },
  });
  if (!res.ok) throw new Error(`Mailchimp API ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { campaigns: MailchimpCampaign[] };
  return json.campaigns || [];
}

// --- Section 2: Paperclip issues opened ---

async function fetchOpenedIssues(since: Date): Promise<PaperclipIssue[]> {
  const all = await fetchPaperclipIssues({ pageSize: 100 });
  return all.filter((i) => new Date(i.createdAt) >= since);
}

// --- Section 3: stalled issues ---

async function fetchStalledIssues(updatedBefore: Date): Promise<PaperclipIssue[]> {
  const all = await fetchPaperclipIssues({ pageSize: 100 });
  const openStatuses = new Set([
    "todo",
    "in_progress",
    "in-progress",
    "blocked",
    "review",
  ]);
  return all.filter(
    (i) =>
      openStatuses.has(i.status.toLowerCase()) &&
      new Date(i.updatedAt) < updatedBefore
  );
}

// --- Section 4: pending approvals ---

async function fetchPendingApprovals(): Promise<PaperclipApproval[]> {
  const { apiUrl, apiKey, companyId } = paperclipEnv();
  const res = await fetch(`${apiUrl}/companies/${companyId}/approvals?status=pending`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`Paperclip approvals ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { approvals?: PaperclipApproval[]; data?: PaperclipApproval[] };
  return json.approvals || json.data || [];
}

// --- Paperclip helpers ---

function paperclipEnv() {
  const apiUrl = process.env.PAPERCLIP_API_URL;
  const apiKey = process.env.PAPERCLIP_API_KEY;
  const companyId = process.env.PAPERCLIP_COMPANY_ID || COMPANY_ID;
  if (!apiUrl) throw new Error("PAPERCLIP_API_URL not set");
  if (!apiKey) throw new Error("PAPERCLIP_API_KEY not set");
  return { apiUrl, apiKey, companyId };
}

async function fetchPaperclipIssues(opts: { pageSize: number }): Promise<PaperclipIssue[]> {
  const { apiUrl, apiKey, companyId } = paperclipEnv();
  const res = await fetch(
    `${apiUrl}/companies/${companyId}/issues?pageSize=${opts.pageSize}&sort=updatedAt&order=desc`,
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );
  if (!res.ok) throw new Error(`Paperclip issues ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { issues?: PaperclipIssue[]; data?: PaperclipIssue[] };
  return json.issues || json.data || [];
}

async function createCeoTask(title: string, description: string): Promise<void> {
  const { apiUrl, apiKey, companyId } = paperclipEnv();
  const ceoAgentId = process.env.PAPERCLIP_CEO_AGENT_ID || CEO_AGENT_ID;

  const res = await fetch(`${apiUrl}/companies/${companyId}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      description,
      assigneeAgentId: ceoAgentId,
      status: "todo",
      priority: "medium",
      labels: ["ceo-digest"],
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to create CEO digest task: ${res.status} ${body}`);
  }
}

// --- Rendering ---

interface RenderArgs {
  date: string;
  shippedPRs: SectionResult<MergedPR>;
  mailchimpSends: SectionResult<MailchimpCampaign>;
  openedIssues: SectionResult<PaperclipIssue>;
  stalledIssues: SectionResult<PaperclipIssue>;
  approvals: SectionResult<PaperclipApproval>;
}

function renderDescription(a: RenderArgs): string {
  const lines: string[] = [];
  lines.push(`# CEO Daily Digest — ${a.date}`);
  lines.push("");
  lines.push(
    "Trailing 24h of agent activity. The at-will ship lane (CRO marketing, CTO LogRocket fixes) ran without CEO approval; this digest is the read-once observability surface."
  );
  lines.push("");

  lines.push("## 1. Shipped");
  lines.push("");
  if (a.shippedPRs.items.length || a.mailchimpSends.items.length) {
    for (const pr of a.shippedPRs.items) {
      lines.push(
        `- **${pr.author}** — [#${pr.number} ${pr.title}](${pr.url}) (merged ${formatTime(pr.mergedAt)})`
      );
    }
    for (const c of a.mailchimpSends.items) {
      const subject = c.settings?.subject_line || c.settings?.title || "(no subject)";
      const recipients = c.emails_sent != null ? ` — ${c.emails_sent} recipients` : "";
      lines.push(`- **Mailchimp** — sent: ${subject}${recipients}`);
    }
  } else {
    lines.push("_No PRs merged or Mailchimp campaigns sent in the last 24h._");
  }
  appendErrors(lines, [
    ["GitHub", a.shippedPRs.error],
    ["Mailchimp", a.mailchimpSends.error],
  ]);
  lines.push("");

  lines.push("## 2. Issues opened or escalated");
  lines.push("");
  if (a.openedIssues.items.length) {
    for (const i of a.openedIssues.items) {
      const assignee = i.assignee?.name ? ` → ${i.assignee.name}` : "";
      const link = i.url ? `[${i.identifier || i.id}](${i.url})` : i.identifier || i.id;
      lines.push(`- ${link}${assignee} — ${i.title} _(${i.status})_`);
    }
  } else {
    lines.push("_No new issues filed in the last 24h._");
  }
  appendErrors(lines, [["Paperclip issues", a.openedIssues.error]]);
  lines.push("");

  lines.push("## 3. Stalled >24h");
  lines.push("");
  if (a.stalledIssues.items.length) {
    for (const i of a.stalledIssues.items) {
      const hours = Math.round(
        (Date.now() - new Date(i.updatedAt).getTime()) / (60 * 60 * 1000)
      );
      const assignee = i.assignee?.name ? ` → ${i.assignee.name}` : "";
      const link = i.url ? `[${i.identifier || i.id}](${i.url})` : i.identifier || i.id;
      lines.push(`- ${link}${assignee} — ${i.title} — **${hours}h stalled** _(${i.status})_`);
    }
  } else {
    lines.push("_Nothing open and untouched for >24h._");
  }
  appendErrors(lines, [["Paperclip stalled", a.stalledIssues.error]]);
  lines.push("");

  lines.push("## 4. Pending net-new spend approvals (your action items)");
  lines.push("");
  if (a.approvals.items.length) {
    for (const ap of a.approvals.items) {
      const age = Math.round(
        (Date.now() - new Date(ap.createdAt).getTime()) / (60 * 60 * 1000)
      );
      const amount = ap.amount != null ? ` — $${ap.amount}` : "";
      const by = ap.requestedBy ? ` (from ${ap.requestedBy})` : "";
      const link = ap.url ? `[${ap.title}](${ap.url})` : ap.title;
      lines.push(`- ${link}${by}${amount} — **${age}h old**`);
    }
  } else {
    lines.push("_No approvals waiting on you._");
  }
  appendErrors(lines, [["Paperclip approvals", a.approvals.error]]);
  lines.push("");

  lines.push("---");
  lines.push("");
  lines.push(
    "_Source: `ceo-daily-digest` Trigger.dev task. Spec: `notes/ceo-digest-spec-2026-05-16.md`._"
  );

  return lines.join("\n");
}

function appendErrors(lines: string[], errs: Array<[string, string | undefined]>) {
  for (const [name, err] of errs) {
    if (err) lines.push(`> :warning: ${name} fetch failed: ${err}`);
  }
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toISOString().replace("T", " ").slice(0, 16) + "Z";
}
