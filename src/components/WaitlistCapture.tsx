"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

interface WaitlistCaptureProps {
  zip: string;
}

export function WaitlistCapture({ zip }: WaitlistCaptureProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;

    setSubmitting(true);
    try {
      await fetch("/api/capture-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          product: "waitlist",
          tags: ["waitlist", `zip-${zip}`],
        }),
      });
    } catch {
      // Fire-and-forget — never block the user
    }
    setSubmitted(true);
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <p className="text-xs text-primary mt-1">
        You're on the list! We'll email you when we deliver to {zip}.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-1.5">
      <Input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-8 text-xs flex-1"
        aria-label="Waitlist email"
      />
      <button
        type="submit"
        disabled={submitting}
        className="h-8 px-3 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-60 whitespace-nowrap"
      >
        {submitting ? "..." : "Join waitlist"}
      </button>
    </form>
  );
}
