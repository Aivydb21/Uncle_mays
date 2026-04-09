import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !webhookSecret) {
    console.error("Webhook error: missing signature or secret");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(
        `[WEBHOOK] checkout.session.completed | session=${session.id} amount=${session.amount_total} email=${session.customer_email ?? session.customer_details?.email ?? "unknown"}`
      );
      // TODO: fulfillment logic (send confirmation email, update order DB, notify ops)
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(
        `[WEBHOOK] checkout.session.expired | session=${session.id} email=${session.customer_email ?? "unknown"}`
      );
      // TODO: abandoned cart follow-up
      break;
    }

    case "payment_intent.succeeded": {
      const intent = event.data.object as Stripe.PaymentIntent;
      console.log(
        `[WEBHOOK] payment_intent.succeeded | pi=${intent.id} amount=${intent.amount} status=${intent.status}`
      );
      break;
    }

    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const failMessage =
        intent.last_payment_error?.message ?? "unknown failure";
      console.error(
        `[WEBHOOK] payment_intent.payment_failed | pi=${intent.id} error="${failMessage}"`
      );
      // TODO: alert ops on payment failure
      break;
    }

    default:
      console.log(`[WEBHOOK] unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
