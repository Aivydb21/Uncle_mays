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

  return (
    <div className="space-y-12">
      {grouped.map(({ category, items }) => (
        <section key={category}>
          <h2 className="mb-4 text-2xl font-bold text-foreground">{category}</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="relative aspect-square w-full bg-muted">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            {item.name}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold leading-tight text-foreground">
            {item.name}
          </h3>
          <p className="whitespace-nowrap text-base font-bold text-primary">
            {formatCents(item.priceCents)}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">per {item.unit}</p>
        {item.description && (
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {item.description}
          </p>
        )}
        <div className="mt-auto pt-3">
          <AddToCartButton item={item} />
        </div>
      </div>
    </div>
  );
}
