import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { session_id, customer_id, email } = await req.json();

    let customerId: string | null = customer_id ?? null;

    // Resolve customer from a Checkout Session if no direct customer_id provided
    if (!customerId && session_id) {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (!session.customer) {
        return NextResponse.json(
          { error: "No customer associated with this checkout session" },
          { status: 400 }
        );
      }
      customerId = typeof session.customer === "string" ? session.customer : session.customer.id;
    }

    // Resolve customer from email (for /manage-subscription self-serve page)
    if (!customerId && email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length === 0) {
        return NextResponse.json(
          { error: "No subscription found for this email address" },
          { status: 404 }
        );
      }
      customerId = customers.data[0].id;
    }

    if (!customerId) {
      return NextResponse.json(
        { error: "session_id, customer_id, or email required" },
        { status: 400 }
      );
    }

    const origin = req.headers.get("origin") || "https://unclemays.com";

    // Ensure a portal configuration exists; create one if the Dashboard hasn't set it up yet.
    let configurationId: string | undefined;
    try {
      const configs = await stripe.billingPortal.configurations.list({ is_default: true, limit: 1 });
      if (configs.data.length > 0) {
        configurationId = configs.data[0].id;
      } else {
        const newConfig = await stripe.billingPortal.configurations.create({
          business_profile: {
            headline: "Uncle May's Produce — Manage Your Subscription",
            privacy_policy_url: `${origin}/privacy`,
            terms_of_service_url: `${origin}/terms`,
          },
          features: {
            subscription_cancel: { enabled: true },
            payment_method_update: { enabled: true },
            invoice_history: { enabled: true },
          },
          default_return_url: `${origin}/`,
        });
        configurationId = newConfig.id;
      }
    } catch {
      // If configuration listing fails, proceed without explicit configuration
      // (Stripe will use the Dashboard default if one exists)
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/`,
      ...(configurationId ? { configuration: configurationId } : {}),
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Portal session API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
