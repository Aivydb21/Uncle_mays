"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

// Thin promo bar above the main Navigation. Sets a cookie when dismissed
// so the same visitor doesn't see it again that session. Sticky-positioned
// above the existing sticky nav (using container-level CSS).
//
// Show on every page; the visitor either takes the discount and goes to
// /shop, or dismisses and the bar is gone for that session. Either way,
// FRESH10 is visible at every funnel step until they convert.

const DISMISS_KEY = "um-promo-strip-dismissed-v1";

export function PromoStrip() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const dismissed = window.sessionStorage.getItem(DISMISS_KEY) === "1";
      if (!dismissed) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  function dismiss() {
    setOpen(false);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  }

  if (!open) return null;

  return (
    <div className="relative bg-primary text-primary-foreground">
      <div className="container flex items-center justify-center gap-3 px-6 py-2 text-center text-sm">
        <span className="font-semibold">
          🎁 New customer? Use code{" "}
          <span className="rounded bg-primary-foreground/15 px-2 py-0.5 font-bold tracking-wider">
            FRESH10
          </span>{" "}
          for $10 off your first order over $25
        </span>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss promo banner"
          className="absolute right-3 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
