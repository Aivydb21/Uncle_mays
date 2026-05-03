import { NextRequest, NextResponse } from "next/server";
import { createSession, updateSession, getAbandonedSessions } from "@/lib/checkout-store";
import { upsertContact, createCart, deleteCart, tagOrderCompleted } from "@/lib/mailchimp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      product,
      price,
      productName,
      email,
      firstName,
      lastName,
      phone,
      address,
      deliveryNotes,
      deliveryDate,
      deliveryWindow,
      proteinChoices,
      additionalProteinChoices,
      beanChoice,
      cart,
      subtotalCents,
      discountCents,
      shippingCents,
      taxCents,
      totalCents,
      fulfillmentMode,
      pickupSlotId,
      pickupSlotLabel,
    } = body;

    const isCustomCart = Array.isArray(cart) && cart.length > 0;
    const resolvedProduct = product || (isCustomCart ? "custom_cart" : null);
    const resolvedPrice = isCustomCart
      ? Math.round(((totalCents ?? subtotalCents ?? 0) as number) / 100)
      : Number(price);

    if (!firstName || !lastName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!resolvedProduct) {
      return NextResponse.json({ error: "Missing product or cart" }, { status: 400 });
    }
    if (fulfillmentMode === "delivery" && !address) {
      return NextResponse.json({ error: "Missing delivery address" }, { status: 400 });
    }
    if (!isCustomCart && !price) {
      return NextResponse.json({ error: "Missing price" }, { status: 400 });
    }

    const session = createSession({
      product: resolvedProduct,
      price: Number.isFinite(resolvedPrice) ? resolvedPrice : 0,
      productName: productName || (isCustomCart ? "Custom cart" : resolvedProduct),
      email: email || undefined,
      firstName,
      lastName,
      phone,
      address: address || {
        street: "",
        city: "",
        state: "",
        zip: "",
      },
      deliveryNotes,
      deliveryDate,
      deliveryWindow,
      proteins:
        Array.isArray(proteinChoices) && proteinChoices.length > 0
          ? proteinChoices
          : undefined,
      additionalProteins:
        Array.isArray(additionalProteinChoices) && additionalProteinChoices.length > 0
          ? additionalProteinChoices
          : undefined,
      beanChoice: typeof beanChoice === "string" ? beanChoice : undefined,
      cart: isCustomCart ? cart : undefined,
      subtotalCents:
        typeof subtotalCents === "number" ? subtotalCents : undefined,
      discountCents:
        typeof discountCents === "number" ? discountCents : undefined,
      shippingCents:
        typeof shippingCents === "number" ? shippingCents : undefined,
      taxCents: typeof taxCents === "number" ? taxCents : undefined,
      totalCents: typeof totalCents === "number" ? totalCents : undefined,
      fulfillmentMode:
        fulfillmentMode === "pickup" || fulfillmentMode === "delivery"
          ? fulfillmentMode
          : undefined,
      pickupSlotId:
        typeof pickupSlotId === "string" ? pickupSlotId : undefined,
      pickupSlotLabel:
        typeof pickupSlotLabel === "string" ? pickupSlotLabel : undefined,
    });

    if (email) {
      upsertContact(email, firstName, lastName).catch((err) =>
        console.error("Mailchimp upsertContact error:", err)
      );
      createCart(session.id, email, firstName, lastName, resolvedProduct, session.price).catch(
        (err) => console.error("Mailchimp createCart error:", err)
      );

      const triggerKey = process.env.TRIGGER_SECRET_KEY;
      if (triggerKey) {
        fetch(
          "https://api.trigger.dev/api/v1/tasks/send-abandoned-checkout-email/trigger",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${triggerKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              payload: {
                sessionId: session.id,
                email,
                firstName,
                lastName,
                product: resolvedProduct,
              },
              options: {
                idempotencyKey: `abandoned-checkout-${session.id}`,
              },
            }),
          }
        ).catch((err) => console.warn("Trigger.dev queue error (non-fatal):", err));
      }
    }

    return NextResponse.json({ sessionId: session.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("checkout/session error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { sessionId, ...patch } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }
    const updated = updateSession(sessionId, patch);
    if (!updated) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (patch.completedAt && updated.email) {
      tagOrderCompleted(updated.email).catch((err) =>
        console.error("Mailchimp order_completed error:", err)
      );
      deleteCart(sessionId).catch((err) =>
        console.error("Mailchimp deleteCart error:", err)
      );
    }

    return NextResponse.json({ session: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sinceParam = searchParams.get("since");
    const since = sinceParam ? new Date(sinceParam) : undefined;
    const sessions = getAbandonedSessions(since);
    return NextResponse.json({ sessions });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
