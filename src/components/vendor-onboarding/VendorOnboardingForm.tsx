"use client";

import { useState } from "react";

// Multi-section form for vendor self-onboarding. Posts to
// /api/vendor-onboarding which writes a row to the Suppliers table in
// Airtable, fires a branded thank-you email via Resend, and sends an
// internal alert to anthony@unclemays.com.

const US_STATES = [
  "AL","AR","AZ","CA","CO","CT","DC","DE","FL","GA","HI","IA","IL","IN","KS","KY","LA",
  "MA","MD","ME","MI","MN","MO","MS","NC","NE","NH","NJ","NM","NY","OH","OK","OR","PA",
  "RI","SC","TN","TX","VA","VT","WA","WI","WV","WY",
];

// Mirror the Airtable Suppliers.Category multipleSelects options exactly so
// values pass the schema. Order is the shopper-frequency order, not alpha.
const CATEGORIES = [
  "Produce",
  "Meat & Seafood",
  "Dairy",
  "Eggs",
  "Pantry",
  "Spices, Sauces & Condiments",
  "Baking & Bread Ingredients",
  "Grains & Starches",
  "Snacks",
  "Beverages",
  "Frozen Foods",
  "Prepared Foods",
  "Canned Goods",
  "Honey & Bees",
  "Mushrooms",
  "Floral & Plants",
  "Personal Care",
  "Health & Wellness",
  "International",
  "Candy",
  "Gift Sets",
  "Kitchen Utensils",
];

const SUPPLIER_TYPES = ["Farm", "Vendor", "Both", "Other"] as const;

const BLACK_OWNED_ANSWERS = ["Yes", "No", "Prefer not to say"] as const;

const CADENCES = [
  "On-demand (each order)",
  "Daily",
  "Weekly",
  "Biweekly",
  "Monthly",
] as const;

const PAYMENT_TERMS = [
  "Prepaid",
  "Net-7",
  "Net-15",
  "Net-30",
  "Net-60",
  "Cash on delivery",
  "Other - see notes",
] as const;

const CERTIFICATIONS = ["GAP", "PSA", "Other", "No Certification"] as const;

const TRANSPORTATION_METHODS = [
  "They ship to us (they pay freight)",
  "They ship to us (we pay freight)",
  "We pick up at their location",
  "They deliver to Chicago (own truck)",
  "Drop-ship direct to customer",
] as const;

const SEASONALITY_OPTIONS = ["Year-round", "Seasonal"] as const;

const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",
] as const;

export interface VendorOnboardingFormState {
  businessName: string;
  blackOwnedStatus: (typeof BLACK_OWNED_ANSWERS)[number] | "";
  supplierType: (typeof SUPPLIER_TYPES)[number] | "";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  website: string;
  categories: string[];
  productsOffered: string;
  certifications: string[];
  seasonality: (typeof SEASONALITY_OPTIONS)[number] | "";
  seasonMonths: string[];
  leadTimeDays: string;
  orderBatchingCadence: (typeof CADENCES)[number] | "";
  minOrderQty: string;
  coldChainRequired: boolean;
  dropShipCapable: boolean;
  retailPricePerUnit: string;
  caseSize: string;
  caseWholesalePrice: string;
  pricingNegotiable: boolean;
  wholesalePricingNotes: string;
  paymentTerms: (typeof PAYMENT_TERMS)[number] | "";
  scaleCapacityNotes: string;
  sampleAvailable: boolean;
  transportationMethods: string[];
  pickupAddress: string;
  transportationNotes: string;
  additionalNotes: string;
}

