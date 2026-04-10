"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    gtag: (...args: unknown[]) => void;
  }
}

function fireTracking(transactionId: string, value: number, currency: string) {
  if (typeof window === "undefined") return;

  if (window.gtag) {
    window.gtag("event", "purchase", { transaction_id: transactionId, value, currency });

    const gAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
    const gAdsLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
    if (gAdsId && gAdsLabel) {
      window.gtag("event", "conversion", {
        send_to: `${gAdsId}/${gAdsLabel}`,
        value,
        currency,
        transaction_id: transactionId,
      });
    }
  }

  if (window.fbq) {
    window.fbq("track", "Purchase", { value, currency });
  }
}

export default function OrderSuccessContent() {
  const searchParams = useSearchParams();
  // Stripe Checkout Sessions flow: ?session_id=cs_xxx
  const sessionId = searchParams.get("session_id");
  // PaymentIntent flow (custom checkout): ?pi=pi_xxx&amount=35
  const paymentIntentId = searchParams.get("pi");
  const amountParam = searchParams.get("amount");
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;

    // PaymentIntent flow — data is available from URL params directly
    if (paymentIntentId && amountParam) {
      fired.current = true;
      const value = parseFloat(amountParam);
      if (!isNaN(value)) {
        try { fireTracking(paymentIntentId, value, "USD"); } catch { /* ignore */ }
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
          try { fireTracking(data.transactionId, data.value, data.currency ?? "USD"); } catch { /* ignore */ }
        })
        .catch(() => {});
    }
  }, [sessionId, paymentIntentId, amountParam]);

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
        <Button asChild size="lg" className="rounded-xl">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
