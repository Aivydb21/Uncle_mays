"use client";

import { useState, useEffect } from "react";
import { useParams, notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { PRODUCTS, type ProductSlug, type ProteinId } from "@/lib/products";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    gtag: (...args: unknown[]) => void;
  }
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
  deliveryDate: string;
  deliveryWindow: string;
}

type FormErrors = Partial<Record<keyof FormFields, string>>;

// Check if a date is a Wednesday
function isWednesday(date: Date): boolean {
  return date.getDay() === 3; // 0 = Sunday, 3 = Wednesday
}

// Get the earliest selectable delivery date (next Wednesday)
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

// Check if a date is a valid delivery date
function isValidDeliveryDate(date: Date): boolean {
  const earliest = getEarliestDeliveryDate();
  const maxDate = new Date(earliest);
  maxDate.setDate(maxDate.getDate() + (8 * 7)); // 8 weeks out

  const dateTime = date.getTime();
  return (
    isWednesday(date) &&
    dateTime >= earliest.getTime() &&
    dateTime <= maxDate.getTime()
  );
}

// Generate next 4 available Wednesday delivery dates
function getAvailableDeliveryDates(): Array<{ value: string; label: string }> {
  const dates: Array<{ value: string; label: string }> = [];
  const firstWednesday = getEarliestDeliveryDate();

  for (let i = 0; i < 4; i++) {
    const date = new Date(firstWednesday);
    date.setDate(date.getDate() + (i * 7)); // Add weeks

    // Use local date components to avoid timezone conversion issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const label = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });

    dates.push({ value: dateStr, label });
  }

  return dates;
}

const TIME_WINDOWS = [
  { id: '9am-12pm', label: '9:00 AM - 12:00 PM' },
  { id: '12pm-3pm', label: '12:00 PM - 3:00 PM' },
  { id: '3pm-6pm', label: '3:00 PM - 6:00 PM' },
  { id: '6pm-9pm', label: '6:00 PM - 9:00 PM' },
];

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
  }
  if (!fields.deliveryDate) errors.deliveryDate = "Please select a delivery date.";
  if (!fields.deliveryWindow) errors.deliveryWindow = "Please select a delivery time window.";
  return errors;
}

