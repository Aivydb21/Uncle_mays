"use client";

import { useState } from "react";

// Layer 2 manual upload form for the Customer Feedback Program. Used to
// ingest interview notes (Source D), sales-call notes, and any feedback
// that arrives outside the digital funnel.
//
// Auth: token typed once per session, kept only in component state, sent
// in the API call so the server can validate against FEEDBACK_ADMIN_TOKEN.
// Re-prompts on reload (no localStorage — token is sensitive).

const SOURCES = [
  { value: "interview", label: "Founder interview" },
  { value: "manual-upload", label: "Manual upload (other)" },
  { value: "abandon-reply", label: "Email reply (abandon ask)" },
];

const CHANNELS = [
  { value: "interview", label: "Interview" },
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
  { value: "social", label: "Social" },
  { value: "web", label: "Web (rare)" },
];

export default function AdminFeedbackPage() {
  const [token, setToken] = useState("");
  const [tokenAuthed, setTokenAuthed] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [source, setSource] = useState("interview");
  const [channel, setChannel] = useState("interview");
  const [rawText, setRawText] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [productSlug, setProductSlug] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkToken = async () => {
    setTokenError(null);
    try {
      const res = await fetch(
        `/api/feedback?token=${encodeURIComponent(token)}`,
        { method: "GET" }
      );
      if (res.ok) {
        setTokenAuthed(true);
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setTokenError(data.error || `Auth failed (${res.status})`);
      }
    } catch {
      setTokenError("Network error checking token");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) {
      setError("Response text is required.");
      return;
    }
    setError(null);
    setFeedback(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Token is also passed in the body as a fallback, but the GET
          // pre-check is what gates access to this page in practice.
          "X-Admin-Token": token,
        },
        body: JSON.stringify({
          source,
          channel,
          raw_text: rawText.trim(),
          customer_email: customerEmail.trim() || undefined,
          product_slug: productSlug.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || `Save failed (${res.status})`);
        return;
      }
      setFeedback("Saved. The row is now in Anthony's inbox under feedback-inbound.");
      setRawText("");
      setCustomerEmail("");
      setProductSlug("");
      setNotes("");
    } catch {
      setError("Network error saving response.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!tokenAuthed) {
    return (
      <main className="min-h-screen bg-muted/30 py-16">
        <div className="container max-w-md mx-auto px-4">
          <h1 className="text-xl font-bold mb-1">Feedback admin</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Manual upload for the Customer Feedback Program. Enter the
            FEEDBACK_ADMIN_TOKEN to continue.
          </p>
          <div className="rounded-2xl bg-background shadow-soft p-6 space-y-3">
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Admin token"
              className="w-full rounded-lg border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            {tokenError ? <p className="text-xs text-destructive">{tokenError}</p> : null}
            <button
              type="button"
              onClick={checkToken}
              disabled={!token.trim()}
              className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              Continue
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30 py-16">
      <div className="container max-w-2xl mx-auto px-4">
        <h1 className="text-xl font-bold mb-1">Upload feedback</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Captures into Anthony&apos;s inbox under <code>feedback-inbound</code>. Use
          this for interview notes, sales-call summaries, or any feedback collected
          outside the website funnel.
        </p>

        <form onSubmit={submit} className="rounded-2xl bg-background shadow-soft p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-sm">
              <span className="block font-medium mb-1">Source</span>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full rounded-lg border border-border bg-background p-2 text-sm"
              >
                {SOURCES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="block font-medium mb-1">Channel</span>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full rounded-lg border border-border bg-background p-2 text-sm"
              >
                {CHANNELS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="text-sm block">
            <span className="block font-medium mb-1">Response text *</span>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={6}
              maxLength={2000}
              placeholder="Paste interview notes or quote here…"
              className="w-full rounded-lg border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-sm">
              <span className="block font-medium mb-1">Customer email (optional)</span>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-background p-2 text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="block font-medium mb-1">Product slug (optional)</span>
              <input
                value={productSlug}
                onChange={(e) => setProductSlug(e.target.value)}
                placeholder="starter / family"
                className="w-full rounded-lg border border-border bg-background p-2 text-sm"
              />
            </label>
          </div>

          <label className="text-sm block">
            <span className="block font-medium mb-1">Notes (optional)</span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Context, who interviewed, anything we should remember"
              className="w-full rounded-lg border border-border bg-background p-2 text-sm"
            />
          </label>

          {error ? <p className="text-xs text-destructive">{error}</p> : null}
          {feedback ? <p className="text-xs text-primary">{feedback}</p> : null}

          <button
            type="submit"
            disabled={submitting || !rawText.trim()}
            className="rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </form>
      </div>
    </main>
  );
}
