import { schedules, task, wait } from "@trigger.dev/sdk/v3";
import { createHash } from "crypto";

const MAILCHIMP_DC = "us19";
const MAILCHIMP_LIST_ID = "2645503d11";

// Base URL for the Uncle May's website API (checkout-store sessions)
const SITE_BASE_URL = process.env.SITE_BASE_URL || "https://unclemays.com";

function md5(s: string) {
  return createHash("md5").update(s).digest("hex");
}

// --- Local checkout-store (new 3-step checkout flow) ---

interface LocalCheckoutSession {
  id: string;
  product: string;
  price: number;
  productName: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address: {
    street: string;
    apt?: string;
    city: string;
    state: string;
    zip: string;
  };
  paymentIntentId?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  recoveryEmailSent?: boolean;
}

// Fetch abandoned local sessions (created but not completed, older than 1h, within 48h)
async function fetchAbandonedLocalSessions(since: string): Promise<LocalCheckoutSession[]> {
  const url = `${SITE_BASE_URL}/api/checkout/session?since=${encodeURIComponent(since)}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.warn("fetchAbandonedLocalSessions: API returned", res.status);
    return [];
  }
  const data = await res.json();
  return (data.sessions || []) as LocalCheckoutSession[];
}

// Mark a local session so we don't re-send recovery emails
async function markLocalSessionEmailSent(sessionId: string): Promise<void> {
  await fetch(`${SITE_BASE_URL}/api/checkout/session`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, recoveryEmailSent: true }),
  });
}

// --- Mailchimp ---

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

  const htmlContent = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,sans-serif;color:#1a1a1a;background:#fff;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
    <h2 style="font-size:22px;margin-bottom:16px;">Your produce box is still available</h2>
    <p style="font-size:16px;line-height:1.6;">Hi ${firstName},</p>
    <p style="font-size:16px;line-height:1.6;">
      You started an order with Uncle May's Produce but didn't complete it.
      Your fresh produce box is just one click away.
    </p>
    <p style="margin:32px 0;">
      <a href="${checkoutUrl}"
         style="background:#2d7a2d;color:white;padding:14px 28px;text-decoration:none;border-radius:4px;font-size:16px;font-weight:bold;display:inline-block;">
        Complete My Order
      </a>
    </p>
    <p style="font-size:14px;color:#666;line-height:1.6;">
      Questions? Reply to this email or call (312) 972-2595.
    </p>
    <p style="font-size:14px;color:#666;">— The Uncle May's Team</p>
    <hr style="border:none;border-top:1px solid #eee;margin:32px 0;" />
    <p style="font-size:12px;color:#999;">
      Uncle May's Produce &nbsp;|&nbsp; Chicago, IL &nbsp;|&nbsp;
      <a href="https://unclemays.com" style="color:#999;">unclemays.com</a>
    </p>
  </div>
</body>
</html>`;

  const plainText = [
    `Hi ${firstName},`,
    ``,
    `You started an order with Uncle May's Produce but didn't complete it.`,
    `Complete your order here: ${checkoutUrl}`,
    ``,
    `Questions? Call us at (312) 972-2595.`,
    ``,
    `— The Uncle May's Team`,
  ].join("\n");

  // Create campaign targeted at this specific subscriber
  const campaignRes = await fetch(
    `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/campaigns`,
    {
      method: "POST",
      headers: { Authorization: authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "regular",
        settings: {
          subject_line: "Your Uncle May's produce box is still waiting",
          preview_text: "Complete your order and get fresh produce delivered.",
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

// --- Apollo ---

async function upsertApolloContact(
  apiKey: string,
  email: string,
  name: { first?: string; last?: string }
) {
  const ABANDONED_TAG = "Customers";
  const headers = { "Content-Type": "application/json", "X-Api-Key": apiKey };

  const searchRes = await fetch("https://api.apollo.io/api/v1/contacts/search", {
    method: "POST",
    headers,
    body: JSON.stringify({ q_keywords: email, page: 1, per_page: 1 }),
  });
  const searchData = await searchRes.json();
  const existing = searchData.contacts?.[0];

  if (existing) {
    const labels: string[] = existing.label_names || [];
    if (!labels.includes(ABANDONED_TAG)) {
      await fetch(`https://api.apollo.io/api/v1/contacts/${existing.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ label_names: [...labels, ABANDONED_TAG] }),
      });
    }
    return { action: "tagged", id: existing.id };
  }

  const createRes = await fetch("https://api.apollo.io/api/v1/contacts", {
    method: "POST",
    headers,
    body: JSON.stringify({
      email,
      first_name: name.first || "",
      last_name: name.last || "",
      label_names: [ABANDONED_TAG],
    }),
  });
  const created = await createRes.json();
  return { action: "created", id: created.contact?.id };
}

// --- Shared helpers ---

function parseNameParts(fullName: string): { first: string; last: string } {
  const parts = (fullName || "").trim().split(/\s+/);
  return { first: parts[0] || "", last: parts.slice(1).join(" ") || "" };
}

// --- Webhook-triggered task: waits 1 hour, then sends recovery email ---
// Triggered from /api/checkout/session (POST) after delivery form submission.
// Payload now carries local session data — no Stripe session lookup needed.

export const sendAbandonedCheckoutEmail = task({
  id: "send-abandoned-checkout-email",
  maxDuration: 120,
  run: async (payload: {
    sessionId: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    product?: string | null;
    // Legacy fields kept for backwards-compat with old Stripe-session triggers
    customerName?: string | null;
    expiresAt?: number | null;
  }) => {
    // Wait 1 hour before sending — Trigger.dev checkpoints this automatically
    await wait.for({ hours: 1 });

    const mailchimpKey = process.env.MAILCHIMP_API_KEY!;

    // Re-verify session is still abandoned by querying the local checkout-store
    const checkUrl = `${SITE_BASE_URL}/api/checkout/session?since=${encodeURIComponent(
      new Date(Date.now() - 48 * 3600 * 1000).toISOString()
    )}`;
    let alreadyPaid = false;
    let alreadySent = false;
    try {
      const sessionRes = await fetch(checkUrl);
      if (sessionRes.ok) {
        const { sessions } = (await sessionRes.json()) as { sessions: LocalCheckoutSession[] };
        const match = sessions.find((s) => s.id === payload.sessionId);
        if (match) {
          alreadyPaid = !!match.completedAt;
          alreadySent = !!match.recoveryEmailSent;
        }
      }
    } catch (e) {
      console.warn("Could not verify session status, proceeding with send:", e);
    }

    if (alreadyPaid) {
      console.log(`Session ${payload.sessionId} was paid — skipping recovery email`);
      return { skipped: true, reason: "checkout_completed" };
    }

    if (alreadySent) {
      console.log(`Session ${payload.sessionId} already processed — skipping`);
      return { skipped: true, reason: "already_processed" };
    }

    const email = payload.email;
    const name = payload.firstName
      ? { first: payload.firstName, last: payload.lastName ?? "" }
      : parseNameParts(payload.customerName ?? "");

    // Ensure contact exists in Mailchimp (required for targeted campaign send)
    await upsertMailchimpContact(mailchimpKey, email, name).catch((e) =>
      console.warn("Mailchimp upsert warning:", e.message)
    );

    // Send recovery email via Mailchimp campaign
    const { campaignId } = await sendRecoveryEmail(
      mailchimpKey,
      email,
      name,
      payload.sessionId
    );

    // Mark local session to prevent duplicate sends (fire-and-forget)
    await markLocalSessionEmailSent(payload.sessionId).catch((e) =>
      console.warn("markLocalSessionEmailSent error:", e.message)
    );

    console.log(
      `Recovery email sent | session=${payload.sessionId} email=${email} campaign=${campaignId}`
    );
    return { sent: true, email, campaignId };
  },
});

// --- Scheduled fallback: catches local sessions missed by direct trigger, runs every 15 min ---
// Queries the local checkout-store for abandoned sessions (delivery submitted, payment not completed).

export const abandonedCheckoutProcessor = schedules.task({
  id: "abandoned-checkout-processor",
  cron: "*/15 * * * *",
  run: async () => {
    const apolloKey = process.env.APOLLO_API_KEY!;
    const mailchimpKey = process.env.MAILCHIMP_API_KEY!;

    // Fetch local sessions created in the last 48h
    const since = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
    const allSessions = await fetchAbandonedLocalSessions(since);

    const now = Date.now();
    const oneHourAgo = now - 3600 * 1000;
    const fourHoursAgo = now - 4 * 3600 * 1000;

    // Qualifying sessions:
    // 1. Not completed (no completedAt)
    // 2. Created 1–4 hours ago (1hr minimum delay, 4hr max)
    // 3. Recovery email not already sent
    const qualifying = allSessions.filter((s) => {
      const createdMs = new Date(s.createdAt).getTime();
      return (
        !s.completedAt &&
        !s.recoveryEmailSent &&
        createdMs <= oneHourAgo &&
        createdMs >= fourHoursAgo
      );
    });

    console.log(
      `Local sessions: ${allSessions.length} total, ${qualifying.length} qualifying for recovery`
    );

    const results: any[] = [];

    for (const session of qualifying) {
      const email = session.email;
      const name = { first: session.firstName, last: session.lastName ?? "" };

      // Tag in Apollo for CRM tracking
      const apolloResult = await upsertApolloContact(apolloKey, email, name).catch(
        (e: any) => ({ error: e.message })
      );

      // Upsert in Mailchimp (required for targeted campaign)
      await upsertMailchimpContact(mailchimpKey, email, name).catch((e) =>
        console.warn(`Mailchimp upsert warning for ${email}:`, e.message)
      );

      // Send recovery email
      let recoveryResult: any;
      try {
        const { campaignId } = await sendRecoveryEmail(
          mailchimpKey,
          email,
          name,
          session.id
        );
        await markLocalSessionEmailSent(session.id);
        recoveryResult = { sent: true, campaignId };
        console.log(
          `Recovery email sent | session=${session.id} email=${email} campaign=${campaignId}`
        );
      } catch (e: any) {
        recoveryResult = { sent: false, error: e.message };
        console.error(`Recovery email failed for session ${session.id}:`, e.message);
      }

      results.push({
        sessionId: session.id,
        email,
        priceDollars: session.price,
        product: session.product,
        apollo: apolloResult,
        recovery: recoveryResult,
      });
    }

    return {
      totalSessions: allSessions.length,
      qualifying: qualifying.length,
      processed: results.length,
      results,
    };
  },
});

// --- Manual backfill task (local checkout-store) ---

export const backfillAbandonedCheckouts = task({
  id: "backfill-abandoned-checkouts",
  maxDuration: 300,
  run: async (payload?: { lookbackHours?: number; dryRun?: boolean }) => {
    const hours = payload?.lookbackHours ?? 24;
    const dryRun = payload?.dryRun ?? false;
    const mailchimpKey = process.env.MAILCHIMP_API_KEY!;

    const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();
    const allSessions = await fetchAbandonedLocalSessions(since);
    const notCompleted = allSessions.filter((s) => !s.completedAt);

    if (dryRun) {
      return {
        dryRun: true,
        totalSessions: allSessions.length,
        notCompleted: notCompleted.length,
        sessions: notCompleted.map((s) => ({
          id: s.id,
          email: s.email,
          product: s.product,
          price: s.price,
          createdAt: s.createdAt,
          alreadySent: !!s.recoveryEmailSent,
        })),
      };
    }

    const results: any[] = [];
    for (const session of notCompleted) {
      if (session.recoveryEmailSent) {
        results.push({ sessionId: session.id, skipped: true, reason: "already_sent" });
        continue;
      }

      const email = session.email;
      const name = { first: session.firstName, last: session.lastName ?? "" };

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
        await markLocalSessionEmailSent(session.id);
        results.push({ sessionId: session.id, sent: true, email, campaignId });
      } catch (e: any) {
        results.push({ sessionId: session.id, sent: false, error: e.message });
      }
    }

    return {
      polledSessions: allSessions.length,
      notCompleted: notCompleted.length,
      processed: results.length,
      results,
    };
  },
});
