"use client";

import Link from "next/link";

// Subscriptions are paused. Existing Stripe subscriptions (e.g. Doina's
// $55/wk grandfathered plan) continue to bill independently of this page;
// this banner exists for anyone landing on a legacy /subscribe/* link.
export default function SubscribePausedPage() {
  return (
    <div className="container mx-auto max-w-2xl px-6 py-16">
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-amber-900">
        <h1 className="text-2xl font-bold">Subscriptions are paused</h1>
        <p className="mt-2 text-base">
          We&rsquo;re focused on one-time orders right now. You can still build
          a custom order from the catalog and pick delivery or Polsky Center
          pickup.
        </p>
        <Link
          href="/shop"
          className="mt-5 inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Shop the catalog →
        </Link>
        <p className="mt-4 text-xs text-amber-800">
          Existing subscribers continue to be billed and delivered as scheduled.
          Questions: info@unclemays.com or (312) 972-2595.
        </p>
      </div>
    </div>
  );
}