const INITIAL_STATE: VendorOnboardingFormState = {
  businessName: "",
  blackOwnedStatus: "",
  supplierType: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  website: "",
  categories: [],
  productsOffered: "",
  certifications: [],
  seasonality: "",
  seasonMonths: [],
  leadTimeDays: "",
  orderBatchingCadence: "",
  minOrderQty: "",
  coldChainRequired: false,
  dropShipCapable: false,
  retailPricePerUnit: "",
  caseSize: "",
  caseWholesalePrice: "",
  pricingNegotiable: false,
  wholesalePricingNotes: "",
  paymentTerms: "",
  scaleCapacityNotes: "",
  sampleAvailable: false,
  transportationMethods: [],
  pickupAddress: "",
  transportationNotes: "",
  additionalNotes: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function VendorOnboardingForm() {
  const [form, setForm] = useState<VendorOnboardingFormState>(INITIAL_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof VendorOnboardingFormState>(
    key: K,
    value: VendorOnboardingFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleArrayValue(
    key: "categories" | "certifications" | "transportationMethods" | "seasonMonths",
    value: string
  ) {
    setForm((prev) => {
      const current = prev[key];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  }

  function validate(): string | null {
    if (!form.businessName.trim()) return "Business name is required.";
    if (!form.blackOwnedStatus) return "Tell us whether your business is Black-owned.";
    if (!form.supplierType) return "Pick what kind of business you are.";
    if (!form.firstName.trim()) return "First name is required.";
    if (!form.lastName.trim()) return "Last name is required.";
    if (!EMAIL_RE.test(form.email.trim())) return "Enter a valid email.";
    if (!form.city.trim()) return "City is required.";
    if (!form.state) return "State is required.";
    if (form.categories.length === 0)
      return "Pick at least one product category.";
    if (!form.productsOffered.trim())
      return "Tell us about the products you want us to consider.";
    if (!form.seasonality) return "Tell us if your products are year-round or seasonal.";
    if (form.seasonality === "Seasonal" && form.seasonMonths.length === 0)
      return "Pick the months when your seasonal products are available.";
    if (!form.leadTimeDays.trim() || Number.isNaN(Number(form.leadTimeDays)))
      return "Lead time in business days is required (a number).";
    if (!form.orderBatchingCadence) return "Pick an order batching cadence.";
    if (!form.minOrderQty.trim()) return "Minimum order quantity is required.";
    if (!form.caseSize.trim()) return "Tell us your case or pack size.";
    if (!form.caseWholesalePrice.trim() || Number.isNaN(Number(form.caseWholesalePrice)))
      return "Wholesale price per case is required (a number, in dollars).";
    if (!form.wholesalePricingNotes.trim())
      return "Tell us about your wholesale pricing tiers.";
    if (!form.paymentTerms) return "Pick a payment term you accept.";
    if (!form.scaleCapacityNotes.trim())
      return "Tell us about your scale capacity.";
    if (form.transportationMethods.length === 0)
      return "Pick at least one way you can get product to us.";
    if (
      form.transportationMethods.includes("We pick up at their location") &&
      !form.pickupAddress.trim()
    )
      return "Pickup address is required when we pick up at your location.";
    return null;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      // Scroll to top so the customer sees the error.
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/vendor-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setSubmitted(true);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(
        `We couldn't submit your application: ${msg}. Try again, or email anthony@unclemays.com directly.`
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
        <h2 className="text-2xl font-bold text-foreground">Thanks for sending this through.</h2>
        <p className="mt-3 text-base text-muted-foreground">
          We review every submission within 5 business days. If you&rsquo;re a
          fit for our launch wave, you&rsquo;ll hear from Anthony or Zoe with a
          next step &mdash; usually that&rsquo;s a small sample order so we can
          photograph your product and add it to the catalog.
        </p>
        <p className="mt-3 text-base text-muted-foreground">
          If we&rsquo;re not a fit right now, we&rsquo;ll tell you that directly so you can
          move on. We keep your profile on file either way.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Questions: <a className="font-semibold text-primary hover:underline" href="mailto:anthony@unclemays.com">anthony@unclemays.com</a> &middot; (312)&nbsp;972-2595
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-10" noValidate>
      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <Section title="Business basics" subtitle="Who you are and how to reach you.">
        <Field label="Business name" required>
          <input
            type="text"
            required
            value={form.businessName}
            onChange={(e) => set("businessName", e.target.value)}
            className={INPUT_CLS}
          />
        </Field>

        <Field
          label="Are you a Black-owned business?"
          required
          help="We surface a Black-owned badge on the site for verified suppliers. Your answer is optional to be made public."
        >
          <div className="flex flex-wrap gap-2">
            {BLACK_OWNED_ANSWERS.map((a) => (
              <label
                key={a}
                className={`inline-flex h-9 cursor-pointer items-center rounded-full border px-3 text-sm font-semibold transition-colors ${
                  form.blackOwnedStatus === a
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary/50"
                }`}
              >
                <input
                  type="radio"
                  name="blackOwnedStatus"
                  value={a}
                  className="sr-only"
                  checked={form.blackOwnedStatus === a}
                  onChange={() => set("blackOwnedStatus", a)}
                />
                {a}
              </label>
            ))}
          </div>
        </Field>

        <Field label="What kind of business are you?" required>
          <div className="flex flex-wrap gap-2">
            {SUPPLIER_TYPES.map((t) => (
              <label
                key={t}
                className={`inline-flex h-9 cursor-pointer items-center rounded-full border px-3 text-sm font-semibold transition-colors ${
                  form.supplierType === t
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary/50"
                }`}
              >
                <input
                  type="radio"
                  name="supplierType"
                  value={t}
                  className="sr-only"
                  checked={form.supplierType === t}
                  onChange={() => set("supplierType", t)}
                />
                {t}
              </label>
            ))}
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your first name" required>
            <input type="text" required value={form.firstName} onChange={(e) => set("firstName", e.target.value)} className={INPUT_CLS} />
          </Field>
          <Field label="Your last name" required>
            <input type="text" required value={form.lastName} onChange={(e) => set("lastName", e.target.value)} className={INPUT_CLS} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" required>
            <input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} className={INPUT_CLS} />
          </Field>
          <Field label="Phone (optional)">
            <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={INPUT_CLS} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="City" required>
            <input type="text" required value={form.city} onChange={(e) => set("city", e.target.value)} className={INPUT_CLS} />
          </Field>
          <Field label="State" required>
            <select required value={form.state} onChange={(e) => set("state", e.target.value)} className={INPUT_CLS}>
              <option value="">Pick one</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Website or social link (optional)">
          <input
            type="url"
            placeholder="https://"
            value={form.website}
            onChange={(e) => set("website", e.target.value)}
            className={INPUT_CLS}
          />
        </Field>
      </Section>

      <Section title="What you sell" subtitle="The products you want us to consider stocking.">
        <Field label="Which categories best describe your products?" required>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const checked = form.categories.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleArrayValue("categories", c)}
                  aria-pressed={checked}
                  className={`inline-flex h-9 items-center rounded-full border px-3 text-sm font-semibold transition-colors ${
                    checked
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/50"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </Field>

        <Field
          label="List the products you want us to consider"
          required
          help="Include sizes, units, and any seasonality. Be specific."
        >
          <textarea
            required
            rows={5}
            value={form.productsOffered}
            onChange={(e) => set("productsOffered", e.target.value)}
            className={`${INPUT_CLS} font-sans`}
            placeholder="e.g. Louisiana-style hot sauce, 5 oz glass bottle, 12 per case. Available year-round."
          />
        </Field>

        <Field label="Certifications (optional)">
          <div className="flex flex-wrap gap-2">
            {CERTIFICATIONS.map((c) => {
              const checked = form.certifications.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleArrayValue("certifications", c)}
                  aria-pressed={checked}
                  className={`inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold transition-colors ${
                    checked
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/50"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Availability" required>
          <div className="flex flex-wrap gap-2">
            {SEASONALITY_OPTIONS.map((s) => (
              <label
                key={s}
                className={`inline-flex h-9 cursor-pointer items-center rounded-full border px-3 text-sm font-semibold transition-colors ${
                  form.seasonality === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary/50"
                }`}
              >
                <input
                  type="radio"
                  name="seasonality"
                  value={s}
                  className="sr-only"
                  checked={form.seasonality === s}
                  onChange={() => set("seasonality", s)}
                />
                {s}
              </label>
            ))}
          </div>
        </Field>

        {form.seasonality === "Seasonal" && (
          <Field label="Available months" required help="Pick every month your product is available.">
            <div className="flex flex-wrap gap-2">
              {MONTHS.map((m) => {
                const checked = form.seasonMonths.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleArrayValue("seasonMonths", m)}
                    aria-pressed={checked}
                    className={`inline-flex h-8 w-12 items-center justify-center rounded-full border px-2 text-xs font-semibold transition-colors ${
                      checked
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:border-primary/50"
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </Field>
        )}
      </Section>

      <Section title="Operations and fulfillment" subtitle="Lead times, minimums, and how we'd work together.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Business days from order to ship-out" required>
            <input
              type="number"
              required
              min={0}
              max={60}
              inputMode="numeric"
              value={form.leadTimeDays}
              onChange={(e) => set("leadTimeDays", e.target.value)}
              className={INPUT_CLS}
              placeholder="e.g. 5"
            />
          </Field>
          <Field label="Order batching cadence you prefer" required>
            <select
              required
              value={form.orderBatchingCadence}
              onChange={(e) =>
                set("orderBatchingCadence", e.target.value as VendorOnboardingFormState["orderBatchingCadence"])
              }
              className={INPUT_CLS}
            >
              <option value="">Pick one</option>
              {CADENCES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          label="Minimum order quantity"
          required
          help="Per SKU, per shipment, or per dollar amount &mdash; tell us in your terms."
        >
          <input
            type="text"
            required
            value={form.minOrderQty}
            onChange={(e) => set("minOrderQty", e.target.value)}
            className={INPUT_CLS}
            placeholder="e.g. 12 units per SKU, or $300 per order"
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Cold-chain requirements">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.coldChainRequired}
                onChange={(e) => set("coldChainRequired", e.target.checked)}
                className={CHECKBOX_CLS}
              />
              <span>My products need refrigerated or frozen shipping.</span>
            </label>
          </Field>
          <Field label="Drop-ship">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.dropShipCapable}
                onChange={(e) => set("dropShipCapable", e.target.checked)}
                className={CHECKBOX_CLS}
              />
              <span>I can ship directly to Uncle May&rsquo;s customers.</span>
            </label>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Retail price per unit ($)" help="What an end customer pays.">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={form.retailPricePerUnit}
              onChange={(e) => set("retailPricePerUnit", e.target.value)}
              className={INPUT_CLS}
              placeholder="e.g. 20.00"
            />
          </Field>
          <Field label="Case / pack size" required help="How you sell to wholesale buyers.">
            <input
              type="text"
              required
              value={form.caseSize}
              onChange={(e) => set("caseSize", e.target.value)}
              className={INPUT_CLS}
              placeholder="e.g. 12 x 8oz, 5 lb box"
            />
          </Field>
          <Field label="Wholesale price per case ($)" required>
            <input
              type="number"
              required
              inputMode="decimal"
              min={0}
              step="0.01"
              value={form.caseWholesalePrice}
              onChange={(e) => set("caseWholesalePrice", e.target.value)}
              className={INPUT_CLS}
              placeholder="e.g. 48.00"
            />
          </Field>
        </div>

        <Field label="Negotiable on volume?">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.pricingNegotiable}
              onChange={(e) => set("pricingNegotiable", e.target.checked)}
              className={CHECKBOX_CLS}
            />
            <span>Yes, wholesale pricing is negotiable based on committed volume.</span>
          </label>
        </Field>

        <Field
          label="Volume tiers and other pricing notes"
          required
          help="Tier breaks, freight included thresholds, seasonal price swings &mdash; anything that affects the case price."
        >
          <textarea
            required
            rows={4}
            value={form.wholesalePricingNotes}
            onChange={(e) => set("wholesalePricingNotes", e.target.value)}
            className={`${INPUT_CLS} font-sans`}
            placeholder="e.g. $48/case at 1-4 cases; $44/case at 5+. Free shipping on orders $500+. Pricing reviewed every Jan 1."
          />
        </Field>

        <Field label="Payment terms you accept" required>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_TERMS.map((t) => (
              <label
                key={t}
                className={`inline-flex h-9 cursor-pointer items-center rounded-full border px-3 text-sm font-semibold transition-colors ${
                  form.paymentTerms === t
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary/50"
                }`}
              >
                <input
                  type="radio"
                  name="paymentTerms"
                  value={t}
                  className="sr-only"
                  checked={form.paymentTerms === t}
                  onChange={() => set("paymentTerms", t)}
                />
                {t}
              </label>
            ))}
          </div>
        </Field>

        <Field
          label="Scale capacity"
          required
          help="If demand jumped to 50 units a week, could you fill that? In how long?"
        >
          <textarea
            required
            rows={3}
            value={form.scaleCapacityNotes}
            onChange={(e) => set("scaleCapacityNotes", e.target.value)}
            className={`${INPUT_CLS} font-sans`}
          />
        </Field>

        <Field label="Samples">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.sampleAvailable}
              onChange={(e) => set("sampleAvailable", e.target.checked)}
              className={CHECKBOX_CLS}
            />
            <span>I can send free or low-cost samples for photography and tasting.</span>
          </label>
        </Field>

        <Field
          label="How can you get product to us?"
          required
          help="Pick every option that works for you. We will sort out the best lane together."
        >
          <div className="flex flex-col gap-2">
            {TRANSPORTATION_METHODS.map((m) => {
              const checked = form.transportationMethods.includes(m);
              return (
                <label
                  key={m}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    checked
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleArrayValue("transportationMethods", m)}
                    className={CHECKBOX_CLS}
                  />
                  <span>{m}</span>
                </label>
              );
            })}
          </div>
        </Field>

        {form.transportationMethods.includes("We pick up at their location") && (
          <Field
            label="Pickup address"
            required
            help="Street address where we collect product. Used for route planning."
          >
            <textarea
              required
              rows={2}
              value={form.pickupAddress}
              onChange={(e) => set("pickupAddress", e.target.value)}
              className={`${INPUT_CLS} font-sans`}
              placeholder="e.g. 12345 County Road 681, Covert, MI 49043"
            />
          </Field>
        )}

        <Field
          label="Logistics notes (optional)"
          help="Anything else about shipping, lanes, cold-chain handoff, or scheduling we should know."
        >
          <textarea
            rows={2}
            value={form.transportationNotes}
            onChange={(e) => set("transportationNotes", e.target.value)}
            className={`${INPUT_CLS} font-sans`}
          />
        </Field>

        <Field label="Anything else we should know? (optional)">
          <textarea
            rows={3}
            value={form.additionalNotes}
            onChange={(e) => set("additionalNotes", e.target.value)}
            className={`${INPUT_CLS} font-sans`}
            placeholder="Optional. Press releases, awards, the story behind your products &mdash; whatever helps us understand who you are."
          />
        </Field>
      </Section>

      <div className="border-t border-border pt-6">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
        >
          {submitting ? "Sending..." : "Send application"}
        </button>
        <p className="mt-3 text-xs text-muted-foreground">
          By submitting, you&rsquo;re sharing your business profile with Uncle May&rsquo;s for evaluation. No commitment on either side.
        </p>
      </div>
    </form>
  );
}

const INPUT_CLS =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const CHECKBOX_CLS =
  "h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30";

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  required = false,
  help,
  children,
}: {
  label: string;
  required?: boolean;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-sm font-semibold text-foreground">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </span>
      {help && (
        <span
          className="block text-xs text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: help }}
        />
      )}
      {children}
    </label>
  );
}
