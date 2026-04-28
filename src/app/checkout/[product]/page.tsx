"use client";

import { useParams, notFound } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { PRODUCTS, PROTEIN_OPTIONS, PROTEIN_TAGLINE, BEAN_OPTIONS, DEFAULT_BEAN, type ProductSlug, type ProteinId, type BeanId } from "@/lib/products";
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

// 2-step indicator: Order Details -> Payment
function StepIndicator({ current }: { current: 1 | 2 }) {
  const steps = ["Order Details", "Payment"];
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

function getEarliestDeliveryDate(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let current = new Date(today);
  const daysUntilWednesday = (3 - current.getDay() + 7) % 7;
  if (daysUntilWednesday === 0) {
    current.setDate(current.getDate() + 7);
  } else {
    current.setDate(current.getDate() + daysUntilWednesday);
  }
  return current;
}

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

export default function CheckoutPage() {
  const params = useParams<{ product: string }>();
  const router = useRouter();
  const slug = params.product as ProductSlug;

  if (!PRODUCTS[slug]) {
    notFound();
  }

  const product = PRODUCTS[slug];
  const basePrice = product.price;

  // Protein add-ons: optional, multi-select, collapsed by default.
  const [selectedProteins, setSelectedProteins] = useState<ProteinId[]>([]);
  const [showProteinAddOns, setShowProteinAddOns] = useState(false);

  // Bean choice: Full Harvest Box only.
  const isFullHarvest = slug === "family";
  const [selectedBean, setSelectedBean] = useState<BeanId>(DEFAULT_BEAN);

  // Promo code
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

  // Fire Meta Pixel ViewContent + server CAPI.
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

  // Restore prior protein/bean selections from sessionStorage.
  useEffect(() => {
    try {
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
  const discountedTotal = Math.max(0, totalPrice - promoDiscount);

  // --- Delivery form state ---
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

  // Disclosure state for optional fields — collapsed by default to shorten
  // the form visually. Auto-expand if a value is rehydrated from storage.
  const [showPhone, setShowPhone] = useState(false);
  const [showApt, setShowApt] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);
  // After Google Places autocomplete fills street/city/state/zip we collapse
  // city + zip into a single confirmation chip. User can click "Change" to
  // re-expose the inputs (e.g. fix a wrong autocomplete pick).
  const [addressConfirmed, setAddressConfirmed] = useState(false);

  const formStorageKey = `unc-checkout-form-${slug}`;

  // Rehydrate the form from localStorage so users who leave and come back
  // do not have to retype everything. Per-slug key so spring vs family
  // do not stomp each other.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(formStorageKey);
      if (!saved) return;
      const parsed = JSON.parse(saved) as Partial<FormFields>;
      setFields((prev) => ({ ...prev, ...parsed }));
      if (parsed.phone) setShowPhone(true);
      if (parsed.apt) setShowApt(true);
      if (parsed.deliveryNotes) setShowNotes(true);
      if (parsed.city && parsed.zip) setAddressConfirmed(true);
    } catch {
      // ignore corrupt storage
    }
  }, [formStorageKey]);

  // Persist on every change so we never lose more than the last keystroke.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(formStorageKey, JSON.stringify(fields));
    } catch {
      // ignore quota / private mode
    }
  }, [fields, formStorageKey]);

  useEffect(() => {
    const d = getEarliestDeliveryDate();
    setDeliveryDateLabel(d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }));
  }, []);

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
      state: address.state || prev.state,
      zip: address.zip || prev.zip,
    }));
    setErrors((prev) => ({
      ...prev,
      street: undefined,
      city: undefined,
      state: undefined,
      zip: undefined,
    }));
    setAddressConfirmed(true);
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
      fetch("/api/capture-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, product: slug }),
      }).catch(() => {});
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

    // Fire AddToCart pixel
    try {
      if (window.fbq) {
        window.fbq("track", "AddToCart", {
          content_name: product.name,
          content_ids: [slug],
          content_type: "product",
          value: totalPrice,
          currency: "USD",
          num_items: 1,
        });
      }
    } catch { /* ignore */ }

    let beanChoice: string | undefined;
    if (isFullHarvest) {
      beanChoice = (selectedBean === "pinto" || selectedBean === "kidney") ? selectedBean : "black";
    }

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
          price: totalPrice,
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
          proteinChoices: selectedProteins.length > 0 ? selectedProteins : undefined,
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
            price: totalPrice,
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
            proteinChoices: selectedProteins.length > 0 ? selectedProteins : undefined,
            beanChoice,
          })
        );
        sessionStorage.removeItem(`unc-proteins-${slug}`);
        sessionStorage.removeItem(`unc-bean-${slug}`);
        localStorage.removeItem(formStorageKey);
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
            href="/#boxes"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            &larr; Back to boxes
          </Link>
        </div>

        <StepIndicator current={1} />

        {/* Promo chip */}
        {activePromo && promoDiscount > 0 ? (
          <div className="mb-4 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
            <strong>{promoCode}</strong> applied · {activePromo.label}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Main content: product summary + delivery form */}
            <div className="md:col-span-2 space-y-6">
              {/* Product summary card */}
              <div className="rounded-2xl overflow-hidden shadow-soft bg-background">
                {/* Product image */}
                <div className="relative pointer-events-none select-none">
                  <img
                    src="/images/produce-box.jpg"
                    alt={`${product.name} -- fresh seasonal produce`}
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

                  {/* What's in the box */}
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
                              {isIncluded ? "\u2605" : "\u2713"}
                            </span>
                            <span className={isIncluded ? "font-semibold text-foreground" : ""}>{item}</span>
                          </li>
                        );
                      })}
                    </ul>
                    <p className="mt-3 text-xs text-muted-foreground italic">{product.weightEstimate}</p>
                  </div>

                  {/* Bean choice: Full Harvest Box only */}
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

                  {/* Optional protein add-on */}
                  <div className="rounded-xl border border-border bg-muted/30 overflow-hidden">
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
                        {PROTEIN_OPTIONS.filter((o) => !(isFullHarvest && o.id === "chicken")).map((opt) => {
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
                </div>
              </div>

              {/* Delivery details card */}
              <div className="rounded-2xl bg-background shadow-soft p-6 md:p-8">
                <h2
                  className="text-xl font-bold mb-1"
                  style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)" }}
                >
                  Delivery Details
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Where should we deliver your box?
                </p>

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

                {/* Phone — collapsed by default */}
                {showPhone ? (
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
                      autoFocus
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowPhone(true)}
                    className="text-sm text-primary hover:underline mb-4"
                  >
                    + Add phone (helps with delivery)
                  </button>
                )}

                {/* Street (full width). Apt/Unit collapsed by default. */}
                <div className="space-y-1.5 mb-4">
                  <Label htmlFor="street">
                    Street Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="street"
                    name="street"
                    ref={streetInputRef}
                    value={fields.street}
                    onChange={(e) => {
                      handleChange(e);
                      // User edited street manually — re-expose city/zip in case
                      // they need to fix the autocompleted values.
                      if (addressConfirmed) setAddressConfirmed(false);
                    }}
                    onBlur={requireBlur("street", "Street address")}
                    autoComplete="off"
                    placeholder="Start typing your address..."
                  />
                  {errors.street && (
                    <p className="text-destructive text-xs">{errors.street}</p>
                  )}
                </div>
                {showApt ? (
                  <div className="space-y-1.5 mb-4">
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
                      autoFocus
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowApt(true)}
                    className="text-sm text-primary hover:underline mb-4 block"
                  >
                    + Add apt or unit
                  </button>
                )}

                {/* City + ZIP. After Google Places autocomplete fills these,
                    collapse to a confirmation chip with a Change link. */}
                {addressConfirmed && fields.city && fields.zip && !errors.city && !errors.zip ? (
                  <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
                    <span className="text-foreground/80">
                      <span aria-hidden="true">&#x1F4CD;</span> {fields.city}
                      {fields.state ? `, ${fields.state}` : ""}{" "}
                      {fields.zip}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAddressConfirmed(false)}
                      className="text-primary hover:underline text-xs font-medium"
                    >
                      Change
                    </button>
                  </div>
                ) : (
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
                )}

                {/* Delivery info */}
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-primary/5 px-4 py-2.5 text-sm text-primary border border-primary/20">
                  <span>&#x1F69A;</span>
                  <span>Your next delivery: <strong>{deliveryDateLabel}</strong></span>
                </div>

                {/* Delivery notes — collapsed by default */}
                {showNotes ? (
                  <div className="space-y-1.5 mb-4">
                    <Label htmlFor="deliveryNotes">Delivery instructions (optional)</Label>
                    <textarea
                      id="deliveryNotes"
                      name="deliveryNotes"
                      value={fields.deliveryNotes}
                      onChange={handleChange}
                      placeholder="Leave at front door, gate code, etc."
                      rows={3}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      autoFocus
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowNotes(true)}
                    className="text-sm text-primary hover:underline mb-4 block"
                  >
                    + Delivery instructions
                  </button>
                )}

                {/* Promo code — collapsed by default. Auto-applies via ?promo= URL,
                    so the input is only needed for typed codes. */}
                {!promoCode && showPromoInput ? (
                  <div className="mb-4">
                    <Label htmlFor="promo" className="text-sm font-semibold mb-2 block">
                      Promo code
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
                        autoFocus
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
                  </div>
                ) : !promoCode ? (
                  <button
                    type="button"
                    onClick={() => setShowPromoInput(true)}
                    className="text-sm text-primary hover:underline mb-4 block"
                  >
                    + Have a promo code?
                  </button>
                ) : null}

                {submitError && (
                  <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    {submitError}
                  </div>
                )}

                {/* Trust signals */}
                <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">&#x1F512; Secure checkout</span>
                  <span className="flex items-center gap-1">&#x2713; No subscription lock-in</span>
                  <span className="flex items-center gap-1">&#x1F4E6; Fresh-guaranteed</span>
                </div>
                <p className="mb-4 text-xs text-muted-foreground italic">
                  This will take 30 seconds.
                </p>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-primary-foreground rounded-xl h-12 px-6 text-base font-semibold hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Saving\u2026" : `Continue to Payment \u00b7 $${discountedTotal} \u2192`}
                </button>
              </div>
            </div>

            {/* Order summary sidebar (desktop only) */}
            <div className="hidden md:block md:col-span-1">
              <div className="rounded-2xl bg-background shadow-soft p-5 sticky top-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Order Summary
                </h2>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{product.name}</span>
                  <span className="font-bold text-primary">${basePrice}</span>
                </div>
                {proteinCost > 0 ? (
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="text-foreground/70">Protein add-ons</span>
                    <span className="font-medium">+${proteinCost}</span>
                  </div>
                ) : null}
                {promoDiscount > 0 && activePromo ? (
                  <>
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="text-primary font-medium">{promoCode} discount</span>
                      <span className="text-primary font-medium">&minus;${promoDiscount}</span>
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
                    <span className="text-primary">${discountedTotal}.00</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  No subscription. Order when you want.
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Spacer for sticky mobile CTA */}
        <div className="h-20 md:hidden" />
      </div>

      {/* Sticky mobile CTA */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-border px-4 py-3 shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.08)]">
        <button
          type="button"
          onClick={() => {
            const form = document.querySelector("form");
            if (form) form.requestSubmit();
          }}
          disabled={submitting}
          className="w-full bg-primary text-primary-foreground rounded-xl h-12 px-6 text-base font-semibold hover:bg-primary/90 transition-colors shadow-soft flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span>Continue to Payment</span>
          <span className="font-normal opacity-80">&middot; ${discountedTotal}</span>
        </button>
      </div>
    </section>
  );
}
