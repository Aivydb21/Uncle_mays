import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

// Map product slugs to amounts in cents (regular price)
const AMOUNT_MAP: Record<string, number> = {
  starter: 3500,
  family: 6500,
  community: 9500,
};

// First-order discounted prices in cents — applied automatically for eligible products
const FIRST_ORDER_AMOUNT_MAP: Record<string, number> = {
  starter: 3000, // $30 first-order price (regular $35)
};

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const { product, email, firstName, lastName, proteins, utm_source, utm_medium, utm_campaign, utm_content, utm_term } = await req.json();

    // Apply first-order discount for eligible products (e.g. starter box)
    const isFirstOrder = product in FIRST_ORDER_AMOUNT_MAP;
    const amount = isFirstOrder ? FIRST_ORDER_AMOUNT_MAP[product] : AMOUNT_MAP[product];

    if (!amount) {
      return NextResponse.json({ error: "Unknown product" }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      receipt_email: email || undefined,
      metadata: {
        product,
        customer_name: `${firstName || ""} ${lastName || ""}`.trim(),
        customer_email: email || "",
        ...(isFirstOrder ? { first_order_discount: "true" } : {}),
        ...(Array.isArray(proteins) && proteins.length > 0
          ? { protein_selections: proteins.join(", ") }
          : {}),
        ...(utm_source ? { utm_source } : {}),
        ...(utm_medium ? { utm_medium } : {}),
        ...(utm_campaign ? { utm_campaign } : {}),
        ...(utm_content ? { utm_content } : {}),
        ...(utm_term ? { utm_term } : {}),
      },
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("checkout/intent error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
