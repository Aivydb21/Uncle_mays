"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cart/store";

export function PromoBanner({ code }: { code: string }) {
  const setPromoCode = useCartStore((s) => s.setPromoCode);
  useEffect(() => {
    if (code) setPromoCode(code.toUpperCase());
  }, [code, setPromoCode]);
  return (
    <div className="mx-auto mb-6 inline-flex w-full max-w-2xl items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-center text-sm font-semibold text-primary">
      Promo{" "}
      <span className="rounded bg-primary px-2 py-0.5 text-xs font-bold tracking-wider text-primary-foreground">
        {code.toUpperCase()}
      </span>{" "}
      will apply at checkout
    </div>
  );
}
