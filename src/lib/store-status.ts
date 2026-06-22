// Store-paused gate (UNC-1755). Server-side only — STORE_PAUSED is not
// NEXT_PUBLIC_, so this module must only be imported from server components,
// route handlers, or other server code. When the store cannot fulfill — move week,
// product reset, vendor outage — flip STORE_PAUSED=true in Vercel env to:
//   1. Render the paused banner on `/` and `/shop` and replace the
//      "Add to cart" / "Shop the catalog" CTAs with email capture.
//   2. Reject /api/checkout/intent with 409 so a stale tab cannot pay.
//
// Defaults to OPEN. Any value other than "true" / "1" / "yes" is treated
// as open so a typo cannot accidentally close the store.

export interface StoreStatus {
  paused: boolean;
  reason: string;
}

const DEFAULT_REASON =
  "We're paused for a short window and will reopen soon.";

function parseBool(v: string | undefined): boolean {
  if (!v) return false;
  const norm = v.trim().toLowerCase();
  return norm === "true" || norm === "1" || norm === "yes";
}

export function getStoreStatus(): StoreStatus {
  const paused = parseBool(process.env.STORE_PAUSED);
  const reason =
    (process.env.STORE_PAUSED_REASON || "").trim() || DEFAULT_REASON;
  return { paused, reason };
}
