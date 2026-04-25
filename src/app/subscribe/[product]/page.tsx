"use client";

import { useParams, notFound } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { PRODUCTS, PROTEIN_OPTIONS, PROTEIN_TAGLINE, type ProductSlug, type ProteinId } from "@/lib/products";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Truck, Leaf } from "lucide-react";
import { ACTIVE_PROMOS, normalizePromo } from "@/lib/promo";

function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const steps = ["Subscription Summary", "Your Details", "Payment"];
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((label, i) => {
        const step = i + 1;
        const filled = step <= current;
        return (
          <div key={step} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  filled
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step}
              </div>
              <span
                className={`text-sm hidden sm:inline ${
                  filled ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-px flex-1 min-w-[24px] ${
                  step < current ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function SubscribeSummaryPage() {
  const params = useParams<{ product: string }>();
  const router = useRouter();
  const slug = params.product as ProductSlug;

  if (!PRODUCTS[slug]) {
    notFound();
  }

  const product = PRODUCTS[slug];

  // Proteins are optional paid add-ons, available on every box.
  const [selectedProteins, setSelectedProteins] = useState<ProteinId[]>([]);
  const [showProteinAddOns, setShowProteinAddOns] = useState(false);
  const [email, setEmail] = useState("");
  const [emailCaptured, setEmailCaptured] = useState(false);

  // Promo code: captured from ?promo= on mount (set by Meta ad URLs), persisted
  // to sessionStorage so it survives through delivery + payment steps, or
  // entered manually by the user via the promo input field.
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const fromUrl = new URLSearchParams(window.location.search).get("promo");
      const normalized = normalizePromo(fromUrl);
      if (normalized && ACTIVE_PROMOS[normalized]) {
        sessionStorage.setItem("unc-promo", normalized);
        setPromoCode(normalized);
        return;
      }
      const saved = sessionStorage.getItem("unc-promo");
      const savedNorm = normalizePromo(saved);
      if (savedNorm && ACTIVE_PROMOS[savedNorm]) setPromoCode(savedNorm);
    } catch {
      // ignore
    }
  }, []);

  function applyPromoCode() {
    setPromoError("");
    const normalized = normalizePromo(promoInput);
    if (!normalized) return;
    const entry = ACTIVE_PROMOS[normalized];
    if (!entry || !entry.appliesTo.includes("subscription")) {
      setPromoError("Invalid promo code");
      return;
    }
    try { sessionStorage.setItem("unc-promo", normalized); } catch { /* ignore */ }
    setPromoCode(normalized);
    setPromoInput("");
  }
  const activePromo = promoCode ? ACTIVE_PROMOS[promoCode] : null;
  const promoDiscount = activePromo?.appliesTo.includes("subscription")
    ? activePromo.amountOffCents / 100
    : 0;

  // Fire Meta Pixel ViewContent on page load (client-side) AND server-side CAPI,
  // both carrying the same eventID so Meta deduplicates the pair to a single event.
  // AddToCart fires on the "Continue" button click (see below); InitiateCheckout
  // fires only at the payment step.
  useEffect(() => {
    const eventId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `view-${slug}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    fetch("/api/capi/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, contentName: product.name, value: product.subPrice, eventId }),
    }).catch(() => {
      // Never block checkout for CAPI failures
    });

    function fireViewContent() {
      const fbq = (window as Window & { fbq?: (...args: unknown[]) => void }).fbq;
      if (!fbq) return false;
      fbq(
        "track",
        "ViewContent",
        {
          content_name: product.name,
          content_ids: [slug],
          content_type: "product",
          value: product.subPrice,
          currency: "USD",
        },
        { eventID: eventId }
      );
      return true;
    }

    if (!fireViewContent()) {
      const timer = setTimeout(fireViewContent, 2000);
      return () => clearTimeout(timer);
    }
  }, [slug, product.name, product.subPrice]);

  // Restore any prior email from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(`unc-email-${slug}`);
      if (saved) {
        setEmail(saved);
        setEmailCaptured(true);
      }
    } catch {
      // ignore
    }
  }, [slug]);

  function handleEmailBlur() {
    const trimmed = email.trim();
    if (trimmed && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      try {
        sessionStorage.setItem(`unc-email-${slug}`, trimmed);
      } catch {
        // ignore
      }
      if (!emailCaptured) {
        setEmailCaptured(true);
        fetch("/api/capture-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmed, product: slug }),
        }).catch(() => {
          // Never block checkout for email capture
        });
      }
    }
  }

  // Restore a prior protein selection if the user came back via browser-back.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(`unc-sub-proteins-${slug}`);
      if (saved) {
        const parsed = JSON.parse(saved) as ProteinId[];
        if (parsed.length > 0) {
          setSelectedProteins(parsed);
          setShowProteinAddOns(true);
        }
      }
    } catch {
      // ignore
    }
  }, [slug]);

  // Multi-select: checkbox behavior for optional add-ons.
  function toggleProtein(id: ProteinId) {
    setSelectedProteins((prev) => {
      const next = prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id];
      try {
        sessionStorage.setItem(`unc-sub-proteins-${slug}`, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  const proteinCost = selectedProteins.reduce((sum, id) => {
    const opt = PROTEIN_OPTIONS.find((o) => o.id === id);
    return sum + (opt?.price ?? 0);
  }, 0);

  return (
    <section className="py-10 md:py-16 bg-muted/30 min-h-screen">
      <div className="container px-4 max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/#boxes"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            &larr; Back to boxes
          </Link>
        </div>

        <StepIndicator current={1} />

        {/* Promo banner — reinforces the ad-to-landing-page promise
            immediately, so users see the discount they were promised without
            scrolling. */}
        {activePromo && promoDiscount > 0 ? (
          <div className="mb-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Promo {promoCode} applied
            </p>
            <p className="text-sm font-bold text-primary mt-0.5">
              {activePromo.label}: first box ${Math.max(0, product.subPrice - promoDiscount).toFixed(2)} (then ${product.subPrice}/wk)
            </p>
          </div>
        ) : null}

        <div className="rounded-2xl overflow-hidden shadow-soft bg-background">
          <div className="relative">
            <img
              src="/images/produce-box.jpg"
              alt={`${product.name} — fresh seasonal produce`}
              className="w-full h-36 md:h-56 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <div className="absolute bottom-4 left-5 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                ${product.subPrice}/wk — Subscribe &amp; Save
              </span>
              <span className="bg-muted/80 text-foreground text-xs px-2 py-1 rounded-full line-through">
                ${product.price} one-time
              </span>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)" }}>
                  {product.name}
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Delivered fresh every Wednesday
                </p>
              </div>
              <div className="text-right shrink-0">
                {promoDiscount > 0 ? (
                  <>
                    <div className="text-sm line-through text-muted-foreground">${product.subPrice}</div>
                    <span className="text-3xl font-bold text-primary">${Math.max(0, product.subPrice - promoDiscount).toFixed(2)}</span>
                    <div className="text-xs text-primary font-medium">first box</div>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-primary">${product.subPrice}</span>
                    <span className="text-muted-foreground text-sm">/wk</span>
                  </>
                )}
              </div>
            </div>

            {/* Savings callout */}
            <div className="mb-6 flex items-center gap-2 text-sm text-primary font-medium bg-primary/5 px-3 py-2 rounded-lg border border-primary/20">
              <span>✓</span>
              <span>You save ${(product.price - product.subPrice).toFixed(2)} per delivery vs. one-time pricing (10% off)</span>
            </div>

            {/* Cutoff deadline */}
            <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm">
              <p className="font-semibold text-amber-800">
                Order by Sunday 11:59 PM CT for Wednesday delivery
              </p>
              <p className="text-amber-700 text-xs mt-1">
                100% fresh or refunded.
              </p>
            </div>

            {/* What's in the box */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                What&apos;s in your box each week
              </h2>
              <ul className="space-y-2">
                {product.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Optional protein add-on — single collapsed accordion. */}
            <div className="mb-6 rounded-xl border border-border bg-muted/30 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowProteinAddOns((v) => !v)}
                className="w-full flex items-center justify-between gap-3 p-4 text-left"
                aria-expanded={showProteinAddOns}
              >
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Add a protein <span className="text-muted-foreground/70 normal-case font-normal">($15/wk each)</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedProteins.length > 0
                      ? `${selectedProteins.length} added (+$${proteinCost}/wk)`
                      : "Pasture-raised, no antibiotics. Slaughtered fresh."}
                  </p>
                </div>
                <span className={`text-xl text-muted-foreground transition-transform ${showProteinAddOns ? "rotate-45" : ""}`}>+</span>
              </button>
              {showProteinAddOns ? (
                <div className="px-4 pb-4 space-y-2">
                  <p className="text-xs text-foreground/70 leading-relaxed pb-1">
                    {PROTEIN_TAGLINE}
                  </p>
                  {PROTEIN_OPTIONS.map((opt) => {
                    const selected = selectedProteins.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleProtein(opt.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium text-left transition-all ${
                          selected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-primary/5"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center ${
                            selected ? "border-primary bg-primary" : "border-muted-foreground/40"
                          }`}
                        >
                          {selected && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <span className="flex-1">{opt.label}</span>
                        <span className="text-muted-foreground font-normal">+${opt.price}/wk</span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>

            {/* Trust signals */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 py-4 border-y border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span>Cancel anytime, no fees</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="h-4 w-4 text-primary shrink-0" />
                <span>Free delivery, every Wednesday</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Leaf className="h-4 w-4 text-primary shrink-0" />
                <span>Locally sourced, Black-owned farms</span>
              </div>
            </div>

            {/* Email capture — earliest possible point for abandoned cart recovery */}
            <div className="mb-6 p-4 rounded-xl border border-border bg-muted/30">
              <Label htmlFor="email" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
                Your Email
              </Label>
              <p className="text-xs text-muted-foreground mb-3">
                We&apos;ll send your subscription confirmation and delivery updates here.
              </p>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleEmailBlur}
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>

            {/* Promo code input */}
            {!promoCode ? (
              <div className="mb-6">
                <Label htmlFor="promo" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
                  Promo Code
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="promo"
                    type="text"
                    value={promoInput}
                    onChange={(e) => { setPromoInput(e.target.value); setPromoError(""); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyPromoCode(); } }}
                    placeholder="e.g. FRESH10"
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={applyPromoCode}
                    className="px-4 py-2 rounded-lg border border-primary text-primary text-sm font-semibold hover:bg-primary/10 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="text-xs text-red-500 mt-1">{promoError}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  Try <span className="font-semibold text-primary">FRESH10</span> for $10 off your first box
                </p>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => {
                // Fire AddToCart, not InitiateCheckout: the user has only selected a
                // box here, they haven't entered any checkout info. InitiateCheckout
                // is reserved for the payment step. Client-only (no CAPI pair).
                try {
                  const fbq = (window as Window & { fbq?: (...args: unknown[]) => void }).fbq;
                  if (fbq) {
                    fbq("track", "AddToCart", {
                      content_name: product.name,
                      content_ids: [slug],
                      content_type: "product",
                      value: product.subPrice,
                      currency: "USD",
                      num_items: 1,
                    });
                  }
                } catch {
                  // Never block checkout for tracking failures
                }

                // Persist email if valid
                const trimmed = email.trim();
                if (trimmed && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
                  try {
                    sessionStorage.setItem(`unc-email-${slug}`, trimmed);
                  } catch {
                    // ignore
                  }
                }
                router.push(`/subscribe/${slug}/delivery`);
              }}
              className="w-full bg-primary text-primary-foreground rounded-xl h-12 px-6 text-base font-semibold hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Your Details →
            </button>
          </div>
        </div>

        {/* Bottom spacer so the sticky mobile CTA doesn't cover content. */}
        <div className="h-20 md:hidden" />
      </div>

      {/* Sticky mobile CTA — always within thumb reach. 76% of traffic is
          mobile, and the inline CTA is ~4 scrolls down on iPhone viewports. */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-border px-4 py-3 shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.08)]">
        <button
          type="button"
          onClick={() => {
            try {
              const fbq = (window as Window & { fbq?: (...args: unknown[]) => void }).fbq;
              if (fbq) {
                fbq("track", "AddToCart", {
                  content_name: product.name,
                  content_ids: [slug],
                  content_type: "product",
                  value: product.subPrice,
                  currency: "USD",
                  num_items: 1,
                });
              }
            } catch { /* ignore */ }
            try {
              const trimmed = email.trim();
              if (trimmed && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
                sessionStorage.setItem(`unc-email-${slug}`, trimmed);
              }
            } catch { /* ignore */ }
            router.push(`/subscribe/${slug}/delivery`);
          }}
          className="w-full bg-primary text-primary-foreground rounded-xl h-12 px-6 text-base font-semibold hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span>Continue</span>
          <span className="font-normal opacity-80">
            · ${promoDiscount > 0 ? Math.max(0, product.subPrice - promoDiscount).toFixed(2) : product.subPrice}
            {promoDiscount > 0 ? " first box" : "/wk"}
          </span>
        </button>
      </div>
    </section>
  );
}
