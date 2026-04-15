import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

// Subscription Price IDs (weekly, 10% discount vs one-time)
const SUB_PRICE_MAP: Record<string, string> = {
  starter: process.env.STRIPE_STARTER_SUB_PRICE_ID || "",
  family: process.env.STRIPE_FAMILY_SUB_PRICE_ID || "",
  community: process.env.STRIPE_COMMUNITY_SUB_PRICE_ID || "",
};

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    const {
      product,
      email,
      firstName,
      lastName,
      phone,
      address,
      deliveryNotes,
      proteinChoices,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
    } = await req.json();

    const priceId = SUB_PRICE_MAP[product];

    if (!priceId) {
      return NextResponse.json(
        { error: "Subscription not available for this product" },
        { status: 400 }
      );
    }

    // Get price details to know the amount
    const price = await stripe.prices.retrieve(priceId);
    const amount = price.unit_amount || 0;

    // Look up or create customer
    let customerId: string;
    if (email) {
      const existingCustomers = await stripe.customers.list({ email, limit: 1 });
      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email,
          name: `${firstName} ${lastName}`.trim(),
          phone,
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
    } else {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Build metadata
    const metadata: Record<string, string> = { product, priceId };
    if (firstName) metadata.firstName = firstName;
    if (lastName) metadata.lastName = lastName;
    if (phone) metadata.phone = phone;
    if (address?.street) {
      metadata.deliveryAddress = [
        address.street,
        address.apt,
        address.city,
        address.state,
        address.zip,
      ]
        .filter(Boolean)
        .join(", ");
    }
    if (deliveryNotes) metadata.deliveryNotes = deliveryNotes;
    if (proteinChoices?.length) metadata.proteinChoices = proteinChoices.join(", ");
    if (utm_source) metadata.utm_source = utm_source;
    if (utm_medium) metadata.utm_medium = utm_medium;
    if (utm_campaign) metadata.utm_campaign = utm_campaign;
    if (utm_content) metadata.utm_content = utm_content;
    if (utm_term) metadata.utm_term = utm_term;

    // Create subscription in paused state - will be activated after first payment
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      metadata,
      // Start in the future so first payment is manual
      billing_cycle_anchor_config: { day_of_month: 1 },
      proration_behavior: "none",
    });

    // Create a manual PaymentIntent for the first payment
    const paymentIntent = await stripe.paymentIntents.create({
      customer: customerId,
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      setup_future_usage: "off_session",
      metadata: {
        ...metadata,
        subscriptionId: subscription.id,
        firstPayment: "true",
      },
    });

    if (!paymentIntent.client_secret) {
      // Clean up subscription if payment intent creation failed
      await stripe.subscriptions.cancel(subscription.id);
      return NextResponse.json(
        { error: "Could not initialize subscription payment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      subscriptionId: subscription.id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Subscribe intent API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
