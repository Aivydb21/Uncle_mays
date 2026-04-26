"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { PRODUCTS, type ProductSlug, type ProteinId } from "@/lib/products";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ACTIVE_PROMOS, normalizePromo } from "@/lib/promo";
import { useAddressAutocomplete, type ParsedAddress } from "@/hooks/use-address-autocomplete";
import { WaitlistCapture } from "@/components/WaitlistCapture";
import { isInServiceArea, OUT_OF_AREA_MESSAGE } from "@/lib/service-area";

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    gtag: (...args: unknown[]) => void;
  }
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

interface FormFields {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  apt: string;
  city: string;
  state: string;
  zip: string;
  deliveryNotes: string;
}

type FormErrors = Partial<Record<keyof FormFields, string>>;

// Get the next available Wednesday delivery date
function getEarliestDeliveryDate(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let current = new Date(today);
  const daysUntilWednesday = (3 - current.getDay() + 7) % 7;

  if (daysUntilWednesday === 0) {
    // If today is Wednesday, start from next Wednesday to give processing time
    current.setDate(current.getDate() + 7);
  } else {
    current.setDate(current.getDate() + daysUntilWednesday);
  }

  return current;
}


// Service area validation lives in src/lib/service-area.ts so both
// checkout flows and any future API route share the same list.

function validate(fields: FormFields): FormErrors {
  const errors: FormErrors = {};
  if (!fields.firstName.trim()) errors.firstName = "First name is required.";
  if (!fields.lastName.trim()) errors.lastName = "Last name is required.";
  if (!fields.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
    errors.email = "A valid email address is required.";
  }
  if (!fields.street.trim()) errors.street = "Street address is required.";
  if (!fields.city.trim()) errors.city = "City is required.";
  if (!fields.state.trim()) errors.state = "State is required.";
  if (!fields.zip.trim() || !/^\d{5}(-\d{4})?$/.test(fields.zip.trim())) {
    errors.zip = "A valid ZIP code is required.";
  } else if (!isInServiceArea(fields.state, fields.zip)) {
    errors.zip = OUT_OF_AREA_MESSAGE;
  }
  return errors;
}

