import { schedules, task } from "@trigger.dev/sdk/v3";
import { createHash } from "crypto";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const MAILCHIMP_DC = "us19";
const MAILCHIMP_LIST_ID = "2645503d11";

// Track which emails we've sent per session (persistent file-based store)
const SENT_EMAILS_FILE = join(process.cwd(), ".stripe-abandoned-emails.json");

function md5(s: string) {
  return createHash("md5").update(s).digest("hex");
}

interface EmailTracker {
  [sessionId: string]: {
    email1SentAt?: string;
    email2SentAt?: string;
    email3SentAt?: string;
  };
}

function loadEmailTracker(): EmailTracker {
  if (!existsSync(SENT_EMAILS_FILE)) {
    return {};
  }
  try {
    const data = JSON.parse(readFileSync(SENT_EMAILS_FILE, "utf-8"));
    return data.emails || {};
  } catch {
    return {};
  }
}

function saveEmailTracker(tracker: EmailTracker) {
  writeFileSync(
    SENT_EMAILS_FILE,
    JSON.stringify({ emails: tracker, updatedAt: new Date().toISOString() }, null, 2)
  );
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
  const firstName = name.first || "there";
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
      Complete your order now and get Sunday delivery. Questions? Call us anytime at
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
      Uncle May's Produce | Chicago, IL<br>
      <a href="https://unclemays.com" style="color:#999;">unclemays.com</a> |
      <a href="mailto:info@unclemays.com" style="color:#999;">info@unclemays.com</a>
    </p>
  </div>
</body>
</html>`;
    plainText = `Hi ${firstName},

You started an order for premium produce from Uncle May's but didn't finish. Your items are still in your cart, ready to go. We curate every box with care for Black families who want quality they can count on.

Complete your order now and get Sunday delivery. Questions? Call us anytime at (312) 972-2595.

${checkoutUrl}

---
Uncle May's Produce | Chicago, IL
unclemays.com | info@unclemays.com`;
  } else if (emailNumber === 2) {
    // Email 2: Urgency Reminder (24 hours after abandonment)
    subjectLine = "Order by Thursday for Sunday delivery";
    previewText = "89% of our customers refer friends. Your box is almost ready.";
    htmlContent = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,sans-serif;color:#1a1a1a;background:#fff;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
    <h2 style="font-size:22px;margin-bottom:16px;color:#2d7a2d;">Order by Thursday for Sunday delivery</h2>
    <p style="font-size:16px;line-height:1.6;">Hi ${firstName},</p>
    <p style="font-size:16px;line-height:1.6;">
      We saved your cart, but time is running out. To get your fresh produce delivered this Sunday,
      you need to complete your order by Thursday.
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
      Uncle May's Produce | Chicago, IL<br>
      <a href="https://unclemays.com" style="color:#999;">unclemays.com</a> |
      <a href="mailto:info@unclemays.com" style="color:#999;">info@unclemays.com</a>
    </p>
  </div>
</body>
</html>`;
    plainText = `Hi ${firstName},

We saved your cart, but time is running out. To get your fresh produce delivered this Sunday, you need to complete your order by Thursday.

Uncle May's isn't your average grocery box. We curate premium produce for Black communities that deserve the best. 89% of our customers refer friends and family because they trust what we deliver.

${checkoutUrl}

Questions? We're here: (312) 972-2595

---
Uncle May's Produce | Chicago, IL
unclemays.com | info@unclemays.com`;
  } else {
    // Email 3: Final Urgency (48 hours after abandonment)
    subjectLine = "Last chance: Limited boxes left this week";
    previewText = "We only have a few boxes left for Sunday delivery. Order now or miss out.";
    htmlContent = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,sans-serif;color:#1a1a1a;background:#fff;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
    <h2 style="font-size:22px;margin-bottom:16px;color:#d9534f;">Last chance: Limited boxes left this week</h2>
    <p style="font-size:16px;line-height:1.6;">Hi ${firstName},</p>
    <p style="font-size:16px;line-height:1.6;">
      This is your final reminder. We have limited boxes available for Sunday delivery, and your cart
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
      Uncle May's Produce | Chicago, IL<br>
      <a href="https://unclemays.com" style="color:#999;">unclemays.com</a> |
      <a href="mailto:info@unclemays.com" style="color:#999;">info@unclemays.com</a>
    </p>
  </div>
</body>
</html>`;
    plainText = `Hi ${firstName},

This is your final reminder. We have limited boxes available for Sunday delivery, and your cart is still sitting there. Once they're gone, you'll have to wait until next week.

Our customers love Uncle May's because we bring quality produce to neighborhoods that have been overlooked for too long. Don't miss your chance to join them this week.

${checkoutUrl}

Need help? Call (312) 972-2595 before it's too late.

---
Uncle May's Produce | Chicago, IL
unclemays.com | info@unclemays.com`;
  }

  // Create campaign targeted at this specific subscriber
  const campaignRes = await fetch(
    `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/campaigns`,
    {
      method: "POST",
      headers: { Authorization: authHeader, "Content-Type: application/json" },
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

    const emailTracker = loadEmailTracker();
    const results: any[] = [];

    // Email 1: Sessions expired 1-24 hours ago (no Email 1 sent yet)
    const email1Sessions = await fetchStripeExpiredSessions(
      stripeKey,
      twentyFourHoursAgo,
      oneHourAgo
    );

    console.log(`Found ${email1Sessions.length} sessions for Email 1 (1-24h window)`);

    for (const session of email1Sessions) {
      if (emailTracker[session.id]?.email1SentAt) {
        continue; // Already sent Email 1
      }

      const email = session.customer_details?.email;
      if (!email) {
        console.warn(`Session ${session.id} has no customer email, skipping`);
        continue;
      }

      const name = parseNameParts(session.customer_details?.name || "");

      // Upsert in Mailchimp
      await upsertMailchimpContact(mailchimpKey, email, name).catch((e) =>
        console.warn(`Mailchimp upsert warning for ${email}:`, e.message)
      );

      // Send Email 1
      try {
        const { campaignId } = await sendEmail(mailchimpKey, email, name, session.id, 1);

        // Track Email 1 sent
        if (!emailTracker[session.id]) emailTracker[session.id] = {};
        emailTracker[session.id].email1SentAt = new Date().toISOString();
        saveEmailTracker(emailTracker);

        console.log(`✓ Email 1 sent | session=${session.id} email=${email} campaign=${campaignId}`);

        results.push({
          sessionId: session.id,
          email,
          emailNumber: 1,
          sent: true,
          campaignId,
        });
      } catch (e: any) {
        console.error(`✗ Email 1 failed for session ${session.id}:`, e.message);
        results.push({
          sessionId: session.id,
          email,
          emailNumber: 1,
          sent: false,
          error: e.message,
        });
      }
    }

    // Email 2: Sessions expired 24-48 hours ago (Email 1 sent, Email 2 not sent)
    const email2Sessions = await fetchStripeExpiredSessions(
      stripeKey,
      fortyEightHoursAgo,
      twentyFourHoursAgo
    );

    console.log(`Found ${email2Sessions.length} sessions for Email 2 (24-48h window)`);

    for (const session of email2Sessions) {
      if (!emailTracker[session.id]?.email1SentAt) {
        continue; // Email 1 not sent yet
      }
      if (emailTracker[session.id]?.email2SentAt) {
        continue; // Already sent Email 2
      }

      const email = session.customer_details?.email;
      if (!email) continue;

      const name = parseNameParts(session.customer_details?.name || "");

      try {
        const { campaignId } = await sendEmail(mailchimpKey, email, name, session.id, 2);

        // Track Email 2 sent
        emailTracker[session.id].email2SentAt = new Date().toISOString();
        saveEmailTracker(emailTracker);

        console.log(`✓ Email 2 sent | session=${session.id} email=${email} campaign=${campaignId}`);

        results.push({
          sessionId: session.id,
          email,
          emailNumber: 2,
          sent: true,
          campaignId,
        });
      } catch (e: any) {
        console.error(`✗ Email 2 failed for session ${session.id}:`, e.message);
        results.push({
          sessionId: session.id,
          email,
          emailNumber: 2,
          sent: false,
          error: e.message,
        });
      }
    }

    // Email 3: Sessions expired 48-72 hours ago (Email 2 sent, Email 3 not sent)
    const email3Sessions = await fetchStripeExpiredSessions(
      stripeKey,
      seventyTwoHoursAgo,
      fortyEightHoursAgo
    );

    console.log(`Found ${email3Sessions.length} sessions for Email 3 (48-72h window)`);

    for (const session of email3Sessions) {
      if (!emailTracker[session.id]?.email2SentAt) {
        continue; // Email 2 not sent yet
      }
      if (emailTracker[session.id]?.email3SentAt) {
        continue; // Already sent Email 3
      }

      const email = session.customer_details?.email;
      if (!email) continue;

      const name = parseNameParts(session.customer_details?.name || "");

      try {
        const { campaignId } = await sendEmail(mailchimpKey, email, name, session.id, 3);

        // Track Email 3 sent
        emailTracker[session.id].email3SentAt = new Date().toISOString();
        saveEmailTracker(emailTracker);

        console.log(`✓ Email 3 sent | session=${session.id} email=${email} campaign=${campaignId}`);

        results.push({
          sessionId: session.id,
          email,
          emailNumber: 3,
          sent: true,
          campaignId,
        });
      } catch (e: any) {
        console.error(`✗ Email 3 failed for session ${session.id}:`, e.message);
        results.push({
          sessionId: session.id,
          email,
          emailNumber: 3,
          sent: false,
          error: e.message,
        });
      }
    }

    return {
      email1: {
        totalSessions: email1Sessions.length,
        sent: results.filter((r) => r.emailNumber === 1 && r.sent).length,
        failed: results.filter((r) => r.emailNumber === 1 && !r.sent).length,
      },
      email2: {
        totalSessions: email2Sessions.length,
        sent: results.filter((r) => r.emailNumber === 2 && r.sent).length,
        failed: results.filter((r) => r.emailNumber === 2 && !r.sent).length,
      },
      email3: {
        totalSessions: email3Sessions.length,
        sent: results.filter((r) => r.emailNumber === 3 && r.sent).length,
        failed: results.filter((r) => r.emailNumber === 3 && !r.sent).length,
      },
      totalProcessed: results.length,
      results,
    };
  },
});
