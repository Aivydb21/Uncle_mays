"use client";

import { useEffect, useRef, useState } from "react";

// Source A of the Customer Feedback Program.
//
// Trigger thresholds calibrated against Microsoft Clarity 3-day dwell data
// (see notes/exit-survey-thresholds-2026-04-29.md). Median active engagement
// on /checkout/family was 19.5s, on /checkout/starter 20.7s. We fire at 18s
// dwell + 30% scroll, or on desktop exit-intent (mouse leaves through top of
// viewport) after 8s, or on mobile back-scroll heuristic.
//
// Fires once per session via sessionStorage. Skipped on payment / success.

interface Props {
  productSlug: string;
}

const STORAGE_KEY_PREFIX = "unc-exit-survey-shown-";
const DESKTOP_DWELL_MS = 18_000;
const DESKTOP_EXIT_INTENT_GUARD_MS = 8_000;
const MIN_SCROLL_DEPTH_DESKTOP = 0.3;
const MOBILE_DWELL_MS = 12_000;
const MIN_SCROLL_DEPTH_MOBILE = 0.4;
const MOBILE_SCROLLUP_PX = 200;
const AUTO_DISMISS_MS = 30_000;

function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 768px)").matches;
}

function maxScrollPct(): number {
  if (typeof window === "undefined") return 0;
  const scrolled = window.scrollY + window.innerHeight;
  const total = document.documentElement.scrollHeight;
  if (total <= 0) return 0;
  return Math.min(1, scrolled / total);
}

export function CheckoutExitSurvey({ productSlug }: Props) {
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const firedRef = useRef(false);
  const mountedAtRef = useRef<number>(Date.now());
  const maxScrollRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `${STORAGE_KEY_PREFIX}${productSlug}`;
    try {
      if (sessionStorage.getItem(key) === "1") {
        firedRef.current = true;
        return;
      }
    } catch {
      // ignore
    }

    const fire = () => {
      if (firedRef.current) return;
      firedRef.current = true;
      setOpen(true);
      try {
        sessionStorage.setItem(key, "1");
      } catch {
        // ignore
      }
    };

    const onScroll = () => {
      const pct = maxScrollPct();
      if (pct > maxScrollRef.current) maxScrollRef.current = pct;
    };

    const onMouseOut = (e: MouseEvent) => {
      // Desktop exit-intent: mouse left through the top of the viewport.
      if (e.clientY > 0) return;
      const elapsed = Date.now() - mountedAtRef.current;
      if (elapsed < DESKTOP_EXIT_INTENT_GUARD_MS) return;
      if (maxScrollRef.current < MIN_SCROLL_DEPTH_DESKTOP) return;
      fire();
    };

    let lastScrollY = 0;
    let maxScrollY = 0;
    const onScrollMobile = () => {
      const y = window.scrollY;
      if (y > maxScrollY) maxScrollY = y;
      const elapsed = Date.now() - mountedAtRef.current;
      const scrolledUp = maxScrollY - y;
      if (
        elapsed >= MOBILE_DWELL_MS &&
        maxScrollRef.current >= MIN_SCROLL_DEPTH_MOBILE &&
        scrolledUp >= MOBILE_SCROLLUP_PX
      ) {
        fire();
      }
      lastScrollY = y;
    };

    // Time-based fallback (desktop & mobile): fires at full dwell threshold.
    const dwellTimer = setTimeout(
      () => {
        if (firedRef.current) return;
        if (maxScrollRef.current < MIN_SCROLL_DEPTH_DESKTOP) return;
        fire();
      },
      isMobile() ? MOBILE_DWELL_MS + 8_000 : DESKTOP_DWELL_MS
    );

    window.addEventListener("scroll", onScroll, { passive: true });
    if (isMobile()) {
      window.addEventListener("scroll", onScrollMobile, { passive: true });
    } else {
      document.addEventListener("mouseout", onMouseOut);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScrollMobile);
      document.removeEventListener("mouseout", onMouseOut);
      clearTimeout(dwellTimer);
      void lastScrollY;
    };
  }, [productSlug]);

  // Auto-dismiss after AUTO_DISMISS_MS so we never trap the user.
  useEffect(() => {
    if (!open || submitted) return;
    const t = setTimeout(() => setOpen(false), AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [open, submitted]);

  if (!open) return null;

  const close = () => setOpen(false);

  const submit = async () => {
    const trimmed = response.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "checkout-exit",
          channel: "web",
          raw_text: trimmed,
          question: "What would have made you order today?",
          customer_email: email.trim() || undefined,
          product_slug: productSlug,
          session_id:
            typeof window !== "undefined" ? window.sessionStorage.getItem("unc-session-id") || undefined : undefined,
        }),
      });
      setSubmitted(true);
    } catch {
      // swallow — we don't want to scare a user who's already leaving.
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-survey-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={close}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-background shadow-2xl p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground p-2"
          aria-label="Close"
        >
          ×
        </button>

        {submitted ? (
          <div className="text-center py-2">
            <h2 id="exit-survey-title" className="text-lg font-semibold mb-2">
              Thank you.
            </h2>
            <p className="text-sm text-foreground/80">
              We read every reply personally. If you left an email, we&apos;ll be in touch.
            </p>
            <button
              type="button"
              onClick={close}
              className="mt-4 inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 id="exit-survey-title" className="text-lg font-semibold mb-1">
              One quick question.
            </h2>
            <p className="text-sm text-foreground/75 mb-4">
              Before you go — what would have made you order today? Anything we&apos;re missing,
              anything unclear, any item you wanted that wasn&apos;t there.
            </p>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="Just one sentence is plenty…"
              className="w-full rounded-lg border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              autoFocus
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (optional, only if you want a reply)"
              className="mt-3 w-full rounded-lg border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={close}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground"
              >
                Not now
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={submitting || !response.trim()}
                className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Send"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
