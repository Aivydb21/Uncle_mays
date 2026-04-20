import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const SUB_PRICE_MAP: Record<string, string> = {
  starter: process.env.STRIPE_STARTER_SUB_PRICE_ID || "",
  family: process.env.STRIPE_FAMILY_SUB_PRICE_ID || "",
  community: process.env.STRIPE_COMMUNITY_SUB_PRICE_ID || "",
};

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
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

    // Build delivery metadata
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

    // Find or create Stripe customer to avoid duplicates
    let customerId: string;
    if (email) {
      const existing = await stripe.customers.list({ email, limit: 1 });
      if (existing.data.length > 0) {
        customerId = existing.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email,
          name: `${firstName || ""} ${lastName || ""}`.trim() || undefined,
          metadata: deliveryMeta,
        });
        customerId = customer.id;
      }
    } else {
      const customer = await stripe.customers.create({ metadata: deliveryMeta });
      customerId = customer.id;
    }

    // Create subscription in incomplete state so we always get an intent to confirm.
    // payment_behavior:"default_incomplete" keeps the sub inactive until payment confirmed.
    // If the price has a trial (first invoice $0), Stripe creates a pending_setup_intent
    // instead of a payment_intent — we fall back to that so the card is saved for billing.
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      metadata: deliveryMeta,
      expand: ["latest_invoice.payment_intent", "pending_setup_intent"],
    });

    // latest_invoice.payment_intent and pending_setup_intent are expanded objects,
    // not available on the base types — cast through unknown to access them.
    type ExpandedInvoice = Stripe.Invoice & { payment_intent?: Stripe.PaymentIntent | null };
    const invoice = subscription.latest_invoice as ExpandedInvoice | null;
    const paymentIntent = invoice?.payment_intent ?? null;
    const setupIntent = subscription.pending_setup_intent as Stripe.SetupIntent | null;

    const clientSecret = paymentIntent?.client_secret ?? setupIntent?.client_secret ?? null;
    const intentType: "payment" | "setup" = paymentIntent?.client_secret ? "payment" : "setup";

    if (!clientSecret) {
      // Stripe returned neither intent — this should not happen with default_incomplete,
      // but log diagnostic info and surface a clear error.
      console.error("[subscribe-intent] null client_secret", {
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        invoiceId: (invoice as Stripe.Invoice & { id?: string })?.id,
        invoiceAmountDue: (invoice as Stripe.Invoice & { amount_due?: number })?.amount_due,
        paymentIntentStatus: paymentIntent?.status,
        hasPendingSetupIntent: !!setupIntent,
        priceId,
      });
      return NextResponse.json(
        { error: "Could not initialize subscription payment" },
        { status: 500 }
      );
    }

    console.log("[subscribe-intent] created", {
      subscriptionId: subscription.id,
      intentType,
      priceId,
    });

    return NextResponse.json({
      clientSecret,
      subscriptionId: subscription.id,
      intentType,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[subscribe-intent] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
