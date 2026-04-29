import { NextRequest, NextResponse } from "next/server";
import { sendInternalAlert } from "@/lib/email/resend";
import { addSignupLead } from "@/lib/mailchimp";

// Customer Feedback Program — Layer 2 (ingest) + Layer 5 ad-hoc CSV.
//
// Why email and not a database?
// Vercel's serverless filesystem is ephemeral, so we cannot append to a JSONL
// file in production. The durable store is Anthony's Gmail inbox: every
// captured response is forwarded as an email (via Resend internal-alert) to
// anthony@unclemays.com, which Gmail filters auto-label `feedback-inbound`.
// `investor-outreach/scripts/ingest-gmail-feedback.py` reconstructs the
// canonical JSONL store on demand from the labelled threads.
//
// Mailchimp tagging is the secondary channel: respondents who provide an
// email get added/updated with a `feedback:<source>` tag for segmentation.
// Internal mailboxes are filtered out by `addSignupLead`'s suppression check.

const VALID_SOURCES = new Set([
  "checkout-exit",
  "homepage-ask",
  "interview",
  "manual-upload",
  "abandon-reply",
  "social-ask",
]);
const VALID_CHANNELS = new Set(["web", "email", "interview", "phone", "social"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_RESPONSE_CHARS = 2000;

interface FeedbackPayload {
  source: string;
  channel?: string;
  raw_text: string;
  question?: string;
  customer_email?: string;
  product_slug?: string;
  session_id?: string;
  structured_answers?: Record<string, unknown>;
  notes?: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildEmail(p: FeedbackPayload): { subject: string; html: string; text: string } {
  const lines: string[] = [
    `Source: ${p.source}`,
    `Channel: ${p.channel || "web"}`,
  ];
  if (p.product_slug) lines.push(`Product: ${p.product_slug}`);
  if (p.customer_email) lines.push(`Email: ${p.customer_email}`);
  if (p.session_id) lines.push(`Session: ${p.session_id}`);
  if (p.question) lines.push(`Question: ${p.question}`);
  if (p.structured_answers && Object.keys(p.structured_answers).length) {
    lines.push(`Structured: ${JSON.stringify(p.structured_answers)}`);
  }
  if (p.notes) lines.push(`Notes: ${p.notes}`);
  lines.push("");
  lines.push("Response:");
  lines.push(p.raw_text);

  const text = lines.join("\n");
  const html = `<pre style="font-family:ui-monospace,Menlo,Consolas,monospace;white-space:pre-wrap;font-size:14px;line-height:1.5;">${escapeHtml(text)}</pre>`;
  const previewSnippet = p.raw_text.slice(0, 60).replace(/\s+/g, " ");
  const subject = `[feedback:${p.source}] ${previewSnippet}${p.raw_text.length > 60 ? "…" : ""}`;
  return { subject, html, text };
}

export async function POST(req: NextRequest) {
  let body: FeedbackPayload;
  try {
    body = (await req.json()) as FeedbackPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  // Validate
  if (typeof body.source !== "string" || !VALID_SOURCES.has(body.source)) {
    return NextResponse.json({ ok: false, error: "Invalid source" }, { status: 400 });
  }
  if (body.channel && !VALID_CHANNELS.has(body.channel)) {
    return NextResponse.json({ ok: false, error: "Invalid channel" }, { status: 400 });
  }
  if (typeof body.raw_text !== "string") {
    return NextResponse.json({ ok: false, error: "raw_text required" }, { status: 400 });
  }
  const trimmed = body.raw_text.trim();
  if (!trimmed) {
    return NextResponse.json({ ok: false, error: "raw_text empty" }, { status: 400 });
  }
  if (trimmed.length > MAX_RESPONSE_CHARS) {
    return NextResponse.json(
      { ok: false, error: `raw_text exceeds ${MAX_RESPONSE_CHARS} chars` },
      { status: 400 }
    );
  }
  const email = body.customer_email?.trim();
  if (email && !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
  }

  const payload: FeedbackPayload = {
    ...body,
    raw_text: trimmed,
    customer_email: email || undefined,
    channel: body.channel || "web",
  };

  // Primary: durable email-as-store. Always attempted.
  const mail = buildEmail(payload);
  const sendResult = await sendInternalAlert({
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    tags: [
      { name: "type", value: "feedback_capture" },
      { name: "source", value: payload.source },
    ],
  });
  if (!sendResult.sent) {
    console.warn("[/api/feedback] internal alert not sent:", sendResult.reason || sendResult.error);
  }

  // Secondary: Mailchimp tag, only if we have an email and it's not suppressed.
  if (email) {
    try {
      await addSignupLead(email, `feedback-${payload.source}`);
    } catch (e) {
      console.warn("[/api/feedback] Mailchimp tag failed:", e);
    }
  }

  return NextResponse.json({ ok: true });
}

// Ad-hoc CSV download (Layer 5). Authenticated via shared-secret token in
// FEEDBACK_ADMIN_TOKEN. The actual data lives in Gmail; this endpoint simply
// confirms the configured token and tells the caller where to ingest from.
// Real CSV generation happens client-side after running the Gmail ingest
// script — putting the full export here would require a database round-trip
// we explicitly chose not to build.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const expected = process.env.FEEDBACK_ADMIN_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "FEEDBACK_ADMIN_TOKEN not configured on server" },
      { status: 500 }
    );
  }
  if (token !== expected) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    note:
      "Feedback canonical store is Anthony's Gmail inbox under the `feedback-inbound` label. To export to CSV, run `python investor-outreach/scripts/ingest-gmail-feedback.py --csv > feedback.csv` locally.",
  });
}
