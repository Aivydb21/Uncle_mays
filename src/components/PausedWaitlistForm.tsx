"use client";

import { useState } from "react";
import { Check } from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function PausedWaitlistForm({ source }: { source: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setStatus("error");
      setError("Please enter a valid email.");
      return;
    }
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/paused-waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, source }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        setError(data?.error ?? "Something went wrong. Try again.");
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Something went wrong. Try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="inline-flex items-center gap-2 rounded-xl bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-900">
        <Check className="h-4 w-4" /> You&rsquo;re on the list.
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col items-stretch gap-2 sm:flex-row sm:max-w-md"
    >
      <label htmlFor="paused-waitlist-email" className="sr-only">
        Email address
      </label>
      <input
        id="paused-waitlist-email"
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
        className="flex-1 rounded-xl border border-amber-300 bg-white px-4 py-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center rounded-xl bg-amber-900 px-6 py-3 text-sm font-semibold text-amber-50 hover:bg-amber-900/90 disabled:opacity-60"
      >
        {status === "submitting" ? "Adding…" : "Notify me"}
      </button>
      {status === "error" && error && (
        <p className="sm:ml-2 text-sm text-destructive sm:self-center">
          {error}
        </p>
      )}
    </form>
  );
}
