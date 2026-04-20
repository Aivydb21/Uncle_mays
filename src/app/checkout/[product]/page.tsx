"use client";

import { useParams, notFound } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
  const availableProteins = getAvailableProteins(product);

  // First-order pricing: starter box gets $30 instead of $35
  const effectivePrice = "firstOrderPrice" in product ? product.firstOrderPrice : product.price;
  const isFirstOrderDiscount: boolean = "firstOrderPrice" in product && (product as { firstOrderPrice: number; price: number }).firstOrderPrice < product.price;

  const [selectedProteins, setSelectedProteins] = useState<ProteinId[]>([]);
  const [additionalProteins, setAdditionalProteins] = useState<ProteinId[]>([]);
  const [email, setEmail] = useState("");
  const [emailCaptured, setEmailCaptured] = useState(false);

  // Fire Meta Pixel ViewContent + InitiateCheckout on page load
  // Users arriving here came from a Meta ad routed directly to checkout, so both events apply.
  useEffect(() => {
    const fbq = typeof window !== "undefined"
      ? (window as Window & { fbq?: (...args: unknown[]) => void }).fbq
      : undefined;
    if (fbq) {
      fbq("track", "ViewContent", {
        content_name: product.name,
        content_ids: [slug],
        content_type: "product",
        value: effectivePrice,
        currency: "USD",
      });
      fbq("track", "InitiateCheckout", {
        content_name: product.name,
        content_ids: [slug],
        content_type: "product",
        value: effectivePrice,
        currency: "USD",
        num_items: 1,
      });
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

  // Restore any prior selection from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(`unc-proteins-${slug}`);
      if (saved) {
        const parsed = JSON.parse(saved) as ProteinId[];
        setSelectedProteins(parsed);
      }
      const savedAdditional = sessionStorage.getItem(`unc-additional-proteins-${slug}`);
      if (savedAdditional) {
        const parsed = JSON.parse(savedAdditional) as ProteinId[];
        setAdditionalProteins(parsed);
      }
    } catch {
      // ignore
    }
  }, [slug]);

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
                ${effectivePrice} per delivery
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
                {isFirstOrderDiscount ? (
                  <div className="text-xs text-muted-foreground line-through">${product.price + additionalProteinCost}</div>
                ) : null}
                {additionalProteinCost > 0 ? (
                  <div className="text-xs text-muted-foreground mt-1">
                    Box: ${effectivePrice} + Proteins: ${additionalProteinCost}
                  </div>
                ) : null}
              </div>
            </div>

            {/* First-order discount callout */}
            {isFirstOrderDiscount ? (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2.5 text-sm text-primary font-medium">
                <span>🎉</span>
                <span>First-order discount applied — you save ${product.price - effectivePrice}!</span>
              </div>
            ) : null}

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
                    Choose Your Protein — Included
                  </h2>
                  <p className="text-xs text-muted-foreground mb-3">
                    Protein is included with your box at no extra charge. Select one.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    Add a Protein — Optional
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
                  Add More Proteins — Optional
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

            {/* Trust signals */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 py-4 border-y border-border">
              {[
                { icon: "🌱", text: "Locally sourced" },
                { icon: "🚚", text: "Delivered fresh Wednesdays" },
                { icon: "📍", text: "Chicago area only" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>

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

            {/* CTA */}
            <button
              onClick={() => {
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
              className="w-full bg-primary text-primary-foreground rounded-xl h-12 px-6 text-base font-semibold hover:bg-primary/90 transition-colors shadow-soft"
            >
              Continue to Delivery →
            </button>
            {proteinIncluded && selectedProteins.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Don&apos;t forget to select your protein above before continuing.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
