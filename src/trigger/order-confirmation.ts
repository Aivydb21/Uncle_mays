import { task, wait } from "@trigger.dev/sdk/v3";
import { createHash } from "crypto";

const MAILCHIMP_DC = "us19";
const MAILCHIMP_LIST_ID = "2645503d11";

function md5(s: string) {
  return createHash("md5").update(s).digest("hex");
}

async function upsertMailchimpContact(
  apiKey: string,
  email: string,
  name: { first?: string; last?: string }
) {
  const emailHash = md5(email.toLowerCase());
  const authHeader = `Basic ${btoa("anystring:" + apiKey)}`;

  // status_if_new handles truly new contacts; status: "subscribed" also
  // reactivates archived contacts (e.g. from audience cleanups). Both fields
  // are required to reliably subscribe customers for transactional emails.
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

async function sendConfirmationEmail(
  apiKey: string,
  params: {
    email: string;
    firstName: string;
    lastName: string;
    sessionId: string;
    amountDollars: number;
    productName: string;
    isSubscription: boolean;
    billingInterval?: string | null;
    subscriptionId?: string | null;
  }
): Promise<{ campaignId: string }> {
  const authHeader = `Basic ${btoa("anystring:" + apiKey)}`;
  const {
    email,
    firstName,
    sessionId,
    amountDollars,
    productName,
    isSubscription,
    billingInterval,
    subscriptionId,
  } = params;

  const sessionTag = sessionId.substring(0, 8);
  const formattedAmount = `$${amountDollars.toFixed(2)}`;
  const billingLine = isSubscription
    ? `Billing: ${formattedAmount} / ${billingInterval || "month"} — renews automatically, cancel anytime`
    : `Payment: ${formattedAmount} (one-time)`;
  const subscriptionNote = isSubscription
    ? `<p style="font-size:14px;color:#666;line-height:1.6;">
        Your subscription renews automatically each ${billingInterval || "month"}.
        To manage or cancel your subscription, reply to this email or call us at <strong>(312) 972-2595</strong>.
      </p>`
    : "";

  const subjectLine = `Order confirmed: ${productName}`;
  const previewText = `Thanks for your order, ${firstName}. Your Uncle May's produce box is on its way.`;

  const htmlContent = `<!DOCTYPE html>
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
      <p style="margin:0 0 4px 0;font-size:14px;color:#333;">Product: ${productName}</p>
      <p style="margin:0 0 4px 0;font-size:14px;color:#333;">${billingLine}</p>
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

  const plainText = `Hi ${firstName},

Thank you for your order. We have received your payment and your Uncle May's produce box is confirmed.

ORDER SUMMARY
Product: ${productName}
${billingLine}
Order ID: ${sessionTag}

WHAT HAPPENS NEXT:
- Our team will prepare your produce box with care.
- You will receive a delivery confirmation with your scheduled window.
- Fresh produce delivered to your door, ready for your kitchen.

${isSubscription ? `Your subscription renews automatically each ${billingInterval || "month"}. To manage or cancel, reply to this email or call (312) 972-2595.\n\n` : ""}Questions? Call or text: (312) 972-2595 | info@unclemays.com

---
Uncle May's Produce | Hyde Park, Chicago, IL
unclemays.com`;

  // Create a targeted Mailchimp campaign for this subscriber
  const campaignRes = await fetch(`https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/campaigns`, {
    method: "POST",
    headers: { Authorization: authHeader, "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "regular",
      settings: {
        subject_line: subjectLine,
        preview_text: previewText,
        title: `Order Confirmation - ${sessionTag}`,
        from_name: "Uncle May's Produce",
        reply_to: "info@unclemays.com",
      },
      recipients: {
        list_id: MAILCHIMP_LIST_ID,
        segment_opts: {
          match: "all",
          conditions: [
            { condition_type: "EmailAddress", field: "EMAIL", op: "is", value: email },
          ],
        },
      },
      tracking: { opens: true, html_clicks: true, text_clicks: false },
    }),
  });

  const campaign = await campaignRes.json();
  if (!campaign.id) {
    throw new Error(`Mailchimp campaign creation failed: ${JSON.stringify(campaign)}`);
  }

  await fetch(`https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/campaigns/${campaign.id}/content`, {
    method: "PUT",
    headers: { Authorization: authHeader, "Content-Type": "application/json" },
    body: JSON.stringify({ html: htmlContent, plain_text: plainText }),
  });

  // Poll until Mailchimp finishes computing segment recipients.
  // Sending before recipient_count > 0 causes "recipients not ready" (HTTP 400).
  // Mailchimp segment calculation is async and typically completes in 5-20s.
  let recipientCount = 0;
  for (let attempt = 0; attempt < 12; attempt++) {
    await wait.for({ seconds: 5 });
    const statusRes = await fetch(
      `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/campaigns/${campaign.id}`,
      { headers: { Authorization: authHeader } }
    );
    const status = await statusRes.json() as { recipients?: { recipient_count?: number } };
    recipientCount = status.recipients?.recipient_count ?? 0;
    if (recipientCount > 0) break;
  }

  if (recipientCount === 0) {
    throw new Error(
      `Mailchimp campaign ${campaign.id} has 0 recipients after polling. ` +
      `Contact ${email} may not be subscribed to list ${MAILCHIMP_LIST_ID}.`
    );
  }

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
    amountTotal: number; // in cents
    productName: string;
    isSubscription: boolean;
    billingInterval?: string | null;
    subscriptionId?: string | null;
  }) => {
    const mailchimpKey = process.env.MAILCHIMP_API_KEY;
    if (!mailchimpKey) {
      throw new Error("MAILCHIMP_API_KEY not configured");
    }

    const nameParts = (payload.customerName || "").trim().split(/\s+/);
    const firstName = nameParts[0] || "there";
    const lastName = nameParts.slice(1).join(" ") || "";
    const amountDollars = payload.amountTotal / 100;

    // Ensure contact exists in Mailchimp before sending.
    await upsertMailchimpContact(mailchimpKey, payload.email, {
      first: firstName,
      last: lastName,
    }).catch((e: Error) => console.warn("[OrderConfirmation] Mailchimp upsert warning:", e.message));

    const { campaignId } = await sendConfirmationEmail(mailchimpKey, {
      email: payload.email,
      firstName,
      lastName,
      sessionId: payload.sessionId,
      amountDollars,
      productName: payload.productName,
      isSubscription: payload.isSubscription,
      billingInterval: payload.billingInterval,
      subscriptionId: payload.subscriptionId,
    });

    console.log(
      `[OrderConfirmation] Sent | session=${payload.sessionId} email=${payload.email} campaign=${campaignId} subscription=${payload.isSubscription}`
    );

    return { sent: true, campaignId, email: payload.email };
  },
});
