"use client";

import { useParams, notFound } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { PRODUCTS, PROTEIN_OPTIONS, type ProductSlug, type ProteinId } from "@/lib/products";

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

  const [selectedProteins, setSelectedProteins] = useState<ProteinId[]>([]);

  // Restore any prior selection from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(`unc-proteins-${slug}`);
      if (saved) {
        const parsed = JSON.parse(saved) as ProteinId[];
        setSelectedProteins(parsed);
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
                ${product.price} per delivery
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
                <span className="text-3xl font-bold text-primary">${product.price}</span>
              </div>
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
            {product.proteinCount > 0 && <div className="mb-6 p-4 rounded-xl border border-border bg-muted/30">
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
            </div>}

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

            {/* CTA */}
            <button
              onClick={() => router.push(`/checkout/${slug}/delivery`)}
              className="w-full bg-primary text-primary-foreground rounded-xl h-12 px-6 text-base font-semibold hover:bg-primary/90 transition-colors shadow-soft"
            >
              Continue to Delivery →
            </button>
            {proteinIncluded && selectedProteins.length === 0 && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Don&apos;t forget to select your protein above before continuing.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
