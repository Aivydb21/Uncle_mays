"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
          <h1 className="text-2xl font-bold">Subscription not found</h1>
          <p className="text-muted-foreground leading-relaxed">
            We couldn&apos;t find an active subscription for that email. If you need help, please reach out directly:
          </p>
          <a
            href="mailto:info@unclemays.com"
            className="text-primary underline font-medium"
          >
            info@unclemays.com
          </a>
          <div>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-bold">Manage Your Subscription</h1>
        <p className="text-muted-foreground leading-relaxed">
          Enter the email address you used at checkout. You&apos;ll be taken directly to the Stripe portal where you can cancel, pause, or update your billing.
        </p>
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
        <p className="text-xs text-muted-foreground">
          Questions? Email{" "}
          <a href="mailto:info@unclemays.com" className="underline">
            info@unclemays.com
          </a>
        </p>
        <Button asChild variant="ghost" className="rounded-xl">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
