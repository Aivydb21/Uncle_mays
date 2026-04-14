import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

/**
 * Send purchase event to GA4 via Measurement Protocol (server-side tracking).
 * This ensures 100% accurate conversion tracking, unaffected by ad blockers.
 *
 * Docs: https://developers.google.com/analytics/devguides/collection/protocol/ga4
 */
async function sendGA4PurchaseEvent(session: Stripe.Checkout.Session) {
  const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;
  const GA4_API_SECRET = process.env.GA4_API_SECRET;

  if (!GA4_MEASUREMENT_ID || !GA4_API_SECRET) {
    console.log(
      "[WEBHOOK] GA4 tracking skipped: NEXT_PUBLIC_GA_ID or GA4_API_SECRET not set"
    );
    return;
  }

  // Use customer ID as client_id for GA4 (or fallback to session ID)
  const clientId =
    (typeof session.customer === "string" ? session.customer : session.customer?.id) ||
    session.id;

  // Get product info from metadata
  const product = session.metadata?.product || "unknown";
  const value = session.amount_total ? session.amount_total / 100 : 0;

  // Build items array for enhanced e-commerce
  const items = [
    {
      item_id: product,
      item_name: product.charAt(0).toUpperCase() + product.slice(1) + " Box",
      affiliation: "Uncle May's Produce",
      price: value,
      quantity: 1,
      item_category: "Produce Box",
    },
  ];

  // Build event params with UTM attribution from metadata
  const eventParams: Record<string, unknown> = {
    transaction_id: session.id,
    value,
    currency: "USD",
    tax: 0,
    shipping: 0,
    items,
  };

  // Add UTM parameters for campaign attribution
  if (session.metadata?.utm_source) eventParams.campaign_source = session.metadata.utm_source;
  if (session.metadata?.utm_medium) eventParams.campaign_medium = session.metadata.utm_medium;
  if (session.metadata?.utm_campaign) eventParams.campaign_name = session.metadata.utm_campaign;
  if (session.metadata?.utm_content) eventParams.campaign_content = session.metadata.utm_content;
  if (session.metadata?.utm_term) eventParams.campaign_term = session.metadata.utm_term;

  const payload = {
    client_id: clientId,
    events: [
      {
        name: "purchase",
        params: eventParams,
      },
    ],
  };

  try {
    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      console.log(
        `[WEBHOOK] GA4 purchase event sent for session ${session.id} ($${value})`
      );
    } else {
      console.error(
        `[WEBHOOK] GA4 purchase event failed: ${response.status} ${response.statusText}`
      );
    }
  } catch (error) {
    console.error(`[WEBHOOK] GA4 purchase event error:`, error);
  }
}

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
      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : (session.customer as Stripe.Customer | null)?.id ?? null;
      console.log(
        `[WEBHOOK] checkout.session.completed | session=${session.id} amount=${session.amount_total} customer=${customerId ?? "none"} email=${session.customer_email ?? session.customer_details?.email ?? "unknown"}`
      );

      // Send server-side purchase event to GA4 (unaffected by ad blockers)
      await sendGA4PurchaseEvent(session);

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
      break;
    }

    case "customer.subscription.created": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;
      console.log(
        `[WEBHOOK] customer.subscription.created | sub=${subscription.id} customer=${customerId} status=${subscription.status} plan=${subscription.metadata?.product ?? "unknown"}`
      );
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;
      console.log(
        `[WEBHOOK] customer.subscription.deleted | sub=${subscription.id} customer=${customerId} canceledAt=${subscription.canceled_at}`
      );
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;
      const prevAttrs = event.data.previous_attributes as
        | Partial<Stripe.Subscription>
        | undefined;
      const previousStatus = prevAttrs?.status;
      console.log(
        `[WEBHOOK] customer.subscription.updated | sub=${subscription.id} customer=${customerId} status=${subscription.status}${previousStatus ? ` (was ${previousStatus})` : ""} plan=${subscription.metadata?.product ?? "unknown"}`
      );
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const subDetails = invoice.parent?.subscription_details?.subscription;
      const subscriptionId =
        typeof subDetails === "string" ? subDetails : subDetails?.id ?? null;
      console.log(
        `[WEBHOOK] invoice.payment_succeeded | invoice=${invoice.id} sub=${subscriptionId ?? "none"} amount=${invoice.amount_paid} email=${invoice.customer_email ?? "unknown"}`
      );
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subDetails = invoice.parent?.subscription_details?.subscription;
      const subscriptionId =
        typeof subDetails === "string" ? subDetails : subDetails?.id ?? null;
      const customerId =
        typeof invoice.customer === "string"
          ? invoice.customer
          : (invoice.customer as Stripe.Customer | null)?.id ?? null;
      const email = invoice.customer_email ?? null;

      console.error(
        `[WEBHOOK] invoice.payment_failed | invoice=${invoice.id} sub=${subscriptionId ?? "none"} amount=${invoice.amount_due} email=${email ?? "unknown"} attempt=${invoice.attempt_count}`
      );

      const triggerSecretKey = process.env.TRIGGER_SECRET_KEY;
      if (triggerSecretKey && email) {
        try {
          const res = await fetch(
            "https://api.trigger.dev/api/v1/tasks/send-payment-failed-email/trigger",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${triggerSecretKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                payload: {
                  invoiceId: invoice.id,
                  subscriptionId,
                  customerId,
                  email,
                  amountDue: invoice.amount_due,
                  attemptCount: invoice.attempt_count,
                },
                options: {
                  idempotencyKey: `payment-failed-${invoice.id}`,
                },
              }),
            }
          );
          if (res.ok) {
            console.log(
              `[WEBHOOK] Queued payment failure notification for invoice ${invoice.id}`
            );
          } else {
            const err = await res.json().catch(() => ({}));
            console.warn(
              `[WEBHOOK] Failed to queue payment failure notification:`,
              err
            );
          }
        } catch (e) {
          console.warn(
            `[WEBHOOK] Network error queueing payment failure notification:`,
            e
          );
        }
      } else if (!triggerSecretKey) {
        console.log(
          `[WEBHOOK] TRIGGER_SECRET_KEY not set — payment failure notification skipped for invoice ${invoice.id}`
        );
      }
      break;
    }

    default:
      console.log(`[WEBHOOK] unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
