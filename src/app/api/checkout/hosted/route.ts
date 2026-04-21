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
      console.error("STRIPE_SECRET_KEY is not set");
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const body = await req.json();
    const {
      product,
      email,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
    } = body;

    const priceId = PRICE_MAP[product];

    if (!priceId) {
      return NextResponse.json({ error: "Unknown product" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || "https://unclemays.com";

    const isTestKey = process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") ?? false;

    // Build metadata object with product info + UTM parameters for campaign attribution
    const metadata: Record<string, string> = {
      product,
      source: "website",
      ...(isTestKey ? { is_test: "true" } : {}),
    };

    // Add UTM parameters to metadata for GA4 server-side tracking
    if (utm_source) metadata.utm_source = utm_source;
    if (utm_medium) metadata.utm_medium = utm_medium;
    if (utm_campaign) metadata.utm_campaign = utm_campaign;
    if (utm_content) metadata.utm_content = utm_content;
    if (utm_term) metadata.utm_term = utm_term;

    // Create HOSTED Checkout Session (redirects to checkout.stripe.com)
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      ...(email ? { customer_email: email } : {}),
      customer_creation: "always",
      phone_number_collection: { enabled: true },
      shipping_address_collection: { allowed_countries: ["US"] },
      custom_fields: [
        {
          key: "delivery_notes",
          label: { type: "custom", custom: "Delivery Instructions (optional)" },
          type: "text",
          optional: true,
        },
      ],
      custom_text: {
        submit: {
          message:
            "Chicago delivery on Wednesdays. Order by Tuesday night for this week's delivery.",
        },
      },
      success_url: `${origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#boxes`,
      // Metadata for analytics, abandoned cart tracking, and campaign attribution
      metadata,
    });

    // Return the session URL for redirect (NOT client_secret)
    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Checkout API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
