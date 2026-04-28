import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { upsertContact, createCart } from "@/lib/mailchimp";
import { sendCapiEvent } from "@/lib/meta-capi";
import { validatePromo } from "@/lib/promo";

// Subscription Price IDs (weekly, 10% discount vs one-time).
// Community Box is retired — do not add it back.
const SUB_PRICE_MAP: Record<string, string> = {
  starter: process.env.STRIPE_STARTER_SUB_PRICE_ID || "",
  family: process.env.STRIPE_FAMILY_SUB_PRICE_ID || "",
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

    const {
      product,
      email,
      firstName,
      lastName,
      phone,
      address,
      deliveryNotes,
      proteinChoices,
      additionalProteins,
      beanChoice,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      gclid,
      fbclid,
      fbc,
      fbp,
      eventId: clientEventId,
      promo,
    } = await req.json();

    const fwd = req.headers.get("x-forwarded-for") || "";
    const clientIp = (fwd.split(",")[0] || req.headers.get("x-real-ip") || "").trim() || undefined;
    const clientUa = req.headers.get("user-agent") || undefined;

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
        // Update customer with latest address/phone
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

    const isTestKey = process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") ?? false;

    // Build metadata
    const metadata: Record<string, string> = { product, customer_email: email, ...(isTestKey ? { is_test: "true" } : {}) };
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
    if (typeof beanChoice === "string" && beanChoice) {
      metadata.bean_choice = beanChoice;
    }
    if (Array.isArray(proteinChoices) && proteinChoices.length) {
      metadata.proteinChoices = proteinChoices.join(", ");
    }
    if (Array.isArray(additionalProteins) && additionalProteins.length) {
      metadata.additionalProteins = additionalProteins.join(", ");
    }
    if (utm_source) metadata.utm_source = utm_source;
    if (utm_medium) metadata.utm_medium = utm_medium;
    if (utm_campaign) metadata.utm_campaign = utm_campaign;
    if (utm_content) metadata.utm_content = utm_content;
    if (utm_term) metadata.utm_term = utm_term;
    if (gclid) metadata.gclid = gclid;
    if (fbclid) metadata.fbclid = fbclid;
    if (fbc) metadata.fbc = fbc;
    if (fbp) metadata.fbp = fbp;
    if (clientIp) metadata.client_ip = clientIp;
    if (clientUa) metadata.client_user_agent = clientUa.slice(0, 500);

    // Validate promo. For subscriptions we attach the Stripe coupon directly
    // so Stripe handles the first-invoice discount — duration=once means the
    // coupon only applies to the first billing cycle. Unknown codes are
    // silently ignored (client already validated & displayed the banner).
    const validPromo = validatePromo(promo, "subscription");
    if (validPromo) {
      metadata.promo_code = validPromo.code;
      metadata.promo_discount_cents = String(validPromo.entry.amountOffCents);
    }

    // --- Idempotency: reuse an existing incomplete subscription if one exists ---
    // Without this, every page mount creates a NEW subscription. When a second
    // subscription is created for the same customer+price, Stripe voids the
    // previous invoice, canceling its PaymentIntent with `void_invoice`.
    // This was the root cause of UNC-643.

    type InvoiceWithPayments = Stripe.Invoice & {
      payments?: {
        data: Array<{
          payment: { payment_intent: string | null; type: string };
          status: string;
        }>;
      };
    };

    // Helper: extract a usable PaymentIntent from a subscription's latest invoice
    async function extractUsablePI(sub: Stripe.Subscription): Promise<Stripe.PaymentIntent | null> {
      const inv = sub.latest_invoice as InvoiceWithPayments | null;
      if (!inv || inv.status !== "open") return null;
      const piId = inv.payments?.data?.[0]?.payment?.payment_intent ?? null;
      if (!piId) return null;
      const pi = await stripe.paymentIntents.retrieve(piId);
      // Only reuse if the PI is still waiting for payment
      if (pi.status === "canceled" || !pi.client_secret) return null;
      return pi;
    }

    let subscription!: Stripe.Subscription;
    let paymentIntent!: Stripe.PaymentIntent;

    // Check for existing incomplete subscriptions for same customer + price
    const existingSubs = await stripe.subscriptions.list({
      customer: customerId,
      status: "incomplete",
      limit: 10,
      expand: ["data.latest_invoice.payments"],
    });

    // Find the first incomplete sub with the same price and a usable PI
    let reusedSub: Stripe.Subscription | null = null;
    const orphanedSubIds: string[] = [];

    for (const sub of existingSubs.data) {
      const hasMatchingPrice = sub.items.data.some((item) => item.price.id === priceId);
      if (!hasMatchingPrice) continue;

      if (!reusedSub) {
        const pi = await extractUsablePI(sub);
        if (pi) {
          reusedSub = sub;
          paymentIntent = pi;
        } else {
          orphanedSubIds.push(sub.id);
        }
      } else {
        orphanedSubIds.push(sub.id);
      }
    }

    // Cancel orphaned incomplete subscriptions in the background
    for (const orphanId of orphanedSubIds) {
      stripe.subscriptions.cancel(orphanId).catch((e) =>
        console.warn("Failed to cancel orphaned subscription:", orphanId, e)
      );
    }

    if (reusedSub) {
      // Reuse existing subscription — just re-stamp the PI metadata
      subscription = reusedSub;
      // paymentIntent is already set from extractUsablePI above
    } else {
      // Create a new subscription.
      //
      // CRITICAL: In Stripe API 2025-11-17+, invoice.payment_intent is no longer
      // populated. The PaymentIntent ID is now found under:
      //   invoice.payments.data[0].payment.payment_intent
      // We expand payments, extract the PI ID, then retrieve it to get client_secret.
      subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payments"],
        metadata,
        ...(validPromo ? { discounts: [{ coupon: validPromo.entry.couponId }] } : {}),
      });

      const invoice = subscription.latest_invoice as InvoiceWithPayments;
      const paymentIntentId = invoice?.payments?.data?.[0]?.payment?.payment_intent ?? null;

      if (!paymentIntentId) {
        await stripe.subscriptions.cancel(subscription.id);
        return NextResponse.json(
          { error: "Could not initialize subscription payment" },
          { status: 500 }
        );
      }

      const pi = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (!pi.client_secret) {
        await stripe.subscriptions.cancel(subscription.id);
        return NextResponse.json(
          { error: "Could not initialize subscription payment — no client secret" },
          { status: 500 }
        );
      }

      paymentIntent = pi;
    }

    // Stamp the PaymentIntent with subscription metadata so the
    // payment_intent.succeeded webhook can fire CAPI Purchase and Mailchimp cleanup.
    await stripe.paymentIntents.update(paymentIntent.id, {
      metadata: {
        ...metadata,
        firstPayment: "true",
        subscriptionId: subscription.id,
      },
    });

    // Non-blocking: upsert subscriber + create abandoned cart so Mailchimp
    // Journey fires if the customer abandons before completing payment.
    upsertContact(email, firstName, lastName)
      .catch((err) => console.error("Mailchimp upsertContact error (subscribe-intent):", err));
    const priceInDollars = paymentIntent.amount / 100;
    createCart(paymentIntent.id, email, firstName, lastName, product, priceInDollars)
      .catch((err) => console.error("Mailchimp createCart error (subscribe-intent):", err));

    // Fire CAPI InitiateCheckout server-side for subscription (bypasses ITP/ad blockers)
    const userAgent = clientUa || "";
    const referer = req.headers.get("referer") || "";
    sendCapiEvent({
      eventName: "InitiateCheckout",
      eventSourceUrl: referer || `https://unclemays.com/subscribe/${product}/payment`,
      userData: {
        email,
        phone,
        client_ip_address: clientIp,
        client_user_agent: userAgent,
      },
      customData: {
        content_ids: [product],
        content_type: "product",
        value: priceInDollars,
        currency: "USD",
        num_items: 1,
      },
      // Prefer the client-supplied eventId so the browser pixel and this server
      // CAPI event dedupe at Meta. Fall back to a subscription-based id only if
      // the client didn't send one.
      eventId: clientEventId || `initiate-sub-${subscription.id}`,
    }).catch((err) => console.error("[CAPI] InitiateCheckout (subscribe-intent) error:", err));

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
