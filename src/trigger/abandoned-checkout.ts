import { schedules, task, wait } from "@trigger.dev/sdk/v3";
import { createHash } from "crypto";
import { isSuppressed } from "./_email-suppression";
import { sendTransactional } from "../lib/email/resend";

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
  recoveryEmailSent?: boolean; // Legacy
  // Step 0 (the +2h "feedback ask") was retired 2026-05-02. The field is
  // kept on the interface for backward-compat with historical session rows
  // but is no longer written by any current code path.
  recoveryEmail0SentAt?: string;
  recoveryEmail1SentAt?: string;
  recoveryEmail2SentAt?: string;
  recoveryEmail3SentAt?: string;
  deliveryDate?: string;
  deliveryWindow?: string;
  smsConfirmationSent?: boolean;
  smsConfirmationResponse?: "pending" | "confirmed" | "declined" | null;
  smsConfirmationSentAt?: string;
  smsConfirmationRespondedAt?: string;
}

// Fetch abandoned local sessions (created but not completed, within lookback window)
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

// Mark which recovery email was sent. Step 0 was retired 2026-05-02; only
// emails 1, 2, 3 fire today.
async function markRecoveryEmailSent(
  sessionId: string,
  emailNumber: 1 | 2 | 3
): Promise<void> {
  const field = `recoveryEmail${emailNumber}SentAt` as const;
  await fetch(`${SITE_BASE_URL}/api/checkout/session`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, [field]: new Date().toISOString() }),
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

