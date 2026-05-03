import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { tagOrderCompleted, deleteCart } from "@/lib/mailchimp";
import { sendCapiEvent } from "@/lib/meta-capi";
import { sendInternalAlert } from "@/lib/email/resend";
import { isSuppressed } from "@/lib/email/suppression";

const TRIGGER_API_BASE = "https://api.trigger.dev/api/v1/tasks";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

interface CartLineItemForEmail {
  sku: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

// Custom-cart orders (intent.metadata.product === "custom_cart") store a
// compact cart array in intent.metadata.cart_json as
//   [[sku, qty, unitPriceCents], ...]
// We don't have item names in metadata (size cap); we reconstruct a
// human-readable name from line_items_summary if present, otherwise fall
// back to the SKU.
function parseCartLineItems(
  cartJson: string | undefined | null
): CartLineItemForEmail[] | undefined {
  if (!cartJson) return undefined;
  try {
    const parsed = JSON.parse(cartJson);
    if (!Array.isArray(parsed)) return undefined;
    const lines: CartLineItemForEmail[] = [];
    for (const entry of parsed) {
      if (!Array.isArray(entry) || entry.length < 3) continue;
      const sku = String(entry[0]);
      const quantity = Number(entry[1]);
      const unitPriceCents = Number(entry[2]);
      if (!sku || !Number.isFinite(quantity) || !Number.isFinite(unitPriceCents)) {
        continue;
      }
      lines.push({
        sku,
        name: sku,
        quantity,
        unitPriceCents,
        lineTotalCents: unitPriceCents * quantity,
      });
    }
    return lines.length > 0 ? lines : undefined;
  } catch {
    return undefined;
  }
}

function numberOrNull(s: string | undefined | null): number | null {
  if (s == null) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

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
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

      // Fire CAPI Purchase server-side (bypasses ITP/ad blockers, critical for Meta attribution).
      // Skip for internal/test emails — feeding Meta's optimizer test-purchase signal teaches it
      // to chase profiles that look like Anthony rather than real customers.
      if (!isSuppressed(email !== "unknown" ? email : null)) {
        sendCapiEvent({
          eventName: "Purchase",
          eventSourceUrl: `https://unclemays.com/order-success`,
          userData: {
            email: email !== "unknown" ? email : undefined,
            phone: phone || undefined,
            fbc: session.metadata?.fbc || undefined,
            fbp: session.metadata?.fbp || undefined,
            client_ip_address: session.metadata?.client_ip || undefined,
            client_user_agent: session.metadata?.client_user_agent || undefined,
          },
          customData: {
            value: amountInDollars,
            currency: "USD",
            content_ids: [productId],
            content_name: productName,
            content_type: "product",
            order_id: session.id,
          },
          eventId: `purchase-${session.id}`,
        }).catch((err) => console.error("[CAPI] Purchase (checkout.session.completed) error:", err));
      } else {
        console.log(`[CAPI] Skipped Purchase for suppressed email: ${email}`);
      }

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
                        firstName: checkoutSession.firstName || session.customer_details?.name?.split(" ")[0] || "friend",
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

      // Send order confirmation email
      const triggerSecretKeyForConfirmation = process.env.TRIGGER_SECRET_KEY;
      if (triggerSecretKeyForConfirmation && email && email !== "unknown") {
        const isSubscription = session.mode === "subscription";
        fetch(`${TRIGGER_API_BASE}/send-order-confirmation-email/trigger`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${triggerSecretKeyForConfirmation}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payload: {
              sessionId: session.id,
              email,
              customerName: session.customer_details?.name ?? null,
              amountTotal: session.amount_total ?? 0,
              productName,
              isSubscription,
              billingInterval: null, // populated from subscription metadata if needed
              subscriptionId:
                typeof session.subscription === "string" ? session.subscription : null,
            },
            options: {
              idempotencyKey: `order-confirmation-${session.id}`,
            },
          }),
        })
          .then((r) => {
            if (r.ok) {
              console.log(`[WEBHOOK] Queued order confirmation email for session ${session.id}`);
            } else {
              r.json()
                .catch(() => ({}))
                .then((err) =>
                  console.warn("[WEBHOOK] Failed to queue order confirmation email:", err)
                );
            }
          })
          .catch((e) => console.warn("[WEBHOOK] Error queuing order confirmation email:", e));
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
      const intentRaw = intent as unknown as { invoice?: string | { id?: string } | null };
      const intentInvoice =
        typeof intentRaw.invoice === "string"
          ? intentRaw.invoice
          : (intentRaw.invoice as { id?: string } | null)?.id ?? null;
      console.log(
        `[WEBHOOK] payment_intent.succeeded | pi=${intent.id} amount=${intent.amount} status=${intent.status} invoice=${intentInvoice ?? "none"}`
      );

      // Non-blocking: clean up Mailchimp abandoned cart for subscribe-intent flow.
      // customer_email is stored in metadata by /api/checkout/subscribe-intent.
      const intentEmail = intent.metadata?.customer_email || intent.receipt_email;
      if (intentEmail && intent.metadata?.firstPayment === "true") {
        tagOrderCompleted(intentEmail)
          .catch((err) => console.error("[WEBHOOK] Mailchimp tagOrderCompleted error (pi):", err));
        deleteCart(intent.id)
          .catch((err) => console.error("[WEBHOOK] Mailchimp deleteCart error (pi):", err));

        // Fire CAPI Purchase for subscription first payment (skip internal test orders).
        const intentProduct = intent.metadata?.product || "subscription";
        if (!isSuppressed(intentEmail)) {
          sendCapiEvent({
            eventName: "Purchase",
            eventSourceUrl: `https://unclemays.com/order-success`,
            userData: {
              email: intentEmail || undefined,
              phone: intent.metadata?.phone || undefined,
              fbc: intent.metadata?.fbc || undefined,
              fbp: intent.metadata?.fbp || undefined,
              client_ip_address: intent.metadata?.client_ip || undefined,
              client_user_agent: intent.metadata?.client_user_agent || undefined,
            },
            customData: {
              value: intent.amount / 100,
              currency: "USD",
              content_ids: [intentProduct],
              content_name: intentProduct,
              content_type: "product",
              order_id: intent.id,
            },
            eventId: `purchase-sub-${intent.id}`,
          }).catch((err) => console.error("[CAPI] Purchase (payment_intent.succeeded) error:", err));
        } else {
          console.log(`[CAPI] Skipped Purchase (sub) for suppressed email: ${intentEmail}`);
        }

        // Fire server-side GA4 purchase event (subscription first payment).
        // Client-side gtag on /order-success is unreliable (3DS redirects,
        // ad blockers, script load race) — this ensures every completed
        // subscription is counted in GA4.
        trackGA4Purchase({
          transactionId: intent.id,
          value: intent.amount / 100,
          currency: "USD",
          items: [{
            item_id: intentProduct,
            item_name: intent.metadata?.productName || intentProduct,
            price: intent.amount / 100,
            quantity: 1,
          }],
        }).catch((err) => console.error("[GA4] Purchase (subscription) error:", err));
      }

      // Send order confirmation email for one-time purchases via the embedded
      // checkout intent flow (/api/checkout/intent). These PIs have no invoice
      // (invoice=null) and are not covered by checkout.session.completed.
      // Use receipt_email or metadata.customer_email as the address.
      const confirmEmail = intent.receipt_email || intent.metadata?.customer_email || null;

      // Fire CAPI Purchase for one-time intent purchases (not covered by firstPayment branch above).
      // Subscription first payments use /api/checkout/subscribe-intent and set firstPayment=true,
      // so they are already tracked above. One-time purchases via /api/checkout/intent do not
      // set firstPayment, so we fire CAPI here when: email exists, no invoice (not a renewal),
      // and this is not already covered by the firstPayment branch.
      if (confirmEmail && !intentInvoice && intent.metadata?.firstPayment !== "true") {
        const otProduct = intent.metadata?.product || "produce_box";
        const otCart = parseCartLineItems(intent.metadata?.cart_json);
        const otContentIds =
          otCart && otCart.length > 0 ? otCart.map((l) => l.sku) : [otProduct];
        const otContentName =
          intent.metadata?.line_items_summary || otProduct;

        if (!isSuppressed(confirmEmail)) {
          sendCapiEvent({
            eventName: "Purchase",
            eventSourceUrl: `https://unclemays.com/order-success`,
            userData: {
              email: confirmEmail,
              phone: intent.metadata?.customer_phone || intent.metadata?.phone || undefined,
              fbc: intent.metadata?.fbc || undefined,
              fbp: intent.metadata?.fbp || undefined,
              client_ip_address: intent.metadata?.client_ip || undefined,
              client_user_agent: intent.metadata?.client_user_agent || undefined,
            },
            customData: {
              value: intent.amount / 100,
              currency: "USD",
              content_ids: otContentIds,
              content_name: otContentName,
              content_type: "product",
              order_id: intent.id,
            },
            eventId: `purchase-ot-${intent.id}`,
          }).catch((err) => console.error("[CAPI] Purchase (payment_intent.succeeded one-time) error:", err));
        } else {
          console.log(`[CAPI] Skipped Purchase (one-time) for suppressed email: ${confirmEmail}`);
        }

        const ga4Items =
          otCart && otCart.length > 0
            ? otCart.map((l) => ({
                item_id: l.sku,
                item_name: l.name,
                price: l.unitPriceCents / 100,
                quantity: l.quantity,
              }))
            : [
                {
                  item_id: otProduct,
                  item_name: intent.metadata?.productName || otProduct,
                  price: intent.amount / 100,
                  quantity: 1,
                },
              ];

        trackGA4Purchase({
          transactionId: intent.id,
          value: intent.amount / 100,
          currency: "USD",
          items: ga4Items,
        }).catch((err) => console.error("[GA4] Purchase (one-time) error:", err));
      }

      if (confirmEmail && !intentInvoice) {
        const triggerKeyForOtConfirmation = process.env.TRIGGER_SECRET_KEY;
        if (triggerKeyForOtConfirmation) {
          const productKey = intent.metadata?.product ?? null;
          // 'starter' and 'family' map to the legacy fixed-box flow, kept
          // only so historical pending orders render correctly. New orders
          // since the catalog launch (2026-04-30) all carry 'custom_cart'.
          const PRODUCT_NAMES: Record<string, string> = {
            starter: "Spring Box (legacy)",
            family: "Full Harvest Box (legacy)",
            custom_cart: "Your Uncle May's order",
          };
          const productName = productKey ? (PRODUCT_NAMES[productKey] ?? productKey) : "Your Uncle May's order";

          // Custom-cart orders carry itemized data in metadata. Parse and
          // pass through so the order-confirmation email can render line
          // items rather than a single product line.
          const cartLineItems = parseCartLineItems(intent.metadata?.cart_json);
          const fulfillmentMode =
            intent.metadata?.fulfillment_mode === "pickup" ? "pickup" : "delivery";
          const pickupSlotLabel = intent.metadata?.pickup_slot_label ?? null;

          fetch(`${TRIGGER_API_BASE}/send-order-confirmation-email/trigger`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${triggerKeyForOtConfirmation}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              payload: {
                sessionId: intent.id,
                email: confirmEmail,
                customerName: intent.metadata?.customer_name ?? null,
                amountTotal: intent.amount,
                productName,
                isSubscription: false,
                billingInterval: null,
                subscriptionId: null,
                lineItems: cartLineItems,
                subtotalCents: numberOrNull(intent.metadata?.subtotal_cents),
                discountCents: numberOrNull(intent.metadata?.discount_cents),
                shippingCents: numberOrNull(intent.metadata?.shipping_cents),
                taxCents: numberOrNull(intent.metadata?.tax_cents),
                totalCents: numberOrNull(intent.metadata?.total_cents) ?? intent.amount,
                fulfillmentMode,
                pickupSlotLabel,
              },
              options: {
                idempotencyKey: `order-confirmation-pi-${intent.id}`,
              },
            }),
          })
            .then((r) => {
              if (r.ok) {
                console.log(
                  `[WEBHOOK] Queued order confirmation email for PI ${intent.id} email=${confirmEmail}`
                );
              } else {
                r.json()
                  .catch(() => ({}))
                  .then((err) =>
                    console.warn("[WEBHOOK] Failed to queue order confirmation email (pi):", err)
                  );
              }
            })
            .catch((e) =>
              console.warn("[WEBHOOK] Error queuing order confirmation email (pi):", e)
            );
        }
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
        `[WEBHOOK] customer.subscription.deleted | sub=${subscription.id} customer=${customerId} status=${subscription.status} canceledAt=${subscription.canceled_at}`
      );

      // Resolve customer details up front. Used by both the abandon-alert
      // branch and the customer-cancellation-email branch below.
      let resolvedEmail: string | null = null;
      let resolvedName: string | null = null;
      try {
        const customer = await stripe.customers.retrieve(customerId);
        if (customer && !("deleted" in customer)) {
          resolvedEmail = customer.email ?? null;
          resolvedName = customer.name ?? null;
        }
      } catch (e) {
        console.warn(`[WEBHOOK] Could not retrieve customer ${customerId}:`, e);
      }

      // BRANCH: subscription expired without payment (incomplete_expired).
      // The customer reached the payment form, never confirmed payment, and
      // Stripe auto-canceled the sub after 23 hours. This is the silent
      // drop-off pattern surfaced in the April 2026 audit. Send Anthony a
      // real-time alert so he can follow up while the customer still
      // remembers, and SKIP the customer-facing cancellation email
      // (confusing — they didn't actually subscribe).
      if (subscription.status === "incomplete_expired") {
        const planAmount = subscription.items?.data?.[0]?.price?.unit_amount ?? 0;
        const planLabel = subscription.metadata?.product || "unknown";
        const subjectEmail = resolvedEmail || "(unknown email)";
        const html = `
          <p>A subscription was created but never paid for. The customer reached the payment form and abandoned before confirming.</p>
          <table style="border-collapse:collapse;font-size:14px">
            <tr><td style="padding:4px 12px 4px 0">Customer</td><td><strong>${resolvedName || "—"}</strong></td></tr>
            <tr><td style="padding:4px 12px 4px 0">Email</td><td><a href="mailto:${subjectEmail}">${subjectEmail}</a></td></tr>
            <tr><td style="padding:4px 12px 4px 0">Plan</td><td>${planLabel} · $${(planAmount / 100).toFixed(2)}/wk</td></tr>
            <tr><td style="padding:4px 12px 4px 0">Subscription</td><td>${subscription.id}</td></tr>
            <tr><td style="padding:4px 12px 4px 0">Customer ID</td><td>${customerId}</td></tr>
          </table>
          <p style="margin-top:16px">Suggested follow-up: short personal email asking what happened, offering to push the order through manually. Pattern from the April audit shows this group rarely returns on its own.</p>
        `;
        sendInternalAlert({
          subject: `[Uncle May's] Subscription abandoned at payment — ${subjectEmail}`,
          html,
          tags: [
            { name: "type", value: "internal_alert" },
            { name: "alert", value: "sub_abandoned_at_payment" },
          ],
        }).catch((err) =>
          console.error("[WEBHOOK] Internal alert send error (incomplete_expired):", err)
        );
        break;
      }

      const triggerKeyForCancellation = process.env.TRIGGER_SECRET_KEY;
      if (triggerKeyForCancellation) {
        const cancellationEmail = resolvedEmail;
        const cancellationName = resolvedName;
        if (cancellationEmail) {
          fetch(`${TRIGGER_API_BASE}/send-subscription-cancellation-email/trigger`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${triggerKeyForCancellation}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              payload: {
                subscriptionId: subscription.id,
                customerId,
                email: cancellationEmail,
                customerName: cancellationName,
                canceledAt: subscription.canceled_at,
                accessEndsAt: subscription.items?.data?.[0]?.current_period_end ?? null,
                productName: subscription.metadata?.product ?? null,
              },
              options: {
                idempotencyKey: `sub-cancelled-${subscription.id}`,
              },
            }),
          })
            .then((r) => {
              if (r.ok) {
                console.log(
                  `[WEBHOOK] Queued cancellation confirmation email for sub ${subscription.id} email=${cancellationEmail}`
                );
              } else {
                r.json()
                  .catch(() => ({}))
                  .then((err) =>
                    console.warn(
                      "[WEBHOOK] Failed to queue cancellation confirmation email:",
                      err
                    )
                  );
              }
            })
            .catch((e) =>
              console.warn("[WEBHOOK] Error queuing cancellation confirmation email:", e)
            );
        } else {
          console.warn(`[WEBHOOK] No email for customer ${customerId} — skipping cancellation email for sub ${subscription.id}`);
        }
      }
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
      const prevCancelAtPeriodEnd = (prevAttrs as (Partial<Stripe.Subscription> & { cancel_at_period_end?: boolean }) | undefined)?.cancel_at_period_end;
      console.log(
        `[WEBHOOK] customer.subscription.updated | sub=${subscription.id} customer=${customerId} status=${subscription.status}${previousStatus ? ` (was ${previousStatus})` : ""} cancel_at_period_end=${subscription.cancel_at_period_end} plan=${subscription.metadata?.product ?? "unknown"}`
      );

      // ABANDON ALERT: subscription expired without ever being paid for.
      // Stripe fires this as customer.subscription.updated with status
      // transitioning to "incomplete_expired" (NOT customer.subscription.deleted
      // — that one only fires for canceled-after-active subs). The previous
      // wiring of this alert lived in the deleted handler and never ran. Found
      // 2026-04-27 when Antoinette's 4 incomplete subs from Apr 25 expired
      // silently with no email reaching anthony@unclemays.com.
      if (
        subscription.status === "incomplete_expired" &&
        previousStatus !== "incomplete_expired"
      ) {
        let alertEmail: string | null = null;
        let alertName: string | null = null;
        try {
          const customer = await stripe.customers.retrieve(customerId);
          if (customer && !("deleted" in customer)) {
            alertEmail = customer.email ?? null;
            alertName = customer.name ?? null;
          }
        } catch (e) {
          console.warn(`[WEBHOOK] Could not retrieve customer ${customerId} for abandon alert:`, e);
        }
        const planAmount = subscription.items?.data?.[0]?.price?.unit_amount ?? 0;
        const planLabel = subscription.metadata?.product || "unknown";
        const subjectEmail = alertEmail || "(unknown email)";
        const html = `
          <p>A subscription was created but never paid for. The customer reached the payment form and abandoned before confirming.</p>
          <table style="border-collapse:collapse;font-size:14px">
            <tr><td style="padding:4px 12px 4px 0">Customer</td><td><strong>${alertName || "—"}</strong></td></tr>
            <tr><td style="padding:4px 12px 4px 0">Email</td><td><a href="mailto:${subjectEmail}">${subjectEmail}</a></td></tr>
            <tr><td style="padding:4px 12px 4px 0">Plan</td><td>${planLabel} · $${(planAmount / 100).toFixed(2)}/wk</td></tr>
            <tr><td style="padding:4px 12px 4px 0">Subscription</td><td>${subscription.id}</td></tr>
            <tr><td style="padding:4px 12px 4px 0">Customer ID</td><td>${customerId}</td></tr>
          </table>
          <p style="margin-top:16px">Suggested follow-up: short personal email asking what happened, offering to push the order through manually.</p>
        `;
        sendInternalAlert({
          subject: `[Uncle May's] Subscription abandoned at payment — ${subjectEmail}`,
          html,
          tags: [
            { name: "type", value: "internal_alert" },
            { name: "alert", value: "sub_abandoned_at_payment" },
          ],
        }).catch((err) =>
          console.error("[WEBHOOK] Internal alert send error (incomplete_expired via update):", err)
        );
      }

      // Send cancellation email when cancel_at_period_end transitions to true.
      // This is the typical portal flow: user clicks Cancel, subscription stays active
      // until end of period but cancel_at_period_end flips to true immediately.
      if (
        subscription.cancel_at_period_end === true &&
        prevCancelAtPeriodEnd === false
      ) {
        const triggerKeyForCancellation = process.env.TRIGGER_SECRET_KEY;
        if (triggerKeyForCancellation) {
          let cancellationEmail: string | null = null;
          let cancellationName: string | null = null;
          try {
            const customer = await stripe.customers.retrieve(customerId);
            if (customer && !("deleted" in customer)) {
              cancellationEmail = customer.email ?? null;
              cancellationName = customer.name ?? null;
            }
          } catch (e) {
            console.warn(`[WEBHOOK] Could not retrieve customer ${customerId} for cancellation email (cancel_at_period_end):`, e);
          }

          if (!cancellationEmail) {
            console.warn(`[WEBHOOK] No email for customer ${customerId} — skipping cancellation email for sub ${subscription.id} (cancel_at_period_end)`);
          } else {
            fetch(`${TRIGGER_API_BASE}/send-subscription-cancellation-email/trigger`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${triggerKeyForCancellation}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                payload: {
                  subscriptionId: subscription.id,
                  customerId,
                  email: cancellationEmail,
                  customerName: cancellationName,
                  canceledAt: subscription.canceled_at,
                  accessEndsAt: subscription.cancel_at ?? (subscription as unknown as { current_period_end?: number }).current_period_end ?? null,
                  productName: subscription.metadata?.product ?? null,
                },
                options: {
                  idempotencyKey: `sub-cancelled-${subscription.id}`,
                },
              }),
            })
              .then((r) => {
                if (r.ok) {
                  console.log(
                    `[WEBHOOK] Queued cancellation confirmation email for sub ${subscription.id} (cancel_at_period_end=true) email=${cancellationEmail}`
                  );
                } else {
                  r.json()
                    .catch(() => ({}))
                    .then((err) =>
                      console.warn(
                        "[WEBHOOK] Failed to queue cancellation confirmation email (cancel_at_period_end):",
                        err
                      )
                    );
                }
              })
              .catch((e) =>
                console.warn(
                  "[WEBHOOK] Error queuing cancellation confirmation email (cancel_at_period_end):",
                  e
                )
              );
          }
        }
      }

      // Send cancellation email when status transitions to canceled for the first time
      // (covers immediate cancellation path where status goes directly to canceled)
      if (subscription.status === "canceled" && previousStatus && previousStatus !== "canceled") {
        const triggerKeyForCancellation = process.env.TRIGGER_SECRET_KEY;
        if (triggerKeyForCancellation) {
          // Resolve customer email now so the worker task doesn't need STRIPE_API_KEY
          let cancellationEmail: string | null = null;
          let cancellationName: string | null = null;
          try {
            const customer = await stripe.customers.retrieve(customerId);
            if (customer && !("deleted" in customer)) {
              cancellationEmail = customer.email ?? null;
              cancellationName = customer.name ?? null;
            }
          } catch (e) {
            console.warn(`[WEBHOOK] Could not retrieve customer ${customerId} for cancellation email (updated):`, e);
          }

          if (!cancellationEmail) {
            console.warn(`[WEBHOOK] No email for customer ${customerId} — skipping cancellation email for sub ${subscription.id} (updated->canceled)`);
          } else {
          fetch(`${TRIGGER_API_BASE}/send-subscription-cancellation-email/trigger`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${triggerKeyForCancellation}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              payload: {
                subscriptionId: subscription.id,
                customerId,
                email: cancellationEmail,
                customerName: cancellationName,
                canceledAt: subscription.canceled_at,
                accessEndsAt: subscription.items?.data?.[0]?.current_period_end ?? null,
                productName: subscription.metadata?.product ?? null,
              },
              options: {
                idempotencyKey: `sub-cancelled-${subscription.id}`,
              },
            }),
          })
            .then((r) => {
              if (r.ok) {
                console.log(
                  `[WEBHOOK] Queued cancellation confirmation email for sub ${subscription.id} (updated->canceled) email=${cancellationEmail}`
                );
              } else {
                r.json()
                  .catch(() => ({}))
                  .then((err) =>
                    console.warn(
                      "[WEBHOOK] Failed to queue cancellation confirmation email (updated):",
                      err
                    )
                  );
              }
            })
            .catch((e) =>
              console.warn(
                "[WEBHOOK] Error queuing cancellation confirmation email (updated):",
                e
              )
            );
          } // end else (has email)
        } // end if (triggerKeyForCancellation)
      } // end if (status === canceled)
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
