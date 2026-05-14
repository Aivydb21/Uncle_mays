import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Package, Truck, Home, Phone, Mail } from "lucide-react";
import { verifyTrackingToken, computeStatus, type OrderStatus } from "@/lib/order-tracking";
import { stripe } from "@/lib/stripe";
import { formatPreferredSlotLabel } from "@/lib/delivery-windows";
import { formatCents } from "@/lib/format";
import type Stripe from "stripe";

export const metadata: Metadata = {
  title: "Track your order — Uncle May's Produce",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ t?: string }>;
}

interface OrderData {
  sessionId: string;
  status: OrderStatus;
  firstName: string;
  totalCents: number;
  items: Array<{ name: string; quantity: number; lineTotalCents: number }>;
  fulfillmentMode: "delivery" | "pickup" | null;
  deliveryWindowLabel: string | null;
  pickupSlotLabel: string | null;
  addressLine: string | null;
  isSubscription: boolean;
}

async function loadOrder(sessionId: string): Promise<OrderData | null> {
  try {
    let metadata: Stripe.Metadata = {};
    let amountTotal = 0;
    let lineItems: Array<{ name: string; quantity: number; lineTotalCents: number }> = [];
    let mode: "payment" | "subscription" | "setup" = "payment";
    let customerName = "";
    let shippingAddress: Stripe.Address | null | undefined = null;

    if (sessionId.startsWith("cs_")) {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["line_items.data.price.product", "customer_details"],
      });
      metadata = session.metadata ?? {};
      amountTotal = session.amount_total ?? 0;
      mode = session.mode;
      customerName = session.customer_details?.name ?? "";
      shippingAddress = (session as unknown as {
        shipping_details?: { address?: Stripe.Address | null } | null;
      }).shipping_details?.address ?? null;
      lineItems = (session.line_items?.data ?? []).map((li) => {
        const product = li.price?.product as Stripe.Product | undefined;
        return {
          name: product?.name ?? li.description ?? "Item",
          quantity: li.quantity ?? 1,
          lineTotalCents: li.amount_total ?? 0,
        };
      });
    } else if (sessionId.startsWith("pi_")) {
      const intent = await stripe.paymentIntents.retrieve(sessionId);
      metadata = intent.metadata ?? {};
      amountTotal = intent.amount;
      customerName = metadata.customer_name ?? "";
      if (metadata.cart_json) {
        try {
          const cart = JSON.parse(metadata.cart_json) as Array<{
            name?: string;
            sku?: string;
            quantity?: number;
            unitPriceCents?: number;
            lineTotalCents?: number;
          }>;
          lineItems = cart.map((c) => ({
            name: c.name ?? c.sku ?? "Item",
            quantity: c.quantity ?? 1,
            lineTotalCents:
              c.lineTotalCents ?? (c.unitPriceCents ?? 0) * (c.quantity ?? 1),
          }));
        } catch {
          // ignore
        }
      }
    } else {
      return null;
    }

    const firstName = (customerName || "").trim().split(/\s+/)[0] || "friend";
    const fulfillmentMode =
      (metadata.fulfillment_mode as "delivery" | "pickup" | undefined) ?? null;
    const deliveryDate = metadata.preferred_delivery_date ?? null;
    const deliveryWindow = metadata.preferred_delivery_window ?? null;
    const deliveryWindowLabel = formatPreferredSlotLabel(deliveryDate, deliveryWindow);
    const pickupSlotLabel = metadata.pickup_slot_label ?? null;

    let addressLine: string | null = null;
    if (fulfillmentMode === "delivery") {
      const city = metadata.shipping_city ?? shippingAddress?.city ?? null;
      const state = metadata.shipping_state ?? shippingAddress?.state ?? null;
      const zip = metadata.shipping_zip ?? shippingAddress?.postal_code ?? null;
      if (city || state || zip) {
        addressLine = [city, state, zip].filter(Boolean).join(", ");
      }
    }

    return {
      sessionId,
      status: computeStatus(deliveryDate),
      firstName,
      totalCents: amountTotal,
      items: lineItems,
      fulfillmentMode,
      deliveryWindowLabel,
      pickupSlotLabel,
      addressLine,
      isSubscription: mode === "subscription",
    };
  } catch {
    return null;
  }
}

const STATUS_STEPS: Array<{ key: OrderStatus; label: string; description: string; Icon: typeof CheckCircle2 }> = [
  { key: "confirmed", label: "Confirmed", description: "Payment received. Your order is in our queue.", Icon: CheckCircle2 },
  { key: "packing", label: "Packing", description: "We pack your box the day before with that morning's harvest.", Icon: Package },
  { key: "out_for_delivery", label: "On the way", description: "Your driver is on the route. You'll get a text when it's close.", Icon: Truck },
  { key: "delivered", label: "Delivered", description: "Box at your door (or in your hands if pickup).", Icon: Home },
];

