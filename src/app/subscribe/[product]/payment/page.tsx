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

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    gtag: (...args: unknown[]) => void;
  }
}

// Load Stripe once outside component to avoid recreating on renders
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const VALUE_ANCHORS: Record<string, { serving: string; guarantee: string }> = {
  starter: {
    serving: "~8 servings of fresh, seasonal produce",
    guarantee: "Sourced to our standard. If it ever falls short, we make it right.",
  },
  family: {
    serving: "~14-18 servings: produce, eggs, and a whole chicken",
    guarantee: "Sourced to our standard. If it ever falls short, we make it right.",
  },
  community: {
    serving: "~20-24 servings: heirloom produce + your choice of protein",
    guarantee: "Sourced to our standard. If it ever falls short, we make it right.",
  },
};

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

// Inner form — must live inside <Elements>
function SubscriptionPaymentForm({
  checkout,
  subscriptionId,
  onSuccess,
}: {
  checkout: StoredSubCheckout;
  subscriptionId: string;
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

    const returnUrl = typeof window !== "undefined"
      ? `${window.location.origin}/order-success?subscription_id=${encodeURIComponent(subscriptionId)}&amount=${checkout.subPrice}&product=${encodeURIComponent(checkout.product)}&type=subscription`
      : `https://unclemays.com/order-success?subscription_id=${encodeURIComponent(subscriptionId)}&type=subscription`;

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: { return_url: returnUrl },
    });

    if (error) {
      setPaymentError(error.message ?? "Payment failed. Please try again.");
      setSubmitting(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      // Clean up localStorage
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem("unc-sub-checkout");
        }
      } catch {
        // Ignore storage errors
      }

      onSuccess();
      router.push(`/order-success?subscription_id=${encodeURIComponent(subscriptionId)}&amount=${checkout.subPrice}&product=${encodeURIComponent(checkout.product)}&type=subscription`);
    } else {
      setPaymentError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement className="mb-4" />

      {/* Value anchor */}
      {(() => {
        const anchor = VALUE_ANCHORS[checkout.product] ?? {
          serving: "~8 servings of fresh, seasonal produce",
          guarantee: "Sourced to our standard. If it ever falls short, we make it right.",
        };
        return (
          <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 px-3 py-3">
            <p className="text-sm font-medium text-primary/80 mb-1">{anchor.serving}</p>
            <p className="text-sm font-bold text-primary">{anchor.guarantee}</p>
          </div>
        );
      })()}

      {paymentError && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {paymentError}
        </div>
      )}

      {/* Cancel anytime badge — above CTA */}
      <div className="mb-3 rounded-lg bg-green-50 border border-green-200 px-4 py-2.5 flex items-center gap-2">
        <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-sm text-green-800 font-medium">Flexible — pause or cancel before your next delivery</span>
      </div>

      {/* FTC / Illinois ILCS 601 auto-renewal disclosure */}
      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
        By completing this purchase, you subscribe to weekly deliveries. You will be charged ${checkout.subPrice}/week on a recurring basis until you cancel. To avoid being charged for the next delivery, you must cancel at least 48 hours in advance. To cancel, email{" "}
        <a href="mailto:info@unclemays.com" className="underline underline-offset-2">info@unclemays.com</a>{" "}
        or manage your subscription at{" "}
        <a href="https://unclemays.com/manage-subscription" className="underline underline-offset-2">unclemays.com/manage-subscription</a>.
      </p>

      <button
        type="submit"
        disabled={!stripe || !elements || submitting}
        className="w-full bg-primary text-primary-foreground rounded-xl h-12 px-6 text-base font-semibold hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting
          ? "Processing…"
          : `Start my subscription — $${checkout.subPrice}/wk`}
      </button>

      {/* Trust signals */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm text-foreground/75">Love your first box or we&apos;ll make it right</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm text-foreground/75">${checkout.subPrice}/week · Pause or cancel anytime in your account</span>
        </div>
      </div>

      {/* Security badge */}
      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
        <svg
          className="w-4 h-4 text-muted-foreground"
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
        <span>Secured by Stripe · SSL encrypted</span>
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
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [intentError, setIntentError] = useState<string | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(true);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const createIntent = useCallback(
    async (data: StoredSubCheckout) => {
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

        // Generate one eventId shared by the browser pixel fire and the server
        // CAPI fire inside /api/checkout/subscribe-intent, so Meta deduplicates
        // the pair and only counts a single InitiateCheckout.
        const icEventId =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `ic-sub-${data.product}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        // Pull the validated promo code out of sessionStorage (set on the
        // summary page when ?promo= is in the URL). Server re-validates.
        let promo: string | undefined;
        try {
          const saved = sessionStorage.getItem("unc-promo");
          if (saved) promo = saved;
        } catch { /* ignore */ }

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
            eventId: icEventId,
            ...(promo ? { promo } : {}),
            ...utms,
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          setIntentError(json.error || "Could not initialize subscription. Please try again.");
          return;
        }
        setClientSecret(json.clientSecret);
        setSubscriptionId(json.subscriptionId);

        // Fire Meta Pixel InitiateCheckout — subscription intent created, payment form loading.
        // The eventID here matches the one sent to subscribe-intent above so Meta dedupes.
        try {
          if (typeof window !== "undefined") {
            const product = data.product;
            const value = data.subPrice;
            if (window.fbq) {
              window.fbq(
                "track",
                "InitiateCheckout",
                {
                  content_ids: [product],
                  content_type: "product",
                  value,
                  currency: "USD",
                  num_items: 1,
                },
                { eventID: icEventId }
              );
            }
            if (window.gtag) {
              window.gtag("event", "begin_checkout", {
                currency: "USD",
                value,
                items: [{ item_id: product, item_name: data.productName, price: value, quantity: 1 }],
              });
            }
          }
        } catch {
          // Never block checkout for tracking failures
        }
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
    let stored: StoredSubCheckout | null = null;
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("unc-sub-checkout");
        if (raw) stored = JSON.parse(raw) as StoredSubCheckout;
      }
    } catch {
      // Ignore parse errors
    }

    if (!stored || stored.product !== slug) {
      // Redirect back to delivery if no session found
      router.replace(`/subscribe/${slug}/delivery`);
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
        {/* Back link */}
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
          {/* Payment form */}
          <div className="md:col-span-2">
            <div className="rounded-2xl bg-background shadow-soft p-6 md:p-8">
              <h1
                className="text-xl font-bold mb-1"
                style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)" }}
              >
                Payment
              </h1>
              <p className="text-sm text-muted-foreground mb-6">
                Complete your subscription to get fresh produce delivered every Wednesday.
              </p>

              {clientSecret && subscriptionId && !paymentComplete ? (
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
                Subscription Summary
              </h2>

              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{checkout.productName}</span>
                <span className="font-bold text-primary">${checkout.subPrice}/wk</span>
              </div>

              {checkout.proteinChoices && checkout.proteinChoices.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    Protein{checkout.proteinChoices.length > 1 ? "s" : ""}:
                  </p>
                  <ul className="space-y-0.5">
                    {checkout.proteinChoices.map((p) => (
                      <li key={p} className="text-xs text-foreground/80">• {p.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border-t border-border pt-3 mb-3">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>Weekly Total</span>
                  <span className="text-primary">${checkout.subPrice}/wk</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Billed weekly · Cancel anytime</p>
              </div>

              {/* First-delivery guarantee */}
              <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 mb-3">
                <p className="text-xs text-green-800 font-medium">Love your first box or we&apos;ll make it right.</p>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
