"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { useCartStore } from "@/lib/cart/store";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { MobileCartTotal } from "@/components/shop/MobileCartTotal";
import { formatCents } from "@/lib/format";
import type { CatalogCategory, CatalogItem } from "@/lib/catalog/types";

const CATEGORY_ORDER: CatalogCategory[] = [
  "Greens",
  "Roots",
  "Microgreens",
  "Pantry",
  "Protein",
];

function slugForCategory(c: CatalogCategory): string {
  return `cat-${c.toLowerCase()}`;
}

export function CatalogGrid({
  items,
  initialPromo,
}: {
  items: CatalogItem[];
  initialPromo: string | null;
}) {
  const setPromoCode = useCartStore((s) => s.setPromoCode);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (initialPromo) setPromoCode(initialPromo.toUpperCase());
  }, [initialPromo, setPromoCode]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const haystack = `${it.name} ${it.description ?? ""} ${it.category}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [items, search]);

  const grouped = useMemo(() => {
    const map = new Map<CatalogCategory, CatalogItem[]>();
    for (const it of filtered) {
      const arr = map.get(it.category) ?? [];
      arr.push(it);
      map.set(it.category, arr);
    }
    return CATEGORY_ORDER.flatMap((cat) =>
      map.has(cat) ? [{ category: cat, items: map.get(cat)! }] : []
    );
  }, [filtered]);

  return (
    <>
      <CategoryNavBar items={items} grouped={grouped} />

      <div className="mt-6 mb-8">
        <SearchBar
          value={search}
          onChange={setSearch}
          resultCount={filtered.length}
          totalCount={items.length}
        />
      </div>

      {grouped.length === 0 ? (
        <NoResultsMessage onClear={() => setSearch("")} />
      ) : (
        <div className="space-y-10 pb-32 sm:pb-10">
          {grouped.map(({ category, items }) => (
            <section key={category} id={slugForCategory(category)} className="scroll-mt-32">
              <h2 className="mb-3 text-xl font-bold text-foreground">{category}</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {items.map((item) => (
                  <CatalogCard key={item.sku} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Mobile-only floating cart total bar at bottom of viewport. */}
      <MobileCartTotal />
    </>
  );
}

function CategoryNavBar({
  items,
  grouped,
}: {
  items: CatalogItem[];
  grouped: { category: CatalogCategory; items: CatalogItem[] }[];
}) {
  // Build the chip list from CATEGORY_ORDER but only show categories that
  // actually have items in the unfiltered catalog (so the nav doesn't change
  // shape as the customer searches).
  const present = useMemo(() => {
    const seen = new Set<CatalogCategory>();
    for (const it of items) seen.add(it.category);
    return CATEGORY_ORDER.filter((c) => seen.has(c));
  }, [items]);

  // Highlight the chip whose section is currently in the viewport.
  const [active, setActive] = useState<CatalogCategory | null>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the topmost section currently above the bottom 60% of viewport.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              a.target.getBoundingClientRect().top -
              b.target.getBoundingClientRect().top
          );
        if (visible.length > 0) {
          const id = visible[0].target.id;
          const cat = present.find((c) => slugForCategory(c) === id);
          if (cat) setActive(cat);
        }
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: 0 }
    );
    for (const c of present) {
      const el = document.getElementById(slugForCategory(c));
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [present, grouped.length]);

  if (present.length <= 1) return null;

  return (
    <nav
      aria-label="Catalog categories"
      className="sticky top-16 z-40 -mx-6 border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <ul className="flex gap-2 overflow-x-auto py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {present.map((cat) => {
          const isActive = active === cat;
          return (
            <li key={cat} className="shrink-0">
              <a
                href={`#${slugForCategory(cat)}`}
                className={`inline-flex h-9 items-center rounded-full border px-4 text-sm font-semibold transition-colors ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary/50 hover:text-primary"
                }`}
              >
                {cat}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function SearchBar({
  value,
  onChange,
  resultCount,
  totalCount,
}: {
  value: string;
  onChange: (v: string) => void;
  resultCount: number;
  totalCount: number;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Search ${totalCount} items…`}
        className="h-11 w-full rounded-full border border-border bg-background pl-10 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        aria-label="Search the catalog"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {value && (
        <p className="mt-2 text-xs text-muted-foreground">
          {resultCount} of {totalCount} {resultCount === 1 ? "item" : "items"} match &ldquo;{value}&rdquo;
        </p>
      )}
    </div>
  );
}

function NoResultsMessage({ onClear }: { onClear: () => void }) {
  return (
    <div className="mx-auto mt-16 max-w-md rounded-2xl border border-border bg-muted/40 p-8 text-center">
      <h2 className="text-lg font-semibold">No matches</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Try a different search, or clear it to see the full catalog.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-4 inline-flex items-center text-sm font-semibold text-primary hover:underline"
      >
        Clear search
      </button>
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
        {(item.freshnessLabel || item.scarcityNote) && (
          <div className="absolute top-2 left-2 right-2 flex flex-col items-start gap-1">
            {item.freshnessLabel && (
              <span className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground shadow-sm">
                {item.freshnessLabel}
              </span>
            )}
            {item.scarcityNote && (
              <span className="rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                {item.scarcityNote}
              </span>
            )}
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
