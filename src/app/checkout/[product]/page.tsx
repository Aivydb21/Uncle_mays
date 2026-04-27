"use client";

import { useParams, notFound } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { PRODUCTS, PROTEIN_OPTIONS, PROTEIN_TAGLINE, BEAN_OPTIONS, DEFAULT_BEAN, type ProductSlug, type ProteinId, type BeanId } from "@/lib/products";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ACTIVE_PROMOS, normalizePromo } from "@/lib/promo";

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
  const basePrice = product.price;

  // Proteins are optional paid add-ons, available on every box, multi-select,
  // collapsed by default so the CTA sits higher on mobile.
  const [selectedProteins, setSelectedProteins] = useState<ProteinId[]>([]);
  const [showProteinAddOns, setShowProteinAddOns] = useState(false);

  // Bean choice — Full Harvest Box only. Defaults to black (matches the
  // Spring Box's fixed black-bean inclusion). No upcharge for any choice.
  const isFullHarvest = slug === "family";
  const [selectedBean, setSelectedBean] = useState<BeanId>(DEFAULT_BEAN);
  const [email, setEmail] = useState("");
  const [emailCaptured, setEmailCaptured] = useState(false);

  // Promo code: captured from ?promo= on mount, validated against ACTIVE_PROMOS,
  // or entered manually by the user via the promo input field.
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
    if (!entry || !entry.appliesTo.includes("one-time")) {
      setPromoError("Invalid promo code");
      return;
    }
    try { sessionStorage.setItem("unc-promo", normalized); } catch { /* ignore */ }
    setPromoCode(normalized);
    setPromoInput("");
  }
  const activePromo = promoCode ? ACTIVE_PROMOS[promoCode] : null;
  const promoDiscount = activePromo?.appliesTo.includes("one-time")
    ? activePromo.amountOffCents / 100
    : 0;

  // Fire Meta Pixel ViewContent + server CAPI, deduped by eventID.
  useEffect(() => {
    const eventId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `view-${slug}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    fetch("/api/capi/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, contentName: product.name, value: basePrice, eventId }),
    }).catch(() => {});

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
          value: basePrice,
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
  }, [slug, product.name, basePrice]);

  // Restore any prior email and protein selections.
  useEffect(() => {
    try {
      const savedEmail = sessionStorage.getItem(`unc-email-${slug}`);
      if (savedEmail) {
        setEmail(savedEmail);
        setEmailCaptured(true);
      }
      const savedBean = sessionStorage.getItem(`unc-bean-${slug}`);
      if (savedBean && BEAN_OPTIONS.some((b) => b.id === savedBean)) {
        setSelectedBean(savedBean as BeanId);
      }
      const savedProteins = sessionStorage.getItem(`unc-proteins-${slug}`);
      if (savedProteins) {
        const parsed = JSON.parse(savedProteins) as ProteinId[];
        if (parsed.length > 0) {
          setSelectedProteins(parsed);
          setShowProteinAddOns(true);
        }
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
      } catch { /* ignore */ }
      if (!emailCaptured) {
        setEmailCaptured(true);
        fetch("/api/capture-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmed, product: slug }),
        }).catch(() => {});
      }
    }
  }

  function toggleProtein(id: ProteinId) {
    setSelectedProteins((prev) => {
      const next = prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id];
      try {
        sessionStorage.setItem(`unc-proteins-${slug}`, JSON.stringify(next));
      } catch { /* ignore */ }
      return next;
    });
  }

  const proteinCost = selectedProteins.reduce((sum, id) => {
    const opt = PROTEIN_OPTIONS.find((o) => o.id === id);
    return sum + (opt?.price ?? 0);
  }, 0);
  const totalPrice = basePrice + proteinCost;

  function continueToDelivery() {
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
  }

  const discountedTotal = Math.max(0, totalPrice - promoDiscount);

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

        {/* Promo chip — one slim line when a valid ?promo= is applied. */}
        {activePromo && promoDiscount > 0 ? (
          <div className="mb-4 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
            <strong>{promoCode}</strong> applied · {activePromo.label}
          </div>
        ) : null}

        <div className="rounded-2xl overflow-hidden shadow-soft bg-background">
          {/* Product image — decorative, not interactive. Clarity replays
              (2026-04-27) showed users tapping the image and the gradient
              expecting something to happen. Marking it pointer-events-none
              so taps fall through to the page itself rather than registering
              as dead clicks. */}
          <div className="relative pointer-events-none select-none">
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
            {/* Product name + price */}
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
                    <span className="text-3xl font-bold text-primary">${discountedTotal}</span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-primary">${totalPrice}</span>
                )}
                {proteinCost > 0 ? (
                  <div className="text-xs text-muted-foreground mt-1">
                    Box ${basePrice} + Protein ${proteinCost}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Cutoff deadline */}
            <div className="mb-5 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm">
              <p className="font-semibold text-amber-800">
                Order by Sunday 11:59 PM CT for Wednesday delivery
              </p>
              <p className="text-amber-700 text-xs mt-1">
                100% fresh or refunded.
              </p>
            </div>

            {/* What's in the box. Items that start with "Everything in the
                Spring Box" or end with "(included)" get a highlighted row so
                they stand out as headline value props on the Full Harvest
                Box. */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                What&apos;s in your box
              </h2>
              <ul className="space-y-2">
                {product.items.map((item) => {
                  const isIncluded = item.includes("(included)");
                  return (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <span className={`mt-0.5 ${isIncluded ? "text-primary text-base leading-none" : "text-primary"}`}>
                        {isIncluded ? "★" : "✓"}
                      </span>
                      <span className={isIncluded ? "font-semibold text-foreground" : ""}>{item}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground italic">{product.weightEstimate}</p>
            </div>

            {/* Bean choice — Full Harvest Box only. Defaults to black. */}
            {isFullHarvest && (
              <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4">
                <h2 className="text-sm font-bold uppercase tracking-wide text-primary mb-1">
                  Choose your bean
                </h2>
                <p className="text-xs text-foreground/70 mb-3">
                  Pick one variety. All same price, organic, included with your box.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {BEAN_OPTIONS.map((bean) => {
                    const selected = selectedBean === bean.id;
                    return (
                      <button
                        key={bean.id}
                        type="button"
                        onClick={() => {
                          setSelectedBean(bean.id);
                          try { sessionStorage.setItem(`unc-bean-${slug}`, bean.id); } catch { /* ignore */ }
                        }}
                        className={`px-3 py-2.5 rounded-lg border-2 text-sm font-semibold transition-colors ${
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-foreground hover:border-primary/50"
                        }`}
                      >
                        {bean.label.replace(" beans", "")}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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
                    Add a protein <span className="text-muted-foreground/70 normal-case font-normal">($12 each)</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedProteins.length > 0
                      ? `${selectedProteins.length} added (+$${proteinCost})`
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
                        <span className="text-muted-foreground font-normal">+${opt.price}</span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>

            {/* Order start: email + optional promo grouped under one
                explicit "Start your order" header. Clarity replays
                (2026-04-27) showed users reading the menu and protein
                section thoroughly, then bouncing without realizing the
                email field was the entry point to ordering. The grouped
                section + colored border + explicit step language makes
                "where the order begins" unmissable. */}
            <div className="mb-6 rounded-xl border-2 border-primary/30 bg-primary/5 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                Start your order
              </p>
              <p className="text-sm text-foreground/80 mb-4">
                Enter your email and we&apos;ll take you to delivery and payment.
              </p>

              <div className="mb-4">
                <Label htmlFor="email" className="text-sm font-semibold mb-2 block">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleEmailBlur}
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="bg-background"
                />
              </div>

              {!promoCode ? (
                <div>
                  <Label htmlFor="promo" className="text-sm font-semibold mb-2 block">
                    Promo code <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="promo"
                      type="text"
                      value={promoInput}
                      onChange={(e) => { setPromoInput(e.target.value); setPromoError(""); }}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyPromoCode(); } }}
                      placeholder="e.g. FRESH10"
                      className="flex-1 bg-background"
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
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={continueToDelivery}
              className="w-full bg-primary text-primary-foreground rounded-xl h-12 px-6 text-base font-semibold hover:bg-primary/90 transition-colors shadow-soft"
            >
              Continue to delivery details →
            </button>
          </div>
        </div>

        {/* Spacer so the sticky mobile CTA bar doesn't cover the last scrolled content. */}
        <div className="h-20 md:hidden" />
      </div>

      {/* Sticky mobile CTA */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-border px-4 py-3 shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.08)]">
        <button
          type="button"
          onClick={continueToDelivery}
          className="w-full bg-primary text-primary-foreground rounded-xl h-12 px-6 text-base font-semibold hover:bg-primary/90 transition-colors shadow-soft flex items-center justify-center gap-2"
        >
          <span>Continue</span>
          <span className="font-normal opacity-80">· ${discountedTotal}</span>
        </button>
      </div>
    </section>
  );
}
