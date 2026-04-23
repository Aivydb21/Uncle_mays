// Promo code registry. The keys are the customer-facing codes shown in ads
// and URLs (e.g. ?promo=FRESH10). Each entry maps to a Stripe coupon ID plus
// the amount off in cents, used for client-side display and server-side
// discount application on PaymentIntents.
//
// Stripe coupons referenced here must exist in the Stripe account with
// duration=once and first_time_transaction semantics where applicable.
export interface PromoEntry {
  couponId: string;
  amountOffCents: number;
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
};

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
