// Client-safe re-export of cart pricing constants. The full pricing engine
// in `cart-pricing.ts` is server-only (Airtable + secrets); UI components
// that just need the minimum-subtotal threshold or shipping default for
// display use this file instead.

export const MIN_SUBTOTAL_CENTS = 2000;
export const SHIPPING_CHICAGO_CENTS = 799;

// Sales tax breakdown for qualifying food sold in Chicago, IL.
//
// Illinois state grocery tax: 0% effective 2026-01-01 per Public Act 103-781
// (signed Aug 2024), which repealed the long-standing 1% state grocery tax
// on "qualifying food, drugs, and medical appliances."
//
// Chicago / Cook County local tax on qualifying food: 0%. Cook County's
// 1.75% home-rule sales tax, the RTA 1% transit tax, and Chicago's
// home-rule tax all exempt qualifying food from their bases. Non-qualifying
// food (prepared meals, hot food, candy, soft drinks, alcohol) is taxed at
// the general Chicago combined rate (~10.25%) but is not currently part of
// the catalog.
//
// The two layers are kept as separate constants so a single rate change
// (e.g. the state reinstating a grocery tax) is a one-line edit. Total
// applied rate = IL_STATE + CHICAGO_LOCAL.
export const IL_STATE_GROCERY_TAX_RATE = 0;
export const CHICAGO_LOCAL_GROCERY_TAX_RATE = 0;

/** @deprecated kept only for backward-compat during the rollout; equals the
 *  sum of the IL state and Chicago local rates. New callers should reference
 *  the split constants instead. */
export const TAX_RATE =
  IL_STATE_GROCERY_TAX_RATE + CHICAGO_LOCAL_GROCERY_TAX_RATE;

export const MAX_QTY_PER_LINE = 99;
