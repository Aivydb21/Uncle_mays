import { schedules, task } from "@trigger.dev/sdk/v3";
import { createHash } from "crypto";

const MAILCHIMP_DC = "us19";
const MAILCHIMP_LIST_ID = "2645503d11";

function md5(s: string) {
  return createHash("md5").update(s).digest("hex");
}

/**
 * Per-session send-state tracking.
 *
 * We used to keep a JSON file on disk (".stripe-abandoned-emails.json") but
 * trigger.dev runs in ephemeral containers — the file gets wiped between every
 * run, so the "already-sent" gate could never fire and nothing ever got sent
 * past the first email. We persist the state as Mailchimp tags on the contact
 * instead: tags survive runs and are read/written via the audience API.
 *
 * Tag format: `abc_<sessionIdSuffix>_e<N>` (abc = abandoned-cart)
 *   - sessionIdSuffix = last 8 chars of the Stripe session id (unique per cart)
 *   - N = 1, 2, or 3 (which recovery email)
 * Example: `abc_9XpT2aKq_e2`
 */
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
  const authHeader = `Basic ${btoa("anystring:" + apiKey)}`;
  const firstName = name.first || "friend";
  const sessionTag = sessionId.substring(0, 8);
  const checkoutUrl =
    `https://unclemays.com/boxes` +
    `?utm_source=email&utm_medium=abandoned_cart&utm_campaign=recovery_email${emailNumber}&utm_content=${sessionTag}`;

  let subjectLine: string;
  let previewText: string;
  let htmlContent: string;
  let plainText: string;

  if (emailNumber === 1) {
    // Email 1: Cart Reminder (1 hour after abandonment)
    subjectLine = "Your Uncle May's box is waiting";
    previewText = "Complete your order in 2 minutes. Fresh, curated produce for your table.";
    htmlContent = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,sans-serif;color:#1a1a1a;background:#fff;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
    <h2 style="font-size:22px;margin-bottom:16px;color:#2d7a2d;">Your Uncle May's box is waiting</h2>
    <p style="font-size:16px;line-height:1.6;">Hi ${firstName},</p>
    <p style="font-size:16px;line-height:1.6;">
      You started an order for premium produce from Uncle May's but didn't finish.
      Your items are still in your cart, ready to go. We curate every box with care
      for Black families who want quality they can count on.
    </p>
    <p style="font-size:16px;line-height:1.6;">
      Complete your order now and get Wednesday delivery. Questions? Call us anytime at
      <strong>(312) 972-2595</strong>.
    </p>
    <p style="margin:32px 0;">
      <a href="${checkoutUrl}"
         style="background:#2d7a2d;color:white;padding:14px 28px;text-decoration:none;border-radius:4px;font-size:16px;font-weight:bold;display:inline-block;">
        Complete Your Order
      </a>
    </p>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
    <p style="font-size:12px;color:#999;line-height:1.6;">
      Uncle May's Produce | Hyde Park, Chicago, IL<br>
      <a href="https://unclemays.com" style="color:#999;">unclemays.com</a> |
      <a href="mailto:info@unclemays.com" style="color:#999;">info@unclemays.com</a>
    </p>
  </div>
</body>
</html>`;
    plainText = `Hi ${firstName},

You started an order for premium produce from Uncle May's but didn't finish. Your items are still in your cart, ready to go. We curate every box with care for Black families who want quality they can count on.

Complete your order now and get Wednesday delivery. Questions? Call us anytime at (312) 972-2595.

${checkoutUrl}

---
Uncle May's Produce | Hyde Park, Chicago, IL
unclemays.com | info@unclemays.com`;
  } else if (emailNumber === 2) {
    // Email 2: Urgency Reminder (24 hours after abandonment)
    subjectLine = "Order by Sunday for Wednesday delivery";
    previewText = "89% of our customers refer friends. Your box is almost ready.";
    htmlContent = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,sans-serif;color:#1a1a1a;background:#fff;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
    <h2 style="font-size:22px;margin-bottom:16px;color:#2d7a2d;">Order by Sunday for Wednesday delivery</h2>
    <p style="font-size:16px;line-height:1.6;">Hi ${firstName},</p>
    <p style="font-size:16px;line-height:1.6;">
      We saved your cart, but time is running out. To get your fresh produce delivered this Wednesday,
      complete your order by Sunday at 11:59 PM CT. Orders after that ship next Wednesday.
    </p>
    <p style="font-size:16px;line-height:1.6;">
      Uncle May's isn't your average grocery box. We curate premium produce for Black communities
      that deserve the best. 89% of our customers refer friends and family because they trust what
      we deliver.
    </p>
    <p style="margin:32px 0;">
      <a href="${checkoutUrl}"
         style="background:#2d7a2d;color:white;padding:14px 28px;text-decoration:none;border-radius:4px;font-size:16px;font-weight:bold;display:inline-block;">
        Order Now for This Week's Delivery
      </a>
    </p>
    <p style="font-size:14px;color:#666;line-height:1.6;">
      Questions? We're here: <strong>(312) 972-2595</strong>
    </p>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
    <p style="font-size:12px;color:#999;line-height:1.6;">
      Uncle May's Produce | Hyde Park, Chicago, IL<br>
      <a href="https://unclemays.com" style="color:#999;">unclemays.com</a> |
      <a href="mailto:info@unclemays.com" style="color:#999;">info@unclemays.com</a>
    </p>
  </div>
</body>
</html>`;
    plainText = `Hi ${firstName},

We saved your cart, but time is running out. To get your fresh produce delivered this Wednesday, complete your order by Sunday at 11:59 PM CT. Orders after that ship next Wednesday.

Uncle May's isn't your average grocery box. We curate premium produce for Black communities that deserve the best. 89% of our customers refer friends and family because they trust what we deliver.

${checkoutUrl}

Questions? We're here: (312) 972-2595

---
Uncle May's Produce | Hyde Park, Chicago, IL
unclemays.com | info@unclemays.com`;
  } else {
    // Email 3: Final Urgency (48 hours after abandonment)
    subjectLine = "Last chance: Limited boxes left this week";
    previewText = "We only have a few boxes left for Wednesday delivery. Order now or miss out.";
    htmlContent = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,sans-serif;color:#1a1a1a;background:#fff;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
    <h2 style="font-size:22px;margin-bottom:16px;color:#d9534f;">Last chance: Limited boxes left this week</h2>
    <p style="font-size:16px;line-height:1.6;">Hi ${firstName},</p>
    <p style="font-size:16px;line-height:1.6;">
      This is your final reminder. We have limited boxes available for Wednesday delivery, and your cart
      is still sitting there. Once they're gone, you'll have to wait until next week.
    </p>
    <p style="font-size:16px;line-height:1.6;">
      Our customers love Uncle May's because we bring quality produce to neighborhoods that have been
      overlooked for too long. Don't miss your chance to join them this week.
    </p>
    <p style="margin:32px 0;">
      <a href="${checkoutUrl}"
         style="background:#d9534f;color:white;padding:14px 28px;text-decoration:none;border-radius:4px;font-size:16px;font-weight:bold;display:inline-block;">
        Complete My Order Now
      </a>
    </p>
    <p style="font-size:14px;color:#666;line-height:1.6;">
      Need help? Call <strong>(312) 972-2595</strong> before it's too late.
    </p>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
    <p style="font-size:12px;color:#999;line-height:1.6;">
      Uncle May's Produce | Hyde Park, Chicago, IL<br>
      <a href="https://unclemays.com" style="color:#999;">unclemays.com</a> |
      <a href="mailto:info@unclemays.com" style="color:#999;">info@unclemays.com</a>
    </p>
  </div>
</body>
</html>`;
    plainText = `Hi ${firstName},

This is your final reminder. We have limited boxes available for Wednesday delivery, and your cart is still sitting there. Once they're gone, you'll have to wait until next week.

Our customers love Uncle May's because we bring quality produce to neighborhoods that have been overlooked for too long. Don't miss your chance to join them this week.

${checkoutUrl}

Need help? Call (312) 972-2595 before it's too late.

---
Uncle May's Produce | Hyde Park, Chicago, IL
unclemays.com | info@unclemays.com`;
  }

  // Create campaign targeted at this specific subscriber
  const campaignRes = await fetch(
    `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/campaigns`,
    {
      method: "POST",
      headers: { Authorization: authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "regular",
        settings: {
          subject_line: subjectLine,
          preview_text: previewText,
          title: `Abandoned Cart Email ${emailNumber} - ${sessionTag}`,
          from_name: "Uncle May's Produce",
          reply_to: "info@unclemays.com",
        },
        recipients: {
          list_id: MAILCHIMP_LIST_ID,
          segment_opts: {
            match: "all",
            conditions: [
              {
                condition_type: "EmailAddress",
                field: "EMAIL",
                op: "is",
                value: email,
              },
            ],
          },
        },
        tracking: { opens: true, html_clicks: true, text_clicks: true },
      }),
    }
  );

  const campaign = await campaignRes.json();
  if (!campaign.id) {
    throw new Error(`Mailchimp campaign creation failed: ${JSON.stringify(campaign)}`);
  }

  // Set email content
  await fetch(
    `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/campaigns/${campaign.id}/content`,
    {
      method: "PUT",
      headers: { Authorization: authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({ html: htmlContent, plain_text: plainText }),
    }
  );

  // Send
  const sendRes = await fetch(
    `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/campaigns/${campaign.id}/actions/send`,
    { method: "POST", headers: { Authorization: authHeader } }
  );

  if (sendRes.status !== 204) {
    const err = await sendRes.json().catch(() => ({}));
    throw new Error(`Mailchimp send failed for campaign ${campaign.id}: ${JSON.stringify(err)}`);
  }

  return { campaignId: campaign.id };
}

function parseNameParts(fullName: string): { first: string; last: string } {
  const parts = (fullName || "").trim().split(/\s+/);
  return { first: parts[0] || "", last: parts.slice(1).join(" ") || "" };
}

/**
 * Stripe Abandoned Checkout Recovery - 3-Email Sequence
 *
 * Polls Stripe API every 30 minutes for expired checkout sessions.
 * Sends 3-email recovery sequence:
 * - Email 1: 1 hour after expiration (sessions expired 1-24 hours ago)
 * - Email 2: 24 hours after expiration (sessions expired 24-48 hours ago)
 * - Email 3: 48 hours after expiration (sessions expired 48-72 hours ago)
 *
 * This is Phase 1A with full 3-email sequence support.
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
    const oneHourAgo = now - 3600;
    const twentyFourHoursAgo = now - 24 * 3600;
    const fortyEightHoursAgo = now - 48 * 3600;
    const seventyTwoHoursAgo = now - 72 * 3600;

    const results: any[] = [];

    /**
     * Process a single time window. Each window is INDEPENDENT of the others —
     * we don't require that an earlier email was sent before sending a later one,
     * because the old "chain" logic combined with ephemeral state silently skipped
     * carts that aged past the first window without ever getting any email.
     *
     * Gate is a Mailchimp tag on the customer: `abc_<session8>_e<N>`. If the
     * contact already has that tag, we've already sent them this specific email
     * for this specific session — skip. Otherwise send, then add the tag.
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

        const tag = sessionEmailTag(session.id, emailNumber);
        const existingTags = await getContactTags(mailchimpKey, email);
        if (existingTags.has(tag)) {
          // Already sent this email for this session — skip
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

    const email1Count = await processWindow(1, twentyFourHoursAgo, oneHourAgo, "1-24h window");
    const email2Count = await processWindow(2, fortyEightHoursAgo, twentyFourHoursAgo, "24-48h window");
    const email3Count = await processWindow(3, seventyTwoHoursAgo, fortyEightHoursAgo, "48-72h window");

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
