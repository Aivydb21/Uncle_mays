"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useHydratedCart, useCartStore } from "@/lib/cart/store";
import type { CatalogItem } from "@/lib/catalog/types";

interface Props {
  item: CatalogItem;
  variant?: "compact" | "full";
}

export function AddToCartButton({ item, variant = "full" }: Props) {
  const lines = useHydratedCart((s) => s.lines);
  const addLine = useCartStore((s) => s.addLine);
  const setQuantity = useCartStore((s) => s.setQuantity);

  const inCart = lines?.find((l) => l.sku === item.sku);
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
    addLine(item.sku, 1);
    bump();
    cachePrice();
    fireAnalytics(item, qty + 1);
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
      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl ${
        variant === "compact" ? "h-9 px-3 text-sm" : "h-10 px-4 text-sm"
      } font-semibold border-2 border-primary bg-background text-primary transition-colors hover:bg-primary hover:text-primary-foreground`}
    >
      <Plus className="h-4 w-4" />
      Add to cart
    </button>
  );
}

function fireAnalytics(item: CatalogItem, newQty: number) {
  try {
    if (typeof window === "undefined") return;
    const w = window as unknown as {
      fbq?: (...args: unknown[]) => void;
      gtag?: (...args: unknown[]) => void;
    };
    const value = (item.priceCents * newQty) / 100;
    if (w.fbq) {
      w.fbq("track", "AddToCart", {
        content_name: item.name,
        content_ids: [item.sku],
        content_type: "product",
        value,
        currency: "USD",
      });
    }
    if (w.gtag) {
      w.gtag("event", "add_to_cart", {
        currency: "USD",
        value,
        items: [
          {
            item_id: item.sku,
            item_name: item.name,
            price: item.priceCents / 100,
            quantity: 1,
          },
        ],
      });
    }
  } catch {
    // analytics never blocks
  }
}
