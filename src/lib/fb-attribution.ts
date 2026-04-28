/**
 * Client-side helpers for Meta CAPI attribution.
 *
 * Returns the `_fbc` (Facebook click ID) and `_fbp` (Facebook browser ID)
 * cookies set by the Meta Pixel, plus a fallback that constructs `_fbc`
 * from the persisted `fbclid` URL param if Meta hasn't written the cookie
 * yet (common in private mode, fresh sessions, or when the pixel script
 * hasn't loaded). These values are forwarded to /api/checkout/intent and
 * stored in Stripe PaymentIntent metadata so the Stripe webhook can pass
 * them to the Meta CAPI Purchase event — without them, server-side
 * attribution back to the original ad click is poor.
 */

export interface FbAttribution {
  fbc?: string;
  fbp?: string;
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = new RegExp(`(?:^|; )${name}=([^;]+)`).exec(document.cookie);
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function getFbAttribution(): FbAttribution {
  if (typeof window === "undefined") return {};

  const fbp = readCookie("_fbp");
  let fbc = readCookie("_fbc");

  // Construct _fbc from fbclid if the pixel hasn't set the cookie yet.
  // Meta's required format: `fb.1.{unix_seconds}.{fbclid}`.
  if (!fbc) {
    let fbclid: string | null = null;
    try {
      fbclid = new URLSearchParams(window.location.search).get("fbclid");
    } catch {
      fbclid = null;
    }
    if (!fbclid) {
      try { fbclid = localStorage.getItem("unc-fbclid"); } catch { /* ignore */ }
    }
    if (fbclid) {
      fbc = `fb.1.${Math.floor(Date.now() / 1000)}.${fbclid}`;
    }
  }

  return { fbc, fbp };
}
