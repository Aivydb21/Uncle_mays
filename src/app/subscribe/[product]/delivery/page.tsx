"use client";

import { useState } from "react";
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormFields]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleEmailBlur() {
    if (
      !leadFired &&
      fields.email.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())
    ) {
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
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate(fields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);

    // Read protein choices from sessionStorage
    let proteinChoices: ProteinId[] | undefined;
    if (product.proteinCount > 0 && typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem(`unc-sub-proteins-${slug}`);
        if (saved) {
          proteinChoices = JSON.parse(saved) as ProteinId[];
        }
      } catch {
        // ignore
      }
    }

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
                Subscription Summary
              </h2>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{product.name}</span>
                <span className="font-bold text-primary">${product.subPrice}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">/week · cancel anytime</p>
              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>Weekly total</span>
                  <span className="text-primary">${product.subPrice}</span>
                </div>
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
