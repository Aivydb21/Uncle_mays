import { task } from "@trigger.dev/sdk/v3";
import { createHash } from "crypto";
import { isSuppressed } from "./_email-suppression";
import { sendTransactional } from "../lib/email/resend";

const MAILCHIMP_DC = "us19";
const MAILCHIMP_LIST_ID = "2645503d11";

function md5(s: string) {
  return createHash("md5").update(s).digest("hex");
}

// Keeps the contact in the Mailchimp audience for future newsletter
// segmentation. Transactional send itself has moved to Resend.
async function upsertMailchimpContact(
  apiKey: string,
  email: string,
  name: { first?: string; last?: string }
) {
  const emailHash = md5(email.toLowerCase());
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

function fmtCents(cents: number): string {
  if (!Number.isFinite(cents)) return "$0.00";
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  return `${sign}$${(abs / 100).toFixed(2)}`;
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
  } = params;
  const sessionTag = sessionId.substring(0, 8);
  const formattedAmount = `$${amountDollars.toFixed(2)}`;
  const billingLine = isSubscription
    ? `Billing: ${formattedAmount} / ${billingInterval || "month"} — renews automatically`
    : `Payment: ${formattedAmount} (one-time)`;
  const hasLines = Array.isArray(lineItems) && lineItems.length > 0;
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
                    `<tr><td style="padding:3px 0;">${l.name} <span style="color:#777;">x${l.quantity}</span></td><td style="padding:3px 0;text-align:right;">${fmtCents(
                      l.lineTotalCents
                    )}</td></tr>`
                )
                .join("")}
              ${
                typeof subtotalCents === "number"
                  ? `<tr><td style="padding:6px 0 2px;color:#666;border-top:1px solid #e5e5e5;">Subtotal</td><td style="padding:6px 0 2px;text-align:right;border-top:1px solid #e5e5e5;">${fmtCents(subtotalCents)}</td></tr>`
                  : ""
              }
              ${
                typeof discountCents === "number" && discountCents > 0
                  ? `<tr><td style="padding:2px 0;color:#2d7a2d;">Discount</td><td style="padding:2px 0;text-align:right;color:#2d7a2d;">-${fmtCents(discountCents)}</td></tr>`
                  : ""
              }
              ${
                typeof shippingCents === "number"
                  ? `<tr><td style="padding:2px 0;color:#666;">Shipping</td><td style="padding:2px 0;text-align:right;">${fmtCents(shippingCents)}</td></tr>`
                  : ""
              }
              ${
                typeof taxCents === "number"
                  ? `<tr><td style="padding:2px 0;color:#666;">Tax</td><td style="padding:2px 0;text-align:right;">${fmtCents(taxCents)}</td></tr>`
                  : ""
              }
              ${
                typeof totalCents === "number"
                  ? `<tr><td style="padding:6px 0 2px;font-weight:bold;border-top:1px solid #ccc;">Total</td><td style="padding:6px 0 2px;text-align:right;font-weight:bold;border-top:1px solid #ccc;">${fmtCents(totalCents)}</td></tr>`
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

    <p style="font-size:16px;line-height:1.6;font-weight:bold;">What happens next:</p>
    <ul style="font-size:15px;line-height:1.8;color:#333;padding-left:20px;">
      <li>Our team will prepare your produce box with care.</li>
      <li>You will receive a delivery confirmation with your scheduled window.</li>
      <li>Fresh produce delivered to your door, ready for your kitchen.</li>
    </ul>

    ${subscriptionNote}

    <p style="font-size:15px;line-height:1.6;color:#333;">
      Questions about your order? We are here.<br>
      Call or text: <strong>(312) 972-2595</strong><br>
      Email: <a href="mailto:info@unclemays.com" style="color:#2d7a2d;">info@unclemays.com</a>
    </p>

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
        .map((l) => `- ${l.name} x${l.quantity}  ${fmtCents(l.lineTotalCents)}`)
        .join("\n") +
      (typeof subtotalCents === "number" ? `\n\nSubtotal: ${fmtCents(subtotalCents)}` : "") +
      (typeof discountCents === "number" && discountCents > 0
        ? `\nDiscount: -${fmtCents(discountCents)}`
        : "") +
      (typeof shippingCents === "number" ? `\nShipping: ${fmtCents(shippingCents)}` : "") +
      (typeof taxCents === "number" ? `\nTax: ${fmtCents(taxCents)}` : "") +
      (typeof totalCents === "number" ? `\nTotal: ${fmtCents(totalCents)}` : "")
    : `Product: ${productName}\n${billingLine}`;

  const fulfillmentText =
    fulfillmentMode === "pickup" && pickupSlotLabel
      ? `\nPickup: ${pickupSlotLabel}`
      : fulfillmentMode === "delivery"
      ? `\nDelivery: address on file`
      : "";

  const text = `Hi ${firstName},

Thank you for your order. We have received your payment and your Uncle May's order is confirmed.

ORDER SUMMARY
${orderLinesText}${fulfillmentText}
Order ID: ${sessionTag}

WHAT HAPPENS NEXT:
- Our team will prepare your produce box with care.
- You will receive a delivery confirmation with your scheduled window.
- Fresh produce delivered to your door, ready for your kitchen.

${isSubscription ? `Your subscription renews automatically each ${billingInterval || "month"}. To manage or cancel, reply to this email or call (312) 972-2595.\n\n` : ""}Questions? Call or text: (312) 972-2595 | info@unclemays.com

---
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
