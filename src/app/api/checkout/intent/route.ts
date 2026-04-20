import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

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

// Additional protein pricing in cents (10-13% markup over base protein costs)
const ADDITIONAL_PROTEIN_PRICING: Record<string, number> = {
  chicken: 2000,
  "pork-chops": 1800,
  "beef-short-ribs": 2400,
  salmon: 2200,
};

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const { product, email, firstName, lastName, phone, address, proteins, additionalProteins, utm_source, utm_medium, utm_campaign, utm_content, utm_term } = await req.json();

    // Apply first-order discount for eligible products (e.g. starter box)
    const isFirstOrder = product in FIRST_ORDER_AMOUNT_MAP;
    let amount = isFirstOrder ? FIRST_ORDER_AMOUNT_MAP[product] : AMOUNT_MAP[product];

    if (!amount) {
      return NextResponse.json({ error: "Unknown product" }, { status: 400 });
    }

    // Add additional protein costs to the total amount
    if (Array.isArray(additionalProteins) && additionalProteins.length > 0) {
      for (const proteinId of additionalProteins) {
        const proteinCost = ADDITIONAL_PROTEIN_PRICING[proteinId];
        if (proteinCost) {
          amount += proteinCost;
        }
      }
    }

    // Look up or create Stripe customer with shipping address and phone
    let customerId: string | undefined;
    if (email) {
      const existingCustomers = await stripe.customers.list({ email, limit: 1 });
      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
        // Update existing customer with latest address/phone if provided
        if (address || phone) {
          await stripe.customers.update(customerId, {
            name: `${firstName} ${lastName}`.trim(),
            phone: phone || undefined,
            address: address
              ? {
                  line1: address.street,
                  line2: address.apt || undefined,
                  city: address.city,
                  state: address.state,
                  postal_code: address.zip,
                  country: "US",
                }
              : undefined,
          });
        }
      } else {
        const customer = await stripe.customers.create({
          email,
          name: `${firstName} ${lastName}`.trim(),
          phone: phone || undefined,
          address: address
            ? {
                line1: address.street,
                line2: address.apt || undefined,
                city: address.city,
                state: address.state,
                postal_code: address.zip,
                country: "US",
              }
            : undefined,
        });
        customerId = customer.id;
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      customer: customerId,
      receipt_email: email || undefined,
      metadata: {
        product,
        customer_name: `${firstName || ""} ${lastName || ""}`.trim(),
        customer_email: email || "",
        ...(phone ? { customer_phone: phone } : {}),
        ...(address
          ? {
              shipping_street: address.street,
              shipping_apt: address.apt || "",
              shipping_city: address.city,
              shipping_state: address.state,
              shipping_zip: address.zip,
            }
          : {}),
        ...(isFirstOrder ? { first_order_discount: "true" } : {}),
        ...(Array.isArray(proteins) && proteins.length > 0
          ? { protein_selections: proteins.join(", ") }
          : {}),
        ...(Array.isArray(additionalProteins) && additionalProteins.length > 0
          ? { additional_protein_selections: additionalProteins.join(", ") }
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
