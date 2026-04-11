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
      const email =
        session.customer_email ?? session.customer_details?.email ?? null;

      console.log(
        `[WEBHOOK] checkout.session.expired | session=${session.id} email=${email ?? "unknown"} expires_at=${session.expires_at}`
      );

      // Only attempt recovery if we have the customer's email (pre-checkout capture)
      if (email) {
        // Trigger a Trigger.dev task to send a recovery email 1 hour after abandonment.
        // TRIGGER_SECRET_KEY is the prod secret key from:
        //   https://cloud.trigger.dev → Project → Environments → Production → Secret key
        // If unset, the cron-based abandonedCheckoutProcessor (runs every 15 min) will
        // catch this session after the 1-hour window and send the recovery email instead.
        const triggerSecretKey = process.env.TRIGGER_SECRET_KEY;
        if (triggerSecretKey) {
          try {
            const res = await fetch(
              "https://api.trigger.dev/api/v1/tasks/send-abandoned-checkout-email/trigger",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${triggerSecretKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  payload: {
                    sessionId: session.id,
                    email,
                    customerName: session.customer_details?.name ?? null,
                    expiresAt: session.expires_at,
                  },
                  options: {
                    // Idempotency key prevents duplicate tasks if webhook fires more than once
                    idempotencyKey: `abandoned-checkout-${session.id}`,
                  },
                }),
              }
            );

            if (res.ok) {
              console.log(
                `[WEBHOOK] Queued 1hr recovery email task for session ${session.id}`
              );
            } else {
              const err = await res.json().catch(() => ({}));
              console.warn(
                `[WEBHOOK] Failed to queue recovery email task (will rely on cron fallback):`,
                err
              );
            }
          } catch (e) {
            console.warn(
              `[WEBHOOK] Network error queueing recovery email task (will rely on cron fallback):`,
              e
            );
          }
        } else {
          console.log(
            `[WEBHOOK] TRIGGER_SECRET_KEY not set — recovery email will be sent by cron fallback`
          );
        }
      }
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
