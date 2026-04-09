"use client";

import { useCallback, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    gtag: (...args: unknown[]) => void;
  }
}
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
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!VALID_PRODUCTS.has(product)) {
    notFound();
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError(null);

    // Save lead to Mailchimp — fire and forget, never block checkout
    fetch("/api/capture-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: trimmed, product }),
    }).catch(() => {});

    // Fire InitiateCheckout tracking events
    if (typeof window !== "undefined") {
      if (window.fbq) window.fbq("track", "InitiateCheckout");
      if (window.gtag) window.gtag("event", "begin_checkout");
    }

    setEmailSubmitted(true);
  };

  const fetchClientSecret = useCallback(async () => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product, email: email.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Something went wrong. Please try again.");
      throw new Error(data.error);
    }
    return data.clientSecret;
  }, [product, email]);

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
        ) : !emailSubmitted ? (
          <div className="rounded-2xl overflow-hidden shadow-soft bg-background p-8">
            <h2 className="text-xl font-semibold mb-2">Enter your email</h2>
            <p className="text-muted-foreground text-sm mb-6">
              We&apos;ll send your order confirmation here.
            </p>
            <form onSubmit={handleEmailSubmit} noValidate>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-2"
              />
              {emailError && (
                <p className="text-destructive text-xs mb-3">{emailError}</p>
              )}
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground rounded-lg px-4 py-3 text-sm font-medium mt-2 hover:bg-primary/90 transition-colors"
              >
                Continue to payment
              </button>
            </form>
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
