"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, notFound, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PRODUCTS, type ProductSlug, type ProteinId } from "@/lib/products";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ACTIVE_PROMOS, getDiscountCents, normalizePromo } from "@/lib/promo";
import { useAddressAutocomplete, type ParsedAddress } from "@/hooks/use-address-autocomplete";
import { WaitlistCapture } from "@/components/WaitlistCapture";
import { isInServiceArea, OUT_OF_AREA_MESSAGE } from "@/lib/service-area";
import { CART_ENABLED } from "@/lib/feature-flags";

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    gtag: (...args: unknown[]) => void;
  }
}

// Step indicator component
// Passive progress bar (see /checkout/[product]/page.tsx for rationale).
function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const steps = ["Order Summary", "Delivery", "Payment"];
  const total = steps.length;
  const pct = Math.round((current / total) * 100);
  return (
    <div className="mb-8 select-none">
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="font-semibold text-foreground">
          Step {current} of {total}: {steps[current - 1]}
        </span>
        <span className="text-muted-foreground">{pct}%</span>
      </div>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
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

export default function DeliveryPage() {
  const params = useParams<{ product: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.product as ProductSlug;

  useEffect(() => {
    if (!CART_ENABLED) return;
    const promo = searchParams?.get("promo");
    router.replace(promo ? `/shop?promo=${encodeURIComponent(promo)}` : "/shop");
  }, [router, searchParams]);

  if (CART_ENABLED) return null;

  if (!PRODUCTS[slug]) {
    notFound();
  }

  const product = PRODUCTS[slug];

  // Effective price (may include protein add-ons stored by the summary page)
  const [displayPrice, setDisplayPrice] = useState<number>(product.price);
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(`unc-price-${slug}`);
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed > 0) setDisplayPrice(parsed);
      }
    } catch {
      // ignore
    }
  }, [slug]);

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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [leadFired, setLeadFired] = useState(false);
  const [deliveryDateLabel, setDeliveryDateLabel] = useState("Wednesday");

  useEffect(() => {
    const d = getEarliestDeliveryDate();
    setDeliveryDateLabel(d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }));
  }, []);

  // Promo code persisted from the summary page; shown here so the user sees
  // the discount they were promised by the ad through every step.
  const [promoCode, setPromoCode] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = normalizePromo(sessionStorage.getItem("unc-promo"));
      if (saved && ACTIVE_PROMOS[saved]) setPromoCode(saved);
    } catch { /* ignore */ }
  }, []);
  const activePromo = promoCode ? ACTIVE_PROMOS[promoCode] : null;
  const promoDiscount = activePromo && activePromo.appliesTo.includes("one-time")
    ? getDiscountCents(activePromo, Math.round(product.price * 100)) / 100
    : 0;

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
    // Clear field error on change
    if (errors[name as keyof FormFields]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  const streetInputRef = useAddressAutocomplete((address: ParsedAddress) => {
    setFields((prev) => ({
      ...prev,
      street: address.street,
      city: address.city || prev.city,
      state: address.state || prev.state,
      zip: address.zip || prev.zip,
    }));
    // Clear address-related errors when autocomplete fills fields
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

  // Per-field blur validators — see subscribe/delivery for rationale.
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
      // Fire pixel events (non-blocking, ignore errors)
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

      // Capture email immediately to Mailchimp — fire-and-forget.
      // This ensures abandoned cart recovery works even if the user never
      // submits the delivery form. Non-blocking: never delays or breaks checkout.
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
    setSubmitError(null);

    // Protein add-ons are optional on every box.
    let proteinChoices: ProteinId[] | undefined;
    let additionalProteinChoices: ProteinId[] | undefined;
    let beanChoice: string | undefined;
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem(`unc-proteins-${slug}`);
        if (saved) {
          const parsed = JSON.parse(saved) as ProteinId[];
          if (parsed.length > 0) proteinChoices = parsed;
        }
        const savedAdditional = sessionStorage.getItem(`unc-additional-proteins-${slug}`);
        if (savedAdditional) {
          const parsed = JSON.parse(savedAdditional) as ProteinId[];
          if (parsed.length > 0) additionalProteinChoices = parsed;
        }
        // Bean choice — every box. Default to "black" if missing.
        const savedBean = sessionStorage.getItem(`unc-bean-${slug}`);
        beanChoice = (savedBean === "pinto" || savedBean === "kidney") ? savedBean : "black";
      } catch {
        // ignore
      }
    }

    // Read effective price (may include protein add-ons stored by the summary page)
    let effectivePrice: number = product.price;
    try {
      const storedPrice = sessionStorage.getItem(`unc-price-${slug}`);
      if (storedPrice) {
        const parsed = parseInt(storedPrice, 10);
        if (!isNaN(parsed) && parsed > 0) effectivePrice = parsed;
      }
    } catch {
      // ignore
    }

    // Auto-assign next available Wednesday delivery date and default window
    const autoDeliveryDate = (() => {
      const date = getEarliestDeliveryDate();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })();
    const autoDeliveryWindow = '5pm-8pm';

    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: slug,
          price: effectivePrice,
          productName: product.name,
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
          deliveryWindow: autoDeliveryWindow,
          proteinChoices: proteinChoices?.length ? proteinChoices : undefined,
          additionalProteinChoices: additionalProteinChoices?.length ? additionalProteinChoices : undefined,
          beanChoice,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Something went wrong. Please try again.");
        return;
      }

      // Persist to localStorage for payment page
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "unc-checkout",
          JSON.stringify({
            sessionId: data.sessionId,
            product: slug,
            productName: product.name,
            price: effectivePrice,
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
            deliveryWindow: autoDeliveryWindow,
            proteinChoices: proteinChoices?.length ? proteinChoices : undefined,
            additionalProteinChoices: additionalProteinChoices?.length ? additionalProteinChoices : undefined,
            beanChoice,
          })
        );
        // Clear protein + bean sessionStorage once saved
        sessionStorage.removeItem(`unc-proteins-${slug}`);
        sessionStorage.removeItem(`unc-additional-proteins-${slug}`);
        sessionStorage.removeItem(`unc-bean-${slug}`);
      }

      router.push(`/checkout/${slug}/payment`);
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="py-10 md:py-16 bg-muted/30 min-h-screen">
      <div className="container px-4 max-w-3xl mx-auto">
        {/* Back link */}
        <div className="mb-6">
          <Link
            href={`/checkout/${slug}`}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            &larr; Back to order summary
          </Link>
        </div>

        <StepIndicator current={2} />

        {/* Mobile-only compact order + promo header. Desktop users already
            see the sticky sidebar with the same info. Without this, mobile
            users fill the form with no visible reminder of what they're
            buying or how much it costs — a silent trust leak. */}
        <div className="md:hidden sticky top-0 z-30 mb-4 rounded-xl bg-background/95 backdrop-blur shadow-soft p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {product.name}
            </p>
            <p className="text-sm text-muted-foreground">Delivered Wednesdays</p>
          </div>
          <div className="text-right">
            {promoDiscount > 0 ? (
              <>
                <div className="text-xs line-through text-muted-foreground">${displayPrice}</div>
                <div className="text-xl font-bold text-primary">${Math.max(0, displayPrice - promoDiscount)}</div>
              </>
            ) : (
              <div className="text-xl font-bold text-primary">${displayPrice}</div>
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
                Delivery Details
              </h1>
              <p className="text-sm text-muted-foreground mb-6">
                Where should we deliver your box?
              </p>

              <form onSubmit={handleSubmit} noValidate>
                {/* Name row */}
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

                {/* Email */}
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

                {/* Phone — marked optional explicitly. Previously this
                    rendered as "Phone" with no optional marker, and users
                    mistook it for required next to the other labeled
                    required fields. */}
                <div className="space-y-1.5 mb-4">
                  <Label htmlFor="phone">
                    Phone <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <p className="text-xs text-muted-foreground -mt-1">Helps with delivery coordination.</p>
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

                {/* Street + Apt — stacked on mobile. */}
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

                {/* City + ZIP. ZIP validation is currently open to any 5-digit US ZIP. */}
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
                  Outside the Chicago metro area? We&apos;ll reach out to confirm a delivery window before charging.
                </p>

                {/* Delivery info — Wednesday, auto-assigned */}
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-primary/5 px-4 py-2.5 text-sm text-primary border border-primary/20">
                  <span>🚚</span>
                  <span>Your next delivery: <strong>{deliveryDateLabel}</strong></span>
                </div>

                {/* Cutoff deadline */}
                <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2.5 text-sm">
                  <p className="font-semibold text-amber-800">
                    Order by Sunday 11:59 PM CT for Wednesday delivery
                  </p>
                </div>

                {/* Delivery notes */}
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

                {submitError && (
                  <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    {submitError}
                  </div>
                )}

                {/* Trust signals — counteract the "am I safe to give this info"
                    pause that users take on address/phone fields. Cheap lift
                    on mobile where social proof from the summary page scrolls
                    off-screen. */}
                <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">🔒 Secure checkout</span>
                  <span className="flex items-center gap-1">✓ No subscription lock-in</span>
                  <span className="flex items-center gap-1">📦 Fresh-guaranteed</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-primary-foreground rounded-xl h-12 px-6 text-base font-semibold hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Saving…" : `Continue to Payment · $${promoDiscount > 0 ? Math.max(0, displayPrice - promoDiscount) : displayPrice} →`}
                </button>
              </form>
            </div>
          </div>

          {/* Order summary sidebar — hidden on mobile where the compact
              header above serves the same purpose. */}
          <div className="hidden md:block md:col-span-1">
            <div className="rounded-2xl bg-background shadow-soft p-5 sticky top-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Order Summary
              </h2>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{product.name}</span>
                <span className={`font-bold ${promoDiscount > 0 ? "text-muted-foreground line-through text-sm" : "text-primary"}`}>
                  ${displayPrice}
                </span>
              </div>
              {promoDiscount > 0 && activePromo ? (
                <>
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="text-primary font-medium">{promoCode} discount</span>
                    <span className="text-primary font-medium">−${promoDiscount}</span>
                  </div>
                  <p className="text-xs text-primary mb-2">{activePromo.label}</p>
                </>
              ) : null}
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span>Delivery</span>
                <span className="text-primary font-medium">FREE</span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>Total</span>
                  <span className="text-primary">${Math.max(0, displayPrice - promoDiscount)}.00</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Delivered every Wednesday. No subscription — order when you want.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
