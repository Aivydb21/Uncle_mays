"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Subscriptions are paused for new customers (cart launch 2026-05-01).
// This page only matters for existing subscribers who need to manage,
// pause, or cancel their billing via the Stripe customer portal.

export default function ManageSubscriptionContent() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.error) {
        setError(data.error);
      }
    } catch {
      setError("Something went wrong. Please try again or email info@unclemays.com.");
    }
    setSent(true);
    setLoading(false);
  };

  if (sent && error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-md text-center space-y-6">
          <h1 className="text-2xl font-bold">No active subscription found</h1>
          <p className="text-muted-foreground leading-relaxed">
            We couldn&apos;t find an active subscription for that email. We&rsquo;re
            no longer accepting new subscriptions; you can still place a one-time
            order from the catalog.
          </p>
          <div className="flex flex-col gap-3">
            <Button asChild className="rounded-xl">
              <Link href="/shop">Shop the catalog</Link>
            </Button>
            <a
              href="mailto:info@unclemays.com"
              className="text-primary underline font-medium text-sm"
            >
              Or email info@unclemays.com
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-16">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-3">Manage your subscription</h1>
          <p className="text-muted-foreground leading-relaxed">
            Pause, cancel, or update your billing — all from the Stripe portal.
            Enter the email you subscribed with.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 mb-6 text-sm text-amber-900">
          New subscriptions are paused. This page is for existing subscribers.
          To place a one-time order,{" "}
          <Link href="/shop" className="underline font-semibold">
            browse the catalog →
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button
            type="submit"
            size="lg"
            className="rounded-xl w-full"
            disabled={loading}
          >
            {loading ? "Looking up…" : "Go to Subscription Portal"}
          </Button>
        </form>
        {error && !sent && (
          <p className="text-sm text-destructive mt-3 text-center">{error}</p>
        )}
        <div className="text-center mt-6 space-y-3">
          <p className="text-xs text-muted-foreground">
            Questions? Email{" "}
            <a href="mailto:info@unclemays.com" className="underline">
              info@unclemays.com
            </a>{" "}
            or call (312) 972-2595
          </p>
          <Button asChild variant="ghost" className="rounded-xl">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
