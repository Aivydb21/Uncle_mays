// Reminder banner only — the customer enters the code themselves in the
// cart drawer or on /checkout. We do not auto-apply ?promo=CODE from the
// URL because customers should consciously claim the discount.
export function PromoBanner({ code }: { code: string }) {
  return (
    <div className="mx-auto mb-6 inline-flex w-full max-w-2xl items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-center text-sm font-semibold text-primary">
      Use code{" "}
      <span className="rounded bg-primary px-2 py-0.5 text-xs font-bold tracking-wider text-primary-foreground">
        {code.toUpperCase()}
      </span>{" "}
      at checkout for $10 off
    </div>
  );
}
