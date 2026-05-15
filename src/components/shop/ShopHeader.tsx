export function ShopHeader() {
  return (
    <header className="mb-10 text-center">
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-sm font-semibold text-primary">
        Build Your Own Box
      </div>
      <h1 className="mt-4 text-4xl font-bold md:text-5xl">Shop the catalog</h1>
      <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
        Pick exactly what you want, in whatever quantity you want. $20 minimum.
        <strong>Chicago-area delivery</strong> 7 days a week with a window of
        your choice, or free pickup at Polsky Center in Hyde Park.
      </p>
      <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
        <span aria-hidden="true">📍</span>
        <span>Chicago delivery only — confirm your ZIP at checkout</span>
      </div>
    </header>
  );
}
