import { isSuppressed } from "./suppression";

// Single transactional send helper. All triggered email (order confirmations,
// abandoned cart, payment failed, cancellation) goes through this. Newsletter
// broadcasts still live on Mailchimp.
//
// Env:
//   RESEND_API_KEY       — required
//   RESEND_FROM_EMAIL    — e.g. "Uncle May's Produce <orders@unclemays.com>"
//   RESEND_REPLY_TO      — optional, defaults to info@unclemays.com

export interface SendTransactionalParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  tags?: { name: string; value: string }[]; // Resend event-webhook filtering
  replyTo?: string;
}

export interface SendTransactionalResult {
  sent: boolean;
  id?: string;
  reason?: string;
  error?: string;
}

export async function sendTransactional(
  params: SendTransactionalParams
): Promise<SendTransactionalResult> {
  if (isSuppressed(params.to)) {
    return { sent: false, reason: "suppressed_recipient" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    console.warn("[Resend] RESEND_API_KEY or RESEND_FROM_EMAIL not configured");
    return { sent: false, reason: "not_configured" };
  }

  const replyTo = params.replyTo || process.env.RESEND_REPLY_TO || "info@unclemays.com";

  const body: Record<string, unknown> = {
    from,
    to: [params.to],
    subject: params.subject,
    html: params.html,
    reply_to: replyTo,
  };
  if (params.text) body.text = params.text;
  if (params.tags?.length) body.tags = params.tags;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as { id?: string; message?: string; name?: string };
    if (!res.ok) {
      const err = data.message || data.name || `HTTP ${res.status}`;
      console.error(`[Resend] send failed: ${err}`);
      return { sent: false, error: err };
    }
    return { sent: true, id: data.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[Resend] send error: ${msg}`);
    return { sent: false, error: msg };
  }
}
