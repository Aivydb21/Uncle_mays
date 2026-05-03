"use client";

import { useEffect, useMemo, useState } from "react";
import { ShoppingBag, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useHydratedCart, useCartStore, useCartItemCount } from "@/lib/cart/store";
import { formatCents } from "@/lib/format";
import { MIN_SUBTOTAL_CENTS } from "@/lib/cart-pricing-constants";
import type { PricingResponse } from "@/lib/catalog/types";

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const count = useCartItemCount();
  const lines = useHydratedCart((s) => s.lines) ?? [];
  const fulfillmentMode = useHydratedCart((s) => s.fulfillmentMode) ?? "delivery";
  const shippingZip = useHydratedCart((s) => s.shippingZip);
  const promoCode = useHydratedCart((s) => s.promoCode);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeLine = useCartStore((s) => s.removeLine);
  const setPromoCode = useCartStore((s) => s.setPromoCode);

  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [promoInput, setPromoInput] = useState(promoCode || "");

  useEffect(() => {
    setPromoInput(promoCode || "");
  }, [promoCode]);

  const cartFingerprint = useMemo(
    () =>
      JSON.stringify({
        lines: lines?.map((l) => [l.sku, l.quantity]),
        fulfillmentMode,
        shippingZip,
        promoCode,
      }),
    [lines, fulfillmentMode, shippingZip, promoCode]
  );

  useEffect(() => {
    if (!open) return;
    if (!lines || lines.length === 0) {
      setPricing(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch("/api/cart/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cart: lines,
        fulfillmentMode,
        shippingZip,
        promoCode,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setPricing(data as PricingResponse);
      })
      .catch(() => {
        if (!cancelled)
          setPricing({
            ok: false,
            code: "catalog_unavailable",
            message: "Could not refresh totals.",
          });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [cartFingerprint, open, lines, fulfillmentMode, shippingZip, promoCode]);

  const subtotalCents = pricing && pricing.ok ? pricing.subtotalCents : 0;
  const meetsMin = subtotalCents >= MIN_SUBTOTAL_CENTS;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={`Open cart (${count} items)`}
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted"
        >
          <ShoppingBag className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
              {count}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-border px-6 py-5">
          <SheetTitle>Your cart</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {(!lines || lines.length === 0) && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-base text-muted-foreground">
                Your cart is empty.
              </p>
              <Link
                href="/shop"
                className="mt-4 inline-flex items-center text-sm font-semibold text-primary hover:underline"
                onClick={() => setOpen(false)}
              >
                Browse the catalog →
              </Link>
            </div>
          )}

          {lines && lines.length > 0 && pricing && pricing.ok && (
            <ul className="space-y-4">
              {pricing.lineItems.map((item) => (
                <li
                  key={item.sku}
                  className="flex items-start gap-3 border-b border-border pb-4 last:border-b-0"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCents(item.unitPriceCents)} / {item.unit}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={item.quantity}
                        onChange={(e) => {
                          const next = Math.max(
                            0,
                            Math.min(99, parseInt(e.target.value || "0", 10) || 0)
                          );
                          setQuantity(item.sku, next);
                        }}
                        className="h-9 w-16 rounded-md border border-border bg-background px-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeLine(item.sku)}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right text-sm font-semibold text-foreground">
                    {formatCents(item.lineTotalCents)}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {lines && lines.length > 0 && (
            <div className="mt-6 space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Promo code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="FRESH10"
                  className="h-10 flex-1 rounded-md border border-border bg-background px-3 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setPromoCode(promoInput.trim() || null)}
                  className="rounded-md border border-primary px-3 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Apply
                </button>
              </div>
              {pricing && pricing.ok && pricing.appliedPromoCode && (
                <p className="text-xs text-primary">
                  {pricing.appliedPromoCode} applied
                </p>
              )}
            </div>
          )}
        </div>

        {lines && lines.length > 0 && (
          <div className="border-t border-border bg-muted/40 px-6 py-5">
            <Totals pricing={pricing} loading={loading} />
            {!meetsMin && (
              <p className="mt-2 text-xs text-amber-700">
                Add{" "}
                {formatCents(Math.max(0, MIN_SUBTOTAL_CENTS - subtotalCents))}{" "}
                more to reach the $25 minimum.
              </p>
            )}
            <Link
              href="/checkout"
              onClick={(e) => {
                if (!meetsMin) e.preventDefault();
                else setOpen(false);
              }}
              className={`mt-4 inline-flex h-12 w-full items-center justify-center rounded-xl text-base font-semibold transition-colors ${
                meetsMin
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "cursor-not-allowed bg-muted text-muted-foreground"
              }`}
              aria-disabled={!meetsMin}
            >
              Continue to checkout
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Totals({
  pricing,
  loading,
}: {
  pricing: PricingResponse | null;
  loading: boolean;
}) {
  if (loading && !pricing) {
    return (
      <div className="flex items-center justify-center py-3 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Calculating…
      </div>
    );
  }
  if (!pricing) return null;
  if (!pricing.ok) {
    return (
      <p className="text-sm text-muted-foreground">{pricing.message}</p>
    );
  }
  return (
    <dl className="space-y-1 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd>{formatCents(pricing.subtotalCents)}</dd>
      </div>
      {pricing.discountCents > 0 && (
        <div className="flex justify-between text-primary">
          <dt>Discount</dt>
          <dd>-{formatCents(pricing.discountCents)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Shipping</dt>
        <dd>{formatCents(pricing.shippingCents)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Tax</dt>
        <dd>{formatCents(pricing.taxCents)}</dd>
      </div>
      <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-semibold">
        <dt>Total</dt>
        <dd>{formatCents(pricing.totalCents)}</dd>
      </div>
    </dl>
  );
}
