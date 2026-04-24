import { createHash } from "crypto";

const STORE_ID = "unclemays_stripe";

// Blocks internal / test recipients from being added to Mailchimp or tagged.
// Any tag we add server-side can trigger a Mailchimp Customer Journey, so the
// cleanest fix is to never insert these addresses at all.
const SUPPRESSED_DOMAINS = ["unclemays.com"];
const SUPPRESSED_EMAILS = new Set(
  [
    "anthonypivy@gmail.com",
    ...(process.env.EMAIL_SUPPRESSION_LIST || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  ].map((s) => s.toLowerCase())
);

function isSuppressed(email: string | null | undefined): boolean {
  if (!email) return true;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return true;
  if (SUPPRESSED_EMAILS.has(normalized)) return true;
  const domain = normalized.split("@")[1];
  return !!domain && SUPPRESSED_DOMAINS.includes(domain);
}

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
  firstName: string,
  lastName?: string
): Promise<void> {
  if (isSuppressed(email)) return;
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
        merge_fields: { FNAME: firstName, ...(lastName ? { LNAME: lastName } : {}) },
      }),
    });
    if (!res.ok) {
      console.error("Mailchimp upsert error:", res.status, await res.text());
    }
  } catch (err) {
    console.error("Mailchimp upsert error:", err);
  }
}

// Maps checkout product slugs to the IDs registered in the Mailchimp store.
// Community Box is retired — do not add it back.
const MC_PRODUCT_IDS: Record<string, { productId: string; variantId: string }> = {
  starter: { productId: "starter_box", variantId: "starter_box_v1" },
  family:  { productId: "family_box",  variantId: "family_box_v1" },
};

// Create a Mailchimp e-commerce cart so the abandoned cart Journey fires if
// the customer does not complete payment.
export async function createCart(
  sessionId: string,
  email: string,
  firstName: string,
  lastName: string,
  productSlug: string,
  price: number
): Promise<void> {
  if (isSuppressed(email)) return;
  const config = getConfig();
  if (!config) return;
  const mc = MC_PRODUCT_IDS[productSlug];
  if (!mc) {
    console.warn(`Mailchimp createCart: unknown product slug "${productSlug}"`);
    return;
  }
  const emailSlug = email.trim().toLowerCase().replace(/[^a-z0-9]/g, "-");
  const url = `https://${config.serverPrefix}.api.mailchimp.com/3.0/ecommerce/stores/${STORE_ID}/carts`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authHeader(config.apiKey),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: sessionId,
        customer: {
          id: emailSlug,
          email_address: email,
          opt_in_status: true,
          first_name: firstName,
          last_name: lastName,
        },
        currency_code: "USD",
        order_total: price,
        checkout_url: `https://unclemays.com/checkout/${productSlug}`,
        lines: [
          {
            id: "line1",
            product_id: mc.productId,
            product_variant_id: mc.variantId,
            quantity: 1,
            price,
          },
        ],
      }),
    });
    if (!res.ok) {
      console.error("Mailchimp createCart error:", res.status, await res.text());
    }
  } catch (err) {
    console.error("Mailchimp createCart error:", err);
  }
}

// Delete cart after purchase completes so the abandoned cart Journey does not
// fire for customers who already paid.
export async function deleteCart(sessionId: string): Promise<void> {
  const config = getConfig();
  if (!config) return;
  const url = `https://${config.serverPrefix}.api.mailchimp.com/3.0/ecommerce/stores/${STORE_ID}/carts/${sessionId}`;
  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: authHeader(config.apiKey) },
    });
    // 404 is fine — cart may have already been removed
    if (!res.ok && res.status !== 404) {
      console.error("Mailchimp deleteCart error:", res.status, await res.text());
    }
  } catch (err) {
    console.error("Mailchimp deleteCart error:", err);
  }
}

// Add a new homepage-capture lead to the list with the new_signup tag.
// This is the entry point for the welcome series (see
// campaigns/email-sequences/welcome-series.md).
// Idempotent: existing members get the tag added; existing subscribers stay subscribed.
export async function addSignupLead(email: string, source?: string): Promise<{ ok: boolean; error?: string }> {
  if (isSuppressed(email)) return { ok: true };
  const config = getConfig();
  if (!config) {
    return { ok: false, error: "Mailchimp not configured" };
  }
  const hash = hashEmail(email);
  const url = `https://${config.serverPrefix}.api.mailchimp.com/3.0/lists/${config.listId}/members/${hash}`;
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
        tags: ["new_signup", ...(source ? [`source:${source}`] : [])],
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("Mailchimp addSignupLead error:", res.status, body);
      return { ok: false, error: `Mailchimp returned ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("Mailchimp addSignupLead error:", err);
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// Called after Stripe payment success. Adds order_completed and deactivates
// checkout_started in one call so the recovery sequence stops immediately.
export async function tagOrderCompleted(email: string): Promise<void> {
  if (isSuppressed(email)) return;
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
