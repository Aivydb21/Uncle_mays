"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";
import { useHydratedCart, useCartStore, useCartHydrated } from "@/lib/cart/store";
import { getUTMParams } from "@/lib/utm";
import { useAddressAutocomplete } from "@/hooks/use-address-autocomplete";
import { formatCents } from "@/lib/format";
import { MIN_SUBTOTAL_CENTS } from "@/lib/cart-pricing-constants";
import { sha256, hashPhone } from "@/lib/browser-hash";
import { getFbAttribution } from "@/lib/fb-attribution";
import {
  DeliveryScheduler,
  type DeliverySchedulerSelection,
} from "@/components/checkout/DeliveryScheduler";

// localStorage keys for hashed identity — written at InitiateCheckout, read
// by Purchase (order-success) and AddToCart (returning users) pixel events.
const LS_EM = "unc-em";
const LS_PH = "unc-ph";

import type {
  FulfillmentMode,
  PickupSlot,
  PricingResponse,
} from "@/lib/catalog/types";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Read a cookie by name; returns undefined client-side if missing or SSR.
function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}

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

/**
 * Fire begin_checkout / InitiateCheckout across GA4 (gtag), Meta Pixel
 * (browser), and Meta CAPI (server). The browser pixel and CAPI call
 * share an eventId so Meta dedupes them. fbq + gtag are pre-stubbed in
 * layout.tsx, so calls made before the deferred scripts load are
 * buffered and flushed by fbevents.js / gtag.js when they arrive — no
 * retry needed on the gtag path anymore, but kept short as belt-and-
 * braces for legacy session storage races.
 *
 * Now includes hashed email (Advanced Matching) to improve Meta Pixel
 * Match Quality from 5.0/10 to 8.0+/10.
 */
