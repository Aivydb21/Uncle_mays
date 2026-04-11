import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

// Subscription Price IDs (weekly, 10% discount vs one-time)
// Set these in .env: STRIPE_STARTER_SUB_PRICE_ID, STRIPE_FAMILY_SUB_PRICE_ID, STRIPE_COMMUNITY_SUB_PRICE_ID
const SUB_PRICE_MAP: Record<string, string> = {
  starter: process.env.STRIPE_STARTER_SUB_PRICE_ID || "",   // Essentials — $31.50/wk
  family: process.env.STRIPE_FAMILY_SUB_PRICE_ID || "",     // Family — $58.50/wk
  community: process.env.STRIPE_COMMUNITY_SUB_PRICE_ID || "", // Community — $85.50/wk
};

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    const { product, email } = await req.json();
    const priceId = SUB_PRICE_MAP[product];

    if (!priceId) {
      return NextResponse.json(
        { error: "Subscription not available for this product" },
        { status: 400 }
      );
    }

    const origin = req.headers.get("origin") || "https://unclemays.com";

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      phone_number_collection: { enabled: true },
      shipping_address_collection: { allowed_countries: ["US"] },
      subscription_data: {
        metadata: { product },
      },
      success_url: `${origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#boxes`,
    };

    // Pass customer email if available to prevent duplicate customers (UNC-144 will add full dedup)
    if (email) {
      sessionParams.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Subscribe checkout API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