export default function SubscribeDeliveryPage() {
  const params = useParams<{ product: string }>();
  const router = useRouter();
  const slug = params.product as ProductSlug;

  if (!PRODUCTS[slug]) {
    notFound();
  }

  const product = PRODUCTS[slug];

  const [fields, setFields] = useState<FormFields>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    apt: "",
    city: "",
    state: "IL",
    zip: "",
    deliveryNotes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [leadFired, setLeadFired] = useState(false);
  const [deliveryDateLabel, setDeliveryDateLabel] = useState("Wednesday");

  useEffect(() => {
    const d = getEarliestDeliveryDate();
    setDeliveryDateLabel(d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }));
  }, []);

  // Promo code persisted from the summary page; carried through every step
  // so the discount promised by the ad is visible end-to-end.
  const [promoCode, setPromoCode] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = normalizePromo(sessionStorage.getItem("unc-promo"));
      if (saved && ACTIVE_PROMOS[saved]) setPromoCode(saved);
    } catch { /* ignore */ }
  }, []);
  const activePromo = promoCode ? ACTIVE_PROMOS[promoCode] : null;
  const promoDiscount = activePromo?.appliesTo.includes("subscription")
    ? activePromo.amountOffCents / 100
    : 0;
  const firstBoxPrice = Math.max(0, product.subPrice - promoDiscount);

  // Pre-fill email from Step 1 capture (sessionStorage)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(`unc-email-${slug}`);
      if (saved && !fields.email) {
        setFields((prev) => ({ ...prev, email: saved }));
        setLeadFired(true); // Already captured at Step 1
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormFields]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  const streetInputRef = useAddressAutocomplete((address: ParsedAddress) => {
    setFields((prev) => ({
      ...prev,
      street: address.street,
      city: address.city || prev.city,
      // State is locked to IL — Chicago-only delivery. Even if the user
      // picks an out-of-state suggestion, we keep the state value pinned
      // so the validator's Chicago check fires correctly downstream.
      state: "IL",
      zip: address.zip || prev.zip,
    }));
    setErrors((prev) => ({
      ...prev,
      street: undefined,
      city: undefined,
      state: undefined,
      zip: undefined,
    }));
  });

  function handleZipBlur() {
    const zip = fields.zip.trim();
    if (!zip) return;
    if (!/^\d{5}(-\d{4})?$/.test(zip)) {
      setErrors((prev) => ({ ...prev, zip: "A valid ZIP code is required." }));
      return;
    }
    if (!isInServiceArea(fields.state, zip)) {
      setErrors((prev) => ({ ...prev, zip: OUT_OF_AREA_MESSAGE }));
    }
  }

  // Per-field blur validators. Baymard finding: inline validation as the
  // user leaves each field reduces form-abandonment vs. surfacing every
  // error at once on submit.
  function requireBlur(name: keyof FormFields, label: string) {
    return () => {
      if (!fields[name].trim()) {
        setErrors((prev) => ({ ...prev, [name]: `${label} is required.` }));
      }
    };
  }

  function handleEmailBlur() {
    const email = fields.email.trim();
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (!leadFired) {
        setLeadFired(true);
        try {
          if (typeof window !== "undefined") {
            if (window.fbq) window.fbq("track", "Lead");
            if (window.gtag) window.gtag("event", "generate_lead");
          }
        } catch {
          // Never block checkout for tracking failures
        }
      }
      // Capture email to Mailchimp for abandoned cart recovery — fire-and-forget.
      fetch("/api/capture-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, product: slug }),
      }).catch(() => {
        // Intentionally swallowed — email capture must never interrupt checkout
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate(fields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);

    // Protein add-ons are optional on every box.
    let proteinChoices: ProteinId[] | undefined;
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem(`unc-sub-proteins-${slug}`);
        if (saved) {
          const parsed = JSON.parse(saved) as ProteinId[];
          if (parsed.length > 0) proteinChoices = parsed;
        }
      } catch {
        // ignore
      }
    }

    // Auto-assign next available Wednesday
    const autoDeliveryDate = (() => {
      const date = getEarliestDeliveryDate();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })();

    // Save to localStorage for the payment page
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "unc-sub-checkout",
        JSON.stringify({
          product: slug,
          productName: product.name,
          subPrice: product.subPrice,
          email: fields.email.trim(),
          firstName: fields.firstName.trim(),
          lastName: fields.lastName.trim(),
          phone: fields.phone.trim() || undefined,
          address: {
            street: fields.street.trim(),
            apt: fields.apt.trim() || undefined,
            city: fields.city.trim(),
            state: fields.state.trim(),
            zip: fields.zip.trim(),
          },
          deliveryNotes: fields.deliveryNotes.trim() || undefined,
          deliveryDate: autoDeliveryDate,
          deliveryWindow: '5pm-8pm',
          proteinChoices: proteinChoices?.length ? proteinChoices : undefined,
        })
      );
      // Clear protein sessionStorage once saved
      sessionStorage.removeItem(`unc-sub-proteins-${slug}`);
    }

    router.push(`/subscribe/${slug}/payment`);
  }

  return (
    <section className="py-10 md:py-16 bg-muted/30 min-h-screen">
      <div className="container px-4 max-w-3xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/subscribe/${slug}`}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            &larr; Back to subscription summary
          </Link>
        </div>

        <StepIndicator current={2} />

        {/* Mobile compact header with price + promo reminder. Desktop users
            see the sticky sidebar; mobile users see nothing below the form
            until submit, which silently leaks trust on address entry.
            Sticky-top so the price anchor stays visible as the user fills
            out the form. */}
        <div className="md:hidden sticky top-0 z-30 mb-4 rounded-xl bg-background/95 backdrop-blur shadow-soft p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{product.name}</p>
            <p className="text-sm text-muted-foreground">Weekly delivery · Cancel any time</p>
          </div>
          <div className="text-right">
            {promoDiscount > 0 ? (
              <>
                <div className="text-xs line-through text-muted-foreground">${product.subPrice}</div>
                <div className="text-xl font-bold text-primary">${firstBoxPrice.toFixed(2)}</div>
                <div className="text-xs text-primary font-medium">first box</div>
              </>
            ) : (
              <>
                <div className="text-xl font-bold text-primary">${product.subPrice}</div>
                <div className="text-xs text-muted-foreground">/week</div>
              </>
            )}
          </div>
        </div>
        {activePromo && promoDiscount > 0 ? (
          <div className="md:hidden mb-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm text-primary">
            <strong>Promo {promoCode}</strong> applied — {activePromo.label}
          </div>
        ) : null}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Form */}
          <div className="md:col-span-2">
            <div className="rounded-2xl bg-background shadow-soft p-6 md:p-8">
              <h1
                className="text-xl font-bold mb-1"
                style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)" }}
              >
                Your Delivery Details
              </h1>
              <p className="text-sm text-muted-foreground mb-6">
                Where should we deliver your weekly box?
              </p>

              <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={fields.firstName}
                      onChange={handleChange}
                      onBlur={requireBlur("firstName", "First name")}
                      autoFocus
                      autoComplete="given-name"
                      placeholder="Jane"
                    />
                    {errors.firstName && (
                      <p className="text-destructive text-xs">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">
                      Last Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={fields.lastName}
                      onChange={handleChange}
                      onBlur={requireBlur("lastName", "Last name")}
                      autoComplete="family-name"
                      placeholder="Smith"
                    />
                    {errors.lastName && (
                      <p className="text-destructive text-xs">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 mb-4">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={fields.email}
                    onChange={handleChange}
                    onBlur={handleEmailBlur}
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="text-destructive text-xs">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-1.5 mb-4">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={fields.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    placeholder="(312) 555-0100"
                  />
                </div>

                {/* Stack street/apt on mobile (Baymard: multi-column inputs
                    cramp tap targets on <380px viewports). */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="street">
                      Street Address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="street"
                      name="street"
                      ref={streetInputRef}
                      value={fields.street}
                      onChange={handleChange}
                      onBlur={requireBlur("street", "Street address")}
                      autoComplete="off"
                      placeholder="Start typing your address..."
                    />
                    {errors.street && (
                      <p className="text-destructive text-xs">{errors.street}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="apt">
                      Apt / Unit <span className="text-muted-foreground font-normal">(optional)</span>
                    </Label>
                    <Input
                      id="apt"
                      name="apt"
                      value={fields.apt}
                      onChange={handleChange}
                      autoComplete="address-line2"
                      placeholder="2B"
                    />
                  </div>
                </div>

                {/* City and ZIP only — state is locked to IL because we
                    only deliver inside Chicago. Hiding the state dropdown
                    removes a 50-option distraction and reflects reality. */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="city">
                      City <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      value={fields.city}
                      onChange={handleChange}
                      onBlur={requireBlur("city", "City")}
                      autoComplete="address-level2"
                      placeholder="Chicago"
                    />
                    {errors.city && (
                      <p className="text-destructive text-xs">{errors.city}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="zip">
                      ZIP <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="zip"
                      name="zip"
                      value={fields.zip}
                      onChange={handleChange}
                      onBlur={handleZipBlur}
                      autoComplete="postal-code"
                      inputMode="numeric"
                      placeholder="60601"
                      maxLength={10}
                    />
                    {errors.zip && (
                      <p className="text-destructive text-xs">{errors.zip}</p>
                    )}
                    {errors.zip === OUT_OF_AREA_MESSAGE && (
                      <WaitlistCapture zip={fields.zip} />
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground -mt-2 mb-4">
                  Chicagoland metro. <span aria-hidden="true">·</span> South Chicago + south suburbs.
                </p>

                {/* Delivery info — Wednesday, auto-assigned */}
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-primary/5 px-4 py-2.5 text-sm text-primary border border-primary/20">
                  <span>🚚</span>
                  <span>Your first delivery: <strong>{deliveryDateLabel}</strong></span>
                </div>

                {/* Cutoff deadline */}
                <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2.5 text-sm">
                  <p className="font-semibold text-amber-800">
                    Order by Sunday 11:59 PM CT for Wednesday delivery
                  </p>
                </div>

                <div className="space-y-1.5 mb-6">
                  <Label htmlFor="deliveryNotes">Delivery Notes (optional)</Label>
                  <textarea
                    id="deliveryNotes"
                    name="deliveryNotes"
                    value={fields.deliveryNotes}
                    onChange={handleChange}
                    placeholder="Leave at front door, gate code, etc."
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  />
                </div>

                {/* Trust signals — counteract the info-entry pause. */}
                <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">🔒 Secure checkout</span>
                  <span className="flex items-center gap-1">✓ Cancel anytime</span>
                  <span className="flex items-center gap-1">📦 Fresh-guaranteed</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-primary-foreground rounded-xl h-12 px-6 text-base font-semibold hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Saving…" : `Continue to Payment · $${promoDiscount > 0 ? firstBoxPrice.toFixed(2) : product.subPrice} →`}
                </button>
              </form>
            </div>
          </div>

          {/* Order summary sidebar — hidden on mobile; compact header above
              covers the same role there. */}
          <div className="hidden md:block md:col-span-1">
            <div className="rounded-2xl bg-background shadow-soft p-5 sticky top-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Subscription Summary
              </h2>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{product.name}</span>
                <span className={`font-bold ${promoDiscount > 0 ? "text-muted-foreground line-through text-sm" : "text-primary"}`}>
                  ${product.subPrice}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">/week · cancel anytime</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span>Delivery</span>
                <span className="text-primary font-medium">FREE</span>
              </div>
              {promoDiscount > 0 && activePromo ? (
                <>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-primary font-medium">{promoCode} discount</span>
                    <span className="text-primary font-medium">−${promoDiscount}</span>
                  </div>
                  <p className="text-xs text-primary mb-3">{activePromo.label}</p>
                </>
              ) : null}
              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>{promoDiscount > 0 ? "First box" : "Weekly total"}</span>
                  <span className="text-primary">${promoDiscount > 0 ? firstBoxPrice.toFixed(2) : product.subPrice}</span>
                </div>
                {promoDiscount > 0 ? (
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>Then weekly</span>
                    <span>${product.subPrice}</span>
                  </div>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Delivered every Wednesday. Cancel anytime — no fees.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
