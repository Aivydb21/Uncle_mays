"use client";

import { useState } from "react";

// Source B of the Customer Feedback Program. Captures top-of-funnel
// visitors who never reach checkout. Posts to /api/feedback with
// source=homepage-ask. Email field is optional but encouraged so we
// can follow up when we add what they asked for.

export function AskCapture() {
  const [response, setResponse] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = response.trim();
    if (!trimmed) {
      setError("Tell us what you'd want, even if it's one word.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "homepage-ask",
          channel: "web",
          raw_text: trimmed,
          question: "What would you want in your box?",
          customer_email: email.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Something went wrong. Try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container px-4 max-w-2xl mx-auto">
        <div className="rounded-2xl border border-border bg-background p-6 md:p-8 shadow-soft">
          <h2 className="text-xl md:text-2xl font-bold mb-2">
            Don&apos;t see what you&apos;d buy?
          </h2>
          <p className="text-sm text-foreground/75 mb-5">
            Tell us what you&apos;d want in your box. We restock weekly based on what people ask for,
            and we&apos;ll email you when it&apos;s in.
          </p>

          {submitted ? (
            <div className="rounded-lg bg-primary/10 border border-primary/30 px-4 py-3">
              <p className="text-sm text-primary font-semibold">Got it. Thank you.</p>
              <p className="text-xs text-foreground/75 mt-1">
                Anthony reads every reply. If you left an email we&apos;ll follow up when we add what you asked for.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="e.g., 'fresh herbs', 'eggs', 'collard greens', 'smaller box for one person'…"
                className="w-full rounded-lg border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email (optional)"
                className="w-full rounded-lg border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              {error ? <p className="text-xs text-destructive">{error}</p> : null}
              <button
                type="submit"
                disabled={submitting || !response.trim()}
                className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Send"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