async function fireBeginCheckout(value: number, items: { sku: string; name: string; quantity: number; unitPriceCents: number }[], email?: string, phone?: string, fbc?: string, fbp?: string) {
  try {
    if (typeof window === "undefined") return;
    const w = window as unknown as {
      fbq?: (...args: unknown[]) => void;
      gtag?: (...args: unknown[]) => void;
    };

    const eventId = `initiate-custom_cart-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const contentIds = items.map((i) => i.sku);

    // Hash email + phone for Advanced Matching (lifts Match Quality 5.0→8.0+).
    // Cache both raw (for CAPI routes that rehash server-side) and hashed
    // (for browser Pixel em/ph fields) so downstream events can reuse them:
    //   unc-email → raw email  (AddToCart CAPI, which hashes server-side)
    //   unc-em    → SHA-256 hex email (Purchase/ViewContent/AddToCart Pixel)
    //   unc-ph    → SHA-256 hex phone (Purchase/ViewContent/AddToCart Pixel)
    const hashedEmail = email ? await sha256(email) : undefined;
    const hashedPhone = phone ? await hashPhone(phone) : undefined;
    try {
      if (email) localStorage.setItem("unc-email", email);
      if (hashedEmail) localStorage.setItem(LS_EM, hashedEmail);
      if (hashedPhone) localStorage.setItem(LS_PH, hashedPhone);
    } catch { /* ignore storage errors */ }

    // Meta Pixel (browser). The fbq stub queues if fbevents.js hasn't
    // loaded; the queue replays automatically when it does.
    if (w.fbq) {
      w.fbq(
        "track",
        "InitiateCheckout",
        {
          value,
          currency: "USD",
          content_type: "product",
          content_ids: contentIds,
          ...(hashedEmail && { em: hashedEmail }),
          ...(hashedPhone && { ph: hashedPhone }),
        },
        { eventID: eventId }
      );
    }

    // Meta CAPI (server). Survives iOS ATT and Safari ITP, which the
    // browser pixel does not. Same eventId → Meta dedupes.
    fetch("/api/capi/initiate-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        slug: "custom_cart",
        contentName: items.map((i) => `${i.quantity}x ${i.name}`).join(", ").slice(0, 200),
        value,
        eventId,
        email: email || undefined,
        phone: phone || undefined,
        fbc,
        fbp,
      }),
    }).catch(() => {
      /* CAPI failure must never block checkout. */
    });

    // GA4
    if (typeof w.gtag === "function") {
      w.gtag("event", "begin_checkout", {
        currency: "USD",
        value,
        items: items.map((item) => ({
          item_id: item.sku,
          item_name: item.name,
          price: item.unitPriceCents / 100,
          quantity: item.quantity,
        })),
      });
    }
  } catch {
    // analytics never blocks
  }
}

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
  const [deliverySelection, setDeliverySelection] =
    useState<DeliverySchedulerSelection | null>(null);
  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [preparingPayment, setPreparingPayment] = useState(false);

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

  // Fire ViewContent once on mount. Returning users may have hashed em/ph
  // cached in localStorage from a prior InitiateCheckout — include those in
  // the browser Pixel call (already SHA-256 hex). The CAPI route needs raw
  // email/phone to hash server-side, which we don't have at mount time, so
  // CAPI fires without identity params (still improves server-side attribution).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as unknown as { fbq?: (...args: unknown[]) => void };
    let cachedEm: string | undefined;
    let cachedPh: string | undefined;
    try {
      cachedEm = localStorage.getItem(LS_EM) || undefined;
      cachedPh = localStorage.getItem(LS_PH) || undefined;
    } catch { /* ignore */ }

    const viewEventId = `view-checkout-${Date.now()}`;

    if (w.fbq) {
      w.fbq(
        "track",
        "ViewContent",
        {
          content_ids: ["custom_cart"],
          content_type: "product",
          ...(cachedEm && { em: cachedEm }),
          ...(cachedPh && { ph: cachedPh }),
        },
        { eventID: viewEventId }
      );
    }

    // CAPI fires without raw email/phone at mount time (not yet collected).
    // fbc/fbp are available immediately from cookies — include for click attribution.
    const { fbc: viewFbc, fbp: viewFbp } = getFbAttribution();
    fetch("/api/capi/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        slug: "custom_cart",
        contentName: "Checkout",
        value: 0,
        eventId: viewEventId,
        fbc: viewFbc,
        fbp: viewFbp,
      }),
    }).catch(() => { /* never block */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canProceed =
    pricing?.ok &&
    contact.email.trim().length > 3 &&
    contact.firstName.trim() &&
    contact.lastName.trim() &&
    (fulfillmentMode === "pickup"
      ? Boolean(cartPickupSlot)
      : Boolean(deliverySelection) &&
        address.street.trim() &&
        /^\d{5}$/.test(address.zip));

  // Auto-prepare payment intent when form is complete (single-page checkout)
  useEffect(() => {
    if (canProceed && !clientSecret && !preparingPayment) {
      preparePaymentIntent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canProceed, clientSecret, preparingPayment]);

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

  async function preparePaymentIntent() {
    if (!pricing?.ok) return;
    if (clientSecret) return; // Already prepared
    setPreparingPayment(true);
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

      // Pull UTM/click-id attribution from session+local storage. Without
      // this the Stripe PaymentIntent metadata is missing utm_*/gclid/fbclid
      // ~99% of the time (the ML notebook flagged this as a primary
      // attribution gap on 2026-05-02).
      const utm = typeof window !== "undefined" ? getUTMParams() : {};
      const persistedGclid =
        typeof window !== "undefined"
          ? localStorage.getItem("unc-gclid") || undefined
          : undefined;
      const persistedFbclid =
        typeof window !== "undefined"
          ? localStorage.getItem("unc-fbclid") || undefined
          : undefined;
      const fbc = readCookie("_fbc");
      const fbp = readCookie("_fbp");
      // GA4 client_id (user_pseudo_id) lives in the _ga cookie. Format:
      //   GA1.1.<random>.<random>  → drop the GA1.1. prefix; the remainder is
      // the value that BigQuery exports as user_pseudo_id. Capturing it on
      // the PaymentIntent lets the ML pipeline join GA4 session-summary rows
      // (browse behavior, traffic source, scroll depth) to checkout
      // attempts. Without this, the join only works for purchase events,
      // which is why the 2026-05-02 notebook saw GA4 data on 1/305 rows.
      const gaClientId = (() => {
        // Primary: value persisted to localStorage by gtag('get') in layout.tsx.
        // This survives lazyOnload race conditions where GA4 hasn't set _ga yet.
        try {
          const stored = localStorage.getItem("unc-ga-client-id");
          if (stored) return stored;
        } catch (_) {}
        // Fallback: parse _ga cookie directly (works for returning users).
        const raw = readCookie("_ga");
        if (!raw) return undefined;
        const parts = raw.split(".");
        return parts.length >= 4 ? parts.slice(2).join(".") : raw;
      })();

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
          utm_source: utm.utm_source,
          utm_medium: utm.utm_medium,
          utm_campaign: utm.utm_campaign,
          utm_content: utm.utm_content,
          utm_term: utm.utm_term,
          gclid: utm.gclid || persistedGclid,
          fbclid: utm.fbclid || persistedFbclid,
          fbc,
          fbp,
          ga_client_id: gaClientId,
          preferredDeliveryDate:
            fulfillmentMode === "delivery" && deliverySelection
              ? deliverySelection.isoDate
              : undefined,
          preferredDeliveryWindow:
            fulfillmentMode === "delivery" && deliverySelection
              ? deliverySelection.windowKey
              : undefined,
          preferredDeliveryWindowLabel:
            fulfillmentMode === "delivery" && deliverySelection
              ? deliverySelection.windowLabel
              : undefined,
        }),
      });
      const intentJson = await intentRes.json();
      if (!intentRes.ok) {
        throw new Error(intentJson.error || "Could not start payment");
      }
      setClientSecret(intentJson.clientSecret as string);
      setPaymentIntentId(intentJson.paymentIntentId as string);

      // Persist email so AddToCart CAPI events can include em (Advanced Matching)
      // on return visits or if the user navigates back to /shop mid-session.
      try { localStorage.setItem("unc-email", contact.email.trim()); } catch { /* ignore */ }

      // Fire begin_checkout when payment intent is prepared
      const { fbc: checkoutFbc, fbp: checkoutFbp } = getFbAttribution();
      fireBeginCheckout(pricing.totalCents / 100, pricing.lineItems, contact.email.trim(), contact.phone.trim() || undefined, checkoutFbc, checkoutFbp);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setPreparingPayment(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 pb-20 lg:pb-0 lg:grid-cols-[1fr_380px]">
      <div>
        <h1 className="mb-6 text-3xl font-bold">Checkout</h1>

        {/* Mobile-only collapsible summary at the top so the customer
            sees the total before investing time in the form. Desktop
            uses the right-rail summary instead. */}
        <div className="lg:hidden mb-6">
          <MobileCollapsibleSummary pricing={pricing} loading={pricingLoading} />
        </div>

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
            <>
              <section>
                <h2 className="mb-4 text-xl font-semibold">Schedule delivery</h2>
                <DeliveryScheduler
                  value={deliverySelection}
                  onChange={setDeliverySelection}
                />
              </section>
              <DeliverySection
                address={address}
                setAddress={setAddress}
                addressRef={addressInputRef}
              />
            </>
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

          {/* Show payment section inline when form is complete */}
          {clientSecret ? (
            <div id="payment-section" className="pt-4 border-t">
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
                />
              </Elements>
            </div>
          ) : preparingPayment ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Preparing payment…
            </div>
          ) : !canProceed ? (
            <div className="py-4 text-sm text-muted-foreground">
              Please complete all required fields above to continue.
            </div>
          ) : null}
        </div>
      </div>

      <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
        <OrderSummary pricing={pricing} loading={pricingLoading} />
      </aside>

      {/* Mobile sticky total bar - always visible */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-border bg-card/95 backdrop-blur-sm shadow-lg">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Total
            </p>
            <p className="text-lg font-bold text-foreground">
              {pricing && pricing.ok ? formatCents(pricing.totalCents) : "—"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (canProceed && !clientSecret) {
                preparePaymentIntent();
              } else if (clientSecret) {
                document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            disabled={!canProceed || preparingPayment}
            className={`inline-flex h-11 items-center justify-center rounded-xl px-6 text-sm font-semibold transition-colors whitespace-nowrap ${
              canProceed && !preparingPayment
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "cursor-not-allowed bg-muted text-muted-foreground"
            }`}
          >
            {preparingPayment ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading…
              </>
            ) : clientSecret ? (
              "Continue to payment"
            ) : (
              "Place order"
            )}
          </button>
        </div>
      </div>
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
    <div className="mx-auto mt-12 max-w-lg rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
      <h2 className="text-2xl font-bold">Your cart is empty</h2>
      <p className="mt-3 text-base text-muted-foreground">
        Pick out a few items from the catalog and we&apos;ll handle the rest.
      </p>
      <Link
        href="/shop"
        className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Browse the catalog
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
            {pricing.stateTaxCents > 0 && (
              <Row
                label="Sales tax (IL state)"
                value={formatCents(pricing.stateTaxCents)}
              />
            )}
            {pricing.localTaxCents > 0 && (
              <Row
                label="Sales tax (Chicago / Cook)"
                value={formatCents(pricing.localTaxCents)}
              />
            )}
            {pricing.stateTaxCents === 0 && pricing.localTaxCents === 0 && (
              <Row label="Sales tax" value="$0.00" />
            )}
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
                $20 minimum.
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
}: {
  sessionId: string | null;
  paymentIntentId: string | null;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elementsReady, setElementsReady] = useState(false);

  void paymentIntentId;

  // Fire add_payment_info event when payment form is visible
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (w.gtag) {
      w.gtag('event', 'add_payment_info', {
        currency: 'USD',
        payment_type: 'card'
      });
    }
  }, []); // Run once on mount

  // Auto-scroll to payment section on mobile ONLY after Stripe Elements is ready.
  // Previously this happened 100ms after clientSecret was set, which caused a
  // race condition where Elements hadn't mounted yet, resulting in a blank/
  // broken payment form on mobile (especially slower connections). This fix
  // waits for the onReady callback before scrolling, ensuring Elements is
  // interactive when it comes into view. Fixes UNC-956 (78% checkout abandonment).
  useEffect(() => {
    if (!elementsReady) return;
    if (typeof window === 'undefined') return;
    const paymentSection = document.getElementById('payment-section');
    if (paymentSection && window.innerWidth < 1024) {
      paymentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [elementsReady]);

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

      {/* Trust signals: Secure checkout badge */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <span>🔒 Secure checkout · Your information is encrypted and secure</span>
      </div>

      <div className="relative">
        <PaymentElement
          onReady={() => setElementsReady(true)}
          onLoadError={(event) => {
            setError(event.error.message || "Payment form failed to load. Please refresh and try again.");
            setElementsReady(false);
          }}
        />
        {!elementsReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading payment form…
            </div>
          </div>
        )}
      </div>

      {/* Trust signals: Powered by Stripe */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Powered by</span>
        <svg className="h-4" viewBox="0 0 60 25" fill="currentColor">
          <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 01-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 013.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.87zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 01-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 01-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 00-4.1-1.06c-.86 0-1.44.25-1.44.9 0 1.85 6.29.97 6.29 5.88z" />
        </svg>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Trust signals: Satisfaction guarantee */}
      <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
        ✓ 100% satisfaction guarantee — email us if anything's wrong
      </div>

      <button
        type="submit"
        disabled={submitting || !stripe}
        className={`inline-flex h-12 w-full items-center justify-center rounded-xl px-8 text-base font-semibold transition-colors ${
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
