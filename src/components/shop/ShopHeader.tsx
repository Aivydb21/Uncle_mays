// Static informational header above the catalog.
// The inline ZIP-check expander was removed 2026-05-18 — service area is
// validated at checkout instead, so the catalog header stays a clean
// informational block. Customers who type a ZIP at checkout get the same
// in-zone / out-of-zone messaging powered by `SERVICE_AREA_ZIPS` in
// src/lib/service-area.ts (still the single source of truth).

export function ShopHeader() {
  return (
    <header className="mb-10 text-center">
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-sm font-semibold text-primary">
        Build Your Own Box
      </div>
      <h1 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
        Shop the catalog
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
        Pick exactly what you want, in whatever quantity you want. $20 minimum.
        <strong className="ml-1">Chicago-area delivery</strong> 7 days a week
        with a window of your choice, or free pickup at Polsky Center in Hyde
        Park.
      </p>
    </header>
  );
}
