/**
 * Customer-facing order tracking — token generation + verification.
 *
 * Stripe checkout session IDs are 56-char Stripe-generated random strings,
 * already unguessable, but we still HMAC them so a leaked /orders link
 * cannot be brute-forced from a guess and so we can later rotate access
 * by changing the secret. Token is 12 url-safe base64 chars (~72 bits).
 *
 * Secret source: ORDER_TRACKING_SECRET env var. Set it in Vercel
 * (production + preview) and Trigger.dev project envs so the
 * day-before reminder task can mint the same tokens.
 */

import crypto from "node:crypto";

function getSecret(): string {
  const s = process.env.ORDER_TRACKING_SECRET;
  if (!s) {
    throw new Error(
      "ORDER_TRACKING_SECRET not set — required for /orders/[sessionId] token signing."
    );
  }
  return s;
}

function urlSafe(b64: string): string {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function generateTrackingToken(sessionId: string): string {
  const hmac = crypto.createHmac("sha256", getSecret());
  hmac.update(sessionId);
  return urlSafe(hmac.digest("base64")).slice(0, 12);
}

export function verifyTrackingToken(sessionId: string, token: string): boolean {
  if (!sessionId || !token) return false;
  const expected = generateTrackingToken(sessionId);
  if (expected.length !== token.length) return false;
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(token, "utf8")
    );
  } catch {
    return false;
  }
}

/**
 * Public tracking URL for a Stripe session. Used in the order confirmation
 * email and the day-before reminder. Defaults to the production domain;
 * override SITE_URL in dev (e.g. http://localhost:3000) so links work locally.
 */
export function buildTrackingUrl(sessionId: string): string {
  const base = process.env.SITE_URL || "https://unclemays.com";
  const token = generateTrackingToken(sessionId);
  return `${base.replace(/\/+$/, "")}/orders/${encodeURIComponent(sessionId)}?t=${token}`;
}

/**
 * Status the tracking page surfaces. Pure function of the delivery date and
 * "now" — no operational signal exists yet (no driver dispatch). When that
 * lands, this is where the status enum gets richer (e.g. driver_assigned,
 * out_for_delivery_live).
 */
export type OrderStatus = "confirmed" | "packing" | "out_for_delivery" | "delivered";

export function computeStatus(
  preferredDeliveryDate: string | null | undefined,
  now: Date = new Date()
): OrderStatus {
  if (!preferredDeliveryDate) return "confirmed";
  const [y, m, d] = preferredDeliveryDate.split("-").map(Number);
  if (!y || !m || !d) return "confirmed";
  // Compare in local time using midnight boundaries.
  const delivery = new Date(y, m - 1, d);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round(
    (delivery.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays > 1) return "confirmed";
  if (diffDays === 1) return "packing";
  if (diffDays === 0) return "out_for_delivery";
  return "delivered";
}
