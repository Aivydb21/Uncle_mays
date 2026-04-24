import { task, wait } from "@trigger.dev/sdk/v3";
import { isSuppressed } from "./_email-suppression";
import { sendTransactional } from "../lib/email/resend";

const MAILCHIMP_DC = "us19";
const MAILCHIMP_LIST_ID = "2645503d11";

async function fetchCustomer(stripeKey: string, customerId: string) {
  const res = await fetch(`https://api.stripe.com/v1/customers/${customerId}`, {
    headers: { Authorization: `Basic ${btoa(stripeKey + ":")}` },
  });
  return res.json();
}

async function upsertMailchimpContact(
  apiKey: string,
  email: string,
  name: { first?: string; last?: string }
) {
  const { createHash } = await import("crypto");
  const emailHash = createHash("md5").update(email.toLowerCase()).digest("hex");
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

  await fetch(
    `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members/${emailHash}`,
    {
      method: "PUT",
      headers: { Authorization: authHeader, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
}

/**
 * Send a cancellation confirmation email when a subscription is cancelled.
 * Triggered from /api/webhook on customer.subscription.deleted or
 * customer.subscription.updated (status=canceled).
 */
export const sendSubscriptionCancellationEmail = task({
  id: "send-subscription-cancellation-email",
  maxDuration: 120,
  run: async (payload: {
    subscriptionId: string;
    customerId: string;
    email?: string | null;
    customerName?: string | null;
    canceledAt?: number | null;      // Unix timestamp
    accessEndsAt?: number | null;    // Unix timestamp (current_period_end)
    productName?: string | null;
  }) => {
    const stripeKey = process.env.STRIPE_API_KEY!;
    const mailchimpKey = process.env.MAILCHIMP_API_KEY;
    if (!mailchimpKey) {
      throw new Error("MAILCHIMP_API_KEY not configured");
    }

    // Resolve customer email and name from Stripe if not passed in
    let email = payload.email;
    let customerName = payload.customerName;
    if (!email && payload.customerId) {
      try {
        const customer = await fetchCustomer(stripeKey, payload.customerId);
        email = customer.email ?? null;
        if (!customerName && customer.name) customerName = customer.name;
      } catch (e) {
        console.warn("[CancellationEmail] Could not fetch customer from Stripe:", e);
      }
    }

    if (!email) {
      console.warn(
        `[CancellationEmail] No email for customer ${payload.customerId} — skipping send`
      );
      return { sent: false, reason: "no_email" };
    }

    if (isSuppressed(email)) {
      console.log(`[CancellationEmail] Suppressed recipient ${email} — skipping send`);
      return { sent: false, reason: "suppressed_recipient", email };
    }

    const nameParts = (customerName || "").trim().split(/\s+/);
    const firstName = nameParts[0] || "friend";
    const lastName = nameParts.slice(1).join(" ") || "";
    const productName = payload.productName || "Produce Box subscription";
    const subTag = payload.subscriptionId.substring(0, 8);

    // Format access end date (current_period_end tells customer when they lose access)
    let accessEndText = "immediately";
    if (payload.accessEndsAt) {
      const d = new Date(payload.accessEndsAt * 1000);
      accessEndText = d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    const htmlContent = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,sans-serif;color:#1a1a1a;background:#fff;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
    <h2 style="font-size:22px;margin-bottom:16px;color:#1a1a1a;">Your subscription has been cancelled.</h2>
    <p style="font-size:16px;line-height:1.6;">Hi ${firstName},</p>
    <p style="font-size:16px;line-height:1.6;">
      We've confirmed your cancellation of the ${productName}.
      Your subscription is now cancelled and you will not be charged again.
    </p>

    <div style="background:#f9f9f9;border-left:4px solid #ccc;padding:16px 20px;margin:24px 0;border-radius:2px;">
      <p style="margin:0 0 8px 0;font-size:15px;font-weight:bold;">Cancellation Details</p>
      <p style="margin:0 0 4px 0;font-size:14px;color:#333;">Status: Cancelled</p>
      <p style="margin:0 0 4px 0;font-size:14px;color:#333;">Access ends: ${accessEndText}</p>
      <p style="margin:0;font-size:12px;color:#999;">Subscription ID: ${subTag}</p>
    </div>

    <p style="font-size:16px;line-height:1.6;">We're sorry to see you go.</p>
    <p style="font-size:15px;line-height:1.6;color:#333;">
      If you cancelled by mistake or change your mind, you can reactivate your subscription any time.
      Fresh, quality produce is always here when you're ready.
    </p>

    <p style="margin:32px 0;">
      <a href="https://unclemays.com/#boxes"
         style="background:#2d7a2d;color:white;padding:14px 28px;text-decoration:none;border-radius:4px;font-size:16px;font-weight:bold;display:inline-block;">
        Reactivate My Subscription
      </a>
    </p>

    <p style="font-size:15px;line-height:1.6;color:#333;">
      Questions or feedback? We'd love to hear from you.<br>
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

    const plainText = [
      `Hi ${firstName},`,
      ``,
      `We've confirmed your cancellation of the ${productName}.`,
      `Your subscription is now cancelled and you will not be charged again.`,
      ``,
      `CANCELLATION DETAILS`,
      `Status: Cancelled`,
      `Access ends: ${accessEndText}`,
      `Subscription ID: ${subTag}`,
      ``,
      `If you cancelled by mistake or change your mind, you can reactivate any time at https://unclemays.com/#boxes`,
      ``,
      `Questions? Call or text (312) 972-2595 | info@unclemays.com`,
      ``,
      `---`,
      `Uncle May's Produce | Hyde Park, Chicago, IL`,
      `unclemays.com`,
    ].join("\n");

    // Keep the contact in the Mailchimp audience for newsletter segmentation.
    await upsertMailchimpContact(mailchimpKey, email, {
      first: firstName !== "friend" ? firstName : undefined,
      last: lastName || undefined,
    }).catch((e: Error) =>
      console.warn("[CancellationEmail] Mailchimp upsert warning:", e.message)
    );

    const result = await sendTransactional({
      to: email,
      subject: "Your Uncle May's subscription has been cancelled",
      html: htmlContent,
      text: plainText,
      tags: [
        { name: "type", value: "subscription_cancellation" },
        { name: "sub", value: subTag },
      ],
    });

    if (!result.sent) {
      throw new Error(
        `[CancellationEmail] Resend send failed: ${result.error || result.reason || "unknown"}`
      );
    }

    console.log(
      `[CancellationEmail] Sent | sub=${payload.subscriptionId} email=${email} resend=${result.id}`
    );

    return { sent: true, emailId: result.id, email };
  },
});
