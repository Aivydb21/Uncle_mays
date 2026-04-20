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

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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

function SubscriptionPaymentForm({
  checkout,
  subscriptionId,
  intentType,
}: {
  checkout: StoredSubCheckout;
  subscriptionId: string;
  intentType: "payment" | "setup";
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setPaymentError(null);

    const returnUrl = `${window.location.origin}/order-success?sub=${encodeURIComponent(subscriptionId)}&product=${encodeURIComponent(checkout.product)}`;

    let result;
    if (intentType === "setup") {
      result = await stripe.confirmSetup({
        elements,
        confirmParams: { return_url: returnUrl },
        redirect: "if_required",
      });
    } else {
      result = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: returnUrl },
        redirect: "if_required",
      });
    }

    const { error } = result;

    if (error) {
      setPaymentError(error.message ?? "Payment failed. Please try again.");
      setSubmitting(false);
      return;
    }

    // Clear stored checkout data
    try {
      localStorage.removeItem("unc-sub-checkout");
    } catch {
      // ignore
    }

    router.push(
      `/order-success?sub=${encodeURIComponent(subscriptionId)}&product=${encodeURIComponent(checkout.product)}`
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement className="mb-4" />

      <div className="mb-6 p-3 rounded-lg bg-muted/30 border border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <span>🔄</span>
          <span className="font-medium text-foreground">Weekly Subscription</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Your ${checkout.subPrice}/wk box delivers 8–10 servings of fresh produce — just $3–5 per
          meal. Cancel anytime.
        </p>
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
        {submitting ? "Processing…" : `Start Subscription — $${checkout.subPrice}/wk`}
      </button>

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

export default function SubscribePaymentPage() {
  const params = useParams<{ product: string }>();
  const slug = params.product as ProductSlug;
  const router = useRouter();

  if (!PRODUCTS[slug]) {
    notFound();
  }

  const [checkout, setCheckout] = useState<StoredSubCheckout | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string>("");
  const [intentType, setIntentType] = useState<"payment" | "setup">("payment");
  const [intentError, setIntentError] = useState<string | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(true);

  const createSubscriptionIntent = useCallback(async (data: StoredSubCheckout) => {
    try {
      let utms: Record<string, string> = {};
      try {
        const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
        keys.forEach((k) => {
          const val = localStorage.getItem(`unc-${k}`);
          if (val) utms[k] = val;
        });
      } catch {
        /* ignore */
      }

      const res = await fetch("/api/checkout/subscribe-intent", {
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
          ...utms,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.clientSecret) {
        setIntentError(json.error || "Could not initialize subscription payment. Please try again.");
        return;
      }

      setClientSecret(json.clientSecret);
      setSubscriptionId(json.subscriptionId ?? "");
      setIntentType(json.intentType ?? "payment");
    } catch {
      setIntentError("Network error. Please check your connection and try again.");
    } finally {
      setLoadingIntent(false);
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
    createSubscriptionIntent(stored);
  }, [slug, router, createSubscriptionIntent]);

  if (!checkout || loadingIntent) {
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

  if (intentError) {
    return (
      <section className="py-10 md:py-16 bg-muted/30 min-h-screen">
        <div className="container px-4 max-w-2xl mx-auto">
          <StepIndicator current={3} />
          <div className="rounded-2xl bg-background shadow-soft p-8 text-center">
            <p className="text-destructive mb-4">{intentError}</p>
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

  return (
    <section className="py-10 md:py-16 bg-muted/30 min-h-screen">
      <div className="container px-4 max-w-3xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/subscribe/${slug}/delivery`}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            &larr; Back to delivery details
          </Link>
        </div>

        <StepIndicator current={3} />

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="rounded-2xl bg-background shadow-soft p-6 md:p-8">
              <h1
                className="text-xl font-bold mb-1"
                style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)" }}
              >
                Payment
              </h1>
              <p className="text-sm text-muted-foreground mb-4">
                Start your weekly subscription and get fresh produce delivered every Sunday.
              </p>

              <div className="mb-6 p-4 rounded-xl border border-primary/20 bg-primary/5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">⏰</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-primary mb-1">
                      Order by Thursday 11:59pm for delivery this Sunday
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Limited boxes available this week. Cancel anytime — no commitment required.
                    </p>
                  </div>
                </div>
              </div>

              {clientSecret && (
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
                  <SubscriptionPaymentForm
                    checkout={checkout}
                    subscriptionId={subscriptionId}
                    intentType={intentType}
                  />
                </Elements>
              )}
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="rounded-2xl bg-background shadow-soft p-5 sticky top-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Subscription Summary
              </h2>

              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{checkout.productName}</span>
                <span className="font-bold text-primary">${checkout.subPrice}/wk</span>
              </div>

              <div className="mb-2">
                <span className="text-xs text-green-700 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                  10% off vs one-time
                </span>
              </div>

              {checkout.proteinChoices && checkout.proteinChoices.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    Protein{checkout.proteinChoices.length > 1 ? "s" : ""}:
                  </p>
                  <ul className="space-y-0.5">
                    {checkout.proteinChoices.map((p) => (
                      <li key={p} className="text-xs text-foreground/80">
                        • {p.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border-t border-border pt-3 mb-3">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>Weekly Total</span>
                  <span className="text-primary">${checkout.subPrice}/wk</span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1 mb-4">
                <p className="font-medium text-foreground/80">
                  {checkout.firstName} {checkout.lastName}
                </p>
                <p>{checkout.email}</p>
                {checkout.address && (
                  <p>
                    {checkout.address.street}
                    {checkout.address.apt ? ` ${checkout.address.apt}` : ""},{" "}
                    {checkout.address.city}, {checkout.address.state} {checkout.address.zip}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-border space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Delivered every Sunday</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Cancel anytime</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>💡</span>
                  <span>Just $3–5 per meal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
