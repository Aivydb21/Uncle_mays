"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { PRODUCTS, type ProductSlug } from "@/lib/products";

// Load Stripe once outside component to avoid recreating on renders
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StoredCheckout {
  sessionId: string;
  product: ProductSlug;
  productName: string;
  price: number;
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
  additionalProteinChoices?: string[];
}

// Step indicator component
function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const steps = ["Order Summary", "Delivery", "Payment"];
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

// Inner form — must live inside <Elements>
function PaymentForm({
  checkout,
  onSuccess,
}: {
  checkout: StoredCheckout;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setPaymentError(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setPaymentError(error.message ?? "Payment failed. Please try again.");
      setSubmitting(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      // PATCH session as completed — fire and don't block redirect
      try {
        await fetch("/api/checkout/session", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: checkout.sessionId,
            paymentIntentId: paymentIntent.id,
            completedAt: new Date().toISOString(),
          }),
        });
      } catch {
        // Non-blocking — don't prevent redirect on API failure
      }

      // Clean up localStorage
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem("unc-checkout");
        }
      } catch {
        // Ignore storage errors
      }

      onSuccess();
      router.push(`/order-success?pi=${encodeURIComponent(paymentIntent.id)}&amount=${checkout.price}&product=${encodeURIComponent(checkout.product)}`);
    } else {
      setPaymentError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement className="mb-4" />

      {/* Value anchor — Whole Foods quality, Aldi price */}
      <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 overflow-hidden">
        <div className="px-3 py-1.5 bg-primary/10 border-b border-primary/15">
          <p className="text-xs font-semibold text-primary text-center">
            Better than Whole Foods. Cheaper than Aldi.
          </p>
        </div>
        <div className="flex divide-x divide-primary/10">
          <div className="flex-1 flex flex-col items-center gap-0.5 px-2 py-2 text-center">
            <span className="text-base">🥬</span>
            <span className="text-[10px] text-foreground/75 leading-tight">No chemical washes</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-0.5 px-2 py-2 text-center">
            <span className="text-base">🥩</span>
            <span className="text-[10px] text-foreground/75 leading-tight">No chemical baths</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-0.5 px-2 py-2 text-center">
            <span className="text-base">💰</span>
            <span className="text-[10px] text-foreground/75 leading-tight">Less than Aldi/serving</span>
          </div>
        </div>
      </div>

      {paymentError && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {paymentError}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || submitting}
        className="w-full bg-primary text-primary-foreground rounded-xl h-12 px-6 text-base font-semibold hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting
          ? "Processing…"
          : `Place Order — $${checkout.price}.00`}
      </button>

      {/* Enhanced security badges */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <svg
            className="w-4 h-4 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>Secure checkout powered by Stripe</span>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Your payment info is encrypted and secure. We never store your card details.
        </p>
      </div>
    </form>
  );
}

