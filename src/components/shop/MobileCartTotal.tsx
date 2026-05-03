"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useHydratedCart, useCartItemCount } from "@/lib/cart/store";
import { MIN_SUBTOTAL_CENTS } from "@/lib/cart-pricing-constants";
import { formatCents } from "@/lib/format";

// Floating cart bar at the bottom of /shop on mobile only. Keeps the
// conversion target visible while the customer scrolls 5 categories of
// items. Hidden on sm+ since the desktop cart icon in the nav is enough.
//
// Computes a CLIENT-SIDE estimate (sum of priceCents in localStorage) for
// instant feedback. Server is still the authority on price; this is just
// the running tally a customer expects to see.
export function MobileCartTotal() {
  const lines = useHydratedCart((s) => s.lines) ?? [];
  const count = useCartItemCount();
  if (!lines || lines.length === 0) return null;

  // Estimate subtotal locally so the bar updates instantly on +/-. We don't
  // know unit prices from the cart store alone, so we rely on the catalog
  // having already been hydrated by the page; if not, we fall back to just
  // showing the item count.
  const estimateCents = lines.reduce((sum, l) => {
    const cached =
      typeof window !== "undefined"
        ? Number(window.sessionStorage.getItem(`um-price-${l.sku}`)) || 0
        : 0;
    return sum + cached * l.quantity;
  }, 0);
  const meetsMin = estimateCents >= MIN_SUBTOTAL_CENTS;
  const shortfall = Math.max(0, MIN_SUBTOTAL_CENTS - estimateCents);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 sm:hidden">
      <div className="border-t border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <Link
          href="/checkout"
          aria-disabled={!meetsMin}
          onClick={(e) => {
            if (!meetsMin) e.preventDefault();
          }}
          className={`flex h-12 w-full items-center justify-between rounded-xl px-4 text-sm font-semibold ${
            meetsMin
              ? "bg-primary text-primary-foreground"
              : "cursor-not-allowed bg-muted text-muted-foreground"
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            {count} {count === 1 ? "item" : "items"}
            {estimateCents > 0 && (
              <span className="opacity-90">· {formatCents(estimateCents)}</span>
            )}
          </span>
          {meetsMin ? (
            <span>Checkout →</span>
          ) : (
            <span className="text-xs">Add {formatCents(shortfall)}</span>
          )}
        </Link>
      </div>
    </div>
  );
}
