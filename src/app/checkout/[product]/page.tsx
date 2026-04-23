"use client";

import { useParams, notFound } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { PRODUCTS, PROTEIN_OPTIONS, type ProductSlug, type ProteinId } from "@/lib/products";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  const [selectedProteins, setSelectedProteins] = useState<ProteinId[]>([]);
  const [additionalProteins, setAdditionalProteins] = useState<ProteinId[]>([]);
  const [email, setEmail] = useState("");
  const [emailCaptured, setEmailCaptured] = useState(false);

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

  // Restore any prior selection from sessionStorage, or auto-select if only one included option
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(`unc-proteins-${slug}`);
      if (saved) {
        const parsed = JSON.parse(saved) as ProteinId[];
        setSelectedProteins(parsed);
      } else if (proteinIncluded && availableProteins.length === 1) {
        // Auto-select the only included protein (e.g. Family box = chicken)
        const autoSelected = [availableProteins[0].id];
        setSelectedProteins(autoSelected);
        sessionStorage.setItem(`unc-proteins-${slug}`, JSON.stringify(autoSelected));
      }
      const savedAdditional = sessionStorage.getItem(`unc-additional-proteins-${slug}`);
      if (savedAdditional) {
        const parsed = JSON.parse(savedAdditional) as ProteinId[];
        setAdditionalProteins(parsed);
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

        <div className="rounded-2xl overflow-hidden shadow-soft bg-background">
          {/* Product image */}
          <div className="relative">
            <img
              src="/images/produce-box.jpg"
              alt={`${product.name} — fresh seasonal produce`}
              className="w-full h-56 object-cover"
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
                <span className="text-3xl font-bold text-primary">${totalPrice}</span>
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

            {/* Additional proteins section — only for boxes that allow it */}
            {"additionalProteinAllowed" in product && product.additionalProteinAllowed ? (
              <div className="mb-6 p-4 rounded-xl border border-border bg-muted/30">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Add More Proteins (Optional)
                </h2>
                <p className="text-xs text-muted-foreground mb-3">
                  Add 2nd or 3rd protein options to your box (+${18}–${24}). You can select up to 3 additional proteins.
                </p>
                <div className="space-y-2">
                  {availableProteins
                    .filter((opt) => !selectedProteins.includes(opt.id)) // Exclude already-selected included protein
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
                          {/* Checkbox indicator */}
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
      </div>
    </section>
  );
}
