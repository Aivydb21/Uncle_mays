import { schedules, task, tasks } from "@trigger.dev/sdk/v3";
import Stripe from "stripe";
import { isSuppressed } from "./_email-suppression";

// We instantiate Stripe inline (rather than importing src/lib/stripe.ts)
// because the shared lib throws at module load when STRIPE_SECRET_KEY is
// missing — which it is during the Trigger.dev deploy-time task discovery
// phase. The actual runtime always has the env var; we just need to defer
// the failure until the task runs.
function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set in the Trigger.dev project env");
  }
  return new Stripe(key);
}
import { sendTransactional } from "../lib/email/resend";
import { findWindowByKey, formatPreferredSlotLabel } from "../lib/delivery-windows";
import { buildTrackingUrl } from "../lib/order-tracking";

/**
 * Day-before delivery reminder.
 *
 * Runs daily at 14:00 UTC (~9 AM CDT / 8 AM CST). For every successful
 * Stripe payment with metadata.preferred_delivery_date == tomorrow's date,
 * sends the customer a reminder email with their window, address summary,
 * tracking link, and the (312) 972-2595 number for same-day changes.
 *
 * Idempotency: Trigger.dev task batch uses a per-(sessionId, deliveryDate)
 * idempotency key so a re-run of this scheduled task on the same day will
 * NOT double-send. We do not write back to Stripe metadata — Stripe's
 * metadata is treated as immutable once the customer paid.
 *
 * Required env (Trigger.dev project env):
 *   STRIPE_SECRET_KEY        existing
 *   RESEND_API_KEY           existing
 *   RESEND_FROM_EMAIL        existing
 *   ORDER_TRACKING_SECRET    new — see src/lib/order-tracking.ts
 *   SITE_URL                 optional — defaults to https://unclemays.com
 */

function isoTomorrow(now: Date = new Date()): string {
  const t = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}

export const deliveryDayBeforeReminder = schedules.task({
  id: "delivery-day-before-reminder",
  // 14:00 UTC daily — ~9 AM CDT (summer) / 8 AM CST (winter). Early enough
  // that customers see it with their morning coffee.
  cron: "0 14 * * *",
  run: async () => {
    const tomorrow = isoTomorrow();
    console.log(`[DayBeforeReminder] Looking for orders with preferred_delivery_date=${tomorrow}`);

    // Stripe Search lets us filter payment_intents by metadata. We scope to
    // succeeded + tomorrow + delivery (pickup customers get a different
    // message later, when there's signal that they need one).
    const stripe = getStripe();
    const query =
      `status:'succeeded' AND ` +
      `metadata['preferred_delivery_date']:'${tomorrow}' AND ` +
      `metadata['fulfillment_mode']:'delivery'`;

    const triggered: Array<{ sessionId: string; email: string; emailId?: string }> = [];
    const skipped: Array<{ sessionId: string; reason: string }> = [];

    try {
      for await (const intent of stripe.paymentIntents.search({ query, limit: 100 })) {
        await processOne(intent, tomorrow, triggered, skipped);
      }
    } catch (err) {
      // Stripe Search occasionally requires a moment for newly-indexed
      // metadata. We don't want a transient error to nuke the entire run.
      console.error(`[DayBeforeReminder] paymentIntents.search failed:`, err);
    }

    // Stripe v22 SDK does not expose checkout.sessions.search yet — and the
    // embedded checkout flow (where preferred_delivery_date is set) writes
    // its metadata onto the payment_intent, not the session. The Stripe-
    // hosted buy-button path (cs_*) does NOT set our delivery metadata, so
    // skipping a session search costs us nothing today.

    console.log(
      `[DayBeforeReminder] date=${tomorrow} sent=${triggered.length} skipped=${skipped.length}`
    );
    return { tomorrow, sent: triggered, skipped };
  },
});

async function processOne(
  intent: Stripe.PaymentIntent,
  tomorrow: string,
  triggered: Array<{ sessionId: string; email: string; emailId?: string }>,
  skipped: Array<{ sessionId: string; reason: string }>
): Promise<void> {
  const metadata = intent.metadata ?? {};
  const email =
    (intent.receipt_email as string | null) ||
    (metadata.email as string | undefined) ||
    "";
  const customerName = metadata.customer_name ?? "";

  if (!email) {
    skipped.push({ sessionId: intent.id, reason: "no email" });
    return;
  }
  if (isSuppressed(email)) {
    skipped.push({ sessionId: intent.id, reason: "suppressed" });
    return;
  }

  // Delegate the actual send to a child task so each customer gets their
  // own idempotency key + retry. The send itself is small but we want a
  // clean audit trail per recipient.
  await tasks.trigger("send-delivery-day-before-reminder", {
    sessionId: intent.id,
    email,
    customerName,
    metadata,
    tomorrow,
    totalCents: intent.amount,
  }, {
    idempotencyKey: `dbr:${intent.id}:${tomorrow}`,
  });
  triggered.push({ sessionId: intent.id, email });
}

/**
 * Child task that sends the actual reminder email. Split out so the parent
 * schedule stays a thin orchestrator and each per-customer send has its
 * own retry + idempotency boundary.
 */
