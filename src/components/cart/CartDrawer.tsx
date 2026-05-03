"use client";

import { useEffect, useMemo, useState } from "react";
import { ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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
import type { CatalogItem, PricingResponse } from "@/lib/catalog/types";

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const count = useCartItemCount();
  const lines = useHydratedCart((s) => s.lines) ?? [];
  const fulfillmentMode = useHydratedCart((s) => s.fulfillmentMode) ?? "delivery";
  const shippingZip = useHydratedCart((s) => s.shippingZip);
  const promoCode = useHydratedCart((s) => s.promoCode);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeLine = useCartStore((s) => s.removeLine);
  const addLine = useCartStore((s) => s.addLine);
  const setPromoCode = useCartStore((s) => s.setPromoCode);

  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [promoInput, setPromoInput] = useState(promoCode || "");
  const [popular, setPopular] = useState<CatalogItem[] | null>(null);

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
      body: JSON.stringify({ cart: lines, fulfillmentMode, shippingZip, promoCode }),
    })
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setPricing(data as PricingResponse); })
      .catch(() => {
        if (!cancelled)
          setPricing({
            ok: false,
            code: "catalog_unavailable",
            message: "Could not refresh totals.",
          });
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [cartFingerprint, open, lines, fulfillmentMode, shippingZip, promoCode]);

  // Fetch the "Popular" recommendations when the drawer opens with an empty
  // cart. Cached client-side so subsequent opens are instant.
  useEffect(() => {
    if (!open) return;
    if (lines && lines.length > 0) return;
    if (popular !== null) return;
    fetch("/api/catalog/popular?limit=4")
      .then((r) => r.json())
      .then((d) => { if (d.ok) setPopular(d.items as CatalogItem[]); })
      .catch(() => {});
  }, [open, lines, popular]);

  const subtotalCents = pricing
    ? pricing.ok
      ? pricing.subtotalCents
      : pricing.subtotalCents ?? 0
    : 0;
  const meetsMin = subtotalCents >= MIN_SUBTOTAL_CENTS;
  const isEmpty = !lines || lines.length === 0;
  // Items resolved by the server, available on success AND on soft errors
  // (below_minimum, missing_zip, out_of_zone) so the drawer always shows
  // what's in the cart even when totals can't be finalized.
  const resolvedLineItems = pricing
    ? pricing.ok
      ? pricing.lineItems
      : pricing.lineItems ?? null
    : null;

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
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-6 py-5">
          <SheetTitle>Your cart</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isEmpty && (
            <EmptyCartContent
              popular={popular}
              onAdd={(sku) => {
                addLine(sku, 1);
                try {
                  const item = (popular || []).find((x) => x.sku === sku);
                  if (item && typeof window !== "undefined") {
                    window.sessionStorage.setItem(`um-price-${item.sku}`, String(item.priceCents));
                  }
                } catch { /* ignore */ }
              }}
              onCloseDrawer={() => setOpen(false)}
            />
          )}

          {!isEmpty && resolvedLineItems && (
            <ul className="space-y-4">
              {resolvedLineItems.map((item) => (
                <li
                  key={item.sku}
                  className="flex items-start gap-3 border-b border-border pb-4 last:border-b-0"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCents(item.unitPriceCents)} / {item.unitLabel || item.unit}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Decrease ${item.name}`}
                        onClick={() => setQuantity(item.sku, item.quantity - 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground hover:bg-muted"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-[2ch] text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase ${item.name}`}
                        onClick={() => setQuantity(item.sku, item.quantity + 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground hover:bg-muted"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeLine(item.sku)}
                        className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
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

          {!isEmpty && !resolvedLineItems && (!pricing || loading) && (
            <CartLineSkeleton lines={lines.length} />
          )}
        </div>

        {!isEmpty && (
          <div className="border-t border-border bg-muted/40 px-6 py-5">
            <Totals pricing={pricing} loading={loading} />
            <PromoDisclosure
              promoInput={promoInput}
              setPromoInput={setPromoInput}
              setPromoCode={setPromoCode}
              applied={pricing && pricing.ok ? pricing.appliedPromoCode : null}
            />
            {!meetsMin && pricing && pricing.ok && (
              <p className="mt-2 text-xs text-amber-700">
                Add {formatCents(Math.max(0, MIN_SUBTOTAL_CENTS - subtotalCents))}{" "}
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

function EmptyCartContent({
  popular,
  onAdd,
  onCloseDrawer,
}: {
  popular: CatalogItem[] | null;
  onAdd: (sku: string) => void;
  onCloseDrawer: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 text-base text-muted-foreground">
          Your cart is empty.
        </p>
        <Link
          href="/shop"
          onClick={onCloseDrawer}
          className="mt-2 inline-flex items-center text-sm font-semibold text-primary hover:underline"
        >
          Browse the catalog →
        </Link>
      </div>

      {popular && popular.length > 0 && (
        <div className="mt-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Popular this week
          </p>
          <ul className="space-y-3">
            {popular.map((item) => (
              <li
                key={item.sku}
                className="flex items-center gap-3 rounded-lg border border-border p-2"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[9px] text-muted-foreground">
                      {item.name.split(" ")[0]}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-primary">
                    {formatCents(item.priceCents)}{" "}
                    <span className="text-muted-foreground">/ {item.unit}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onAdd(item.sku)}
                  className="inline-flex h-9 items-center justify-center rounded-lg border-2 border-primary px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  Add
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {popular === null && (
        <div className="mt-8 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-border p-2"
            >
              <div className="h-14 w-14 shrink-0 animate-pulse rounded-md bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PromoDisclosure({
  promoInput,
  setPromoInput,
  setPromoCode,
  applied,
}: {
  promoInput: string;
  setPromoInput: (v: string) => void;
  setPromoCode: (v: string | null) => void;
  applied: string | null;
}) {
  const [open, setOpen] = useState(Boolean(applied));
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
      >
        Have a promo code?
      </button>
    );
  }
  return (
    <div className="mt-3 space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={promoInput}
          onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
          placeholder="Enter code"
          className="h-9 flex-1 rounded-md border border-border bg-background px-3 text-sm"
        />
        <button
          type="button"
          onClick={() => setPromoCode(promoInput.trim() || null)}
          className="rounded-md border border-primary px-3 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
        >
          Apply
        </button>
      </div>
      {applied && (
        <p className="text-xs text-primary">{applied} applied</p>
      )}
    </div>
  );
}

function CartLineSkeleton({ lines }: { lines: number }) {
  return (
    <ul className="space-y-4">
      {Array.from({ length: Math.min(lines, 4) }).map((_, i) => (
        <li
          key={i}
          className="flex items-start gap-3 border-b border-border pb-4 last:border-b-0"
        >
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-9 w-32 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-4 w-12 animate-pulse rounded bg-muted" />
        </li>
      ))}
    </ul>
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
      <div className="space-y-2 py-1">
        <div className="flex justify-between">
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          <div className="h-3 w-12 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex justify-between">
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="h-3 w-12 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex justify-between border-t border-border pt-2">
          <div className="h-4 w-12 animate-pulse rounded bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }
  if (!pricing) return null;
  if (!pricing.ok) {
    return (
      <div className="space-y-1 text-sm">
        {typeof pricing.subtotalCents === "number" && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatCents(pricing.subtotalCents)}</dd>
          </div>
        )}
        <p className="text-muted-foreground">{pricing.message}</p>
      </div>
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
