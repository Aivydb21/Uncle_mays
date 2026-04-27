"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Spring Box",
    description: "For 1 to 2 people",
    subPrice: "$36",
    subFrequency: "/wk",
    bullets: [
      "Salad mix, carrots, sweet potatoes, potatoes, broccoli, black beans",
      "Sourced from our Black farmer partners",
      "Delivered fresh every Wednesday",
    ],
    slug: "starter",
  },
  {
    name: "Full Harvest Box",
    description: "For 3 to 4 people",
    subPrice: "$63",
    subFrequency: "/wk",
    bullets: [
      "Everything in the Spring Box, plus pea shoots, radishes, your choice of bean, and chicken thighs",
      "Add an extra protein at checkout for $12",
      "Delivered fresh every Wednesday",
    ],
    popular: true,
    slug: "family",
  },
];

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
    <div className="min-h-screen px-6 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3">Manage Your Subscription</h1>
          <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
            Upgrade, downgrade, pause, or cancel — all from the Stripe portal. Enter your email to get started.
          </p>
        </div>

        {/* Plan overview */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {plans.map((plan) => (
            <div
              key={plan.slug}
              className={`bg-card rounded-2xl p-5 flex flex-col relative ${
                plan.popular ? "border-2 border-secondary shadow-medium" : "border border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-white px-4 py-1 rounded-full text-xs font-semibold">
                  Most Popular
                </div>
              )}
              <div className="mb-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{plan.description}</span>
              </div>
              <h3 className="text-lg font-bold mb-3">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-primary">{plan.subPrice}</span>
                <span className="text-muted-foreground text-sm">{plan.subFrequency}</span>
              </div>
              <ul className="space-y-2 flex-grow">
                {plan.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/80">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Email form */}
        <div className="max-w-md mx-auto text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter the email you used at checkout to access your subscription portal.
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
          {error && !sent && (
            <p className="text-sm text-destructive">{error}</p>
          )}
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
    </div>
  );
}
