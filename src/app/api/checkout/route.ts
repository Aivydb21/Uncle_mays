import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { sendCapiEvent } from "@/lib/meta-capi";


// Map product slugs to Stripe Price IDs (one-time prices).
// Community Box is retired. The underlying Stripe Price IDs still carry the
// legacy $35/$65 amounts — Stripe prices are immutable, so new Price IDs
// must be created and swapped in when Small/Family retail prices change
// ($40/$70 in the new model). Until then, the embedded-page hosted flow
// (this route) will still charge the old amount. All primary traffic uses
// the custom PaymentIntent flow in /api/checkout/intent, which was updated.
const PRICE_MAP: Record<string, string> = {
  starter: "price_1Sb4yrG67LsNxpTo2r1aphVI",
  family: "price_1Sb5PUG67LsNxpToKdpQkWDg",
};

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const { product, email } = await req.json();
    const priceId = PRICE_MAP[product];

    if (!priceId) {
      return NextResponse.json({ error: "Unknown product" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || "https://unclemays.com";

    const isTestKey = process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") ?? false;

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded_page",
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      ...(email ? { customer_email: email } : {}),
      customer_creation: "always",
      phone_number_collection: { enabled: true },
      shipping_address_collection: { allowed_countries: ["US"] },
      ...(isTestKey ? { metadata: { is_test: "true" } } : {}),
      custom_fields: [
        {
          key: "delivery_zip",
          label: { type: "custom", custom: "Delivery ZIP Code" },
          type: "text",
        },
      ],
      custom_text: {
        submit: {
          message:
            "Chicago delivery on Wednesdays. Order by Tuesday night when you can for this week's route.",
        },
      },
      return_url: `${origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
    });

    // Fire CAPI InitiateCheckout server-side (bypasses ITP/ad blockers)
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "";
    const userAgent = req.headers.get("user-agent") || "";
    const referer = req.headers.get("referer") || "";
    const ONE_TIME_PRICES: Record<string, number> = { starter: 40, family: 70 };
    const priceInDollars = ONE_TIME_PRICES[product] ?? 0;
    sendCapiEvent({
      eventName: "InitiateCheckout",
      eventSourceUrl: referer || `${origin}/checkout/${product}`,
      userData: { client_ip_address: clientIp, client_user_agent: userAgent },
      customData: {
        content_ids: [product],
        content_type: "product",
        value: priceInDollars,
        currency: "USD",
        num_items: 1,
      },
      eventId: `initiate-ot-${session.id}`,
    }).catch((err) => console.error("[CAPI] InitiateCheckout (checkout) error:", err));

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Checkout API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
