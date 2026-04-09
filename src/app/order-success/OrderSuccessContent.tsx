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

export default function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const fired = useRef(false);

  useEffect(() => {
    if (!sessionId || fired.current) return;
    fired.current = true;

    fetch(`/api/order-details?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return;
        const { transactionId, value, currency } = data;

        if (typeof window !== "undefined") {
          // GA4 purchase event
          if (window.gtag) {
            window.gtag("event", "purchase", {
              transaction_id: transactionId,
              value,
              currency,
            });
          }

          // Google Ads conversion event
          const gAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
          const gAdsLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
          if (window.gtag && gAdsId && gAdsLabel) {
            window.gtag("event", "conversion", {
              send_to: `${gAdsId}/${gAdsLabel}`,
              value,
              currency,
              transaction_id: transactionId,
            });
          }

          // Meta Pixel Purchase event
          if (window.fbq) {
            window.fbq("track", "Purchase", { value, currency });
          }
        }
      })
      .catch(() => {});
  }, [sessionId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-3xl font-bold">Thank you for your order</h1>
        <p className="text-muted-foreground leading-relaxed">
          Your produce box is confirmed. We pack from what&apos;s freshest and deliver across Chicago on{" "}
          <span className="font-semibold text-foreground">Wednesdays</span>. You&apos;ll get a confirmation email with your
          delivery window. Order by Tuesday night for the upcoming Wednesday route when possible.
        </p>
        {sessionId ? (
          <p className="text-xs text-muted-foreground break-all">Reference: {sessionId}</p>
        ) : null}
        <Button asChild size="lg" className="rounded-xl">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
