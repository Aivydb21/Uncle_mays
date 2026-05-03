import { schedules, task } from "@trigger.dev/sdk/v3";
import { createHash } from "crypto";
import { isSuppressed } from "./_email-suppression";
import { sendTransactional } from "../lib/email/resend";

const MAILCHIMP_DC = "us19";
const MAILCHIMP_LIST_ID = "2645503d11";

function md5(s: string) {
  return createHash("md5").update(s).digest("hex");
}

/**
 * Per-session send-state tracking.
 *
 * We used to keep a JSON file on disk (".stripe-abandoned-emails.json") but
 * trigger.dev runs in ephemeral containers , the file gets wiped between every
 * run, so the "already-sent" gate could never fire and nothing ever got sent
 * past the first email. We persist the state as Mailchimp tags on the contact
 * instead: tags survive runs and are read/written via the audience API.
 *
 * Tag format: `abc_<sessionIdSuffix>_e<N>` (abc = abandoned-cart)
 *   - sessionIdSuffix = last 8 chars of the Stripe session id (unique per cart)
 *   - N = 1, 2, or 3 (which recovery email)
 * Example: `abc_9XpT2aKq_e2`
 */
// Step 0 (the +2h "feedback ask") was retired 2026-05-02. Sequence is now
// just emails 1-3 at 24/48/72h.
function sessionEmailTag(sessionId: string, emailNumber: 1 | 2 | 3): string {
  return `abc_${sessionId.slice(-8)}_e${emailNumber}`;
}

async function getContactTags(apiKey: string, email: string): Promise<Set<string>> {
  const emailHash = md5(email.toLowerCase());
  const authHeader = `Basic ${btoa("anystring:" + apiKey)}`;
  try {
    const res = await fetch(
      `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members/${emailHash}/tags?count=250`,
      { headers: { Authorization: authHeader } }
    );
    if (!res.ok) return new Set();
    const data = (await res.json()) as { tags?: Array<{ name: string }> };
    return new Set((data.tags || []).map((t) => t.name));
  } catch {
    return new Set();
  }
}

