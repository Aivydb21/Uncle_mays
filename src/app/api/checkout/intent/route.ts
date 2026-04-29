import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getDiscountCents, validatePromo } from "@/lib/promo";

// Map product slugs to amounts in cents (one-time price).
// MUST match src/lib/products.ts PRODUCTS[slug].price * 100.
const AMOUNT_MAP: Record<string, number> = {
  starter: 4000,
  family: 7000,
};

// Optional protein add-on prices in cents.
// MUST match src/lib/products.ts PROTEIN_OPTIONS[].price * 100.
const PROTEIN_ADD_ON_PRICING: Record<string, number> = {
  chicken: 1200,
  "beef-short-ribs": 1200,
  "lamb-chops": 1200,
};

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const { product, email, firstName, lastName, phone, address, proteins, additionalProteins, beanChoice, utm_source, utm_medium, utm_campaign, utm_content, utm_term, gclid, fbclid, fbc, fbp, promo } = await req.json();

    // Capture client IP + user agent for Meta CAPI match quality. These add
    // strong signals on top of email/phone hashes and meaningfully improve
    // the share of CAPI Purchase events that get attributed back to ad clicks.
    const fwd = req.headers.get("x-forwarded-for") || "";
    const clientIp = (fwd.split(",")[0] || req.headers.get("x-real-ip") || "").trim() || undefined;
    const clientUa = req.headers.get("user-agent") || undefined;

    let amount = AMOUNT_MAP[product];

    if (!amount) {
      return NextResponse.json({ error: "Unknown product" }, { status: 400 });
    }

    // Proteins are optional paid add-ons (no protein is ever "included").
    // Charge for every entry in either `proteins` or `additionalProteins` —
    // both arrays are treated identically and may come from legacy callers.
    const allProteins: unknown[] = [
      ...(Array.isArray(proteins) ? proteins : []),
      ...(Array.isArray(additionalProteins) ? additionalProteins : []),
    ];
    for (const proteinId of allProteins) {
      if (typeof proteinId === "string") {
        const proteinCost = PROTEIN_ADD_ON_PRICING[proteinId];
        if (proteinCost) amount += proteinCost;
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

    const isTestKey = process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") ?? false;

    // Apply promo discount to the amount. PaymentIntents do not support Stripe
    // coupons directly, so we subtract the amount_off server-side and record
    // the promo code in metadata so the webhook + CAPI Purchase events reflect
    // the discounted value. Only codes in ACTIVE_PROMOS apply; unknown codes
    // are silently ignored (client already validated & displayed the banner).
    let appliedPromoCode: string | null = null;
    let appliedPromoDiscount = 0;
    const validPromo = validatePromo(promo, "one-time");
    if (validPromo) {
      appliedPromoCode = validPromo.code;
      appliedPromoDiscount = Math.min(getDiscountCents(validPromo.entry, amount), Math.max(0, amount - 100));
      amount -= appliedPromoDiscount;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      customer: customerId,
      receipt_email: email || undefined,
      metadata: {
        product,
        ...(isTestKey ? { is_test: "true" } : {}),
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
        ...(Array.isArray(proteins) && proteins.length > 0
          ? { protein_selections: proteins.join(", ") }
          : {}),
        ...(Array.isArray(additionalProteins) && additionalProteins.length > 0
          ? { additional_protein_selections: additionalProteins.join(", ") }
          : {}),
        ...(typeof beanChoice === "string" && beanChoice
          ? { bean_choice: beanChoice }
          : {}),
        ...(utm_source ? { utm_source } : {}),
        ...(utm_medium ? { utm_medium } : {}),
        ...(utm_campaign ? { utm_campaign } : {}),
        ...(utm_content ? { utm_content } : {}),
        ...(utm_term ? { utm_term } : {}),
        ...(gclid ? { gclid } : {}),
        ...(fbclid ? { fbclid } : {}),
        ...(fbc ? { fbc } : {}),
        ...(fbp ? { fbp } : {}),
        ...(clientIp ? { client_ip: clientIp } : {}),
        ...(clientUa ? { client_user_agent: clientUa.slice(0, 500) } : {}),
        ...(appliedPromoCode ? { promo_code: appliedPromoCode, promo_discount_cents: String(appliedPromoDiscount) } : {}),
      },
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      appliedAmount: amount,
      appliedPromoCode,
      appliedPromoDiscount,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("checkout/intent error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
