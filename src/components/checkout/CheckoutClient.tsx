"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Loader2, Lock, Phone, ShieldCheck } from "lucide-react";
import { useHydratedCart, useCartStore, useCartHydrated } from "@/lib/cart/store";
import { useAddressAutocomplete } from "@/hooks/use-address-autocomplete";
import { formatCents } from "@/lib/format";
import { MIN_SUBTOTAL_CENTS } from "@/lib/cart-pricing-constants";
import type {
  FulfillmentMode,
  PickupSlot,
  PricingResponse,
} from "@/lib/catalog/types";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface ContactFields {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface AddressFields {
  street: string;
  apt: string;
  city: string;
  state: string;
  zip: string;
}

const EMPTY_CONTACT: ContactFields = {
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
};

const EMPTY_ADDRESS: AddressFields = {
  street: "",
  apt: "",
  city: "Chicago",
  state: "IL",
  zip: "",
};

export function CheckoutClient({ slots }: { slots: PickupSlot[] }) {
  const router = useRouter();
  const cartHydrated = useCartHydrated();
  const lines = useHydratedCart((s) => s.lines) ?? [];
  const cartFulfillment = useHydratedCart((s) => s.fulfillmentMode);
  const cartPickupSlot = useHydratedCart((s) => s.pickupSlotId);
  const cartShippingZip = useHydratedCart((s) => s.shippingZip);
  const promoCode = useHydratedCart((s) => s.promoCode);
  const setFulfillmentMode = useCartStore((s) => s.setFulfillmentMode);
  const setPickupSlotId = useCartStore((s) => s.setPickupSlotId);
  const setShippingZip = useCartStore((s) => s.setShippingZip);

  const [contact, setContact] = useState<ContactFields>(EMPTY_CONTACT);
  const [address, setAddress] = useState<AddressFields>(EMPTY_ADDRESS);
  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [stage, setStage] = useState<"form" | "payment">("form");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fulfillmentMode: FulfillmentMode = cartFulfillment ?? "delivery";

  useEffect(() => {
    if (
      fulfillmentMode === "pickup" &&
      slots.length > 0 &&
      !cartPickupSlot
    ) {
      setPickupSlotId(slots[0].slotId);
    }
  }, [fulfillmentMode, slots, cartPickupSlot, setPickupSlotId]);

  useEffect(() => {
    if (address.zip) setShippingZip(address.zip);
  }, [address.zip, setShippingZip]);

  const cartFingerprint = useMemo(
    () =>
      JSON.stringify({
        lines: lines.map((l) => [l.sku, l.quantity]),
        fulfillmentMode,
        zip: address.zip || cartShippingZip,
        promoCode,
      }),
    [lines, fulfillmentMode, address.zip, cartShippingZip, promoCode]
  );

  useEffect(() => {
    if (lines.length === 0) {
      setPricing(null);
      return;
    }
    let cancelled = false;
    setPricingLoading(true);
    fetch("/api/cart/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cart: lines,
        fulfillmentMode,
        shippingZip: address.zip || cartShippingZip,
        promoCode,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setPricing(d as PricingResponse);
      })
      .catch(() => {
        if (!cancelled)
          setPricing({
            ok: false,
            code: "catalog_unavailable",
            message: "Could not refresh totals.",
          });
      })
      .finally(() => {
        if (!cancelled) setPricingLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [cartFingerprint, lines, fulfillmentMode, address.zip, cartShippingZip, promoCode]);

  const addressInputRef = useAddressAutocomplete((parsed) => {
    setAddress((cur) => ({
      ...cur,
      street: parsed.street || cur.street,
      city: parsed.city || cur.city,
      state: parsed.state || cur.state,
      zip: parsed.zip || cur.zip,
    }));
  });

  const canProceed =
    pricing?.ok &&
    contact.email.trim().length > 3 &&
    contact.firstName.trim() &&
    contact.lastName.trim() &&
    (fulfillmentMode === "pickup"
      ? Boolean(cartPickupSlot)
      : address.street.trim() && /^\d{5}$/.test(address.zip));

  if (!cartHydrated) {
    return (
      <div className="mx-auto mt-16 flex max-w-md items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading your cart…
      </div>
    );
  }

  if (lines.length === 0) {
    return <EmptyCheckout />;
  }

  async function handleProceed() {
    if (!pricing?.ok) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const sessionRes = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: contact.email.trim(),
          firstName: contact.firstName.trim(),
          lastName: contact.lastName.trim(),
          phone: contact.phone.trim() || undefined,
          address:
            fulfillmentMode === "delivery"
              ? {
                  street: address.street.trim(),
                  apt: address.apt.trim() || undefined,
                  city: address.city.trim(),
                  state: address.state.trim().toUpperCase(),
                  zip: address.zip.trim(),
                }
              : undefined,
          cart: pricing.lineItems.map((li) => ({
            sku: li.sku,
            name: li.name,
            unit: li.unit,
            quantity: li.quantity,
            unitPriceCents: li.unitPriceCents,
            lineTotalCents: li.lineTotalCents,
          })),
          subtotalCents: pricing.subtotalCents,
          discountCents: pricing.discountCents,
          shippingCents: pricing.shippingCents,
          taxCents: pricing.taxCents,
          totalCents: pricing.totalCents,
          fulfillmentMode,
          pickupSlotId: fulfillmentMode === "pickup" ? cartPickupSlot : undefined,
          productName: "Custom cart",
        }),
      });
      const sessionJson = await sessionRes.json();
      if (!sessionRes.ok) {
        throw new Error(sessionJson.error || "Could not create session");
      }
      const sid = sessionJson.sessionId as string;
      setSessionId(sid);

      const intentRes = await fetch("/api/checkout/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: contact.email.trim(),
          firstName: contact.firstName.trim(),
          lastName: contact.lastName.trim(),
          phone: contact.phone.trim() || undefined,
          address:
            fulfillmentMode === "delivery"
              ? {
                  street: address.street.trim(),
                  apt: address.apt.trim() || undefined,
                  city: address.city.trim(),
                  state: address.state.trim().toUpperCase(),
                  zip: address.zip.trim(),
                }
              : undefined,
          cart: lines,
          fulfillmentMode,
          pickupSlotId: fulfillmentMode === "pickup" ? cartPickupSlot : undefined,
          shippingZip: address.zip || cartShippingZip,
          promo: promoCode,
          checkoutSessionId: sid,
        }),
      });
      const intentJson = await intentRes.json();
      if (!intentRes.ok) {
        throw new Error(intentJson.error || "Could not start payment");
      }
      setClientSecret(intentJson.clientSecret as string);
      setPaymentIntentId(intentJson.paymentIntentId as string);
      setStage("payment");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
      <div>
        <h1 className="mb-6 text-3xl font-bold">Checkout</h1>

        {/* Mobile-only collapsible summary at the top so the customer
            sees the total before investing time in the form. Desktop
            uses the right-rail summary instead. */}
        <div className="lg:hidden mb-6">
          <MobileCollapsibleSummary pricing={pricing} loading={pricingLoading} />
        </div>

        {stage === "form" && (
          <div className="space-y-8">
            <ContactSection contact={contact} setContact={setContact} />
            <FulfillmentSection
              mode={fulfillmentMode}
              onChange={(m) => {
                setFulfillmentMode(m);
                if (m === "delivery") setPickupSlotId(null);
              }}
            />
            {fulfillmentMode === "delivery" ? (
              <DeliverySection
                address={address}
                setAddress={setAddress}
                addressRef={addressInputRef}
              />
            ) : (
              <PickupSection
                slots={slots}
                selected={cartPickupSlot}
                onSelect={setPickupSlotId}
              />
            )}

            {submitError && (
              <p className="text-sm text-destructive">{submitError}</p>
            )}

            <button
              type="button"
              disabled={!canProceed || submitting}
              onClick={handleProceed}
              className={`inline-flex h-12 items-center justify-center rounded-xl px-8 text-base font-semibold transition-colors ${
                canProceed && !submitting
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "cursor-not-allowed bg-muted text-muted-foreground"
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Preparing payment…
                </>
              ) : (
                "Continue to payment"
              )}
            </button>
          </div>
        )}

        {stage === "payment" && clientSecret && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: { theme: "stripe" },
            }}
          >
            <PaymentSection
              sessionId={sessionId}
              paymentIntentId={paymentIntentId}
              onSuccess={() => {
                useCartStore.getState().clear();
                router.push(`/order-success?pi=${paymentIntentId ?? ""}`);
              }}
              onBack={() => {
                setStage("form");
                setClientSecret(null);
              }}
            />
          </Elements>
        )}
      </div>

      <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
        <OrderSummary pricing={pricing} loading={pricingLoading} />
      </aside>
    </div>
  );
}

function MobileCollapsibleSummary({
  pricing,
  loading,
}: {
  pricing: PricingResponse | null;
  loading: boolean;
}) {
  const [open, setOpen] = useState(true);
  const total =
    pricing && pricing.ok ? formatCents(pricing.totalCents) : "—";
  const lineCount =
    pricing && pricing.ok
      ? pricing.lineItems.reduce((s, l) => s + l.quantity, 0)
      : 0;

  return (
    <div className="rounded-xl border border-border bg-card shadow-soft">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
        aria-expanded={open}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Order summary
          </p>
          <p className="text-base font-bold text-foreground">
            {lineCount > 0 ? `${lineCount} ${lineCount === 1 ? "item" : "items"} · ${total}` : "Calculating…"}
          </p>
        </div>
        <span className="text-sm font-semibold text-primary">
          {open ? "Hide" : "Show details"}
        </span>
      </button>
      {open && (
        <div className="border-t border-border p-4">
          <OrderSummary pricing={pricing} loading={loading} compact />
        </div>
      )}
    </div>
  );
}

function EmptyCheckout() {
  return (
    <div className="mx-auto mt-16 max-w-md rounded-2xl border border-border bg-muted/40 p-8 text-center">
      <h2 className="text-lg font-semibold">Your cart is empty</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Add a few items first so we have something to deliver.
      </p>
      <Link
        href="/shop"
        className="mt-4 inline-flex items-center text-sm font-semibold text-primary hover:underline"
      >
        Browse the catalog →
      </Link>
    </div>
  );
}

function ContactSection({
  contact,
  setContact,
}: {
  contact: ContactFields;
  setContact: (c: ContactFields) => void;
}) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">Contact</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Email" required>
          <input
            type="email"
            value={contact.email}
            onChange={(e) => setContact({ ...contact, email: e.target.value })}
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          />
        </Field>
        <Field label="Phone">
          <input
            type="tel"
            value={contact.phone}
            onChange={(e) => setContact({ ...contact, phone: e.target.value })}
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          />
        </Field>
        <Field label="First name" required>
          <input
            type="text"
            value={contact.firstName}
            onChange={(e) =>
              setContact({ ...contact, firstName: e.target.value })
            }
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          />
        </Field>
        <Field label="Last name" required>
          <input
            type="text"
            value={contact.lastName}
            onChange={(e) =>
              setContact({ ...contact, lastName: e.target.value })
            }
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          />
        </Field>
      </div>
    </section>
  );
}

function FulfillmentSection({
  mode,
  onChange,
}: {
  mode: FulfillmentMode;
  onChange: (m: FulfillmentMode) => void;
}) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">How do you want it?</h2>
      <div className="grid grid-cols-2 gap-3">
        <ModeOption
          active={mode === "delivery"}
          title="Chicago delivery"
          subtitle="$7.99 to most Chicago + south-suburb ZIPs"
          onClick={() => onChange("delivery")}
        />
        <ModeOption
          active={mode === "pickup"}
          title="Polsky Center pickup"
          subtitle="Free. Hyde Park, U of Chicago"
          onClick={() => onChange("pickup")}
        />
      </div>
    </section>
  );
}

function ModeOption({
  active,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border-2 p-4 text-left transition-colors ${
        active
          ? "border-primary bg-primary/5"
          : "border-border bg-background hover:border-primary/50"
      }`}
    >
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
    </button>
  );
}

