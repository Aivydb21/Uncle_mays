import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";


// Map product slugs to Stripe Price IDs (one-time prices)
const PRICE_MAP: Record<string, string> = {
  starter: "price_1Sb4yrG67LsNxpTo2r1aphVI",   // Essentials Box — $35
  family: "price_1Sb5PUG67LsNxpToKdpQkWDg",     // Family Box — $65
  community: "price_1Sb5LiG67LsNxpToKmA6QPgg",  // Premium Box — $95
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

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded_page",
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      ...(email ? { customer_email: email } : {}),
      customer_creation: "always",
      phone_number_collection: { enabled: true },
      shipping_address_collection: { allowed_countries: ["US"] },
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

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Checkout API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
