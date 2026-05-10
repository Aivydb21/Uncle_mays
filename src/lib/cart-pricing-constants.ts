// Client-safe re-export of cart pricing constants. The full pricing engine
// in `cart-pricing.ts` is server-only (Airtable + secrets); UI components
// that just need the minimum-subtotal threshold or shipping default for
// display use this file instead.

export const MIN_SUBTOTAL_CENTS = 2000;
export const SHIPPING_CHICAGO_CENTS = 799;

// Sales tax breakdown for a grocery-leaning catalog sold in Chicago, IL.
//
// Catalog now includes a mix of qualifying food (produce) and other
// merchandise (prepared / non-qualifying items, sundries). Per CEO direction
// 2026-05-09, applying a blended 2.25% rate that mirrors the historical IL
// + Cook County combined grocery rate (1% state + 1.25% Cook County) — a
// rate Chicago shoppers are used to seeing on grocery delivery. This
// over-collects on pure produce orders (technically 0% post-2026 repeal of
// the IL state grocery tax under Public Act 103-781) and under-collects on
// general merchandise orders (Chicago combined general rate is 10.25%), so
// revisit with per-item rates in Airtable once the catalog mix stabilizes.
//
// The two layers are kept as separate constants so a single rate change is
// a one-line edit. Total applied rate = IL_STATE + CHICAGO_LOCAL.
export const IL_STATE_GROCERY_TAX_RATE = 0.01;
export const CHICAGO_LOCAL_GROCERY_TAX_RATE = 0.0125;

/** @deprecated kept only for backward-compat during the rollout; equals the
 *  sum of the IL state and Chicago local rates. New callers should reference
 *  the split constants instead. */
export const TAX_RATE =
  IL_STATE_GROCERY_TAX_RATE + CHICAGO_LOCAL_GROCERY_TAX_RATE;

export const MAX_QTY_PER_LINE = 99;
