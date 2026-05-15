"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useCartHydrated, useCartStore } from "@/lib/cart/store";
import { sha256 } from "@/lib/browser-hash";
import { getFbAttribution } from "@/lib/fb-attribution";
import type { CatalogItem } from "@/lib/catalog/types";

interface Props {
  item: CatalogItem;
  variant?: "compact" | "full";
}

export function AddToCartButton({ item, variant = "full" }: Props) {
  const hydrated = useCartHydrated();
  const lines = useCartStore((s) => s.lines);
  const addLine = useCartStore((s) => s.addLine);
  const setQuantity = useCartStore((s) => s.setQuantity);

  // Until persist rehydrates from localStorage, reads of `lines` are not
  // authoritative — treat as "no item in cart" so the qty stepper doesn't
  // flicker. Writes are gated below in handleAdd so pre-hydration clicks
  // are not silently overwritten when persist replays the stored cart.
  const inCart = hydrated ? lines.find((l) => l.sku === item.sku) : undefined;
  const qty = inCart?.quantity ?? 0;

  const [pulse, setPulse] = useState(false);
  function bump() {
    setPulse(true);
    window.setTimeout(() => setPulse(false), 200);
  }

  // Cache unit price in sessionStorage so MobileCartTotal can show a running
  // tally without re-fetching the catalog. Server is still the authority on
  // price (priceCart re-resolves on every quote).
  function cachePrice() {
    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(`um-price-${item.sku}`, String(item.priceCents));
      }
    } catch {
      // ignore quota / disabled-storage
    }
  }

  function handleAdd() {
    // Pre-hydration writes get overwritten when persist replays from
    // localStorage. The button is also disabled in this state, but guard
    // here as belt-and-suspenders for touch dispatch races on slow mobile
    // in-app browsers.
    if (!hydrated) return;
    const addQty = Math.max(1, Math.floor(item.defaultAddQty || 1));
    addLine(item.sku, addQty);
    bump();
    cachePrice();
    fireAnalytics(item, qty + addQty);
  }

  if (qty > 0) {
    return (
      <div className="flex items-center justify-between gap-1 rounded-xl border border-primary/30 bg-primary/5 p-1">
        <button
          type="button"
          onClick={() => {
            setQuantity(item.sku, qty - 1);
            bump();
          }}
          aria-label={`Decrease ${item.name}`}
          // 44x44 minimum touch target on mobile (Apple HIG / Google Material).
          className="flex h-11 w-11 items-center justify-center rounded-lg text-primary active:bg-primary/15 hover:bg-primary/10 sm:h-9 sm:w-9"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span
          className={`min-w-[2ch] text-center text-base font-semibold text-foreground transition-transform sm:text-sm ${
            pulse ? "scale-110" : ""
          }`}
        >
          {qty}
        </span>
        <button
          type="button"
          onClick={() => {
            setQuantity(item.sku, qty + 1);
            bump();
            cachePrice();
            fireAnalytics(item, qty + 1);
          }}
          aria-label={`Increase ${item.name}`}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-primary active:bg-primary/15 hover:bg-primary/10 sm:h-9 sm:w-9"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={!hydrated}
      aria-busy={!hydrated}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl ${
        variant === "compact" ? "h-9 px-3 text-sm" : "h-10 px-4 text-sm"
      } font-semibold border-2 border-primary bg-background text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-60 disabled:cursor-progress`}
    >
      <Plus className="h-4 w-4" />
      {hydrated ? "Add to cart" : "Loading…"}
    </button>
  );
}

async function fireAnalytics(item: CatalogItem, newQty: number) {
  try {
    if (typeof window === "undefined") return;
    const w = window as unknown as {
      fbq?: (...args: unknown[]) => void;
      gtag?: (...args: unknown[]) => void;
    };
    const value = (item.priceCents * newQty) / 100;

    // Read identity cached at InitiateCheckout time. Present for returning
    // visitors or users who started checkout in the same session.
    //   unc-email → raw email  → hashed here for Pixel em + sent raw to CAPI
    //   unc-ph    → pre-hashed phone → used directly as Pixel ph
    let capturedEmail: string | null = null;
    let cachedPh: string | undefined;
    try {
      capturedEmail = localStorage.getItem("unc-email");
      cachedPh = localStorage.getItem("unc-ph") || undefined;
    } catch {
      // ignore storage errors
    }
    const hashedEmail = capturedEmail ? await sha256(capturedEmail) : undefined;

    // Stable eventId shared with CAPI so Meta deduplicates the two signals.
    const eventId = `atc-${item.sku}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    // Meta Pixel. fbq is pre-stubbed in layout.tsx so calls made before
    // fbevents.js loads are buffered into the queue and replayed.
    // Pass hashed em (Advanced Matching) when available.
    if (w.fbq) {
      w.fbq(
        "track",
        "AddToCart",
        {
          content_name: item.name,
          content_ids: [item.sku],
          content_type: "product",
          value,
          currency: "USD",
          ...(hashedEmail && { em: hashedEmail }),
          ...(cachedPh && { ph: cachedPh }),
        },
        { eventID: eventId },
      );
    }

    // Server-side CAPI companion. Survives iOS ATT / Safari ITP.
    // Same eventId → Meta deduplicates. Fire-and-forget; never blocks UI.
    const { fbc, fbp } = getFbAttribution();
    fetch("/api/capi/add-to-cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        sku: item.sku,
        contentName: item.name,
        value,
        quantity: newQty,
        eventId,
        email: capturedEmail || undefined,
        fbc,
        fbp,
      }),
    }).catch(() => {
      /* CAPI failure must never affect UX */
    });

    // GA4 gtag. Stubbed in layout.tsx; retry kept as belt-and-braces.
    let attempts = 0;
    const maxAttempts = 8;
    const tryGtag = () => {
      if (typeof w.gtag === "function") {
        w.gtag("event", "add_to_cart", {
          currency: "USD",
          value,
          items: [
            {
              item_id: item.sku,
              item_name: item.name,
              price: item.priceCents / 100,
              quantity: newQty,
            },
          ],
        });
        return;
      }
      if (++attempts < maxAttempts) {
        setTimeout(tryGtag, 1000);
      }
    };
    tryGtag();
  } catch {
    // analytics never blocks
  }
}