export default function DeliveryPage() {
  const params = useParams<{ product: string }>();
  const router = useRouter();
  const slug = params.product as ProductSlug;

  if (!PRODUCTS[slug]) {
    notFound();
  }

  const product = PRODUCTS[slug];

  // Effective price (may include first-order discount set by order summary page)
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
    deliveryDate: "",
    deliveryWindow: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [leadFired, setLeadFired] = useState(false);

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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name as keyof FormFields]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
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

    // Read protein choices for family/community boxes
    let proteinChoices: ProteinId[] | undefined;
    let additionalProteinChoices: ProteinId[] | undefined;
    if (product.proteinCount > 0 && typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem(`unc-proteins-${slug}`);
        if (saved) {
          proteinChoices = JSON.parse(saved) as ProteinId[];
        }
        const savedAdditional = sessionStorage.getItem(`unc-additional-proteins-${slug}`);
        if (savedAdditional) {
          additionalProteinChoices = JSON.parse(savedAdditional) as ProteinId[];
        }
      } catch {
        // ignore
      }
    }

    // Read effective price (may include first-order discount set by order summary page)
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
          deliveryDate: fields.deliveryDate,
          deliveryWindow: fields.deliveryWindow,
          proteinChoices: proteinChoices?.length ? proteinChoices : undefined,
          additionalProteinChoices: additionalProteinChoices?.length ? additionalProteinChoices : undefined,
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
            deliveryDate: fields.deliveryDate,
            deliveryWindow: fields.deliveryWindow,
            proteinChoices: proteinChoices?.length ? proteinChoices : undefined,
            additionalProteinChoices: additionalProteinChoices?.length ? additionalProteinChoices : undefined,
          })
        );
        // Clear protein sessionStorage once saved
        sessionStorage.removeItem(`unc-proteins-${slug}`);
        sessionStorage.removeItem(`unc-additional-proteins-${slug}`);
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

                {/* Phone */}
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

                {/* Street + Apt */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="street">
                      Street Address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="street"
                      name="street"
                      value={fields.street}
                      onChange={handleChange}
                      autoComplete="street-address"
                      placeholder="123 Main St"
                    />
                    {errors.street && (
                      <p className="text-destructive text-xs">{errors.street}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="apt">Apt / Unit</Label>
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

                {/* City, State, ZIP */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="city">
                      City <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      value={fields.city}
                      onChange={handleChange}
                      autoComplete="address-level2"
                      placeholder="Chicago"
                    />
                    {errors.city && (
                      <p className="text-destructive text-xs">{errors.city}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="state">
                      State <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="state"
                      name="state"
                      value={fields.state}
                      onChange={handleChange}
                      autoComplete="address-level1"
                      placeholder="IL"
                      maxLength={2}
                    />
                    {errors.state && (
                      <p className="text-destructive text-xs">{errors.state}</p>
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
                      autoComplete="postal-code"
                      placeholder="60601"
                      maxLength={10}
                    />
                    {errors.zip && (
                      <p className="text-destructive text-xs">{errors.zip}</p>
                    )}
                  </div>
                </div>

                {/* Delivery Date Selection */}
                <div className="mb-6 p-4 rounded-xl border border-border bg-muted/30">
                  <Label htmlFor="deliveryDate" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
                    Choose Your Delivery Date <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    We deliver every Wednesday. Select your preferred date:
                  </p>
                  <select
                    id="deliveryDate"
                    name="deliveryDate"
                    value={fields.deliveryDate}
                    onChange={(e) => {
                      setFields((prev) => ({ ...prev, deliveryDate: e.target.value }));
                      if (errors.deliveryDate) {
                        setErrors((prev) => ({ ...prev, deliveryDate: undefined }));
                      }
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select a delivery date...</option>
                    {getAvailableDeliveryDates().map((date) => (
                      <option key={date.value} value={date.value}>
                        {date.label}
                      </option>
                    ))}
                  </select>
                  {errors.deliveryDate && (
                    <p className="text-destructive text-xs mt-2">{errors.deliveryDate}</p>
                  )}
                </div>

                {/* Delivery Time Window Selection */}
                <div className="mb-6 p-4 rounded-xl border border-border bg-muted/30">
                  <Label className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
                    Choose Your Delivery Window <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Select a 3-hour delivery window
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {TIME_WINDOWS.map((window) => {
                      const selected = fields.deliveryWindow === window.id;
                      return (
                        <button
                          key={window.id}
                          type="button"
                          onClick={() => {
                            setFields((prev) => ({ ...prev, deliveryWindow: window.id }));
                            if (errors.deliveryWindow) {
                              setErrors((prev) => ({ ...prev, deliveryWindow: undefined }));
                            }
                          }}
                          className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                            selected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-primary/5"
                          }`}
                        >
                          {window.label}
                        </button>
                      );
                    })}
                  </div>
                  {errors.deliveryWindow && (
                    <p className="text-destructive text-xs mt-2">{errors.deliveryWindow}</p>
                  )}
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

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-primary-foreground rounded-xl h-12 px-6 text-base font-semibold hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Saving…" : "Continue to Payment →"}
                </button>
              </form>
            </div>
          </div>

          {/* Order summary sidebar */}
          <div className="md:col-span-1">
            <div className="rounded-2xl bg-background shadow-soft p-5 sticky top-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Order Summary
              </h2>
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-sm">{product.name}</span>
                <span className="font-bold text-primary">${displayPrice}</span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>Total</span>
                  <span className="text-primary">${displayPrice}.00</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Delivered this Wednesday. No subscription — order when you want.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