function DeliverySection({
  address,
  setAddress,
  addressRef,
}: {
  address: AddressFields;
  setAddress: (a: AddressFields) => void;
  addressRef: (node: HTMLInputElement | null) => void;
}) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">Delivery address</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
        <div className="sm:col-span-4">
          <Field label="Street address" required>
            <input
              ref={addressRef}
              type="text"
              value={address.street}
              onChange={(e) => setAddress({ ...address, street: e.target.value })}
              autoComplete="address-line1"
              placeholder="Start typing — we'll fill in city, state, ZIP"
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Apt / Unit">
            <input
              type="text"
              value={address.apt}
              onChange={(e) => setAddress({ ...address, apt: e.target.value })}
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            />
          </Field>
        </div>
        <div className="sm:col-span-3">
          <Field label="City" required>
            <input
              type="text"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            />
          </Field>
        </div>
        <div className="sm:col-span-1">
          <Field label="State" required>
            <input
              type="text"
              value={address.state}
              onChange={(e) =>
                setAddress({ ...address, state: e.target.value.toUpperCase() })
              }
              maxLength={2}
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm uppercase"
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="ZIP" required>
            <input
              type="text"
              value={address.zip}
              onChange={(e) =>
                setAddress({ ...address, zip: e.target.value.replace(/\D/g, "").slice(0, 5) })
              }
              inputMode="numeric"
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            />
          </Field>
        </div>
      </div>
    </section>
  );
}

