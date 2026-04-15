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
    const metadata: Record<string, string> = { product };
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

    // Create subscription in incomplete state
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
      metadata,
    });

    // Handle latest_invoice - it can be a string ID or expanded Invoice object
    let paymentIntent: Stripe.PaymentIntent | null = null;

    if (typeof subscription.latest_invoice === "string") {
      // Invoice not expanded - fetch it manually
      const invoice = await stripe.invoices.retrieve(subscription.latest_invoice, {
        expand: ["payment_intent"],
      });
      paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;
    } else if (subscription.latest_invoice) {
      // Invoice is expanded
      paymentIntent = subscription.latest_invoice.payment_intent as Stripe.PaymentIntent;
    }

    if (!paymentIntent?.client_secret) {
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
