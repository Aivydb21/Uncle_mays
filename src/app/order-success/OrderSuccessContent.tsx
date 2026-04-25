"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, Truck, Share2, Mail } from "lucide-react";

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    fbq: (...args: unknown[]) => void;
    gtag: (...args: unknown[]) => void;
  }
}

interface TrackingItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
}

/**
 * Fire GA4/dataLayer purchase events. dataLayer.push always succeeds (GTM
 * drains the queue once loaded). gtag direct-call retries for up to 8s to
 * survive slow gtag boot after 3DS redirects and mobile networks.
 */
function trackGA(transactionId: string, value: number, items: TrackingItem[]) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "purchase",
    ecommerce: { transaction_id: transactionId, value, currency: "USD", items },
  });

  const gAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const gAdsLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;

  let attempts = 0;
  const maxAttempts = 8; // 8 retries * 1s = 8s total, covers slow mobile gtag boot
  const tryFire = () => {
    if (typeof window.gtag === "function") {
      window.gtag("event", "purchase", { transaction_id: transactionId, value, currency: "USD", items });
      if (gAdsId && gAdsLabel) {
        window.gtag("event", "conversion", {
          send_to: `${gAdsId}/${gAdsLabel}`,
          value,
          currency: "USD",
          transaction_id: transactionId,
        });
      }
      return;
    }
    if (++attempts < maxAttempts) {
      setTimeout(tryFire, 1000);
    }
  };
  tryFire();
}

/**
 * Fire Meta Pixel Purchase event. Returns true if fbq was available and the
 * event fired. Returns false if fbq hasn't loaded yet — caller should retry.
 */
function fireMetaPurchase(value: number, product: string): boolean {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return false;
  window.fbq("track", "Purchase", {
    value,
    currency: "USD",
    content_type: "product",
    content_ids: [product],
  });
  return true;
}

function trackPurchase(transactionId: string, value: number, product?: string, items?: TrackingItem[]) {
  if (typeof window === "undefined") return;

  const resolvedProduct = product || "produce_box";
  const resolvedItems: TrackingItem[] = items && items.length > 0
    ? items
    : [{ item_id: resolvedProduct, item_name: resolvedProduct, price: value, quantity: 1 }];

  trackGA(transactionId, value, resolvedItems);

  // Fire Meta Pixel with retry — order-success is often reached via 3DS
  // redirect where fbq loads async. Try up to 8 times at 1s intervals.
  let attempts = 0;
  const maxAttempts = 8;
  const tryMeta = () => {
    if (fireMetaPurchase(value, resolvedProduct)) return;
    if (++attempts < maxAttempts) setTimeout(tryMeta, 1000);
  };
  tryMeta();
}