async function addContactTag(apiKey: string, email: string, tag: string): Promise<void> {
  const emailHash = md5(email.toLowerCase());
  const authHeader = `Basic ${btoa("anystring:" + apiKey)}`;
  await fetch(
    `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members/${emailHash}/tags`,
    {
      method: "POST",
      headers: { Authorization: authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({ tags: [{ name: tag, status: "active" }] }),
    }
  ).catch(() => {
    // Non-fatal: worst case we send a duplicate email next run, not silent skip forever
  });
}

// Base URL for the Uncle May's website API (to check local checkout sessions)
const SITE_BASE_URL = process.env.SITE_BASE_URL || "https://unclemays.com";

/**
 * Check if a customer email is already tracked by the local checkout-store
 * abandoned cart processor. If so, the local system handles recovery emails
 * with better per-session dedup , the Stripe processor should skip.
 */
async function hasLocalAbandonedSession(email: string): Promise<boolean> {
  try {
    const since = new Date(Date.now() - 96 * 3600 * 1000).toISOString();
    const res = await fetch(
      `${SITE_BASE_URL}/api/checkout/session?since=${encodeURIComponent(since)}`
    );
    if (!res.ok) return false;
    const data = await res.json();
    const sessions: Array<{ email?: string; completedAt?: string }> = data.sessions || [];
    return sessions.some(
      (s) => s.email?.toLowerCase() === email.toLowerCase() && !s.completedAt
    );
  } catch {
    return false; // On error, allow Stripe processor to proceed
  }
}

interface StripeCheckoutSession {
  id: string;
  customer_details?: {
    email?: string | null;
    name?: string | null;
  } | null;
  created: number;
  expires_at: number;
  status: string;
  url: string | null;
  amount_total: number | null;
  currency: string | null;
}

async function fetchStripeExpiredSessions(
  apiKey: string,
  afterTimestamp: number,
  beforeTimestamp: number
): Promise<StripeCheckoutSession[]> {
  const url = new URL("https://api.stripe.com/v1/checkout/sessions");
  url.searchParams.set("limit", "100");
  url.searchParams.set("status", "expired");

  const authHeader = `Basic ${btoa(apiKey + ":")}`;
  const res = await fetch(url.toString(), {
    headers: { Authorization: authHeader },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Stripe API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  const sessions: StripeCheckoutSession[] = data.data || [];

  // Filter to sessions created in our time window
  return sessions.filter(
    (s) => s.created >= afterTimestamp && s.created <= beforeTimestamp
  );
}

async function upsertMailchimpContact(
  apiKey: string,
  email: string,
  name: { first?: string; last?: string }
) {
  const emailHash = md5(email.toLowerCase());
  const authHeader = `Basic ${btoa("anystring:" + apiKey)}`;

  const body: any = { email_address: email, status_if_new: "subscribed" };
  const mergeFields: any = {};
  if (name.first) mergeFields.FNAME = name.first;
  if (name.last) mergeFields.LNAME = name.last;
  if (Object.keys(mergeFields).length > 0) body.merge_fields = mergeFields;

  const res = await fetch(
    `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members/${emailHash}`,
    {
      method: "PUT",
      headers: { Authorization: authHeader, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  return res.json();
}

async function sendEmail(
  apiKey: string,
  email: string,
  name: { first?: string; last?: string },
  sessionId: string,
  emailNumber: 1 | 2 | 3
): Promise<{ campaignId: string }> {
  void apiKey;
  const firstName = name.first || "friend";
  const sessionTag = sessionId.substring(0, 8);
  const checkoutUrl =
    `https://unclemays.com/shop` +
    `?utm_source=email&utm_medium=abandoned_cart&utm_campaign=recovery_email${emailNumber}&utm_content=${sessionTag}`;

  let subjectLine: string;
  let htmlContent: string;
  let plainText: string;

  if (emailNumber === 1) {
    // Email 1: gentle nudge (24h post-expiry)
    subjectLine = "Your Uncle May's order is waiting";
    htmlContent = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,sans-serif;color:#1a1a1a;background:#fff;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
    <h2 style="font-size:22px;margin-bottom:16px;color:#2d7a2d;">Your Uncle May's order is waiting</h2>
    <p style="font-size:16px;line-height:1.6;">Hi ${firstName},</p>
    <p style="font-size:16px;line-height:1.6;">
      You started an order at Uncle May's but didn't finish checking out.
      Pop back over to the catalog and finish whenever you're ready.
    </p>
    <p style="font-size:16px;line-height:1.6;">
      Use code <strong>FRESH10</strong> at checkout for $10 off your first order ($25 minimum).
    </p>
    <p style="margin:32px 0;">
      <a href="${checkoutUrl}"
         style="background:#2d7a2d;color:white;padding:14px 28px;text-decoration:none;border-radius:4px;font-size:16px;font-weight:bold;display:inline-block;">
        Finish Your Order
      </a>
    </p>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
    <p style="font-size:12px;color:#999;line-height:1.6;">
      Uncle May's Produce · Hyde Park, Chicago, IL<br>
      <a href="https://unclemays.com" style="color:#999;">unclemays.com</a> ·
      <a href="mailto:info@unclemays.com" style="color:#999;">info@unclemays.com</a>
    </p>
  </div>
</body>
</html>`;
    plainText = `Hi ${firstName},

You started an order at Uncle May's but didn't finish checking out. Pop back over to the catalog and finish whenever you're ready.

Use code FRESH10 at checkout for $10 off your first order ($25 minimum).

${checkoutUrl}

---
Uncle May's Produce · Hyde Park, Chicago, IL
unclemays.com · info@unclemays.com`;
  } else if (emailNumber === 2) {
    // Email 2: cutoff reminder (48h post-expiry)
    subjectLine = "Order by Sunday for Wednesday delivery";
    htmlContent = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,sans-serif;color:#1a1a1a;background:#fff;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
    <h2 style="font-size:22px;margin-bottom:16px;color:#2d7a2d;">Order by Sunday for Wednesday delivery</h2>
    <p style="font-size:16px;line-height:1.6;">Hi ${firstName},</p>
    <p style="font-size:16px;line-height:1.6;">
      We deliver every Wednesday across the Chicago metro. To get your order
      this Wednesday, finish checking out by Sunday at 11:59 PM CT. After
      that, your order ships the following Wednesday.
    </p>
    <p style="font-size:16px;line-height:1.6;">
      Code <strong>FRESH10</strong> still works on your first order ($25 minimum).
    </p>
    <p style="margin:32px 0;">
      <a href="${checkoutUrl}"
         style="background:#2d7a2d;color:white;padding:14px 28px;text-decoration:none;border-radius:4px;font-size:16px;font-weight:bold;display:inline-block;">
        Finish Your Order
      </a>
    </p>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
    <p style="font-size:12px;color:#999;line-height:1.6;">
      Uncle May's Produce · Hyde Park, Chicago, IL<br>
      <a href="https://unclemays.com" style="color:#999;">unclemays.com</a> ·
      <a href="mailto:info@unclemays.com" style="color:#999;">info@unclemays.com</a>
    </p>
  </div>
</body>
</html>`;
    plainText = `Hi ${firstName},

We deliver every Wednesday across the Chicago metro. To get your order this Wednesday, finish checking out by Sunday at 11:59 PM CT. After that, your order ships the following Wednesday.

Code FRESH10 still works on your first order ($25 minimum).

${checkoutUrl}

---
Uncle May's Produce · Hyde Park, Chicago, IL
unclemays.com · info@unclemays.com`;
  } else {
    // Email 3: last touch (72h post-expiry)
    subjectLine = "Still want to finish your Uncle May's order?";
    htmlContent = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,sans-serif;color:#1a1a1a;background:#fff;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
    <h2 style="font-size:22px;margin-bottom:16px;color:#2d7a2d;">Still want to finish your order?</h2>
    <p style="font-size:16px;line-height:1.6;">Hi ${firstName},</p>
    <p style="font-size:16px;line-height:1.6;">
      Last note from us. The catalog is still open whenever you're ready.
      No commitment, no subscription , just fresh produce, pantry, and
      pasture-raised protein from Black farmers, delivered weekly.
    </p>
    <p style="font-size:16px;line-height:1.6;">
      <strong>FRESH10</strong> is good for $10 off your first order ($25 minimum).
    </p>
    <p style="margin:32px 0;">
      <a href="${checkoutUrl}"
         style="background:#2d7a2d;color:white;padding:14px 28px;text-decoration:none;border-radius:4px;font-size:16px;font-weight:bold;display:inline-block;">
        Finish Your Order
      </a>
    </p>
    <p style="font-size:14px;color:#666;line-height:1.6;">
      Not for you right now? No problem , reply to this email and we'll stop
      these reminders.
    </p>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
    <p style="font-size:12px;color:#999;line-height:1.6;">
      Uncle May's Produce · Hyde Park, Chicago, IL<br>
      <a href="https://unclemays.com" style="color:#999;">unclemays.com</a> ·
      <a href="mailto:info@unclemays.com" style="color:#999;">info@unclemays.com</a>
    </p>
  </div>
</body>
</html>`;
    plainText = `Hi ${firstName},

Last note from us. The catalog is still open whenever you're ready. No commitment, no subscription , just fresh produce, pantry, and pasture-raised protein from Black farmers, delivered weekly.

FRESH10 is good for $10 off your first order ($25 minimum).

${checkoutUrl}

Not for you right now? No problem , reply to this email and we'll stop these reminders.

---
Uncle May's Produce · Hyde Park, Chicago, IL
unclemays.com · info@unclemays.com`;
  }

  const result = await sendTransactional({
    to: email,
    subject: subjectLine,
    html: htmlContent,
    text: plainText,
    tags: [
      { name: "type", value: "abandoned_cart_stripe" },
      { name: "step", value: String(emailNumber) },
      { name: "session", value: sessionTag },
    ],
  });

  if (!result.sent) {
    throw new Error(`Resend send failed: ${result.error || result.reason || "unknown"}`);
  }

  return { campaignId: result.id || "" };
}

function parseNameParts(fullName: string): { first: string; last: string } {
  const parts = (fullName || "").trim().split(/\s+/);
  return { first: parts[0] || "", last: parts.slice(1).join(" ") || "" };
}

/**
 * Stripe Abandoned Checkout Recovery , 3-step sequence.
 *
 * Polls Stripe API every 30 minutes for expired checkout sessions.
 * Step 0 (the +2h "feedback ask") was retired 2026-05-02.
 *
 * - Email 1 (recovery):  expired 24-48 hours ago
 * - Email 2 (recovery):  expired 48-72 hours ago
 * - Email 3 (recovery):  expired 72-96 hours ago
 *
 * Each window is independent; Mailchimp tag dedup prevents duplicates.
 */
export const stripeAbandonedCheckoutProcessor = schedules.task({
  id: "stripe-abandoned-checkout-processor-v2",
  cron: "*/30 * * * *", // Every 30 minutes
  run: async () => {
    const stripeKey = process.env.STRIPE_API_KEY!;
    const mailchimpKey = process.env.MAILCHIMP_API_KEY!;

    if (!stripeKey || !mailchimpKey) {
      console.error("Missing API keys: STRIPE_API_KEY or MAILCHIMP_API_KEY");
      return { error: "missing_api_keys" };
    }

    const now = Math.floor(Date.now() / 1000);
    const twentyFourHoursAgo = now - 24 * 3600;
    const fortyEightHoursAgo = now - 48 * 3600;
    const seventyTwoHoursAgo = now - 72 * 3600;
    const ninetySixHoursAgo = now - 96 * 3600;

    const results: any[] = [];

    /**
     * Process a single time window. Each window is INDEPENDENT of the others ,
     * we don't require that an earlier email was sent before sending a later one,
     * because the old "chain" logic combined with ephemeral state silently skipped
     * carts that aged past the first window without ever getting any email.
     *
     * Gate is a Mailchimp tag on the customer: `abc_<session8>_e<N>`. If the
     * contact already has that tag, we've already sent them this specific email
     * for this specific session , skip. Otherwise send, then add the tag.
     */
    async function processWindow(
      emailNumber: 1 | 2 | 3,
      windowStart: number,
      windowEnd: number,
      windowLabel: string
    ) {
      const sessions = await fetchStripeExpiredSessions(stripeKey, windowStart, windowEnd);
      console.log(`Found ${sessions.length} sessions for Email ${emailNumber} (${windowLabel})`);

      for (const session of sessions) {
        const email = session.customer_details?.email;
        if (!email) {
          console.warn(`Session ${session.id} has no customer email, skipping`);
          continue;
        }
        if (isSuppressed(email)) continue;

        // Skip if the local checkout-store is already tracking this customer.
        // The local abandoned-checkout processor has per-session field dedup
        // and handles the full 4-email sequence , sending from both systems
        // causes duplicates (see UNC-709).
        if (await hasLocalAbandonedSession(email)) {
          console.log(
            `Skipping session ${session.id} (email=${email}): local checkout-store is handling recovery`
          );
          continue;
        }

        const tag = sessionEmailTag(session.id, emailNumber);
        const existingTags = await getContactTags(mailchimpKey, email);
        if (existingTags.has(tag)) {
          // Already sent this email for this session , skip
          continue;
        }

        const name = parseNameParts(session.customer_details?.name || "");

        // Upsert first so the tag has a contact to attach to
        await upsertMailchimpContact(mailchimpKey, email, name).catch((e) =>
          console.warn(`Mailchimp upsert warning for ${email}:`, e.message)
        );

        try {
          const { campaignId } = await sendEmail(mailchimpKey, email, name, session.id, emailNumber);
          await addContactTag(mailchimpKey, email, tag);

          console.log(
            `✓ Email ${emailNumber} sent | session=${session.id} email=${email} campaign=${campaignId}`
          );
          results.push({ sessionId: session.id, email, emailNumber, sent: true, campaignId });
        } catch (e: any) {
          console.error(`✗ Email ${emailNumber} failed for session ${session.id}:`, e.message);
          results.push({ sessionId: session.id, email, emailNumber, sent: false, error: e.message });
        }
      }

      return sessions.length;
    }

    const email1Count = await processWindow(1, fortyEightHoursAgo, twentyFourHoursAgo, "24-48h window");
    const email2Count = await processWindow(2, seventyTwoHoursAgo, fortyEightHoursAgo, "48-72h window");
    const email3Count = await processWindow(3, ninetySixHoursAgo, seventyTwoHoursAgo, "72-96h window");

    return {
      email1: {
        totalSessions: email1Count,
        sent: results.filter((r) => r.emailNumber === 1 && r.sent).length,
        failed: results.filter((r) => r.emailNumber === 1 && !r.sent).length,
      },
      email2: {
        totalSessions: email2Count,
        sent: results.filter((r) => r.emailNumber === 2 && r.sent).length,
        failed: results.filter((r) => r.emailNumber === 2 && !r.sent).length,
      },
      email3: {
        totalSessions: email3Count,
        sent: results.filter((r) => r.emailNumber === 3 && r.sent).length,
        failed: results.filter((r) => r.emailNumber === 3 && !r.sent).length,
      },
      totalProcessed: results.length,
      results,
    };
  },
});
