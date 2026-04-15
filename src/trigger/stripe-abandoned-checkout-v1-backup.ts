import { schedules, task } from "@trigger.dev/sdk/v3";
import { createHash } from "crypto";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const MAILCHIMP_DC = "us19";
const MAILCHIMP_LIST_ID = "2645503d11";

// Track which Stripe sessions we've already contacted (persistent file-based store)
const SENT_SESSIONS_FILE = join(process.cwd(), ".stripe-abandoned-sent.json");

function md5(s: string) {
  return createHash("md5").update(s).digest("hex");
}

function loadSentSessions(): Set<string> {
  if (!existsSync(SENT_SESSIONS_FILE)) {
    return new Set();
  }
  try {
    const data = JSON.parse(readFileSync(SENT_SESSIONS_FILE, "utf-8"));
    return new Set(data.sessions || []);
  } catch {
    return new Set();
  }
}

function saveSentSessions(sessions: Set<string>) {
  writeFileSync(
    SENT_SESSIONS_FILE,
    JSON.stringify({ sessions: Array.from(sessions), updatedAt: new Date().toISOString() }, null, 2)
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

  // Filter to sessions created in our time window (1-48 hours ago)
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

async function sendRecoveryEmail(
  apiKey: string,
  email: string,
  name: { first?: string; last?: string },
  sessionId: string
): Promise<{ campaignId: string }> {
  const authHeader = `Basic ${btoa("anystring:" + apiKey)}`;
  const firstName = name.first || "there";
  const sessionTag = sessionId.substring(0, 8);
  const checkoutUrl =
    `https://unclemays.com/boxes` +
    `?utm_source=email&utm_medium=abandoned_cart&utm_campaign=recovery&utm_content=${sessionTag}`;

  // Email copy from Advertising Creative (Email 1: Cart Reminder)
  const htmlContent = `<!DOCTYPE html>
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

  const plainText = `Hi ${firstName},

You started an order for premium produce from Uncle May's but didn't finish. Your items are still in your cart, ready to go. We curate every box with care for Black families who want quality they can count on.

Complete your order now and get Sunday delivery. Questions? Call us anytime at (312) 972-2595.

${checkoutUrl}

---
Uncle May's Produce | Chicago, IL
unclemays.com | info@unclemays.com`;

  // Create campaign targeted at this specific subscriber
  const campaignRes = await fetch(
    `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/campaigns`,
    {
      method: "POST",
      headers: { Authorization: authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "regular",
        settings: {
          subject_line: "Your Uncle May's box is waiting",
          preview_text: "Complete your order in 2 minutes. Fresh, curated produce for your table.",
          title: `Abandoned Cart Recovery - ${sessionTag}`,
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
 * Stripe Abandoned Checkout Recovery (Phase 1 - Temporary)
 *
 * Polls Stripe API every 30 minutes for expired checkout sessions.
 * Sends recovery email 1 hour after expiration (sessions expired 1-48 hours ago).
 *
 * This is a temporary solution while CTO builds the proper webhook→checkout-store bridge.
 * Phase 2 will migrate back to the local checkout-store architecture.
 */
export const stripeAbandonedCheckoutProcessor = schedules.task({
  id: "stripe-abandoned-checkout-processor",
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
    const fortyEightHoursAgo = now - 48 * 3600;

    // Fetch Stripe sessions that expired between 1 and 48 hours ago
    const sessions = await fetchStripeExpiredSessions(
      stripeKey,
      fortyEightHoursAgo,
      oneHourAgo
    );

    console.log(`Found ${sessions.length} expired Stripe checkout sessions (1-48h window)`);

    const sentSessions = loadSentSessions();
    const results: any[] = [];

    for (const session of sessions) {
      // Skip if already contacted
      if (sentSessions.has(session.id)) {
        continue;
      }

      // Skip if no customer email
      const email = session.customer_details?.email;
      if (!email) {
        console.warn(`Session ${session.id} has no customer email, skipping`);
        continue;
      }

      const name = parseNameParts(session.customer_details?.name || "");

      // Upsert in Mailchimp (required for targeted campaign)
      await upsertMailchimpContact(mailchimpKey, email, name).catch((e) =>
        console.warn(`Mailchimp upsert warning for ${email}:`, e.message)
      );

      // Send recovery email
      try {
        const { campaignId } = await sendRecoveryEmail(
          mailchimpKey,
          email,
          name,
          session.id
        );

        // Mark as sent
        sentSessions.add(session.id);
        saveSentSessions(sentSessions);

        console.log(
          `✓ Recovery email sent | session=${session.id} email=${email} campaign=${campaignId}`
        );

        results.push({
          sessionId: session.id,
          email,
          sent: true,
          campaignId,
          amountCents: session.amount_total,
        });
      } catch (e: any) {
        console.error(`✗ Recovery email failed for session ${session.id}:`, e.message);
        results.push({
          sessionId: session.id,
          email,
          sent: false,
          error: e.message,
        });
      }
    }

    return {
      totalExpired: sessions.length,
      alreadySent: sessions.length - results.length,
      processed: results.length,
      successful: results.filter((r) => r.sent).length,
      failed: results.filter((r) => !r.sent).length,
      results,
    };
  },
});

/**
 * Manual backfill task for Stripe abandoned checkouts
 *
 * Useful for catching up on historical abandoned sessions.
 * Use with dryRun: true to preview before sending.
 */
export const backfillStripeAbandonedCheckouts = task({
  id: "backfill-stripe-abandoned-checkouts",
  maxDuration: 300,
  run: async (payload?: { lookbackHours?: number; dryRun?: boolean }) => {
    const hours = payload?.lookbackHours ?? 48;
    const dryRun = payload?.dryRun ?? false;
    const stripeKey = process.env.STRIPE_API_KEY!;
    const mailchimpKey = process.env.MAILCHIMP_API_KEY!;

    const now = Math.floor(Date.now() / 1000);
    const afterTimestamp = now - hours * 3600;

    const sessions = await fetchStripeExpiredSessions(stripeKey, afterTimestamp, now);
    const sentSessions = loadSentSessions();

    const unsent = sessions.filter(
      (s) => !sentSessions.has(s.id) && s.customer_details?.email
    );

    if (dryRun) {
      return {
        dryRun: true,
        totalExpired: sessions.length,
        alreadySent: sessions.length - unsent.length,
        wouldSend: unsent.length,
        sessions: unsent.map((s) => ({
          id: s.id,
          email: s.customer_details?.email,
          name: s.customer_details?.name,
          createdAt: new Date(s.created * 1000).toISOString(),
          expiresAt: new Date(s.expires_at * 1000).toISOString(),
          amountCents: s.amount_total,
        })),
      };
    }

    const results: any[] = [];
    for (const session of unsent) {
      const email = session.customer_details!.email!;
      const name = parseNameParts(session.customer_details?.name || "");

      await upsertMailchimpContact(mailchimpKey, email, name).catch((e) =>
        console.warn("Mailchimp upsert warning:", e.message)
      );

      try {
        const { campaignId } = await sendRecoveryEmail(
          mailchimpKey,
          email,
          name,
          session.id
        );
        sentSessions.add(session.id);
        saveSentSessions(sentSessions);
        results.push({ sessionId: session.id, sent: true, email, campaignId });
      } catch (e: any) {
        results.push({ sessionId: session.id, sent: false, email, error: e.message });
      }
    }

    return {
      totalExpired: sessions.length,
      alreadySent: sessions.length - unsent.length,
      processed: results.length,
      successful: results.filter((r) => r.sent).length,
      failed: results.filter((r) => !r.sent).length,
      results,
    };
  },
});
