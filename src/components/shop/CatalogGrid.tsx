"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { useCartStore } from "@/lib/cart/store";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { formatCents } from "@/lib/format";
import type { CatalogCategory, CatalogItem } from "@/lib/catalog/types";

const CATEGORY_ORDER: CatalogCategory[] = [
  "Greens",
  "Roots",
  "Microgreens",
  "Pantry",
  "Protein",
];

export function CatalogGrid({
  items,
  initialPromo,
}: {
  items: CatalogItem[];
  initialPromo: string | null;
}) {
  const setPromoCode = useCartStore((s) => s.setPromoCode);

  useEffect(() => {
    if (initialPromo) setPromoCode(initialPromo.toUpperCase());
  }, [initialPromo, setPromoCode]);

  const grouped = useMemo(() => {
    const map = new Map<CatalogCategory, CatalogItem[]>();
    for (const it of items) {
      const arr = map.get(it.category) ?? [];
      arr.push(it);
      map.set(it.category, arr);
    }
    return CATEGORY_ORDER.flatMap((cat) =>
      map.has(cat) ? [{ category: cat, items: map.get(cat)! }] : []
    );
  }, [items]);

  if (grouped.length === 0) return null;

  // Card density per Baymard grocery-ecommerce research: 5–8 columns on
  // wide screens is the sweet spot before scan-fatigue sets in. We ramp
  // 2 → 3 → 4 → 5 → 6 across breakpoints so customers see ~6 items per row
  // on a 1440+ display without overwhelming smaller viewports.
  return (
    <div className="space-y-10">
      {grouped.map(({ category, items }) => (
        <section key={category}>
          <h2 className="mb-3 text-xl font-bold text-foreground">{category}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {items.map((item) => (
              <CatalogCard key={item.sku} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function CatalogCard({ item }: { item: CatalogItem }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-shadow hover:shadow-medium">
      <div className="relative aspect-square w-full bg-muted">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, (max-width: 1536px) 20vw, 16vw"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs text-muted-foreground">
            {item.name}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {item.name}
        </h3>
        <p className="text-sm font-bold text-primary">
          {formatCents(item.priceCents)}
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            / {item.unit}
          </span>
        </p>
        <div className="mt-auto pt-2">
          <AddToCartButton item={item} variant="compact" />
        </div>
      </div>
    </div>
  );
}