export default function OrderSuccessContent() {
  const searchParams = useSearchParams();
  // Stripe Checkout Sessions flow: ?session_id=cs_xxx
  const sessionId = searchParams.get("session_id");
  // PaymentIntent flow (custom checkout): ?pi=pi_xxx&amount=35&product=starter
  const paymentIntentId = searchParams.get("pi");
  const amountParam = searchParams.get("amount");
  const productParam = searchParams.get("product") ?? undefined;
  // Subscription intent flow: ?subscription_id=sub_xxx&product=starter (fallback: ?sub=)
  const subscriptionId = searchParams.get("subscription_id") || searchParams.get("sub");
  const fired = useRef(false);
  const [isSubscription, setIsSubscription] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  // Weekly subscription amounts by product — must match PRODUCTS[slug].subPrice.
  const SUB_AMOUNT: Record<string, number> = {
    starter: 36,
    family: 63,
  };

  useEffect(() => {
    if (fired.current) return;

    // Subscription intent flow — amount derived from product slug
    if (subscriptionId) {
      fired.current = true;
      setIsSubscription(true);
      const value = productParam ? (SUB_AMOUNT[productParam] ?? 0) : 0;
      if (value > 0) {
        try { trackPurchase(subscriptionId, value, productParam); } catch { /* ignore */ }
      }
      return;
    }

    // PaymentIntent flow — data is available from URL params directly
    if (paymentIntentId && amountParam) {
      fired.current = true;
      const value = parseFloat(amountParam);
      if (!isNaN(value)) {
        try { trackPurchase(paymentIntentId, value, productParam); } catch { /* ignore */ }
      }
      return;
    }

    // Stripe Checkout Sessions flow — fetch order details from API
    if (sessionId) {
      fired.current = true;
      fetch(`/api/order-details?session_id=${sessionId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.error) return;
          try { trackPurchase(data.transactionId, data.value, undefined, data.items); } catch { /* ignore */ }
          if (data.mode === "subscription") setIsSubscription(true);
        })
        .catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, paymentIntentId, amountParam, productParam, subscriptionId]);

  const handleManageSubscription = async () => {
    if (!sessionId && !subscriptionId) return;
    setPortalLoading(true);
    try {
      const body = subscriptionId
        ? { subscription_id: subscriptionId }
        : { session_id: sessionId };
      const res = await fetch("/api/portal/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // ignore
    }
    setPortalLoading(false);
  };

  const ref = sessionId || paymentIntentId || subscriptionId;

  // Native share if available; otherwise fall back to a Twitter/X intent.
  const handleShare = async () => {
    const shareData = {
      title: "Uncle May's Produce",
      text: "Just ordered fresh produce delivered weekly across Chicago from Uncle May's. Use code FRESH10 for $10 off your first box.",
      url: "https://unclemays.com/get-started?utm_source=share&utm_medium=organic&utm_campaign=order_success",
    };
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share(shareData);
        return;
      }
    } catch {
      // User canceled or share failed — fall through to Twitter
    }
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer");
  };

  // Pre-filled mailto for the lightweight referral teaser.
  const referralBody = encodeURIComponent(
    `Hey,\n\nI just started getting weekly produce delivered from Uncle May's here in Chicago. Fresh greens, roots, and pantry staples — packed Tuesday, delivered Wednesday.\n\nUse code FRESH10 to get $10 off your first box: https://unclemays.com/get-started?utm_source=share&utm_medium=email&utm_campaign=referral\n\n— sent from a happy customer`
  );
  const referralSubject = encodeURIComponent("Try Uncle May's — $10 off your first box");
  const referralMailto = `mailto:?subject=${referralSubject}&body=${referralBody}`;

  return (
    <div className="min-h-screen bg-muted/20 px-4 py-12 md:py-16">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Confirmation header */}
        <div className="bg-background rounded-2xl shadow-soft p-7 md:p-9 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/15 mb-5">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Thank you for your order</h1>
          <p className="text-muted-foreground leading-relaxed">
            {isSubscription
              ? "Your subscription is active. We'll pack and deliver your first box this Wednesday."
              : "Your box is confirmed. We pack from what's freshest and deliver across Chicago on Wednesdays."}
          </p>
          {ref ? (
            <p className="mt-4 text-xs text-muted-foreground break-all">
              Reference: {ref}
            </p>
          ) : null}
        </div>

        {/* What happens next — three crisp steps */}
        <div className="bg-background rounded-2xl shadow-soft p-7 md:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
            What happens next
          </h2>
          <ol className="space-y-4">
            <li className="flex gap-4">
              <div className="shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Confirmation email on the way</p>
                <p className="text-sm text-foreground/70">
                  Check your inbox now for your order details and delivery window.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold">We pack Tuesday morning</p>
                <p className="text-sm text-foreground/70">
                  Seasonal greens, roots, and pantry staples, fresh that day.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Truck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Delivered Wednesday, 12-3pm</p>
                <p className="text-sm text-foreground/70">
                  Free Chicago delivery. We&apos;ll text you a tighter window the morning of.
                </p>
              </div>
            </li>
          </ol>
        </div>

        {/* Subscription management */}
        {isSubscription && (
          <div className="bg-background rounded-2xl shadow-soft p-6 md:p-7">
            <p className="text-sm text-foreground/80 mb-3">
              You&apos;re a subscriber now. Cancel, pause, or update billing any time.
            </p>
            <Button
              size="lg"
              className="rounded-xl w-full"
              onClick={handleManageSubscription}
              disabled={portalLoading || (!sessionId && !subscriptionId)}
            >
              {portalLoading ? "Loading…" : "Manage Subscription"}
            </Button>
          </div>
        )}

        {/* Referral teaser — lightweight precursor to a full referral program */}
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-7 md:p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Tell a friend, save them $10</h2>
          <p className="text-sm text-foreground/75 mb-5">
            They get $10 off their first box with code FRESH10. We get to feed another Chicago household. Everyone wins.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="rounded-xl">
              <a href={referralMailto}>
                <Mail className="mr-2 h-4 w-4" />
                Email a friend
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl"
              onClick={handleShare}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center">
          <Button asChild size="lg" variant="ghost" className="rounded-xl">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
