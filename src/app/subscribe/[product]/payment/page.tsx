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
import { ACTIVE_PROMOS, normalizePromo } from "@/lib/promo";

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    gtag: (...args: unknown[]) => void;
  }
}

// Load Stripe once outside component to avoid recreating on renders
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
  beanChoice?: string;
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
      <PaymentElement
        className="mb-6"
        options={{ wallets: { applePay: "auto", googlePay: "auto" } }}
      />

      {paymentError && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {paymentError}
        </div>
      )}

      {/* Cancellation proof block — placed above the CTA where the
          subscription anxiety peaks. Concrete steps + visible URL beats
          generic "cancel anytime" copy: customer feedback (April 2026) was
          that vague reassurances trigger more skepticism, not less, because
          subscribers have been burned by services that say "easy to cancel"
          and then aren't. */}
      <div className="mb-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
        <div className="flex items-start gap-2 mb-2">
          <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm text-green-900 font-semibold">Cancel in 30 seconds, any time</span>
        </div>
        <ol className="text-xs text-green-800 ml-6 space-y-0.5 list-decimal">
          <li>
            Sign in at{" "}
            <a href="/manage-subscription" className="underline underline-offset-2 font-medium">
              unclemays.com/manage-subscription
            </a>
          </li>
          <li>Click <strong>Pause</strong> or <strong>Cancel</strong>. That&apos;s it.</li>
        </ol>
        <p className="text-xs text-green-800 mt-1.5 ml-6">
          No phone calls, no forms, no waiting period. Or text Anthony at (312) 972-2595.
        </p>
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
            beanChoice: data.beanChoice,
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

  // Resolve the promo (if any) so the payment-step summary can show the
  // discount line and the explicit "Today's charge" total.
  let appliedPromo: { code: string; amountOff: number; label: string } | null = null;
  try {
    if (typeof window !== "undefined") {
      const saved = normalizePromo(sessionStorage.getItem("unc-promo"));
      if (saved && ACTIVE_PROMOS[saved] && ACTIVE_PROMOS[saved].appliesTo.includes("subscription")) {
        const entry = ACTIVE_PROMOS[saved];
        appliedPromo = { code: saved, amountOff: entry.amountOffCents / 100, label: entry.label };
      }
    }
  } catch { /* ignore */ }
  const todayCharge = Math.max(0, checkout.subPrice - (appliedPromo?.amountOff ?? 0));

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

              {/* Line items. Show every line including $0 ones so users can
                  confirm there are no hidden costs. Bean choice and (on
                  Full Harvest) included chicken render as zero-charge sub
                  lines under the box. Each protein add-on is its own
                  $12 line. */}
              <div className="flex items-center justify-between text-sm mb-2">
                <span>{checkout.productName}</span>
                <span>${checkout.subPrice.toFixed(2)}</span>
              </div>

              {checkout.beanChoice && (
                <div className="flex items-center justify-between text-xs mb-2 pl-3 text-muted-foreground">
                  <span>{checkout.beanChoice.charAt(0).toUpperCase() + checkout.beanChoice.slice(1)} beans</span>
                  <span className="italic">no charge</span>
                </div>
              )}

              {checkout.product === "family" && (
                <div className="flex items-center justify-between text-xs mb-2 pl-3 text-muted-foreground">
                  <span>Pasture-raised chicken thighs</span>
                  <span className="italic">included</span>
                </div>
              )}

              {checkout.proteinChoices && checkout.proteinChoices.length > 0 && (() => {
                const PROTEIN_PRICE = 12;
                const PROTEIN_LABELS: Record<string, string> = {
                  "chicken": "Chicken thighs",
                  "beef-short-ribs": "Beef short ribs",
                  "lamb-chops": "Lamb chops",
                };
                return (
                  <>
                    {checkout.proteinChoices.map((p, idx) => {
                      const baseLabel = PROTEIN_LABELS[p] || p;
                      const labelPrefix = (checkout.product === "family" && p === "chicken") ? "Extra " : "";
                      const label = labelPrefix + baseLabel.toLowerCase();
                      return (
                        <div key={`${p}-${idx}`} className="flex items-center justify-between text-sm mb-2">
                          <span>{label.charAt(0).toUpperCase() + label.slice(1)}</span>
                          <span>+${PROTEIN_PRICE.toFixed(2)}/wk</span>
                        </div>
                      );
                    })}
                  </>
                );
              })()}

              {appliedPromo && (
                <div className="flex items-center justify-between text-sm mb-2 text-primary">
                  <span>Promo {appliedPromo.code}</span>
                  <span>−${appliedPromo.amountOff.toFixed(2)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm mb-2 text-muted-foreground">
                <span>Delivery</span>
                <span className="text-primary">FREE</span>
              </div>

              <div className="border-t border-border pt-3 mb-1">
                <div className="flex items-center justify-between text-base font-semibold">
                  <span>Today&apos;s charge</span>
                  <span className="text-primary">${todayCharge.toFixed(2)}</span>
                </div>
                {appliedPromo ? (
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>Then weekly</span>
                    <span>${checkout.subPrice.toFixed(2)}/wk</span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">Billed weekly · Cancel anytime</p>
                )}
              </div>
              <div className="mb-3" />

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
