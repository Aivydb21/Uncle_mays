import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { upsertContact, createCart } from "@/lib/mailchimp";

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
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const { product, email, firstName, lastName, phone, address, deliveryNotes, proteinChoices, utm_source, utm_medium, utm_campaign, utm_content, utm_term } = await req.json();
    const priceId = SUB_PRICE_MAP[product];

    if (!priceId) {
      return NextResponse.json(
        { error: "Subscription not available for this product" },
        { status: 400 }
      );
    }

    const origin = req.headers.get("origin") || "https://unclemays.com";

    // Build delivery metadata from pre-collected customer info
    const deliveryMeta: Record<string, string> = { product };
    if (firstName) deliveryMeta.firstName = firstName;
    if (lastName) deliveryMeta.lastName = lastName;
    if (phone) deliveryMeta.phone = phone;
    if (address?.street) {
      deliveryMeta.deliveryAddress = [
        address.street,
        address.apt,
        address.city,
        address.state,
        address.zip,
      ]
        .filter(Boolean)
        .join(", ");
    }
    if (deliveryNotes) deliveryMeta.deliveryNotes = deliveryNotes;
    if (proteinChoices?.length) deliveryMeta.proteinChoices = proteinChoices.join(", ");
    if (utm_source) deliveryMeta.utm_source = utm_source;
    if (utm_medium) deliveryMeta.utm_medium = utm_medium;
    if (utm_campaign) deliveryMeta.utm_campaign = utm_campaign;
    if (utm_content) deliveryMeta.utm_content = utm_content;
    if (utm_term) deliveryMeta.utm_term = utm_term;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      phone_number_collection: { enabled: true },
      shipping_address_collection: { allowed_countries: ["US"] },
      subscription_data: {
        metadata: deliveryMeta,
      },
      success_url: `${origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscribe/${product}`,
    };

    // Look up existing Stripe customer by email to prevent duplicate customer records.
    // If found, pass `customer` (ID) so Stripe reuses the existing record.
    // If not found, pass `customer_email` and Stripe will create one automatically.
    if (email) {
      const existingCustomers = await stripe.customers.list({ email, limit: 1 });
      if (existingCustomers.data.length > 0) {
        sessionParams.customer = existingCustomers.data[0].id;
      } else {
        sessionParams.customer_email = email;
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Non-blocking: upsert subscriber + create abandoned cart so Mailchimp
    // Journey fires if the customer abandons the Stripe Checkout page.
    if (email && firstName && lastName) {
      upsertContact(email, firstName, lastName)
        .catch((err) => console.error("Mailchimp upsertContact error (subscribe):", err));
      const priceInDollars = (session.amount_total ?? 0) / 100;
      createCart(session.id, email, firstName, lastName, product, priceInDollars)
        .catch((err) => console.error("Mailchimp createCart error (subscribe):", err));
    }

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Subscribe checkout API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
