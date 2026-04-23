"use client";

import { useParams, notFound } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { PRODUCTS, PROTEIN_OPTIONS, type ProductSlug, type ProteinId } from "@/lib/products";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ACTIVE_PROMOS, normalizePromo } from "@/lib/promo";

// Resolve which protein options are available for a given product
function getAvailableProteins(product: typeof PRODUCTS[ProductSlug]) {
  const allowed = "proteinOptions" in product ? (product.proteinOptions as ProteinId[]) : null;
  return allowed ? PROTEIN_OPTIONS.filter((o) => allowed.includes(o.id)) : [...PROTEIN_OPTIONS];
}

// Step indicator component
function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const steps = ["Order Summary", "Delivery", "Payment"];
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

export default function CheckoutSummaryPage() {
  const params = useParams<{ product: string }>();
  const router = useRouter();
  const slug = params.product as ProductSlug;

  if (!PRODUCTS[slug]) {
    notFound();
  }

  const product = PRODUCTS[slug];
  const proteinIncluded = product.proteinIncluded;
  // Memoize so the reference is stable for a given product slug.
  // Without useMemo this was a new array on every render, which — when
  // placed in a useEffect dep list that also calls setState — caused an
  // infinite re-render loop on Family Box (auto-select triggers setState,
  // which creates a new availableProteins ref, which re-runs the effect,
  // which calls setState again, etc.). React then throws "Maximum update
  // depth exceeded" which breaks hydration for the entire page and leaves
  // every button inert — the symptom CEO reported.
  const availableProteins = useMemo(() => getAvailableProteins(product), [slug]);

  const effectivePrice = product.price;

  // Auto-select the single included protein in the initial state (not useEffect)
  // so the Continue button is never briefly disabled on mount. Previously a
  // useEffect did this, which caused a visible flash of the disabled CTA on
  // fast mobile clickers — they would tap and get no response.
  const [selectedProteins, setSelectedProteins] = useState<ProteinId[]>(() =>
    product.proteinIncluded && getAvailableProteins(product).length === 1
      ? [getAvailableProteins(product)[0].id]
      : []
  );
  const [additionalProteins, setAdditionalProteins] = useState<ProteinId[]>([]);
  const [email, setEmail] = useState("");
  const [emailCaptured, setEmailCaptured] = useState(false);

  // Additional-protein upsell accordion closed by default to reduce decision
  // fatigue on mobile. Users who care can expand; everyone else sees a
  // shorter page with the CTA nearer the top.
  const [showAdditionalProteins, setShowAdditionalProteins] = useState(false);

  // Promo code: captured from ?promo= on mount (set by ad URL), persisted to
  // sessionStorage so it survives through delivery + payment steps, and
  // validated against the ACTIVE_PROMOS registry so unknown codes never
  // render a banner.
  const [promoCode, setPromoCode] = useState<string | null>(null);
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
  const activePromo = promoCode ? ACTIVE_PROMOS[promoCode] : null;
  const promoDiscount = activePromo?.appliesTo.includes("one-time")
    ? activePromo.amountOffCents / 100
    : 0;

  // Fire Meta Pixel ViewContent on page load (client-side) AND server-side CAPI,
  // both carrying the same eventID so Meta deduplicates the pair to a single event.
  // AddToCart fires on the "Continue" button click; InitiateCheckout only at payment.
  useEffect(() => {
    const eventId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `view-${slug}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    fetch("/api/capi/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, contentName: product.name, value: effectivePrice, eventId }),
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
          value: effectivePrice,
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
  }, [slug, product.name, effectivePrice]);

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
      // Store for downstream checkout steps
      try {
        sessionStorage.setItem(`unc-email-${slug}`, trimmed);
      } catch {
        // ignore
      }
      // Fire-and-forget to Mailchimp for abandoned cart recovery
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

  // Restore any prior protein selections from sessionStorage. The initial
  // state above already auto-selects the single included protein; this
  // effect only overrides when a prior visit had a different selection.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(`unc-proteins-${slug}`);
      if (saved) {
        const parsed = JSON.parse(saved) as ProteinId[];
        if (parsed.length > 0) setSelectedProteins(parsed);
      } else if (proteinIncluded && availableProteins.length === 1) {
        // Persist the auto-selection from initial state so downstream steps
        // read it consistently on page refresh.
        sessionStorage.setItem(`unc-proteins-${slug}`, JSON.stringify([availableProteins[0].id]));
      }
      const savedAdditional = sessionStorage.getItem(`unc-additional-proteins-${slug}`);
      if (savedAdditional) {
        const parsed = JSON.parse(savedAdditional) as ProteinId[];
        setAdditionalProteins(parsed);
        if (parsed.length > 0) setShowAdditionalProteins(true);
      }
    } catch {
      // ignore
    }
  }, [slug, proteinIncluded, availableProteins]);

  // Always single-select (radio): selecting a new protein replaces the previous one
  function toggleProtein(id: ProteinId) {
    setSelectedProteins((prev) => {
      const next = prev.includes(id) ? [] : [id];
      try {
        sessionStorage.setItem(`unc-proteins-${slug}`, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  // Multi-select (checkboxes): toggle additional proteins on/off
  function toggleAdditionalProtein(id: ProteinId) {
    setAdditionalProteins((prev) => {
      const next = prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id];
      try {
        sessionStorage.setItem(`unc-additional-proteins-${slug}`, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  // Calculate additional protein cost
  const additionalProteinCost =
    "additionalProteinPricing" in product
      ? additionalProteins.reduce((sum, id) => {
          const pricing = product.additionalProteinPricing as Record<ProteinId, number>;
          return sum + (pricing[id] || 0);
        }, 0)
      : 0;

  // Total price including additional proteins
  const totalPrice = effectivePrice + additionalProteinCost;

  // Product-specific value anchor copy (board-approved, UNC-500)
  const VALUE_ANCHORS: Record<string, { serving: string; guarantee: string }> = {
    starter: {
      serving: "~8 servings of fresh, seasonal produce",
      guarantee: "Sourced to our standard. If it ever falls short, we make it right.",
    },
    family: {
      serving: "~14-18 servings: produce, eggs, and a whole chicken",
      guarantee: "Sourced to our standard. If it ever falls short, we make it right.",
    },
    community: {
      serving: "~20-24 servings: heirloom produce + your choice of protein",
      guarantee: "Sourced to our standard. If it ever falls short, we make it right.",
    },
  };
  const valueAnchor = VALUE_ANCHORS[slug] ?? {
    serving: "~8 servings of fresh, seasonal produce",
    guarantee: "Sourced to our standard. If it ever falls short, we make it right.",
  };

  return (
    <section className="py-10 md:py-16 bg-muted/30 min-h-screen">
      <div className="container px-4 max-w-2xl mx-auto">
        {/* Back link */}
        <div className="mb-6">
          <Link
            href="/#boxes"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            &larr; Back to boxes
          </Link>
        </div>

        <StepIndicator current={1} />

        {/* Promo banner — shown when a valid ?promo= code is in the URL or
            session. Keeps the ad-to-landing-page promise visible without any
            user action. */}
        {activePromo && promoDiscount > 0 ? (
          <div className="mb-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Promo {promoCode} applied
              </p>
              <p className="text-sm font-bold text-primary mt-0.5">
                {activePromo.label}: first box ${Math.max(0, totalPrice - promoDiscount)} (was ${totalPrice})
              </p>
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl overflow-hidden shadow-soft bg-background">
          {/* Product image — shorter on mobile to reduce scroll before CTA */}
          <div className="relative">
            <img
              src="/images/produce-box.jpg"
              alt={`${product.name} — fresh seasonal produce`}
              className="w-full h-36 md:h-56 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <div className="absolute bottom-4 left-5">
              <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                {product.servingBadge}
              </span>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Product name & price */}
            <div className="flex items-start justify-between gap-4 mb-4">
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
                    <div className="text-sm line-through text-muted-foreground">${totalPrice}</div>
                    <span className="text-3xl font-bold text-primary">${Math.max(0, totalPrice - promoDiscount)}</span>
                    <div className="text-xs text-primary font-medium mt-0.5">first box</div>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-primary">${totalPrice}</span>
                )}
                {additionalProteinCost > 0 ? (
                  <div className="text-xs text-muted-foreground mt-1">
                    Box: ${effectivePrice} + Proteins: ${additionalProteinCost}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Value anchor — product-specific copy (UNC-535) */}
            <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
              <p className="text-sm font-medium text-primary/80 mb-1">
                {valueAnchor.serving}
              </p>
              <p className="text-sm font-bold text-primary">
                {valueAnchor.guarantee}
              </p>
            </div>

            {/* What's in the box */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                What&apos;s in your box
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

            {/* Protein section — only for boxes that include/offer protein */}
            {product.proteinCount > 0 ? <div className="mb-6 p-4 rounded-xl border border-border bg-muted/30">
              {proteinIncluded ? (
                <>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    {availableProteins.length === 1 ? "Your Included Protein" : "Choose Your Protein: Included"}
                  </h2>
                  <p className="text-xs text-muted-foreground mb-3">
                    {availableProteins.length === 1
                      ? "Tap to confirm your included protein — no extra charge."
                      : "Protein is included with your box at no extra charge. Select one."}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    Add a Protein (Optional)
                  </h2>
                  <p className="text-xs text-muted-foreground mb-3">
                    Add one locally sourced protein to your box (+$16–$22). Skip if you prefer.
                  </p>
                </>
              )}
              <div className="space-y-2">
                {availableProteins.map((opt) => {
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
                      {/* Radio indicator */}
                      <span
                        className={`w-5 h-5 rounded-full flex-shrink-0 border-2 flex items-center justify-center ${
                          selected ? "border-primary bg-primary" : "border-muted-foreground/40"
                        }`}
                      >
                        {selected && <span className="w-2 h-2 rounded-full bg-white" />}
                      </span>
                      <span className="flex-1">{opt.label}</span>
                      {!proteinIncluded && (
                        <span className="text-muted-foreground font-normal">+${opt.price}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div> : null}

            {/* Additional proteins — collapsed by default to reduce mobile
                decision fatigue. The upsell is still discoverable (one tap)
                but out of the critical path for first-box buyers. */}
            {"additionalProteinAllowed" in product && product.additionalProteinAllowed ? (
              <div className="mb-6 rounded-xl border border-border bg-muted/30 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowAdditionalProteins((v) => !v)}
                  className="w-full flex items-center justify-between gap-3 p-4 text-left"
                  aria-expanded={showAdditionalProteins}
                >
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Add more proteins <span className="text-muted-foreground/70 normal-case font-normal">(optional)</span>
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      {additionalProteins.length > 0
                        ? `${additionalProteins.length} added (+$${additionalProteinCost})`
                        : "Skip if you prefer — you can always add later."}
                    </p>
                  </div>
                  <span className={`text-xl text-muted-foreground transition-transform ${showAdditionalProteins ? "rotate-45" : ""}`}>+</span>
                </button>
                {showAdditionalProteins ? (
                  <div className="px-4 pb-4 space-y-2">
                    {availableProteins
                      .filter((opt) => !selectedProteins.includes(opt.id))
                      .map((opt) => {
                        const selected = additionalProteins.includes(opt.id);
                        const pricing = "additionalProteinPricing" in product
                          ? (product.additionalProteinPricing as Record<ProteinId, number>)[opt.id]
                          : 0;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => toggleAdditionalProtein(opt.id)}
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
                            <span className="text-muted-foreground font-normal">+${pricing}</span>
                          </button>
                        );
                      })}
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Email capture — earliest possible point for abandoned cart recovery */}
            <div className="mb-6 p-4 rounded-xl border border-border bg-muted/30">
              <Label htmlFor="email" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
                Your Email
              </Label>
              <p className="text-xs text-muted-foreground mb-3">
                We&apos;ll send your order confirmation and delivery updates here.
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

            {/* Protein required but not selected — show inline error (UNC-560) */}
            {proteinIncluded && selectedProteins.length === 0 ? (
              <p className="text-sm text-destructive font-medium text-center mb-2">
                Please select your included protein above to continue.
              </p>
            ) : null}

            {/* CTA */}
            <button
              type="button"
              disabled={proteinIncluded && selectedProteins.length === 0}
              onClick={() => {
                // Guard: don't proceed without required protein
                if (proteinIncluded && selectedProteins.length === 0) return;

                // Fire AddToCart, not InitiateCheckout: the user has only selected a
                // box. InitiateCheckout is reserved for the payment step. Client-only.
                try {
                  const fbq = (window as Window & { fbq?: (...args: unknown[]) => void }).fbq;
                  if (fbq) {
                    fbq("track", "AddToCart", {
                      content_name: product.name,
                      content_ids: [slug],
                      content_type: "product",
                      value: totalPrice,
                      currency: "USD",
                      num_items: 1,
                    });
                  }
                } catch {
                  // Never block checkout for tracking failures
                }

                // Persist total price (base + additional proteins) for downstream checkout steps
                try {
                  sessionStorage.setItem(`unc-price-${slug}`, String(totalPrice));
                } catch {
                  // ignore
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
                router.push(`/checkout/${slug}/delivery`);
              }}
              className="w-full bg-primary text-primary-foreground rounded-xl h-12 px-6 text-base font-semibold hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Delivery →
            </button>
          </div>
        </div>

        {/* Bottom spacer so the sticky mobile CTA bar doesn't cover the last
            scrolled content on short viewports. */}
        <div className="h-20 md:hidden" />
      </div>

      {/* Sticky mobile CTA — always within thumb reach so users on long pages
          (76% of traffic is mobile) don't have to scroll to the bottom to act.
          Hidden on desktop where the inline CTA above is already visible. */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-border px-4 py-3 shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.08)]">
        <button
          type="button"
          disabled={proteinIncluded && selectedProteins.length === 0}
          onClick={() => {
            if (proteinIncluded && selectedProteins.length === 0) return;
            try {
              const fbq = (window as Window & { fbq?: (...args: unknown[]) => void }).fbq;
              if (fbq) {
                fbq("track", "AddToCart", {
                  content_name: product.name,
                  content_ids: [slug],
                  content_type: "product",
                  value: totalPrice,
                  currency: "USD",
                  num_items: 1,
                });
              }
            } catch { /* ignore */ }
            try {
              sessionStorage.setItem(`unc-price-${slug}`, String(totalPrice));
              const trimmed = email.trim();
              if (trimmed && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
                sessionStorage.setItem(`unc-email-${slug}`, trimmed);
              }
            } catch { /* ignore */ }
            router.push(`/checkout/${slug}/delivery`);
          }}
          className="w-full bg-primary text-primary-foreground rounded-xl h-12 px-6 text-base font-semibold hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span>Continue</span>
          <span className="font-normal opacity-80">· ${promoDiscount > 0 ? Math.max(0, totalPrice - promoDiscount) : totalPrice}</span>
        </button>
      </div>
    </section>
  );
}
