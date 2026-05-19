"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpDown, Check, Search, SlidersHorizontal, X } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { MobileCartTotal } from "@/components/shop/MobileCartTotal";
import { formatCents } from "@/lib/format";
import { useCartStore } from "@/lib/cart/store";
import { lrTrack } from "@/lib/logrocket";
import type { CatalogCategory, CatalogItem } from "@/lib/catalog/types";

const CATEGORY_ORDER: CatalogCategory[] = [
  "Greens",
  "Roots",
  "Microgreens",
  "Pantry",
  "Protein",
];

type SortMode = "default" | "price-asc" | "price-desc" | "name-asc";

const SORT_MODES: SortMode[] = ["default", "price-asc", "price-desc", "name-asc"];

const SORT_LABELS: Record<SortMode, string> = {
  default: "Featured",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  "name-asc": "Name: A–Z",
};

function slugForCategory(c: CatalogCategory): string {
  return `cat-${c.toLowerCase()}`;
}

function sortItems(items: CatalogItem[], mode: SortMode): CatalogItem[] {
  if (mode === "default") return items;
  const copy = items.slice();
  if (mode === "price-asc") copy.sort((a, b) => a.priceCents - b.priceCents);
  if (mode === "price-desc") copy.sort((a, b) => b.priceCents - a.priceCents);
  if (mode === "name-asc")
    copy.sort((a, b) =>
      a.name.localeCompare(b.name, "en", { sensitivity: "base" })
    );
  return copy;
}

