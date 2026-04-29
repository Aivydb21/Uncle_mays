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

export const ACTIVE_PROMOS: Record<string, PromoEntry> = {
  FRESH10: {
    couponId: "fresh10-apr-2026",
    amountOffCents: 1000,
    label: "$10 off your first box",
    appliesTo: ["one-time", "subscription"],
  },
  FRESH35: {
    couponId: "fresh35-apr-2026",
    percentOff: 35,
    label: "35% off your first box",
    appliesTo: ["one-time", "subscription"],
  },
};

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
