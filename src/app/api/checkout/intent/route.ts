import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  priceCart,
  serializeCartForMetadata,
  summarizeLineItems,
} from "@/lib/cart-pricing";
import { getSlot } from "@/lib/catalog/pickup-slots";
import type { CartLine, FulfillmentMode } from "@/lib/catalog/types";

const STRIPE_METADATA_VALUE_LIMIT = 500;

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 500 }
      );
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const body = await req.json();
    const cart = sanitizeCart(body?.cart);
    const fulfillmentMode: FulfillmentMode =
      body?.fulfillmentMode === "pickup" ? "pickup" : "delivery";
    const pickupSlotId =
      typeof body?.pickupSlotId === "string" ? body.pickupSlotId : null;
    const shippingZip =
      typeof body?.shippingZip === "string"
        ? body.shippingZip
        : body?.address?.zip || null;

    const promoCode =
      typeof body?.promo === "string" ? body.promo : null;

    const pricing = await priceCart({
      cart,
      fulfillmentMode,
      promoCode,
      shippingZip,
    });
    if (!pricing.ok) {
      return NextResponse.json({ error: pricing.code, detail: pricing.message }, { status: 400 });
    }

    let pickupSlotLabel: string | null = null;
    if (fulfillmentMode === "pickup") {
      if (!pickupSlotId) {
        return NextResponse.json(
          { error: "missing_pickup_slot" },
          { status: 400 }
        );
      }
      const slot = await getSlot(pickupSlotId);
      if (!slot || !slot.active || slot.booked >= slot.capacity) {
        return NextResponse.json(
          { error: "slot_unavailable" },
          { status: 409 }
        );
      }
      pickupSlotLabel = `${slot.locationLabel} | ${formatSlotWindow(
        slot.startsAt,
        slot.endsAt
      )}`;
    }

    const {
      email,
      firstName,
      lastName,
      phone,
      address,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      gclid,
      fbclid,
      fbc,
      fbp,
      ga_client_id,
      checkoutSessionId,
    } = body || {};

    const fwd = req.headers.get("x-forwarded-for") || "";
    const clientIp =
      (fwd.split(",")[0] || req.headers.get("x-real-ip") || "").trim() ||
      undefined;
    const clientUa = req.headers.get("user-agent") || undefined;

    let customerId: string | undefined;
    if (email) {
      const existing = await stripe.customers.list({ email, limit: 1 });
      const name = `${firstName || ""} ${lastName || ""}`.trim() || undefined;
      const stripeAddress =
        address && fulfillmentMode === "delivery"
          ? {
              line1: address.street,
              line2: address.apt || undefined,
              city: address.city,
              state: address.state,
              postal_code: address.zip,
              country: "US",
            }
          : undefined;
      if (existing.data.length > 0) {
        customerId = existing.data[0].id;
        await stripe.customers.update(customerId, {
          name,
          phone: phone || undefined,
          address: stripeAddress,
        });
      } else {
        const created = await stripe.customers.create({
          email,
          name,
          phone: phone || undefined,
          address: stripeAddress,
        });
        customerId = created.id;
      }
    }

    const isTestKey =
      process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") ?? false;

    const cartJson = serializeCartForMetadata(pricing.lineItems);
    const summary = summarizeLineItems(pricing.lineItems);

    const cartMetadata: Record<string, string> = {};
    if (cartJson.length <= STRIPE_METADATA_VALUE_LIMIT) {
      cartMetadata.cart_json = cartJson;
    } else if (checkoutSessionId) {
      cartMetadata.cart_ref = String(checkoutSessionId);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: pricing.totalCents,
      currency: "usd",
      customer: customerId,
      receipt_email: email || undefined,
      metadata: {
        product: "custom_cart",
        firstPayment: "true",
        ...(isTestKey ? { is_test: "true" } : {}),
        customer_name: `${firstName || ""} ${lastName || ""}`.trim(),
        customer_email: email || "",
        ...(phone ? { customer_phone: phone } : {}),
        ...(address && fulfillmentMode === "delivery"
          ? {
              shipping_street: address.street,
              shipping_apt: address.apt || "",
              shipping_city: address.city,
              shipping_state: address.state,
              shipping_zip: address.zip,
            }
          : {}),
        fulfillment_mode: fulfillmentMode,
        ...(pickupSlotId ? { pickup_slot: pickupSlotId } : {}),
        ...(pickupSlotLabel ? { pickup_slot_label: pickupSlotLabel } : {}),
        line_count: String(pricing.lineItems.length),
        line_items_summary: summary,
        subtotal_cents: String(pricing.subtotalCents),
        discount_cents: String(pricing.discountCents),
        shipping_cents: String(pricing.shippingCents),
        tax_cents: String(pricing.taxCents),
        total_cents: String(pricing.totalCents),
        ...cartMetadata,
        ...(pricing.appliedPromoCode
          ? {
              promo_code: pricing.appliedPromoCode,
              promo_discount_cents: String(pricing.discountCents),
            }
          : {}),
        ...(checkoutSessionId
          ? { checkoutSessionId: String(checkoutSessionId) }
          : {}),
        ...(utm_source ? { utm_source } : {}),
        ...(utm_medium ? { utm_medium } : {}),
        ...(utm_campaign ? { utm_campaign } : {}),
        ...(utm_content ? { utm_content } : {}),
        ...(utm_term ? { utm_term } : {}),
        ...(gclid ? { gclid } : {}),
        ...(fbclid ? { fbclid } : {}),
        ...(fbc ? { fbc } : {}),
        ...(fbp ? { fbp } : {}),
        ...(ga_client_id ? { ga_client_id } : {}),
        ...(clientIp ? { client_ip: clientIp } : {}),
        ...(clientUa ? { client_user_agent: clientUa.slice(0, 500) } : {}),
      },
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      pricing,
      pickupSlotLabel,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("checkout/intent error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function sanitizeCart(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return [];
  const out: CartLine[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const e = entry as Record<string, unknown>;
    const sku = typeof e.sku === "string" ? e.sku.trim() : "";
    const quantity = Math.floor(Number(e.quantity) || 0);
    if (sku && quantity > 0) out.push({ sku, quantity });
  }
  return out;
}

function formatSlotWindow(startsAtIso: string, endsAtIso: string): string {
  try {
    const start = new Date(startsAtIso);
    const end = new Date(endsAtIso);
    const dateFmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const timeFmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${dateFmt.format(start)}, ${timeFmt.format(start)}-${timeFmt.format(end)}`;
  } catch {
    return `${startsAtIso}-${endsAtIso}`;
  }
}
