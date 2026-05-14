import { task } from "@trigger.dev/sdk/v3";
import { isSuppressed } from "./_email-suppression";
import { sendTransactional } from "../lib/email/resend";
import { formatPreferredSlotLabel } from "../lib/delivery-windows";
import { hashEmail } from "../lib/mailchimp";
import { formatCents } from "../lib/format";
import { buildTrackingUrl } from "../lib/order-tracking";

const MAILCHIMP_DC = "us19";
const MAILCHIMP_LIST_ID = "2645503d11";

// Keeps the contact in the Mailchimp audience for future newsletter
// segmentation. Transactional send itself has moved to Resend.
async function upsertMailchimpContact(
  apiKey: string,
  email: string,
  name: { first?: string; last?: string }
) {
  const emailHash = hashEmail(email);
  const authHeader = `Basic ${btoa("anystring:" + apiKey)}`;

  const body: Record<string, unknown> = {
    email_address: email,
    status_if_new: "subscribed",
    status: "subscribed",
  };
  const mergeFields: Record<string, string> = {};
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

interface ConfirmationLineItem {
  sku: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}


function buildConfirmationEmail(params: {
  firstName: string;
  sessionId: string;
  amountDollars: number;
  productName: string;
  isSubscription: boolean;
  billingInterval?: string | null;
  lineItems?: ConfirmationLineItem[];
  subtotalCents?: number | null;
  discountCents?: number | null;
  shippingCents?: number | null;
  taxCents?: number | null;
  totalCents?: number | null;
  fulfillmentMode?: "delivery" | "pickup" | null;
  pickupSlotLabel?: string | null;
  preferredSlotLabel?: string | null;
}): { subject: string; html: string; text: string } {
  const {
    firstName,
    sessionId,
    amountDollars,
    productName,
    isSubscription,
    billingInterval,
    lineItems,
    subtotalCents,
    discountCents,
    shippingCents,
    taxCents,
    totalCents,
    fulfillmentMode,
    pickupSlotLabel,
    preferredSlotLabel,
  } = params;
  const sessionTag = sessionId.substring(0, 8);
  const formattedAmount = `$${amountDollars.toFixed(2)}`;
  const billingLine = isSubscription
    ? `Billing: ${formattedAmount} / ${billingInterval || "month"} — renews automatically`
    : `Payment: ${formattedAmount} (one-time)`;
  const hasLines = Array.isArray(lineItems) && lineItems.length > 0;
  // Tokenized self-service tracking URL. Customers can refresh this until
  // delivery completes. Replaces the "we'll email you again later with a
  // window" promise that used to leave customers in the dark between
  // confirmation and delivery day.
  let trackingUrl: string | null = null;
  try {
    trackingUrl = buildTrackingUrl(sessionId);
  } catch (err) {
    // Missing ORDER_TRACKING_SECRET — log and continue without the link
    // rather than failing the whole confirmation email.
    console.warn("[OrderConfirmation] buildTrackingUrl failed:", err instanceof Error ? err.message : err);
  }
  const subscriptionNote = isSubscription
    ? `<p style="font-size:14px;color:#666;line-height:1.6;">
        Your subscription renews automatically each ${billingInterval || "month"}.
        To manage or cancel your subscription, reply to this email or call us at <strong>(312) 972-2595</strong>.
      </p>`
    : "";

  const subject = `Order confirmed: ${productName}`;
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,sans-serif;color:#1a1a1a;background:#fff;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
    <h2 style="font-size:22px;margin-bottom:16px;color:#2d7a2d;">Your order is confirmed.</h2>
    <p style="font-size:16px;line-height:1.6;">Hi ${firstName},</p>
    <p style="font-size:16px;line-height:1.6;">
      Thank you for your order. We have received your payment and your Uncle May's produce box is confirmed.
    </p>

    <div style="background:#f9f9f9;border-left:4px solid #2d7a2d;padding:16px 20px;margin:24px 0;border-radius:2px;">
      <p style="margin:0 0 8px 0;font-size:15px;font-weight:bold;">Order Summary</p>
      ${
        hasLines
          ? `<table style="width:100%;border-collapse:collapse;margin-bottom:8px;font-size:14px;color:#333;">
              ${lineItems!
                .map(
                  (l) =>
                    `<tr><td style="padding:3px 0;">${l.name} <span style="color:#777;">x${l.quantity}</span></td><td style="padding:3px 0;text-align:right;">${formatCents(
                      l.lineTotalCents
                    )}</td></tr>`
                )
                .join("")}
              ${
                typeof subtotalCents === "number"
                  ? `<tr><td style="padding:6px 0 2px;color:#666;border-top:1px solid #e5e5e5;">Subtotal</td><td style="padding:6px 0 2px;text-align:right;border-top:1px solid #e5e5e5;">${formatCents(subtotalCents)}</td></tr>`
                  : ""
              }
              ${
                typeof discountCents === "number" && discountCents > 0
                  ? `<tr><td style="padding:2px 0;color:#2d7a2d;">Discount</td><td style="padding:2px 0;text-align:right;color:#2d7a2d;">-${formatCents(discountCents)}</td></tr>`
                  : ""
              }
              ${
                typeof shippingCents === "number"
                  ? `<tr><td style="padding:2px 0;color:#666;">Shipping</td><td style="padding:2px 0;text-align:right;">${formatCents(shippingCents)}</td></tr>`
                  : ""
              }
              ${
                typeof taxCents === "number"
                  ? `<tr><td style="padding:2px 0;color:#666;">Tax</td><td style="padding:2px 0;text-align:right;">${formatCents(taxCents)}</td></tr>`
                  : ""
              }
              ${
                typeof totalCents === "number"
                  ? `<tr><td style="padding:6px 0 2px;font-weight:bold;border-top:1px solid #ccc;">Total</td><td style="padding:6px 0 2px;text-align:right;font-weight:bold;border-top:1px solid #ccc;">${formatCents(totalCents)}</td></tr>`
                  : ""
              }
            </table>`
          : `<p style="margin:0 0 4px 0;font-size:14px;color:#333;">Product: ${productName}</p>
             <p style="margin:0 0 4px 0;font-size:14px;color:#333;">${billingLine}</p>`
      }
      ${
        fulfillmentMode === "pickup" && pickupSlotLabel
          ? `<p style="margin:8px 0 4px 0;font-size:14px;color:#333;"><strong>Pickup:</strong> ${pickupSlotLabel}</p>`
          : fulfillmentMode === "delivery"
          ? `<p style="margin:8px 0 4px 0;font-size:14px;color:#333;"><strong>Delivery:</strong> address on file</p>`
          : ""
      }
      <p style="margin:0;font-size:12px;color:#999;">Order ID: ${sessionTag}</p>
    </div>

    ${
      trackingUrl
        ? `<div style="text-align:center;margin:24px 0;">
            <a href="${trackingUrl}" style="display:inline-block;background:#2d7a2d;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:16px;font-weight:bold;">Track your order →</a>
            <p style="margin:10px 0 0 0;font-size:13px;color:#777;">
              Bookmark this link. Refresh it any time to see where your order is in the process.
            </p>
           </div>`
        : ""
    }

    <p style="font-size:16px;line-height:1.6;font-weight:bold;margin-bottom:6px;">What happens next:</p>
    <ol style="font-size:15px;line-height:1.7;color:#333;padding-left:22px;margin-top:4px;">
      ${
        fulfillmentMode === "pickup"
          ? `<li><strong>Today.</strong> Your order is confirmed. No further action needed on your end.</li>
             <li><strong>The day before pickup.</strong> We pack your order with that morning's harvest.</li>
             <li><strong>At your pickup window.</strong> Come to the location above. We'll have your name and order ready.</li>`
          : `<li><strong>Today.</strong> Your order is confirmed. No further action needed on your end.</li>
             <li><strong>The day before delivery.</strong> We pack your box with that morning's harvest. You'll get an email reminder with the time window.</li>
             <li><strong>Delivery day.</strong> Your driver texts the phone number on file when your box is on the way. No need to be home — we leave coolers at the door if you're out.</li>`
      }
    </ol>

    ${subscriptionNote}

    <div style="background:#f9f9f9;border-radius:8px;padding:16px 20px;margin:24px 0;">
      <p style="margin:0 0 6px 0;font-size:15px;font-weight:bold;">Need to change something?</p>
      <p style="margin:0 0 8px 0;font-size:14px;line-height:1.6;color:#555;">
        For same-day changes (address tweak, delivery instructions, swap an item), text us — that's the fastest path. We usually reply within the hour during business hours.
      </p>
      <p style="margin:0;font-size:15px;line-height:1.8;color:#333;">
        Call or text: <strong>(312) 972-2595</strong><br>
        Email: <a href="mailto:info@unclemays.com" style="color:#2d7a2d;">info@unclemays.com</a>
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

  const orderLinesText = hasLines
    ? lineItems!
        .map((l) => `- ${l.name} x${l.quantity}  ${formatCents(l.lineTotalCents)}`)
        .join("\n") +
      (typeof subtotalCents === "number" ? `\n\nSubtotal: ${formatCents(subtotalCents)}` : "") +
      (typeof discountCents === "number" && discountCents > 0
        ? `\nDiscount: -${formatCents(discountCents)}`
        : "") +
      (typeof shippingCents === "number" ? `\nShipping: ${formatCents(shippingCents)}` : "") +
      (typeof taxCents === "number" ? `\nTax: ${formatCents(taxCents)}` : "") +
      (typeof totalCents === "number" ? `\nTotal: ${formatCents(totalCents)}` : "")
    : `Product: ${productName}\n${billingLine}`;

  const fulfillmentText =
    fulfillmentMode === "pickup" && pickupSlotLabel
      ? `\nPickup: ${pickupSlotLabel}`
      : fulfillmentMode === "delivery"
      ? `\nDelivery: address on file`
      : "";

  const trackingText = trackingUrl
    ? `\nTRACK YOUR ORDER:\n${trackingUrl}\n(Bookmark this. Refresh any time to see status.)\n`
    : "";

  const whatNextText =
    fulfillmentMode === "pickup"
      ? `\nWHAT HAPPENS NEXT:
1. Today. Your order is confirmed. No further action on your end.
2. The day before pickup. We pack your order with that morning's harvest.
3. At your pickup window. Come to the location above. We'll have your name and order ready.`
      : `\nWHAT HAPPENS NEXT:
1. Today. Your order is confirmed. No further action on your end.
2. The day before delivery. We pack your box with that morning's harvest. You'll get an email reminder with the time window.
3. Delivery day. Your driver texts the phone number on file when your box is on the way. No need to be home — we leave coolers at the door if you're out.`;

  const text = `Hi ${firstName},

Thank you for your order. We have received your payment and your Uncle May's order is confirmed.

ORDER SUMMARY
${orderLinesText}${fulfillmentText}
Order ID: ${sessionTag}
${trackingText}${whatNextText}

NEED TO CHANGE SOMETHING?
For same-day changes (address tweak, delivery instructions, swap an item), text us — that's the fastest path. We usually reply within the hour during business hours.
Call or text: (312) 972-2595
Email: info@unclemays.com

${isSubscription ? `Your subscription renews automatically each ${billingInterval || "month"}. To manage or cancel, reply to this email or call (312) 972-2595.\n\n` : ""}---
Uncle May's Produce | Hyde Park, Chicago, IL
unclemays.com`;

  return { subject, html, text };
}

/**
 * Send an order confirmation email immediately after checkout.session.completed.
 * Triggered from /api/webhook with idempotency key to prevent duplicates.
 */
export const sendOrderConfirmationEmail = task({
  id: "send-order-confirmation-email",
  maxDuration: 120,
  run: async (payload: {
    sessionId: string;
    email: string;
    customerName?: string | null;
    amountTotal: number;
    productName: string;
    isSubscription: boolean;
    billingInterval?: string | null;
    subscriptionId?: string | null;
    lineItems?: ConfirmationLineItem[];
    subtotalCents?: number | null;
    discountCents?: number | null;
    shippingCents?: number | null;
    taxCents?: number | null;
    totalCents?: number | null;
    fulfillmentMode?: "delivery" | "pickup" | null;
    pickupSlotLabel?: string | null;
    preferredDeliveryDate?: string | null;
    preferredDeliveryWindow?: string | null;
  }) => {
    if (isSuppressed(payload.email)) {
      console.log(`[OrderConfirmation] Suppressed recipient ${payload.email} — skipping send`);
      return { sent: false, reason: "suppressed_recipient", email: payload.email };
    }

    const nameParts = (payload.customerName || "").trim().split(/\s+/);
    const firstName = nameParts[0] || "friend";
    const lastName = nameParts.slice(1).join(" ") || "";
    const amountDollars = payload.amountTotal / 100;

    // Audience upsert (Mailchimp) — kept so customers stay in the newsletter list.
    const mailchimpKey = process.env.MAILCHIMP_API_KEY;
    if (mailchimpKey) {
      await upsertMailchimpContact(mailchimpKey, payload.email, {
        first: firstName,
        last: lastName,
      }).catch((e: Error) =>
        console.warn("[OrderConfirmation] Mailchimp upsert warning:", e.message)
      );
    }

    const preferredSlotLabel = formatPreferredSlotLabel(
      payload.preferredDeliveryDate,
      payload.preferredDeliveryWindow
    );

    const { subject, html, text } = buildConfirmationEmail({
      firstName,
      sessionId: payload.sessionId,
      amountDollars,
      productName: payload.productName,
      isSubscription: payload.isSubscription,
      billingInterval: payload.billingInterval,
      lineItems: payload.lineItems,
      subtotalCents: payload.subtotalCents ?? null,
      discountCents: payload.discountCents ?? null,
      shippingCents: payload.shippingCents ?? null,
      taxCents: payload.taxCents ?? null,
      totalCents: payload.totalCents ?? null,
      fulfillmentMode: payload.fulfillmentMode ?? null,
      pickupSlotLabel: payload.pickupSlotLabel ?? null,
      preferredSlotLabel,
    });

    const result = await sendTransactional({
      to: payload.email,
      subject,
      html,
      text,
      tags: [
        { name: "type", value: "order_confirmation" },
        { name: "session", value: payload.sessionId.substring(0, 8) },
        { name: "subscription", value: payload.isSubscription ? "true" : "false" },
        ...(payload.preferredDeliveryWindow
          ? [{ name: "preferred_window", value: String(payload.preferredDeliveryWindow) }]
          : []),
      ],
    });

    if (!result.sent) {
      throw new Error(`Resend send failed: ${result.error || result.reason || "unknown"}`);
    }

    console.log(
      `[OrderConfirmation] Sent | session=${payload.sessionId} email=${payload.email} resend=${result.id} subscription=${payload.isSubscription}`
    );

    return { sent: true, emailId: result.id, email: payload.email };
  },
});
