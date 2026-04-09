"use client";

import { useCallback, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const PRODUCTS: Record<string, { name: string; price: string; description: string }> = {
  starter: {
    name: "Starter Box",
    price: "$35",
    description: "6 seasonal produce items (~12-15 lbs). Perfect for individuals or couples.",
  },
  family: {
    name: "Family Box",
    price: "$65",
    description: "9+ produce items, 1 dozen eggs, and 1 protein choice. Ideal for families of 3-5.",
  },
  community: {
    name: "Community Box",
    price: "$95",
    description: "10+ produce items, 2 dozen eggs, and 2 protein choices. For large families or sharing.",
  },
};

export default function CheckoutPage() {
  const params = useParams<{ product: string }>();
  const product = params.product;
  const info = PRODUCTS[product];
  const [error, setError] = useState<string | null>(null);

  if (!info) {
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
    <section className="py-16 bg-muted/30 min-h-screen">
      <div className="container px-6 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{info.name}</h1>
          <p className="text-muted-foreground text-lg">{info.description}</p>
          <p className="text-2xl font-bold text-primary mt-3">{info.price}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Delivered every Wednesday across Chicago
          </p>
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
          <div id="checkout" className="rounded-2xl overflow-hidden shadow-soft bg-card">
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