function PickupSection({
  slots,
  selected,
  onSelect,
}: {
  slots: PickupSlot[];
  selected: string | null | undefined;
  onSelect: (id: string) => void;
}) {
  if (slots.length === 0) {
    return (
      <section className="rounded-xl border border-amber-300 bg-amber-50 p-4">
        <h2 className="mb-1 text-base font-semibold text-amber-900">
          Pickup unavailable right now
        </h2>
        <p className="text-sm text-amber-800">
          No pickup windows are open. Switch to Chicago delivery above, or email{" "}
          <a href="mailto:info@unclemays.com" className="underline">
            info@unclemays.com
          </a>{" "}
          / call (312) 972-2595 to request a custom pickup time.
        </p>
      </section>
    );
  }
  return (
    <section>
      <h2 className="mb-2 text-xl font-semibold">Pick a pickup window</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Polsky Center, 1452 E 53rd St, Hyde Park (lobby reception). Bring an ID
        or your order email.
      </p>
      <div className="space-y-2">
        {slots.map((s) => (
          <SlotOption
            key={s.slotId}
            slot={s}
            active={selected === s.slotId}
            onClick={() => onSelect(s.slotId)}
          />
        ))}
      </div>
    </section>
  );
}

function SlotOption({
  slot,
  active,
  onClick,
}: {
  slot: PickupSlot;
  active: boolean;
  onClick: () => void;
}) {
  const label = useMemo(() => formatSlotLabel(slot), [slot]);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border-2 p-4 text-left transition-colors ${
        active
          ? "border-primary bg-primary/5"
          : "border-border bg-background hover:border-primary/50"
      }`}
    >
      <p className="font-semibold text-foreground">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{slot.locationLabel}</p>
    </button>
  );
}

function formatSlotLabel(slot: PickupSlot): string {
  try {
    const start = new Date(slot.startsAt);
    const end = new Date(slot.endsAt);
    const date = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(start);
    const time = (d: Date) =>
      new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Chicago",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(d);
    return `${date} · ${time(start)} – ${time(end)}`;
  } catch {
    return slot.slotId;
  }
}

function OrderSummary({
  pricing,
  loading,
  compact,
}: {
  pricing: PricingResponse | null;
  loading: boolean;
  compact?: boolean;
}) {
  const wrapperClass = compact
    ? ""
    : "rounded-2xl border border-border bg-card p-6 shadow-soft";
  return (
    <div className={wrapperClass}>
      {!compact && <h2 className="mb-4 text-base font-semibold">Order summary</h2>}
      {loading && !pricing && (
        <SummarySkeleton />
      )}
      {pricing && pricing.ok && (
        <>
          <ul className="space-y-2 border-b border-border pb-4">
            {pricing.lineItems.map((item) => (
              <li
                key={item.sku}
                className="flex justify-between text-sm"
              >
                <span>
                  {item.name}{" "}
                  <span className="text-muted-foreground">
                    × {item.quantity}
                  </span>
                </span>
                <span className="font-medium">
                  {formatCents(item.lineTotalCents)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1 text-sm">
            <Row label="Subtotal" value={formatCents(pricing.subtotalCents)} />
            {pricing.discountCents > 0 && (
              <Row
                label={`Discount (${pricing.appliedPromoCode})`}
                value={`-${formatCents(pricing.discountCents)}`}
                accent="primary"
              />
            )}
            <Row label="Shipping" value={formatCents(pricing.shippingCents)} />
            <Row label="Tax" value={formatCents(pricing.taxCents)} />
            <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-semibold">
              <span>Total</span>
              <span>{formatCents(pricing.totalCents)}</span>
            </div>
          </dl>
        </>
      )}
      {pricing && !pricing.ok && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{pricing.message}</p>
          {pricing.code === "below_minimum" && (
            <Link
              href="/shop"
              className="inline-flex text-sm font-semibold text-primary hover:underline"
            >
              ← Back to shop
            </Link>
          )}
          {pricing.code === "below_minimum" &&
            typeof pricing.shortfallCents === "number" && (
              <p className="text-xs text-amber-700">
                Add {formatCents(pricing.shortfallCents)} more to reach the
                $25 minimum.
              </p>
            )}
        </div>
      )}
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="h-3 w-32 animate-pulse rounded bg-muted" />
          <div className="h-3 w-12 animate-pulse rounded bg-muted" />
        </div>
      ))}
      <div className="border-t border-border pt-3 flex items-center justify-between">
        <div className="h-4 w-12 animate-pulse rounded bg-muted" />
        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "primary";
}) {
  return (
    <div
      className={`flex justify-between ${
        accent === "primary" ? "text-primary" : ""
      }`}
    >
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function PaymentSection({
  sessionId,
  paymentIntentId,
  onSuccess,
  onBack,
}: {
  sessionId: string | null;
  paymentIntentId: string | null;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  void paymentIntentId;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });
    if (stripeError) {
      setError(stripeError.message ?? "Payment failed.");
      setSubmitting(false);
      return;
    }
    if (paymentIntent && paymentIntent.status === "succeeded") {
      if (sessionId) {
        try {
          await fetch("/api/checkout/session", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              paymentIntentId: paymentIntent.id,
              completedAt: new Date().toISOString(),
            }),
          });
        } catch {
          // never block redirect on session patch
        }
      }
      onSuccess();
      return;
    }
    setError("Payment did not complete. Try again.");
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold">Payment</h2>

      {/* Trust strip — three signals reduce abandonment at the last step. */}
      <div className="rounded-xl border border-border bg-muted/40 px-4 py-3">
        <ul className="grid grid-cols-1 gap-2 text-xs text-foreground/80 sm:grid-cols-3 sm:gap-3">
          <li className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Secure checkout via Stripe</span>
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>100% fresh or refunded</span>
          </li>
          <li className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>(312) 972-2595 if anything&rsquo;s off</span>
          </li>
        </ul>
      </div>

      <PaymentElement />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          ← Back to details
        </button>
        <button
          type="submit"
          disabled={submitting || !stripe}
          className={`ml-auto inline-flex h-12 items-center justify-center rounded-xl px-8 text-base font-semibold transition-colors ${
            !submitting
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "cursor-not-allowed bg-muted text-muted-foreground"
          }`}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing…
            </>
          ) : (
            "Place order"
          )}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      {children}
    </label>
  );
}

void MIN_SUBTOTAL_CENTS;
