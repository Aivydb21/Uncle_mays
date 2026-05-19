// Promo code registry. The keys are the customer-facing codes shown in ads
// and URLs (e.g. ?promo=FRESH10). Each entry maps to a Stripe coupon ID plus
// either a flat amount off (cents) or a percent off (0-100).
//
// Stripe coupons referenced here must exist in the Stripe account with
// duration=once and first_time_transaction semantics where applicable.
export interface PromoEntry {
  couponId: string;
  // Exactly one of amountOffCents or percentOff should be set.
  amountOffCents?: number;
  percentOff?: number;
  label: string;
  // appliesTo: which checkout flows this promo is valid in.
  appliesTo: Array<"one-time" | "subscription">;
}

// Active promo registry. Emptied 2026-05-18 — the FRESH10 / 10%-off
// infrastructure was stripped from the customer-facing site so listed
// catalog prices are the prices people pay. Server-side validation,
// abandoned-cart triggers, and cart-pricing math all still run; they just
// resolve to "no valid code" for every input now. To re-enable a promo:
// add the entry here, surface it in the UI, and refresh customer-facts.md.
export const ACTIVE_PROMOS: Record<string, PromoEntry> = {};

// Resolve a promo entry to a discount amount in cents, given the base amount
// in cents (line subtotal before discount). Percent codes scale with the base;
// flat codes return their fixed amountOffCents capped at the base.
export function getDiscountCents(entry: PromoEntry, baseAmountCents: number): number {
  if (entry.percentOff != null) {
    return Math.min(baseAmountCents, Math.round((baseAmountCents * entry.percentOff) / 100));
  }
  return Math.min(baseAmountCents, entry.amountOffCents ?? 0);
}

export function normalizePromo(code: string | null | undefined): string | null {
  if (!code) return null;
  const n = String(code).toUpperCase().trim();
  return n.length > 0 && n.length <= 32 ? n : null;
}

export function validatePromo(
  code: string | null | undefined,
  flow: "one-time" | "subscription"
): { code: string; entry: PromoEntry } | null {
  const normalized = normalizePromo(code);
  if (!normalized) return null;
  const entry = ACTIVE_PROMOS[normalized];
  if (!entry) return null;
  if (!entry.appliesTo.includes(flow)) return null;
  return { code: normalized, entry };
}
