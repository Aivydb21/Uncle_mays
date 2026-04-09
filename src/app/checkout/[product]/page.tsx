"use client";

import { useCallback, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import Link from "next/link";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const VALID_PRODUCTS = new Set(["starter", "family", "community"]);

export default function CheckoutPage() {
  const params = useParams<{ product: string }>();
  const product = params.product;
  const [error, setError] = useState<string | null>(null);

  if (!VALID_PRODUCTS.has(product)) {
    notFound();
  }

  const fetchClientSecret = useCallback(async () => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Something went wrong. Please try again.");
      throw new Error(data.error);
    }
    return data.clientSecret;
  }, [product]);

  return (
    <section className="py-10 md:py-16 bg-muted/30 min-h-screen">
      <div className="container px-4 max-w-xl mx-auto">
        <div className="mb-6">
          <Link
            href="/#boxes"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            &larr; Back to boxes
          </Link>
        </div>

        {error ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <a
              href={`/checkout/${product}`}
              className="text-primary underline underline-offset-4"
            >
              Try again
            </a>
          </div>
        ) : (
          <div id="checkout" className="rounded-2xl overflow-hidden shadow-soft">
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ fetchClientSecret }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        )}
      </div>
    </section>
  );
}
