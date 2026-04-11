"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { PRODUCTS, type ProductSlug } from "@/lib/products";

function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const steps = ["Subscription Summary", "Your Details", "Payment"];
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((label, i) => {
        const step = i + 1;
        const filled = step <= current;
        return (
          <div key={step} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  filled
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step}
              </div>
              <span
                className={`text-sm hidden sm:inline ${
                  filled ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-px flex-1 min-w-[24px] ${
                  step < current ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface StoredSubCheckout {
  product: ProductSlug;
  productName: string;
  subPrice: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address: {
    street: string;
    apt?: string;
    city: string;
    state: string;
    zip: string;
  };
  deliveryNotes?: string;
  proteinChoices?: string[];
}

export default function SubscribePaymentPage() {
  const params = useParams<{ product: string }>();
  const slug = params.product as ProductSlug;
  const router = useRouter();

  if (!PRODUCTS[slug]) {
    notFound();
  }

  const [checkout, setCheckout] = useState<StoredSubCheckout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const startSubscription = useCallback(async (data: StoredSubCheckout) => {
    setRedirecting(true);
    try {
      const res = await fetch("/api/checkout/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: data.product,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          address: data.address,
          deliveryNotes: data.deliveryNotes,
          proteinChoices: data.proteinChoices,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.url) {
        setError(json.error || "Could not start your subscription. Please try again.");
        setRedirecting(false);
        return;
      }

      // Clear stored checkout data before redirecting
      try {
        localStorage.removeItem("unc-sub-checkout");
      } catch {
        // ignore
      }

      window.location.href = json.url;
    } catch {
      setError("Network error. Please check your connection and try again.");
      setRedirecting(false);
    }
  }, []);

  useEffect(() => {
    let stored: StoredSubCheckout | null = null;
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("unc-sub-checkout");
        if (raw) stored = JSON.parse(raw) as StoredSubCheckout;
      }
    } catch {
      // ignore
    }

    if (!stored || stored.product !== slug) {
      router.replace(`/subscribe/${slug}/delivery`);
      return;
    }

    setCheckout(stored);
    startSubscription(stored);
  }, [slug, router, startSubscription]);

  if (!checkout || (redirecting && !error)) {
    return (
      <section className="py-10 md:py-16 bg-muted/30 min-h-screen">
        <div className="container px-4 max-w-2xl mx-auto">
          <StepIndicator current={3} />
          <div className="rounded-2xl bg-background shadow-soft p-8 flex flex-col items-center justify-center min-h-[300px] gap-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground text-sm">Setting up your subscription…</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-10 md:py-16 bg-muted/30 min-h-screen">
        <div className="container px-4 max-w-2xl mx-auto">
          <StepIndicator current={3} />
          <div className="rounded-2xl bg-background shadow-soft p-8 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Link
              href={`/subscribe/${slug}/delivery`}
              className="text-primary underline underline-offset-4 text-sm"
            >
              &larr; Go back and try again
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return null;
}
