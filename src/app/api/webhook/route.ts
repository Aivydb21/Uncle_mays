import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { tagOrderCompleted, deleteCart } from "@/lib/mailchimp";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

// GA4 Measurement Protocol for server-side conversion tracking
async function trackGA4Purchase(params: {
  transactionId: string;
  value: number;
  currency: string;
  items: Array<{ item_id: string; item_name: string; price: number; quantity: number }>;
  clientId?: string;
}) {
  const measurementId = process.env.GA4_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;

  if (!measurementId || !apiSecret) {
    console.warn("[GA4] Measurement ID or API Secret not configured, skipping server-side tracking");
    return;
  }

  try {
    const payload = {
      client_id: params.clientId || `stripe.${params.transactionId}`,
      events: [
        {
          name: "purchase",
          params: {
            transaction_id: params.transactionId,
            value: params.value,
            currency: params.currency,
            items: params.items,
          },
        },
      ],
    };

    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      console.log(`[GA4] Purchase tracked: ${params.transactionId} = $${params.value}`);
    } else {
      console.error(`[GA4] Tracking failed: ${response.status} ${await response.text()}`);
    }
  } catch (error) {
    console.error("[GA4] Error tracking purchase:", error);
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
      const email = session.customer_email ?? session.customer_details?.email ?? "unknown";
      const phone = session.customer_details?.phone ?? null;

      console.log(
        `[WEBHOOK] checkout.session.completed | session=${session.id} amount=${session.amount_total} customer=${customerId ?? "none"} email=${email} phone=${phone ?? "none"}`
      );

      // Track purchase in GA4 (server-side for reliability)
      const amountInDollars = (session.amount_total ?? 0) / 100;
      const productName = session.metadata?.productName || "Produce Box";
      const productId = session.metadata?.productId || "produce_box";

      await trackGA4Purchase({
        transactionId: session.id,
        value: amountInDollars,
        currency: "USD",
        items: [
          {
            item_id: productId,
            item_name: productName,
            price: amountInDollars,
            quantity: 1,
          },
        ],
        clientId: customerId || undefined,
      });

      // Trigger SMS confirmation if phone number and delivery date are available
      // The session metadata should contain the checkout session ID from our local store
      const checkoutSessionId = session.metadata?.checkoutSessionId;
      if (checkoutSessionId && phone) {
        const triggerSecretKey = process.env.TRIGGER_SECRET_KEY;
        if (triggerSecretKey) {
          try {
            // Fetch the local checkout session to get delivery details
            const checkoutRes = await fetch(
              `${process.env.SITE_BASE_URL || "https://unclemays.com"}/api/checkout/session/${checkoutSessionId}`
            );

            if (checkoutRes.ok) {
              const checkoutSession = await checkoutRes.json();

              if (checkoutSession.deliveryDate) {
                const res = await fetch(
                  "https://api.trigger.dev/api/v1/tasks/send-delivery-confirmation-sms/trigger",
                  {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${triggerSecretKey}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      payload: {
                        sessionId: checkoutSessionId,
                        phone: phone,
                        firstName: checkoutSession.firstName || session.customer_details?.name?.split(" ")[0] || "there",
                        deliveryDate: checkoutSession.deliveryDate,
                        deliveryWindow: checkoutSession.deliveryWindow,
                        productName: checkoutSession.productName || "produce box",
                      },
                      options: {
                        idempotencyKey: `sms-confirmation-${checkoutSessionId}`,
                      },
                    }),
                  }
                );

                if (res.ok) {
                  console.log(
                    `[WEBHOOK] Queued SMS confirmation task for session ${checkoutSessionId}`
                  );
                } else {
                  const err = await res.json().catch(() => ({}));
                  console.warn(
                    `[WEBHOOK] Failed to queue SMS confirmation task:`,
                    err
                  );
                }
              } else {
                console.log(
                  `[WEBHOOK] No delivery date for session ${checkoutSessionId}, skipping SMS confirmation`
                );
              }
            }
          } catch (e) {
            console.warn(
              `[WEBHOOK] Error queueing SMS confirmation task:`,
              e
            );
          }
        }
      }

      // Non-blocking: mark order complete and remove the Mailchimp cart so the
      // abandoned cart Journey does not fire for customers who already paid.
      if (email && email !== "unknown") {
        tagOrderCompleted(email)
          .catch((err) => console.error("[WEBHOOK] Mailchimp tagOrderCompleted error:", err));
        deleteCart(session.id)
          .catch((err) => console.error("[WEBHOOK] Mailchimp deleteCart error:", err));
      }

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

      // Non-blocking: clean up Mailchimp abandoned cart for subscribe-intent flow.
      // customer_email is stored in metadata by /api/checkout/subscribe-intent.
      const intentEmail = intent.metadata?.customer_email || intent.receipt_email;
      if (intentEmail && intent.metadata?.firstPayment === "true") {
        tagOrderCompleted(intentEmail)
          .catch((err) => console.error("[WEBHOOK] Mailchimp tagOrderCompleted error (pi):", err));
        deleteCart(intent.id)
          .catch((err) => console.error("[WEBHOOK] Mailchimp deleteCart error (pi):", err));
      }
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