function statusIndex(status: OrderStatus): number {
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

export default async function OrderTrackingPage({ params, searchParams }: PageProps) {
  const { sessionId } = await params;
  const { t: token = "" } = await searchParams;

  if (!verifyTrackingToken(sessionId, token)) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold mb-3">Order not found</h1>
        <p className="text-muted-foreground mb-6">
          This tracking link looks invalid or expired. Check the link in your
          confirmation email, or reach us directly and we&apos;ll help.
        </p>
        <p className="text-sm">
          <a href="tel:+13129722595" className="underline">(312) 972-2595</a>
          {" · "}
          <a href="mailto:info@unclemays.com" className="underline">info@unclemays.com</a>
        </p>
      </main>
    );
  }

  const order = await loadOrder(sessionId);
  if (!order) notFound();

  const currentIdx = statusIndex(order.status);
  const fulfillmentLine =
    order.fulfillmentMode === "pickup"
      ? order.pickupSlotLabel ?? "Pickup details on file"
      : order.deliveryWindowLabel
      ? `${order.deliveryWindowLabel}${order.addressLine ? ` · ${order.addressLine}` : ""}`
      : order.addressLine ?? "Delivery details on file";

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 md:py-14">
      <div className="mb-6">
        <Link href="/" className="text-sm text-muted-foreground underline">
          ← Uncle May&apos;s Produce
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">Hi {order.firstName}, here&apos;s your order</h1>
      <p className="text-muted-foreground mb-8">
        Order reference: <code className="text-xs">{order.sessionId.slice(0, 14)}</code>
      </p>

      {/* Fulfillment headline */}
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 md:p-6 mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">
          {order.fulfillmentMode === "pickup" ? "Pickup" : "Delivery"}
        </p>
        <p className="text-lg font-semibold">{fulfillmentLine}</p>
        {order.fulfillmentMode === "delivery" ? (
          <p className="text-sm text-foreground/75 mt-2">
            Your driver will text the number you provided when your box is on
            the way. No need to be home — we leave coolers at the door.
          </p>
        ) : (
          <p className="text-sm text-foreground/75 mt-2">
            Bring this page or your confirmation email. Bring a bag if you
            picked one up from us last time.
          </p>
        )}
      </div>

      {/* Status timeline */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          Status
        </h2>
        <ol className="space-y-4">
          {STATUS_STEPS.map((step, i) => {
            const done = i < currentIdx;
            const current = i === currentIdx;
            const Icon = step.Icon;
            const ringColor = done || current ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground";
            return (
              <li key={step.key} className="flex gap-4">
                <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${ringColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${current ? "text-primary" : done ? "" : "text-muted-foreground"}`}>
                    {step.label}{current ? " · in progress" : done ? " ✓" : ""}
                  </p>
                  <p className="text-sm text-foreground/70">{step.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Order summary */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          What you ordered
        </h2>
        <div className="rounded-2xl border border-border bg-background p-5">
          {order.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Items will appear here once Stripe confirms your line items.
            </p>
          ) : (
            <ul className="space-y-2">
              {order.items.map((it, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span>
                    {it.name} <span className="text-muted-foreground">× {it.quantity}</span>
                  </span>
                  <span className="font-medium">{formatCents(it.lineTotalCents)}</span>
                </li>
              ))}
              <li className="flex justify-between border-t pt-3 mt-3 font-semibold">
                <span>Total{order.isSubscription ? " (per delivery)" : ""}</span>
                <span>{formatCents(order.totalCents)}</span>
              </li>
            </ul>
          )}
        </div>
      </section>

      {/* Contact */}
      <section className="rounded-2xl bg-muted/30 p-6 md:p-7 text-center">
        <h2 className="text-base font-semibold mb-1">Need to change something?</h2>
        <p className="text-sm text-foreground/75 mb-4">
          We reply in business hours, usually within an hour. For same-day
          changes (address tweak, delivery instruction), text us — fastest path.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="tel:+13129722595"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium"
          >
            <Phone className="h-4 w-4" />
            Call or text (312) 972-2595
          </a>
          <a
            href="mailto:info@unclemays.com"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-medium"
          >
            <Mail className="h-4 w-4" />
            info@unclemays.com
          </a>
        </div>
      </section>
    </main>
  );
}
