import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

// Map product slugs to amounts in cents
const AMOUNT_MAP: Record<string, number> = {
  starter: 3500,
  family: 6500,
  community: 9500,
};

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const { product, email, firstName, lastName } = await req.json();
    const amount = AMOUNT_MAP[product];

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
