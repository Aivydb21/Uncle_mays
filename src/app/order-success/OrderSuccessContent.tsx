"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

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

function trackPurchase(transactionId: string, value: number, product?: string, items?: TrackingItem[]) {
  if (typeof window === "undefined") return;

  const resolvedItems: TrackingItem[] = items && items.length > 0
    ? items
    : [{ item_id: product || "produce_box", item_name: product || "Produce Box", price: value, quantity: 1 }];

  // Push to dataLayer first — GTM routes to GA4/Ads even before gtag loads
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "purchase",
    ecommerce: {
      transaction_id: transactionId,
      value: value,
      currency: "USD",
      items: resolvedItems,
    },
  });

  // Also direct gtag if already initialized
  if (typeof window.gtag === "function") {
    window.gtag("event", "purchase", {
      transaction_id: transactionId,
      value,
      currency: "USD",
      items: resolvedItems,
    });

    const gAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
    const gAdsLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
    if (gAdsId && gAdsLabel) {
      window.gtag("event", "conversion", {
        send_to: `${gAdsId}/${gAdsLabel}`,
        value,
        currency: "USD",
        transaction_id: transactionId,
      });
    }
  }

  // Meta pixel
  if (typeof window.fbq === "function") {
    window.fbq("track", "Purchase", { value, currency: "USD", content_type: "product" });
  }
}

export default function OrderSuccessContent() {
  const searchParams = useSearchParams();
  // Stripe Checkout Sessions flow: ?session_id=cs_xxx
  const sessionId = searchParams.get("session_id");
  // PaymentIntent flow (custom checkout): ?pi=pi_xxx&amount=35&product=starter
  const paymentIntentId = searchParams.get("pi");
  const amountParam = searchParams.get("amount");
  const productParam = searchParams.get("product") ?? undefined;
  const fired = useRef(false);
  const [isSubscription, setIsSubscription] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (fired.current) return;

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
  }, [sessionId, paymentIntentId, amountParam, productParam]);

  const handleManageSubscription = async () => {
    if (!sessionId) return;
    setPortalLoading(true);
    try {
      const res = await fetch("/api/portal/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
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

  const ref = sessionId || paymentIntentId;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-3xl font-bold">Thank you for your order</h1>
        <p className="text-muted-foreground leading-relaxed">
          Your produce box is confirmed. We pack from what&apos;s freshest and deliver across Chicago on{" "}
          <span className="font-semibold text-foreground">Wednesdays</span>. You&apos;ll get a confirmation email with your
          delivery window. Order by Tuesday night for the upcoming Wednesday route when possible.
        </p>
        {ref ? (
          <p className="text-xs text-muted-foreground break-all">Reference: {ref}</p>
        ) : null}
        {isSubscription && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              You&apos;re now a subscriber. You can cancel, pause, or update billing at any time.
            </p>
            <Button
              size="lg"
              className="rounded-xl w-full"
              onClick={handleManageSubscription}
              disabled={portalLoading}
            >
              {portalLoading ? "Loading…" : "Manage Subscription"}
            </Button>
          </div>
        )}
        <Button asChild size="lg" variant={isSubscription ? "outline" : "default"} className="rounded-xl">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