export default function PaymentPage() {
  const params = useParams<{ product: string }>();
  const slug = params.product as ProductSlug;
  const router = useRouter();

  if (!PRODUCTS[slug]) {
    notFound();
  }

  const [checkout, setCheckout] = useState<StoredCheckout | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [intentError, setIntentError] = useState<string | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(true);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const createIntent = useCallback(
    async (data: StoredCheckout) => {
      try {
        // Read any captured UTM params from localStorage
        let utms: Record<string, string> = {};
        try {
          const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
          keys.forEach((k) => {
            const val = localStorage.getItem(`unc-${k}`);
            if (val) utms[k] = val;
          });
        } catch { /* ignore */ }

        const res = await fetch("/api/checkout/intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product: data.product,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            address: data.address,
            proteins: data.proteinChoices,
            additionalProteins: data.additionalProteinChoices,
            ...utms,
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          setIntentError(json.error || "Could not initialize payment. Please try again.");
          return;
        }
        setClientSecret(json.clientSecret);
      } catch {
        setIntentError("Network error. Please check your connection and try again.");
      } finally {
        setLoadingIntent(false);
      }
    },
    []
  );

  useEffect(() => {
    // Load checkout state from localStorage
    let stored: StoredCheckout | null = null;
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("unc-checkout");
        if (raw) stored = JSON.parse(raw) as StoredCheckout;
      }
    } catch {
      // Ignore parse errors
    }

    if (!stored || stored.product !== slug) {
      // Redirect back to delivery if no session found
      router.replace(`/checkout/${slug}/delivery`);
      return;
    }

    setCheckout(stored);
    createIntent(stored);
  }, [slug, router, createIntent]);

  // While loading or redirecting
  if (!checkout || loadingIntent) {
    return (
      <section className="py-10 md:py-16 bg-muted/30 min-h-screen">
        <div className="container px-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-center min-h-[300px]">
            <p className="text-muted-foreground text-sm">Loading payment…</p>
          </div>
        </div>
      </section>
    );
  }

  if (intentError) {
    return (
      <section className="py-10 md:py-16 bg-muted/30 min-h-screen">
        <div className="container px-4 max-w-2xl mx-auto">
          <div className="rounded-2xl bg-background shadow-soft p-8 text-center">
            <p className="text-destructive mb-4">{intentError}</p>
            <Link
              href={`/checkout/${slug}/delivery`}
              className="text-primary underline underline-offset-4 text-sm"
            >
              &larr; Go back and try again
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 md:py-16 bg-muted/30 min-h-screen">
      <div className="container px-4 max-w-3xl mx-auto">
        {/* Back link */}
        <div className="mb-6">
          <Link
            href={`/checkout/${slug}/delivery`}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            &larr; Back to delivery details
          </Link>
        </div>

        <StepIndicator current={3} />

        <div className="grid md:grid-cols-3 gap-6">
          {/* Payment form */}
          <div className="md:col-span-2">
            <div className="rounded-2xl bg-background shadow-soft p-6 md:p-8">
              <h1
                className="text-xl font-bold mb-1"
                style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)" }}
              >
                Payment
              </h1>
              <p className="text-sm text-muted-foreground mb-4">
                Complete your order to get fresh produce delivered this Wednesday.
              </p>

              {clientSecret && !paymentComplete ? (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "stripe",
                      variables: {
                        colorPrimary: "#2d5016",
                        borderRadius: "8px",
                        fontFamily: "Work Sans, system-ui, sans-serif",
                      },
                    },
                  }}
                >
                  <PaymentForm
                    checkout={checkout}
                    onSuccess={() => setPaymentComplete(true)}
                  />
                </Elements>
              ) : paymentComplete ? (
                <div className="text-center py-8">
                  <p className="text-primary font-semibold">
                    Payment successful! Redirecting…
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          {/* Order summary sidebar */}
          <div className="md:col-span-1">
            <div className="rounded-2xl bg-background shadow-soft p-5 sticky top-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Order Summary
              </h2>

              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{checkout.productName}</span>
                <span className="font-bold text-primary">${checkout.price}</span>
              </div>

              {checkout.proteinChoices && checkout.proteinChoices.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    Included Protein:
                  </p>
                  <ul className="space-y-0.5">
                    {checkout.proteinChoices.map((p) => (
                      <li key={p} className="text-xs text-foreground/80">• {p.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</li>
                    ))}
                  </ul>
                </div>
              )}

              {checkout.additionalProteinChoices && checkout.additionalProteinChoices.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    Additional Protein{checkout.additionalProteinChoices.length > 1 ? "s" : ""}:
                  </p>
                  <ul className="space-y-0.5">
                    {checkout.additionalProteinChoices.map((p) => (
                      <li key={p} className="text-xs text-foreground/80">• {p.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border-t border-border pt-3 mb-3">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>Total</span>
                  <span className="text-primary">${checkout.price}.00</span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1 mb-4">
                <p className="font-medium text-foreground/80">{checkout.firstName} {checkout.lastName}</p>
                <p>{checkout.email}</p>
                {checkout.address && (
                  <p>
                    {checkout.address.street}
                    {checkout.address.apt ? ` ${checkout.address.apt}` : ""},{" "}
                    {checkout.address.city}, {checkout.address.state} {checkout.address.zip}
                  </p>
                )}
              </div>

              {/* Trust signals in sidebar */}
              <div className="pt-4 border-t border-border space-y-2 mb-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Delivered this Sunday</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>💰</span>
                  <span>Less than Aldi per serving</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>🥬</span>
                  <span>No chemical washes, cleaner than Whole Foods</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
