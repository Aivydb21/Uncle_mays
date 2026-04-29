"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUTMParams } from "@/lib/utm";

// Source E of the Customer Feedback Program. Two-question landing form for
// FB/IG follower outreach. On submit, posts to /api/feedback with
// source=social-ask and reveals the FRESH35 promo as the carrot. Distinct
// from AskCapture (homepage variant, no promo, single question).

const Q1 = "What would you want in your produce box?";
const Q2 = "What would make you buy?";

export function AskForm() {
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Capture utm/fbclid from sessionStorage (already populated globally by
  // <UTMCapture/> in the root layout) so the feedback row preserves the
  // FB-vs-IG split.
  const [utm, setUtm] = useState<Record<string, string>>({});
  useEffect(() => {
    const u = getUTMParams();
    const flat: Record<string, string> = {};
    for (const [k, v] of Object.entries(u)) {
      if (v) flat[k] = String(v);
    }
    setUtm(flat);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const a1 = q1.trim();
    const a2 = q2.trim();
    if (!a1 && !a2) {
      setError("Answer at least one question so we know what to send you.");
      return;
    }
    setError(null);
    setSubmitting(true);

    const raw_text = [
      a1 ? `Q1 — ${Q1}\n${a1}` : null,
      a2 ? `Q2 — ${Q2}\n${a2}` : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    const notesParts: string[] = [];
    if (utm.utm_source) notesParts.push(`utm_source=${utm.utm_source}`);
    if (utm.utm_medium) notesParts.push(`utm_medium=${utm.utm_medium}`);
    if (utm.utm_campaign) notesParts.push(`utm_campaign=${utm.utm_campaign}`);
    if (utm.fbclid) notesParts.push(`fbclid=${utm.fbclid}`);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "social-ask",
          channel: "social",
          raw_text,
          question: `${Q1} | ${Q2}`,
          customer_email: email.trim() || undefined,
          structured_answers: { q1: a1, q2: a2 },
          notes: notesParts.join("; ") || undefined,
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

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText("FRESH35");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 md:p-8 shadow-soft">
        <h2 className="text-xl md:text-2xl font-bold mb-2">Got it. Thank you.</h2>
        <p className="text-sm text-foreground/75 mb-5">
          Anthony reads every reply personally. Here&apos;s 35% off your first box as a thank you.
        </p>

        <div className="rounded-lg border border-primary/40 bg-background p-4 mb-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
            Your code
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-2xl font-bold tracking-wider text-primary">FRESH35</span>
            <button
              type="button"
              onClick={copyCode}
              className="text-xs font-semibold rounded-md border border-border px-3 py-1.5 hover:bg-muted"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            35% off your first box. Auto-applies at checkout.
          </p>
        </div>

        <Link
          href="/?promo=FRESH35#boxes"
          onClick={() => {
            // Pre-stash the promo so it carries to whichever box the visitor
            // taps on the homepage. The /checkout and /subscribe routes both
            // read sessionStorage["unc-promo"] on mount.
            try {
              sessionStorage.setItem("unc-promo", "FRESH35");
            } catch {
              // ignore
            }
          }}
          className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-primary/90"
        >
          Use it now
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-border bg-background p-6 md:p-8 shadow-soft space-y-5"
    >
      <div>
        <label className="block text-sm font-semibold mb-2">{Q1}</label>
        <textarea
          value={q1}
          onChange={(e) => setQ1(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="e.g., 'more salad mix', 'smaller box for one person', 'add fresh herbs'…"
          className="w-full rounded-lg border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">{Q2}</label>
        <textarea
          value={q2}
          onChange={(e) => setQ2(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="e.g., 'lower price', 'pickup option', 'monthly instead of weekly'…"
          className="w-full rounded-lg border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">
          Email <span className="font-normal text-muted-foreground">(optional, so we can follow up)</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting || (!q1.trim() && !q2.trim())}
        className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Send and get my 35% off"}
      </button>
    </form>
  );
}
