"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Check } from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function HomeEmailCapture({
  source = "home_newsletter",
  headline = "Stay connected to what's growing",
  body = "Get first access to seasonal box drops, farmer spotlights, and what's coming out of the ground this week. Good food news from Chicago, nothing else.",
}: {
  source?: string;
  headline?: string;
  body?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setStatus("error");
      setError("Please enter a valid email address.");
      return;
    }

    setStatus("submitting");
    setError(null);

    try {
      const res = await fetch("/api/email-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, source }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        setError(data?.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="max-w-2xl mx-auto text-center"
    >
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-sm font-semibold text-primary mb-6">
        <Mail className="h-4 w-4" />
        Stay in the loop
      </div>
      <h2 className="text-3xl md:text-4xl font-bold mb-4">{headline}</h2>
      <p className="text-lg text-muted-foreground leading-relaxed mb-8">{body}</p>

      {status === "success" ? (
        <div className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-6 py-4 text-primary font-semibold">
          <Check className="h-5 w-5" />
          You&apos;re on the list. Check your inbox for a welcome from Uncle May&apos;s.
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row items-stretch gap-2 max-w-md mx-auto"
        >
          <label htmlFor="home-email" className="sr-only">
            Email address
          </label>
          <input
            id="home-email"
            type="email"
            required
            autoComplete="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            disabled={status === "submitting"}
            className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={status === "submitting"}
            className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground font-semibold px-6 py-3 text-base hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === "submitting" ? "Adding you…" : "Join"}
          </button>
        </form>
      )}

      {status === "error" && error && (
        <p className="mt-3 text-sm text-destructive">{error}</p>
      )}

      <p className="text-xs text-muted-foreground mt-3">Free to join. Unsubscribe anytime.</p>
    </motion.div>
  );
}
