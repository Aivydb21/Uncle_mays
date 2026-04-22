"use client";

import { useParams, notFound } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { PRODUCTS, PROTEIN_OPTIONS, type ProductSlug, type ProteinId } from "@/lib/products";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Truck, Leaf } from "lucide-react";

function getAvailableProteins(product: typeof PRODUCTS[ProductSlug]) {
  const allowed = "proteinOptions" in product ? (product.proteinOptions as ProteinId[]) : null;
  return allowed ? PROTEIN_OPTIONS.filter((o) => allowed.includes(o.id)) : [...PROTEIN_OPTIONS];
}

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
  const proteinIncluded = product.proteinIncluded;
  const availableProteins = getAvailableProteins(product);

  const [selectedProteins, setSelectedProteins] = useState<ProteinId[]>([]);
  const [email, setEmail] = useState("");
  const [emailCaptured, setEmailCaptured] = useState(false);

  // Fire Meta Pixel ViewContent on page load (client-side).
  // Also fire server-side CAPI ViewContent to bypass ITP/ad blockers for better attribution.
  // InitiateCheckout fires on the "Continue" button click, not on page load (UNC-559).
  useEffect(() => {
    fetch("/api/capi/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, contentName: product.name, value: product.subPrice }),
    }).catch(() => {
      // Never block checkout for CAPI failures
    });

    function fireViewContent() {
      const fbq = (window as Window & { fbq?: (...args: unknown[]) => void }).fbq;
      if (!fbq) return false;
      fbq("track", "ViewContent", {
        content_name: product.name,
        content_ids: [slug],
        content_type: "product",
        value: product.subPrice,
        currency: "USD",
      });
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

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(`unc-sub-proteins-${slug}`);
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
        sessionStorage.setItem(`unc-sub-proteins-${slug}`, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

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

            {/* Protein required but not selected — show inline error (mirrors checkout) */}
            {proteinIncluded && selectedProteins.length === 0 ? (
              <p className="text-sm text-destructive font-medium text-center mb-2">
                Please select your included protein above to continue.
              </p>
            ) : null}

            <button
              type="button"
              disabled={proteinIncluded && selectedProteins.length === 0}
              onClick={() => {
                // Guard: don't proceed without required protein
                if (proteinIncluded && selectedProteins.length === 0) return;

                // Fire InitiateCheckout on user action, not page load (UNC-559)
                try {
                  const fbq = (window as Window & { fbq?: (...args: unknown[]) => void }).fbq;
                  if (fbq) {
                    fbq("track", "InitiateCheckout", {
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
                // Server-side CAPI InitiateCheckout — non-blocking
                fetch("/api/capi/initiate-checkout", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ slug, contentName: product.name, value: product.subPrice }),
                }).catch(() => {});

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
      </div>
    </section>
  );
}