// Restore a cart from a "save my cart" email link (?cart=sku:qty,sku:qty,...)
// Only runs once on mount. Skips items not in the live catalog (sold out or
// retired). Strips the param from the URL after loading so refreshes don't
// re-merge it. Also accepts ?fm=delivery|pickup, ?zip=, ?promo= as side info.
function useRestoreCartFromUrl(items: CatalogItem[]): void {
  const addLine = useCartStore((s) => s.addLine);
  const setFulfillmentMode = useCartStore((s) => s.setFulfillmentMode);
  const setShippingZip = useCartStore((s) => s.setShippingZip);
  const setPromoCode = useCartStore((s) => s.setPromoCode);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const cartParam = url.searchParams.get("cart");
    if (!cartParam) return;
    const valid = new Set(items.map((i) => i.sku));
    let added = 0;
    for (const piece of cartParam.split(",")) {
      const [sku, qtyRaw] = piece.split(":");
      const qty = Math.max(1, Math.min(99, Math.floor(Number(qtyRaw) || 1)));
      if (sku && valid.has(sku.trim())) {
        addLine(sku.trim(), qty);
        added += 1;
      }
    }
    const fm = url.searchParams.get("fm");
    if (fm === "pickup" || fm === "delivery") setFulfillmentMode(fm);
    const zip = url.searchParams.get("zip");
    if (zip && /^\d{5}$/.test(zip)) setShippingZip(zip);
    const promo = url.searchParams.get("promo");
    if (promo) setPromoCode(promo.toUpperCase());
    if (added > 0) {
      // Clean the param so a refresh doesn't double-add. Keep utm_* etc.
      url.searchParams.delete("cart");
      url.searchParams.delete("fm");
      url.searchParams.delete("zip");
      url.searchParams.delete("promo");
      window.history.replaceState({}, "", url.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function CatalogGrid({
  items,
}: {
  items: CatalogItem[];
}) {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<
    Set<CatalogCategory>
  >(new Set());
  const [sortMode, setSortMode] = useState<SortMode>("default");
  useRestoreCartFromUrl(items);

  const availableCategories = useMemo(() => {
    const present = new Set<CatalogCategory>();
    for (const it of items) present.add(it.category);
    return CATEGORY_ORDER.filter((c) => present.has(c));
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      if (selectedCategories.size > 0 && !selectedCategories.has(it.category))
        return false;
      if (!q) return true;
      const haystack =
        `${it.name} ${it.description ?? ""} ${it.category}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [items, search, selectedCategories]);

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

  const flatSorted = useMemo(
    () => sortItems(filtered, sortMode),
    [filtered, sortMode]
  );

  // Grouped sections only make sense when sort is at default. Any user-applied
  // sort dissolves the per-category sub-grouping into a single sorted grid.
  // Category filters still allow grouped layout (the visible sections are just
  // a subset).
  const useGrouped = sortMode === "default";

  const toggleCategory = (cat: CatalogCategory) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      const adding = !next.has(cat);
      if (adding) next.add(cat);
      else next.delete(cat);
      lrTrack("shop_filter_category", {
        category: cat,
        action: adding ? "add" : "remove",
        active_count: next.size,
      });
      return next;
    });
  };

  const clearAll = () => {
    setSelectedCategories(new Set());
    setSortMode("default");
    lrTrack("shop_filter_cleared", {});
  };

  const handleSortChange = (mode: SortMode) => {
    setSortMode(mode);
    lrTrack("shop_sort_changed", { mode });
  };

  return (
    <>
      <div className="mb-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          resultCount={filtered.length}
          totalCount={items.length}
        />
      </div>

      <FilterSortBar
        availableCategories={availableCategories}
        selectedCategories={selectedCategories}
        onToggleCategory={toggleCategory}
        sortMode={sortMode}
        onSortChange={handleSortChange}
        onClear={clearAll}
        resultCount={filtered.length}
      />

      {filtered.length === 0 ? (
        <NoResultsMessage
          onClear={() => {
            setSearch("");
            clearAll();
          }}
        />
      ) : useGrouped ? (
        <div className="mt-5 space-y-10 pb-32 sm:pb-10">
          {grouped.map(({ category, items }, sectionIdx) => (
            <section
              key={category}
              id={slugForCategory(category)}
              className="scroll-mt-32"
            >
              <h2 className="mb-3 text-xl font-bold text-foreground">
                {category}
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {items.map((item, itemIdx) => (
                  // Preload the first row of the first section (above the fold
                  // on every viewport). Galileo UNC-1149 showed the LCP image
                  // request was waiting for hydration on cellular mobile.
                  <CatalogCard
                    key={item.sku}
                    item={item}
                    priority={sectionIdx === 0 && itemIdx < 6}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-5 pb-32 sm:pb-10">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {flatSorted.map((item, idx) => (
              <CatalogCard key={item.sku} item={item} priority={idx < 6} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile-only floating cart total bar at bottom of viewport. */}
      <MobileCartTotal />
    </>
  );
}

function FilterSortBar({
  availableCategories,
  selectedCategories,
  onToggleCategory,
  sortMode,
  onSortChange,
  onClear,
  resultCount,
}: {
  availableCategories: CatalogCategory[];
  selectedCategories: Set<CatalogCategory>;
  onToggleCategory: (cat: CatalogCategory) => void;
  sortMode: SortMode;
  onSortChange: (mode: SortMode) => void;
  onClear: () => void;
  resultCount: number;
}) {
  if (availableCategories.length <= 1) return null;
  const filterCount = selectedCategories.size;
  const hasActive = filterCount > 0 || sortMode !== "default";

  return (
    <div className="mb-1">
      {/* Mobile: two equal-width sheet triggers */}
      <div className="flex gap-2 sm:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold active:scale-[0.97] ${
                filterCount > 0
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground"
              }`}
              aria-label="Open category filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters{filterCount > 0 ? ` (${filterCount})` : ""}
            </button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="max-h-[80vh] overflow-y-auto rounded-t-2xl"
          >
            <SheetHeader>
              <SheetTitle>Filter by category</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-2">
              {availableCategories.map((cat) => {
                const checked = selectedCategories.has(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => onToggleCategory(cat)}
                    aria-pressed={checked}
                    className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-left"
                  >
                    <span className="text-sm font-semibold">{cat}</span>
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-md border ${
                        checked
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background"
                      }`}
                    >
                      {checked && <Check className="h-4 w-4" />}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex items-center gap-3">
              {filterCount > 0 && (
                <button
                  type="button"
                  onClick={onClear}
                  className="h-11 flex-1 rounded-full border border-border bg-background text-sm font-semibold text-foreground"
                >
                  Clear
                </button>
              )}
              <SheetClose asChild>
                <button
                  type="button"
                  className="h-11 flex-[2] rounded-full bg-primary text-sm font-semibold text-primary-foreground"
                >
                  Show {resultCount} {resultCount === 1 ? "item" : "items"}
                </button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>

        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold active:scale-[0.97] ${
                sortMode !== "default"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground"
              }`}
              aria-label="Open sort options"
            >
              <ArrowUpDown className="h-4 w-4" />
              Sort
            </button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="max-h-[80vh] overflow-y-auto rounded-t-2xl"
          >
            <SheetHeader>
              <SheetTitle>Sort by</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-2">
              {SORT_MODES.map((mode) => (
                <SheetClose asChild key={mode}>
                  <button
                    type="button"
                    onClick={() => onSortChange(mode)}
                    aria-pressed={sortMode === mode}
                    className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-left"
                  >
                    <span className="text-sm font-semibold">
                      {SORT_LABELS[mode]}
                    </span>
                    {sortMode === mode && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                </SheetClose>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: inline category chips on the left, sort dropdown on the right */}
      <div className="hidden flex-wrap items-center gap-2 sm:flex">
        <span className="text-sm font-semibold text-muted-foreground">
          Filter:
        </span>
        {availableCategories.map((cat) => {
          const checked = selectedCategories.has(cat);
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onToggleCategory(cat)}
              aria-pressed={checked}
              className={`inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold transition-colors ${
                checked
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:border-primary/50 hover:text-primary"
              }`}
            >
              {cat}
            </button>
          );
        })}
        {hasActive && (
          <button
            type="button"
            onClick={onClear}
            className="ml-1 text-xs font-semibold text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Clear
          </button>
        )}
        <div className="ml-auto inline-flex items-center gap-2">
          <label
            htmlFor="shop-sort"
            className="text-sm font-semibold text-muted-foreground"
          >
            Sort:
          </label>
          <select
            id="shop-sort"
            value={sortMode}
            onChange={(e) => onSortChange(e.target.value as SortMode)}
            className="h-9 rounded-full border border-border bg-background px-3 text-sm font-semibold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {SORT_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {SORT_LABELS[mode]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
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

function CatalogCard({ item, priority = false }: { item: CatalogItem; priority?: boolean }) {
  // Track image load failures so a timed-out or 404'd image falls back to a
  // name-only tile instead of a blank muted box. Galileo 2026-05-15 daily
  // briefing flagged this gap as the #1 friction pattern (UNC-1082).
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-shadow hover:shadow-medium">
      <div className="relative aspect-square w-full bg-muted">
        {item.imageUrl && !imageFailed ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, (max-width: 1536px) 20vw, 16vw"
            className="object-cover"
            quality={70}
            priority={priority}
            onError={() => setImageFailed(true)}
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
            / {item.unitLabel || item.unit}
          </span>
        </p>
        <div className="mt-auto pt-2">
          <AddToCartButton item={item} variant="compact" />
        </div>
      </div>
    </div>
  );
}
