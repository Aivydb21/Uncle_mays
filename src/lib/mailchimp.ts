import { createHash } from "crypto";

function getConfig() {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_AUDIENCE_ID;
  if (!apiKey || !listId) return null;
  const serverPrefix = apiKey.split("-").pop();
  return { apiKey, listId, serverPrefix };
}

function hashEmail(email: string): string {
  return createHash("md5").update(email.trim().toLowerCase()).digest("hex");
}

function authHeader(apiKey: string): string {
  return `Basic ${Buffer.from(`anystring:${apiKey}`).toString("base64")}`;
}

// Upsert contact and tag as checkout_started in a single PUT call.
export async function upsertContact(
  email: string,
  firstName: string
): Promise<void> {
  const config = getConfig();
  if (!config) {
    console.warn("Mailchimp not configured (MAILCHIMP_API_KEY / MAILCHIMP_AUDIENCE_ID missing)");
    return;
  }
  const url = `https://${config.serverPrefix}.api.mailchimp.com/3.0/lists/${config.listId}/members/${hashEmail(email)}`;
  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: authHeader(config.apiKey),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        status_if_new: "subscribed",
        status: "subscribed",
        tags: ["checkout_started"],
        merge_fields: { FNAME: firstName },
      }),
    });
    if (!res.ok) {
      console.error("Mailchimp upsert error:", res.status, await res.text());
    }
  } catch (err) {
    console.error("Mailchimp upsert error:", err);
  }
}

// Called after Stripe payment success. Adds order_completed and deactivates
// checkout_started in one call so the recovery sequence stops immediately.
export async function tagOrderCompleted(email: string): Promise<void> {
  const config = getConfig();
  if (!config) return;
  const url = `https://${config.serverPrefix}.api.mailchimp.com/3.0/lists/${config.listId}/members/${hashEmail(email)}/tags`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authHeader(config.apiKey),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tags: [
          { name: "order_completed", status: "active" },
          { name: "checkout_started", status: "inactive" },
        ],
      }),
    });
    if (!res.ok) {
      console.error("Mailchimp order_completed tag error:", res.status, await res.text());
    }
  } catch (err) {
    console.error("Mailchimp order_completed tag error:", err);
  }
}
