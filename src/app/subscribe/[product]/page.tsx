"use client";

import { useParams, notFound } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { PRODUCTS, PROTEIN_OPTIONS, type ProductSlug, type ProteinId } from "@/lib/products";

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
  const proteinCount = product.proteinCount;

  const [selectedProteins, setSelectedProteins] = useState<ProteinId[]>([]);

  useEffect(() => {
    if (proteinCount === 0) return;
    try {
      const saved = sessionStorage.getItem(`unc-sub-proteins-${slug}`);
      if (saved) {
        const parsed = JSON.parse(saved) as ProteinId[];
        setSelectedProteins(parsed);
      }
    } catch {
      // ignore
    }
  }, [slug, proteinCount]);

  function toggleProtein(id: ProteinId) {
    setSelectedProteins((prev) => {
      let next: ProteinId[];
      if (prev.includes(id)) {
        next = prev.filter((p) => p !== id);
      } else if (proteinCount === 1) {
        next = [id];
      } else {
        next = prev.length < proteinCount ? [...prev, id] : prev;
      }
      try {
        sessionStorage.setItem(`unc-sub-proteins-${slug}`, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  const proteinsReady = proteinCount === 0 || selectedProteins.length === proteinCount;

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

        <div className="rounded-2xl overflow-hidden shadow-soft bg-background">
          <div className="relative">
            <img
              src="/images/produce-box.jpg"
              alt={`${product.name} — fresh seasonal produce`}
              className="w-full h-56 object-cover"
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
                <span className="text-3xl font-bold text-primary">${product.subPrice}</span>
                <span className="text-muted-foreground text-sm">/wk</span>
              </div>
            </div>

            {/* Savings callout */}
            <div className="mb-6 flex items-center gap-2 text-sm text-primary font-medium bg-primary/5 px-3 py-2 rounded-lg border border-primary/20">
              <span>✓</span>
              <span>You save ${(product.price - product.subPrice).toFixed(2)} per delivery vs. one-time pricing (10% off)</span>
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

            {/* Protein selection */}
            {proteinCount > 0 && (
              <div className="mb-6 p-4 rounded-xl border border-border bg-muted/30">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Choose your protein{proteinCount > 1 ? "s" : ""}
                </h2>
                <p className="text-xs text-muted-foreground mb-3">
                  {proteinCount === 1
                    ? "Select 1 protein for your box."
                    : `Select ${proteinCount} proteins for your box.`}{" "}
                  {selectedProteins.length > 0 && (
                    <span className="text-primary font-medium">
                      {selectedProteins.length}/{proteinCount} selected
                    </span>
                  )}
                </p>
                <div className="space-y-2">
                  {PROTEIN_OPTIONS.map((opt) => {
                    const selected = selectedProteins.includes(opt.id);
                    const maxReached = selectedProteins.length >= proteinCount && !selected;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleProtein(opt.id)}
                        disabled={maxReached}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium text-left transition-all ${
                          selected
                            ? "border-primary bg-primary/10 text-primary"
                            : maxReached
                            ? "border-border bg-muted/20 text-muted-foreground cursor-not-allowed opacity-50"
                            : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-primary/5"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center ${
                            selected ? "border-primary bg-primary" : "border-muted-foreground/40"
                          }`}
                        >
                          {selected && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                              <path d="M10 3L5 9 2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                          )}
                        </span>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Trust signals */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 py-4 border-y border-border">
              {[
                { icon: "🔄", text: "Cancel anytime, no fees" },
                { icon: "🚚", text: "Free delivery, every Wednesday" },
                { icon: "🌱", text: "Locally sourced, Black-owned farms" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push(`/subscribe/${slug}/delivery`)}
              disabled={!proteinsReady}
              className="w-full bg-primary text-primary-foreground rounded-xl h-12 px-6 text-base font-semibold hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {proteinsReady
                ? "Continue to Your Details \u2192"
                : `Select ${proteinCount - selectedProteins.length} more protein${proteinCount - selectedProteins.length !== 1 ? "s" : ""} to continue`}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
