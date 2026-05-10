"use client";

// EXP-002 (2026-05-09): replaced the Tuesday-cutoff/Wednesday-delivery
// urgency banner with a flexible-delivery prompt. The old countdown told
// customers they had to order by Tuesday for Wednesday delivery; the painted
// door experiment instead presents every-day windows in the checkout step
// and surfaces flexibility on the home/pricing/shop surfaces.
//
// The component is kept (rather than deleted) so existing consumers
// (Pricing, page-content, etc.) continue to mount without rewiring. The
// `variant` prop is preserved for the same reason.

import Link from "next/link";

interface Props {
  /** "inline" = compact badge for Hero; "box" = card for Pricing/Checkout */
  variant?: "inline" | "box";
}

export function DeadlineCountdown({ variant = "box" }: Props) {
  if (variant === "inline") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
        <span aria-hidden="true">📦</span>
        <span>Pick your delivery day & window at checkout</span>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden="true">📦</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-primary">
            Citywide delivery, every day of the week
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Pick the day and window that works for you when you check out.
            Mornings, lunchtime, afternoons, or after work.
          </p>
          <Link
            href="/shop"
            className="mt-3 inline-flex items-center text-xs font-semibold text-primary hover:underline"
          >
            Build your order →
          </Link>
        </div>
      </div>
    </div>
  );
}
