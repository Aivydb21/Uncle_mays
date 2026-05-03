// Client-safe re-export of cart pricing constants. The full pricing engine
// in `cart-pricing.ts` is server-only (Airtable + secrets); UI components
// that just need the minimum-subtotal threshold or shipping default for
// display use this file instead.

export const MIN_SUBTOTAL_CENTS = 2500;
export const SHIPPING_CHICAGO_CENTS = 799;
export const TAX_RATE = 0.01;
export const MAX_QTY_PER_LINE = 99;
