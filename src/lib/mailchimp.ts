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

export async function upsertContact(
  email: string,
  firstName: string,
  lastName: string
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
        email_address: email.trim().toLowerCase(),
        status_if_new: "subscribed",
        merge_fields: { FNAME: firstName, LNAME: lastName },
      }),
    });
    if (!res.ok) {
      console.error("Mailchimp upsert error:", res.status, await res.text());
    }
  } catch (err) {
    console.error("Mailchimp upsert error:", err);
  }
}

export async function addTag(email: string, tag: string): Promise<void> {
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
      body: JSON.stringify({ tags: [{ name: tag, status: "active" }] }),
    });
    if (!res.ok) {
      console.error("Mailchimp tag error:", res.status, await res.text());
    }
  } catch (err) {
    console.error("Mailchimp tag error:", err);
  }
}
