// Static informational header above the catalog.
// "Build Your Own Box" pill removed 2026-05-18 — it created visual crowding
// with the headline and didn't carry weight after the cart-based catalog
// replaced the fixed boxes. The ZIP-check expander was removed the same day;
// service area is validated at checkout via SERVICE_AREA_ZIPS in
// src/lib/service-area.ts.

export function ShopHeader() {
  return (
    <header className="mb-10 text-center">
      <h1 className="text-4xl font-bold leading-tight md:text-5xl">
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