async function sendEmail(
  _apiKey: string,
  email: string,
  name: { first?: string; last?: string },
  sessionId: string,
  emailNumber: 1 | 2 | 3,
  product?: string | null
): Promise<{ campaignId: string }> {
  const firstName = name.first || "friend";
  const sessionTag = sessionId.substring(0, 8);
  // Catalog model: link back to /shop where the customer rebuilds their
  // cart. localStorage will repopulate if they're on the same browser; if
  // they're on a different device, /shop is the right starting point.
  void product; // legacy product slug , no longer used in URL
  const checkoutUrl =
    `https://unclemays.com/shop` +
    `?utm_source=email&utm_medium=abandoned_cart&utm_campaign=recovery_email${emailNumber}&utm_content=${sessionTag}`;

  let subjectLine: string;
  let htmlContent: string;
  let plainText: string;

  if (emailNumber === 1) {
    // Email 1: gentle nudge (24h after abandonment)
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
      Your cart is still saved. Pick up where you left off whenever you're ready.
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

You started an order at Uncle May's but didn't finish checking out. Your cart is still saved. Pick up where you left off whenever you're ready.

Use code FRESH10 at checkout for $10 off your first order ($25 minimum).

${checkoutUrl}

---
Uncle May's Produce · Hyde Park, Chicago, IL
unclemays.com · info@unclemays.com`;
  } else if (emailNumber === 2) {
    // Email 2: cutoff reminder (48h after abandonment)
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
    // Email 3: last touch (72h after abandonment)
    subjectLine = "Still want to finish your Uncle May's order?";
    htmlContent = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,sans-serif;color:#1a1a1a;background:#fff;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
    <h2 style="font-size:22px;margin-bottom:16px;color:#2d7a2d;">Still want to finish your order?</h2>
    <p style="font-size:16px;line-height:1.6;">Hi ${firstName},</p>
    <p style="font-size:16px;line-height:1.6;">
      Last note from us. Your cart is still here whenever you're ready.
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

Last note from us. Your cart is still here whenever you're ready. No commitment, no subscription , just fresh produce, pantry, and pasture-raised protein from Black farmers, delivered weekly.

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
      { name: "type", value: "abandoned_cart" },
      { name: "step", value: String(emailNumber) },
      { name: "session", value: sessionTag },
    ],
  });

  if (!result.sent) {
    throw new Error(`Resend send failed: ${result.error || result.reason || "unknown"}`);
  }

  return { campaignId: result.id || "" };
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

// Fetch a single session by ID from the checkout API
async function fetchSession(sessionId: string): Promise<LocalCheckoutSession | null> {
  try {
    const res = await fetch(`${SITE_BASE_URL}/api/checkout/session/${sessionId}`);
    if (!res.ok) return null;
    return (await res.json()) as LocalCheckoutSession;
  } catch (e) {
    console.warn("Could not fetch session:", e);
    return null;
  }
}

// Check if a session is still abandoned (not completed)
async function isSessionStillAbandoned(sessionId: string): Promise<boolean> {
  const session = await fetchSession(sessionId);
  if (!session) return true; // Assume still abandoned if we can't verify
  return !session.completedAt;
}

// Check if a specific recovery email was already sent for this session
async function isRecoveryEmailAlreadySent(
  sessionId: string,
  emailNumber: 1 | 2 | 3
): Promise<boolean> {
  const session = await fetchSession(sessionId);
  if (!session) return false; // Can't verify , allow send
  const field = `recoveryEmail${emailNumber}SentAt` as keyof LocalCheckoutSession;
  return !!session[field];
}

/**
 * Webhook-triggered task: 3-step recovery sequence with Trigger.dev waits.
 *
 * Triggered from /api/checkout/session (POST) after delivery form submission.
 * Step 0 (the "ask before we sell" feedback request) was retired 2026-05-02.
 *
 * - Email 1 (recovery):       24 hours after abandonment
 * - Email 2 (recovery):       48 hours after abandonment (if still abandoned)
 * - Email 3 (recovery):       72 hours after abandonment (if still abandoned)
 *
 * V1.1: detect Step 0 replies and suppress Steps 1-3 automatically. For now,
 * Anthony manually flags replied threads and skips the remaining steps via
 * the session API.
 */
export const sendAbandonedCheckoutEmail = task({
  id: "send-abandoned-checkout-email",
  maxDuration: 180, // 3 hours max (covers all waits)
  run: async (payload: {
    sessionId: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    product?: string | null;
    // Legacy fields kept for backwards-compat
    customerName?: string | null;
    expiresAt?: number | null;
  }) => {
    const mailchimpKey = process.env.MAILCHIMP_API_KEY!;
    const email = payload.email;
    const name = payload.firstName
      ? { first: payload.firstName, last: payload.lastName ?? "" }
      : parseNameParts(payload.customerName ?? "");

    if (isSuppressed(email)) {
      console.log(`[AbandonedCheckout] Suppressed recipient ${email} , skipping sequence`);
      return { skipped: true, reason: "suppressed_recipient", email };
    }

    const results: any[] = [];

    // Ensure contact exists in Mailchimp (required for targeted campaign send)
    await upsertMailchimpContact(mailchimpKey, email, name).catch((e) =>
      console.warn("Mailchimp upsert warning:", e.message)
    );

    // --- Email 1: Wait 24 hours, then send the first recovery email ---
    await wait.for({ hours: 24 });

    if (!(await isSessionStillAbandoned(payload.sessionId))) {
      console.log(`Session ${payload.sessionId} was paid , stopping before Email 1`);
      return { stopped: true, reason: "checkout_completed_before_email1" };
    }

    if (await isRecoveryEmailAlreadySent(payload.sessionId, 1)) {
      console.log(`Email 1 already sent for session ${payload.sessionId} (cron beat us) , skipping`);
      results.push({ emailNumber: 1, sent: false, reason: "already_sent" });
    } else {
      try {
        const { campaignId } = await sendEmail(
          mailchimpKey,
          email,
          name,
          payload.sessionId,
          1,
          payload.product
        );
        await markRecoveryEmailSent(payload.sessionId, 1);
        console.log(`Email 1 sent | session=${payload.sessionId} campaign=${campaignId}`);
        results.push({ emailNumber: 1, sent: true, campaignId });
      } catch (e: any) {
        console.error(`Email 1 failed for session ${payload.sessionId}:`, e.message);
        results.push({ emailNumber: 1, sent: false, error: e.message });
      }
    }

    // --- Email 2: Wait 24 more hours (48h total post-abandon), then send ---
    await wait.for({ hours: 24 });

    if (!(await isSessionStillAbandoned(payload.sessionId))) {
      console.log(`Session ${payload.sessionId} was paid , stopping after Email 1`);
      return { results, stopped: true, reason: "checkout_completed_before_email2" };
    }

    if (await isRecoveryEmailAlreadySent(payload.sessionId, 2)) {
      console.log(`Email 2 already sent for session ${payload.sessionId} (cron beat us) , skipping`);
      results.push({ emailNumber: 2, sent: false, reason: "already_sent" });
    } else {
      try {
        const { campaignId } = await sendEmail(
          mailchimpKey,
          email,
          name,
          payload.sessionId,
          2,
          payload.product
        );
        await markRecoveryEmailSent(payload.sessionId, 2);
        console.log(`Email 2 sent | session=${payload.sessionId} campaign=${campaignId}`);
        results.push({ emailNumber: 2, sent: true, campaignId });
      } catch (e: any) {
        console.error(`Email 2 failed for session ${payload.sessionId}:`, e.message);
        results.push({ emailNumber: 2, sent: false, error: e.message });
      }
    }

    // --- Email 3: Wait 24 more hours (72h total post-abandon), then send ---
    await wait.for({ hours: 24 });

    if (!(await isSessionStillAbandoned(payload.sessionId))) {
      console.log(`Session ${payload.sessionId} was paid , stopping after Email 2`);
      return { results, stopped: true, reason: "checkout_completed_before_email3" };
    }

    if (await isRecoveryEmailAlreadySent(payload.sessionId, 3)) {
      console.log(`Email 3 already sent for session ${payload.sessionId} (cron beat us) , skipping`);
      results.push({ emailNumber: 3, sent: false, reason: "already_sent" });
    } else {
      try {
        const { campaignId } = await sendEmail(
          mailchimpKey,
          email,
          name,
          payload.sessionId,
          3,
          payload.product
        );
        await markRecoveryEmailSent(payload.sessionId, 3);
        console.log(`Email 3 sent | session=${payload.sessionId} campaign=${campaignId}`);
        results.push({ emailNumber: 3, sent: true, campaignId });
      } catch (e: any) {
        console.error(`Email 3 failed for session ${payload.sessionId}:`, e.message);
        results.push({ emailNumber: 3, sent: false, error: e.message });
      }
    }

    return { completed: true, results };
  },
});

/**
 * Scheduled fallback: catches local sessions missed by direct trigger
 *
 * Runs every 15 minutes. Sends recovery emails for sessions that:
 * - Were created 1-72 hours ago
 * - Are not completed
 * - Haven't had each respective email sent yet
 *
 * This catches sessions where the webhook trigger failed or was not configured.
 */
export const abandonedCheckoutProcessor = schedules.task({
  id: "abandoned-checkout-processor",
  cron: "*/15 * * * *",
  run: async () => {
    const apolloKey = process.env.APOLLO_API_KEY!;
    const mailchimpKey = process.env.MAILCHIMP_API_KEY!;

    // Fetch local sessions created in the last 96h (covers Email 1 at 24h
    // through Email 3 at 72h, with a 24h buffer for cron drift).
    const since = new Date(Date.now() - 96 * 3600 * 1000).toISOString();
    const allSessions = await fetchAbandonedLocalSessions(since);

    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 3600 * 1000;
    const fortyEightHoursAgo = now - 48 * 3600 * 1000;
    const seventyTwoHoursAgo = now - 72 * 3600 * 1000;

    const results: any[] = [];

    // Process each email tier
    for (const session of allSessions) {
      if (session.completedAt) continue; // Skip completed orders

      const createdMs = new Date(session.createdAt).getTime();
      const email = session.email;
      if (isSuppressed(email)) continue;
      const name = { first: session.firstName, last: session.lastName ?? "" };

      // Tag in Apollo for CRM tracking (once per session)
      if (
        !session.recoveryEmail1SentAt &&
        !session.recoveryEmailSent
      ) {
        await upsertApolloContact(apolloKey, email, name).catch((e: any) =>
          console.warn("Apollo error:", e.message)
        );
      }

      // Email 1: Send if created 24+ hours ago and Email 1 not sent
      if (
        createdMs <= twentyFourHoursAgo &&
        !session.recoveryEmail1SentAt &&
        !session.recoveryEmailSent
      ) {
        await upsertMailchimpContact(mailchimpKey, email, name).catch((e) =>
          console.warn("Mailchimp upsert warning:", e.message)
        );

        try {
          const { campaignId } = await sendEmail(
            mailchimpKey,
            email,
            name,
            session.id,
            1,
            session.product
          );
          await markRecoveryEmailSent(session.id, 1);
          console.log(`Email 1 sent (cron) | session=${session.id} campaign=${campaignId}`);
          results.push({ sessionId: session.id, email, emailNumber: 1, sent: true, campaignId });
        } catch (e: any) {
          console.error(`Email 1 failed (cron) for session ${session.id}:`, e.message);
          results.push({ sessionId: session.id, email, emailNumber: 1, sent: false, error: e.message });
        }
      }

      // Email 2: Send if created 48+ hours ago, Email 1 was sent, and Email 2 not sent
      if (
        createdMs <= fortyEightHoursAgo &&
        (session.recoveryEmail1SentAt || session.recoveryEmailSent) &&
        !session.recoveryEmail2SentAt
      ) {
        try {
          const { campaignId } = await sendEmail(
            mailchimpKey,
            email,
            name,
            session.id,
            2,
            session.product
          );
          await markRecoveryEmailSent(session.id, 2);
          console.log(`Email 2 sent (cron) | session=${session.id} campaign=${campaignId}`);
          results.push({ sessionId: session.id, email, emailNumber: 2, sent: true, campaignId });
        } catch (e: any) {
          console.error(`Email 2 failed (cron) for session ${session.id}:`, e.message);
          results.push({ sessionId: session.id, email, emailNumber: 2, sent: false, error: e.message });
        }
      }

      // Email 3: Send if created 72+ hours ago, Email 2 was sent, and Email 3 not sent
      if (
        createdMs <= seventyTwoHoursAgo &&
        session.recoveryEmail2SentAt &&
        !session.recoveryEmail3SentAt
      ) {
        try {
          const { campaignId } = await sendEmail(
            mailchimpKey,
            email,
            name,
            session.id,
            3,
            session.product
          );
          await markRecoveryEmailSent(session.id, 3);
          console.log(`Email 3 sent (cron) | session=${session.id} campaign=${campaignId}`);
          results.push({ sessionId: session.id, email, emailNumber: 3, sent: true, campaignId });
        } catch (e: any) {
          console.error(`Email 3 failed (cron) for session ${session.id}:`, e.message);
          results.push({ sessionId: session.id, email, emailNumber: 3, sent: false, error: e.message });
        }
      }
    }

    return {
      totalSessions: allSessions.length,
      processed: results.length,
      byEmail: {
        email1: results.filter((r) => r.emailNumber === 1).length,
        email2: results.filter((r) => r.emailNumber === 2).length,
        email3: results.filter((r) => r.emailNumber === 3).length,
      },
      results,
    };
  },
});

/**
 * Manual backfill task (local checkout-store)
 *
 * Use this to backfill recovery emails for historical abandoned checkouts.
 * Supports dry-run mode to preview what would be sent.
 */
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
          email1Sent: !!s.recoveryEmail1SentAt || !!s.recoveryEmailSent,
          email2Sent: !!s.recoveryEmail2SentAt,
          email3Sent: !!s.recoveryEmail3SentAt,
        })),
      };
    }

    const results: any[] = [];
    for (const session of notCompleted) {
      const email = session.email;
      if (isSuppressed(email)) continue;
      const name = { first: session.firstName, last: session.lastName ?? "" };

      await upsertMailchimpContact(mailchimpKey, email, name).catch((e) =>
        console.warn("Mailchimp upsert warning:", e.message)
      );

      // Send Email 1 if not sent
      if (!session.recoveryEmail1SentAt && !session.recoveryEmailSent) {
        try {
          const { campaignId } = await sendEmail(
            mailchimpKey,
            email,
            name,
            session.id,
            1,
            session.product
          );
          await markRecoveryEmailSent(session.id, 1);
          results.push({ sessionId: session.id, emailNumber: 1, sent: true, campaignId });
        } catch (e: any) {
          results.push({ sessionId: session.id, emailNumber: 1, sent: false, error: e.message });
        }
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