export const sendDeliveryDayBeforeReminder = task({
  id: "send-delivery-day-before-reminder",
  maxDuration: 60,
  retry: { maxAttempts: 3, factor: 2, minTimeoutInMs: 2_000, maxTimeoutInMs: 30_000, randomize: false },
  run: async (payload: {
    sessionId: string;
    email: string;
    customerName: string;
    metadata: Stripe.Metadata;
    tomorrow: string;
    totalCents: number;
  }) => {
    if (isSuppressed(payload.email)) {
      return { sent: false, reason: "suppressed_recipient", email: payload.email };
    }

    const firstName = (payload.customerName || "").trim().split(/\s+/)[0] || "friend";
    const md = payload.metadata;
    const deliveryDate = md.preferred_delivery_date ?? payload.tomorrow;
    const windowKey = md.preferred_delivery_window ?? null;
    const win = findWindowByKey(windowKey);
    const slotLabel =
      formatPreferredSlotLabel(deliveryDate, windowKey) ?? `${deliveryDate}`;
    const windowOnly = win ? win.label : "your selected window";

    const city = md.shipping_city ?? "";
    const zip = md.shipping_zip ?? "";
    const addressLine = [city, zip].filter(Boolean).join(", ");

    let trackingUrl: string | null = null;
    try {
      trackingUrl = buildTrackingUrl(payload.sessionId);
    } catch (err) {
      console.warn(
        "[DayBeforeReminder] buildTrackingUrl failed:",
        err instanceof Error ? err.message : err
      );
    }

    const subject = `Tomorrow: your Uncle May's delivery (${windowOnly})`;
    const html = renderHtml({ firstName, slotLabel, addressLine, trackingUrl });
    const text = renderText({ firstName, slotLabel, addressLine, trackingUrl });

    const result = await sendTransactional({
      to: payload.email,
      subject,
      html,
      text,
      tags: [
        { name: "type", value: "delivery_day_before_reminder" },
        { name: "session", value: payload.sessionId.substring(0, 8) },
        { name: "delivery_date", value: deliveryDate },
      ],
    });

    if (!result.sent) {
      throw new Error(`Resend send failed: ${result.error || result.reason || "unknown"}`);
    }
    return { sent: true, emailId: result.id, email: payload.email };
  },
});

function renderHtml(args: {
  firstName: string;
  slotLabel: string;
  addressLine: string;
  trackingUrl: string | null;
}): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,sans-serif;color:#1a1a1a;background:#fff;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
    <h2 style="font-size:22px;margin-bottom:16px;color:#2d7a2d;">Your delivery is tomorrow.</h2>
    <p style="font-size:16px;line-height:1.6;">Hi ${args.firstName},</p>
    <p style="font-size:16px;line-height:1.6;">
      Quick reminder that your Uncle May's order arrives tomorrow.
    </p>

    <div style="background:#f9f9f9;border-left:4px solid #2d7a2d;padding:16px 20px;margin:24px 0;border-radius:2px;">
      <p style="margin:0 0 6px 0;font-size:14px;color:#666;text-transform:uppercase;letter-spacing:0.04em;">Delivery window</p>
      <p style="margin:0 0 12px 0;font-size:17px;font-weight:bold;">${args.slotLabel}</p>
      ${args.addressLine ? `<p style="margin:0;font-size:14px;color:#555;">${args.addressLine}</p>` : ""}
    </div>

    <p style="font-size:16px;line-height:1.6;font-weight:bold;margin-bottom:6px;">What to expect:</p>
    <ul style="font-size:15px;line-height:1.7;color:#333;padding-left:20px;margin-top:4px;">
      <li><strong>This morning, our team is packing your box</strong> from today's harvest.</li>
      <li><strong>Your driver will text the phone number on file</strong> when your box is on the way.</li>
      <li><strong>No need to be home.</strong> If you're out, we leave the cooler at the door — it stays cold for 4+ hours.</li>
    </ul>

    ${
      args.trackingUrl
        ? `<div style="text-align:center;margin:24px 0;">
            <a href="${args.trackingUrl}" style="display:inline-block;background:#2d7a2d;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:16px;font-weight:bold;">View order status →</a>
           </div>`
        : ""
    }

    <div style="background:#fff8e1;border:1px solid #f0c36d;border-radius:8px;padding:14px 16px;margin:16px 0;">
      <p style="margin:0 0 6px 0;font-size:14px;font-weight:bold;color:#7a5a00;">Need to make a same-day change?</p>
      <p style="margin:0;font-size:14px;line-height:1.6;color:#5a4500;">
        Text us at <strong>(312) 972-2595</strong> for address tweaks, gate codes, or delivery instructions. Faster than email when the delivery is this close.
      </p>
    </div>

    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
    <p style="font-size:12px;color:#999;line-height:1.6;">
      Uncle May's Produce | Hyde Park, Chicago, IL<br>
      <a href="https://unclemays.com" style="color:#999;">unclemays.com</a>
    </p>
  </div>
</body>
</html>`;
}

function renderText(args: {
  firstName: string;
  slotLabel: string;
  addressLine: string;
  trackingUrl: string | null;
}): string {
  return `Hi ${args.firstName},

Quick reminder that your Uncle May's order arrives tomorrow.

DELIVERY WINDOW
${args.slotLabel}${args.addressLine ? `\n${args.addressLine}` : ""}

WHAT TO EXPECT:
- This morning, our team is packing your box from today's harvest.
- Your driver will text the phone number on file when your box is on the way.
- No need to be home. If you're out, we leave the cooler at the door — it stays cold for 4+ hours.

${args.trackingUrl ? `VIEW ORDER STATUS:\n${args.trackingUrl}\n\n` : ""}NEED TO MAKE A SAME-DAY CHANGE?
Text us at (312) 972-2595 for address tweaks, gate codes, or delivery instructions. Faster than email when the delivery is this close.

---
Uncle May's Produce | Hyde Park, Chicago, IL
unclemays.com`;
}
