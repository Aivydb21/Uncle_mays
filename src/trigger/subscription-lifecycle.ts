import { task } from "@trigger.dev/sdk/v3";

const MAILCHIMP_DC = "us19";
const MAILCHIMP_LIST_ID = "2645503d11";

// --- Stripe helpers ---

async function fetchCustomer(stripeKey: string, customerId: string) {
  const res = await fetch(`https://api.stripe.com/v1/customers/${customerId}`, {
    headers: { Authorization: `Basic ${btoa(stripeKey + ":")}` },
  });
  return res.json();
}

// --- Mailchimp helper ---

async function upsertMailchimpContact(
  apiKey: string,
  email: string,
  name: { first?: string; last?: string }
) {
  const { createHash } = await import("crypto");
  const emailHash = createHash("md5").update(email.toLowerCase()).digest("hex");
  const authHeader = `Basic ${btoa("anystring:" + apiKey)}`;

  const body: Record<string, unknown> = { email_address: email, status_if_new: "subscribed" };
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

// --- Payment failure notification task ---

export const sendPaymentFailedEmail = task({
  id: "send-payment-failed-email",
  maxDuration: 60,
  run: async (payload: {
    invoiceId: string;
    subscriptionId: string | null;
    customerId: string | null;
    email: string;
    amountDue: number;
    attemptCount: number;
  }) => {
    const stripeKey = process.env.STRIPE_API_KEY!;
    const mailchimpKey = process.env.MAILCHIMP_API_KEY!;
    const authHeader = `Basic ${btoa("anystring:" + mailchimpKey)}`;

    // Resolve customer name from Stripe if we have a customer ID
    let firstName = "there";
    let lastName = "";
    if (payload.customerId) {
      try {
        const customer = await fetchCustomer(stripeKey, payload.customerId);
        if (customer.name) {
          const parts = (customer.name as string).trim().split(/\s+/);
          firstName = parts[0] || "friend";
          lastName = parts.slice(1).join(" ") || "";
        }
      } catch {
        // proceed with defaults
      }
    }

    const amountDollars = (payload.amountDue / 100).toFixed(2);
    const manageUrl = "https://unclemays.com/manage-subscription";

    const htmlContent = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,sans-serif;color:#1a1a1a;background:#fff;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
    <h2 style="font-size:22px;margin-bottom:16px;">We couldn't process your payment</h2>
    <p style="font-size:16px;line-height:1.6;">Hi ${firstName},</p>
    <p style="font-size:16px;line-height:1.6;">
      We weren't able to collect your $${amountDollars} payment for your Uncle May's produce subscription.
      To keep your deliveries coming, please update your payment method.
    </p>
    <p style="margin:32px 0;">
      <a href="${manageUrl}"
         style="background:#2d7a2d;color:white;padding:14px 28px;text-decoration:none;border-radius:4px;font-size:16px;font-weight:bold;display:inline-block;">
        Update Payment Method
      </a>
    </p>
    <p style="font-size:14px;color:#555;line-height:1.6;">
      Stripe will automatically retry your payment. If the issue persists, please update your card
      using the button above or contact us directly.
    </p>
    <p style="font-size:14px;color:#666;line-height:1.6;">
      Questions? Reply to this email or call (312) 972-2595.
    </p>
    <p style="font-size:14px;color:#666;">— The Uncle May's Team</p>
    <hr style="border:none;border-top:1px solid #eee;margin:32px 0;" />
    <p style="font-size:12px;color:#999;">
      Uncle May's Produce &nbsp;|&nbsp; Hyde Park, Chicago, IL &nbsp;|&nbsp;
      <a href="https://unclemays.com" style="color:#999;">unclemays.com</a>
    </p>
  </div>
</body>
</html>`;

    const plainText = [
      `Hi ${firstName},`,
      ``,
      `We weren't able to collect your $${amountDollars} payment for your Uncle May's produce subscription.`,
      ``,
      `Update your payment method here: ${manageUrl}`,
      ``,
      `Stripe will retry automatically. If the issue continues, contact us at (312) 972-2595.`,
      ``,
      `— The Uncle May's Team`,
    ].join("\n");

    // Ensure contact is in Mailchimp before sending
    await upsertMailchimpContact(mailchimpKey, payload.email, {
      first: firstName !== "friend" ? firstName : undefined,
      last: lastName || undefined,
    }).catch((e: Error) => console.warn("Mailchimp upsert warning:", e.message));

    const { createHash } = await import("crypto");
    const emailHash = createHash("md5").update(payload.email.toLowerCase()).digest("hex");
    const invoiceTag = payload.invoiceId.substring(0, 8);

    // Create and send a targeted Mailchimp campaign
    const campaignRes = await fetch(`https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/campaigns`, {
      method: "POST",
      headers: { Authorization: authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "regular",
        settings: {
          subject_line: "Action needed: update your payment method",
          preview_text: "We couldn't process your Uncle May's subscription payment.",
          title: `Payment Failed - ${invoiceTag}`,
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
                value: payload.email,
              },
            ],
          },
        },
        tracking: { opens: true, html_clicks: true, text_clicks: true },
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

    const sendRes = await fetch(
      `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/campaigns/${campaign.id}/actions/send`,
      { method: "POST", headers: { Authorization: authHeader } }
    );

    if (sendRes.status !== 204) {
      const err = await sendRes.json().catch(() => ({}));
      throw new Error(`Mailchimp send failed for campaign ${campaign.id}: ${JSON.stringify(err)}`);
    }

    console.log(
      `Payment failure notification sent | invoice=${payload.invoiceId} email=${payload.email} campaign=${campaign.id} attempt=${payload.attemptCount}`
    );

    // Mark on Stripe subscription metadata so we can track notification history
    if (payload.subscriptionId && stripeKey) {
      await fetch(`https://api.stripe.com/v1/subscriptions/${payload.subscriptionId}`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(stripeKey + ":")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          [`metadata[last_payment_failed_invoice]`]: payload.invoiceId,
          [`metadata[last_payment_failed_notified_at]`]: String(Math.floor(Date.now() / 1000)),
        }),
      });
    }

    return {
      sent: true,
      email: payload.email,
      campaignId: campaign.id,
      invoiceId: payload.invoiceId,
      attemptCount: payload.attemptCount,
    };
  },
});
