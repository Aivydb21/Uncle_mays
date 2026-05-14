import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { verifyTrackingToken, computeStatus } from "@/lib/order-tracking";
import { formatPreferredSlotLabel } from "@/lib/delivery-windows";

/**
 * Customer-facing order tracking endpoint.
 *
 *   GET /api/order-tracking?session_id=cs_xxx&t=<hmac>
 *
 * Verifies the HMAC token, then pulls the order from Stripe and returns
 * the subset of fields a customer needs to track their delivery without
 * logging in. PII is intentionally minimal — first name only, ZIP only
 * (full address kept off the wire even though the customer typed it).
 *
 * Token verification means a tampered/guessed link returns 403.
 */

interface TrackingResponse {
  sessionId: string;
  status: "confirmed" | "packing" | "out_for_delivery" | "delivered";
  firstName: string;
  email: string;
  totalCents: number;
  currency: string;
  items: Array<{ name: string; quantity: number; lineTotalCents: number }>;
  fulfillment: {
    mode: "delivery" | "pickup" | null;
    deliveryDate: string | null;     // ISO YYYY-MM-DD
    deliveryWindow: string | null;   // window key
    deliveryWindowLabel: string | null;
    pickupSlotLabel: string | null;
    addressLine: string | null;      // e.g. "Chicago, IL 60615" (no street)
  };
  isSubscription: boolean;
  createdAt: number;
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  const token = req.nextUrl.searchParams.get("t");

  if (!sessionId || !token) {
    return NextResponse.json({ error: "session_id and t required" }, { status: 400 });
  }

  if (!verifyTrackingToken(sessionId, token)) {
    return NextResponse.json({ error: "invalid token" }, { status: 403 });
  }

  try {
    let session: Stripe.Checkout.Session | null = null;
    let intent: Stripe.PaymentIntent | null = null;
    let metadata: Stripe.Metadata = {};
    let amountTotal = 0;
    let currency = "usd";
    let lineItems: Array<{ name: string; quantity: number; lineTotalCents: number }> = [];
    let mode: "payment" | "subscription" | "setup" = "payment";
    let createdAt = Math.floor(Date.now() / 1000);
    let email = "";
    let customerName = "";

    if (sessionId.startsWith("cs_")) {
      session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["line_items.data.price.product", "customer_details"],
      });
      metadata = session.metadata ?? {};
      amountTotal = session.amount_total ?? 0;
      currency = (session.currency ?? "usd").toUpperCase();
      mode = session.mode;
      createdAt = session.created;
      email = session.customer_details?.email ?? session.customer_email ?? "";
      customerName = session.customer_details?.name ?? "";
      lineItems = (session.line_items?.data ?? []).map((li) => {
        const product = li.price?.product as Stripe.Product | undefined;
        return {
          name: product?.name ?? li.description ?? "Item",
          quantity: li.quantity ?? 1,
          lineTotalCents: li.amount_total ?? 0,
        };
      });
    } else if (sessionId.startsWith("pi_")) {
      intent = await stripe.paymentIntents.retrieve(sessionId);
      metadata = intent.metadata ?? {};
      amountTotal = intent.amount;
      currency = (intent.currency ?? "usd").toUpperCase();
      createdAt = intent.created;
      email = (intent.receipt_email as string | null) ?? metadata.email ?? "";
      customerName = metadata.customer_name ?? "";
      // Parse the cart_json metadata field (set by /api/checkout/intent).
      if (metadata.cart_json) {
        try {
          const cart = JSON.parse(metadata.cart_json) as Array<{
            name?: string;
            sku?: string;
            quantity?: number;
            unitPriceCents?: number;
            lineTotalCents?: number;
          }>;
          lineItems = cart.map((c) => ({
            name: c.name ?? c.sku ?? "Item",
            quantity: c.quantity ?? 1,
            lineTotalCents:
              c.lineTotalCents ??
              (c.unitPriceCents ?? 0) * (c.quantity ?? 1),
          }));
        } catch {
          // ignore parse failures
        }
      }
    } else {
      return NextResponse.json({ error: "unknown session id format" }, { status: 400 });
    }

    const firstName = (customerName || "").trim().split(/\s+/)[0] || "friend";

    const fulfillmentMode = (metadata.fulfillment_mode as "delivery" | "pickup" | undefined) ?? null;
    const deliveryDate = metadata.preferred_delivery_date ?? null;
    const deliveryWindow = metadata.preferred_delivery_window ?? null;
    const deliveryWindowLabel = formatPreferredSlotLabel(deliveryDate, deliveryWindow);
    const pickupSlotLabel = metadata.pickup_slot_label ?? null;

    // Build a minimal city/state/zip address line for delivery orders. We
    // pull from intent metadata (set by /api/checkout/intent at payment
    // creation). Street is deliberately omitted so the tracking URL stays
    // low-PII if shared. Stripe-hosted checkout shipping_details is also
    // consulted as a fallback for legacy buy-button flows.
    let addressLine: string | null = null;
    if (fulfillmentMode === "delivery") {
      const sessionShipping = (session as unknown as {
        shipping_details?: { address?: Stripe.Address | null } | null;
      } | null)?.shipping_details?.address ?? null;
      const city = metadata.shipping_city ?? sessionShipping?.city ?? null;
      const state = metadata.shipping_state ?? sessionShipping?.state ?? null;
      const zip = metadata.shipping_zip ?? sessionShipping?.postal_code ?? null;
      if (city || state || zip) {
        addressLine = [city, state, zip].filter(Boolean).join(", ");
      }
    }
    void intent; // typescript: keep var alive in case we add intent-specific branches later

    const status = computeStatus(deliveryDate);
    const isSubscription = mode === "subscription";

    const body: TrackingResponse = {
      sessionId,
      status,
      firstName,
      email,
      totalCents: amountTotal,
      currency,
      items: lineItems,
      fulfillment: {
        mode: fulfillmentMode,
        deliveryDate,
        deliveryWindow,
        deliveryWindowLabel,
        pickupSlotLabel,
        addressLine,
      },
      isSubscription,
      createdAt,
    };

    return NextResponse.json(body, {
      // Customer may refresh repeatedly during the delivery window —
      // short cache makes it cheap without making it stale.
      headers: { "Cache-Control": "private, max-age=30" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
