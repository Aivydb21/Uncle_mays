import { NextRequest, NextResponse } from "next/server";
import { createSession, updateSession, getAbandonedSessions } from "@/lib/checkout-store";
import { upsertContact, createCart, deleteCart, tagOrderCompleted } from "@/lib/mailchimp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product, price, productName, email, firstName, lastName, phone, address, deliveryNotes, deliveryDate, deliveryWindow, proteinChoices, additionalProteinChoices, beanChoice } = body;

    // Email is now optional at this step (experiment 2026-04-28). Stripe
    // collects it on the payment page either way; the abandoned-cart and
    // Mailchimp recovery infra below only fire when an email IS provided.
    if (!product || !price || !firstName || !lastName || !address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const session = createSession({
      product,
      price: Number(price),
      productName: productName || product,
      email: email || undefined,
      firstName,
      lastName,
      phone,
      address,
      deliveryNotes,
      deliveryDate,
      deliveryWindow,
      proteins: Array.isArray(proteinChoices) && proteinChoices.length > 0 ? proteinChoices : undefined,
      additionalProteins: Array.isArray(additionalProteinChoices) && additionalProteinChoices.length > 0 ? additionalProteinChoices : undefined,
      beanChoice: typeof beanChoice === "string" ? beanChoice : undefined,
    });

    // Recovery infra: only run when we actually have an email to recover to.
    if (email) {
      upsertContact(email, firstName, lastName)
        .catch((err) => console.error("Mailchimp upsertContact error:", err));
      createCart(session.id, email, firstName, lastName, product, session.price)
        .catch((err) => console.error("Mailchimp createCart error:", err));

      const triggerKey = process.env.TRIGGER_SECRET_KEY;
      if (triggerKey) {
        fetch("https://api.trigger.dev/api/v1/tasks/send-abandoned-checkout-email/trigger", {
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
              product,
            },
            options: {
              idempotencyKey: `abandoned-checkout-${session.id}`,
            },
          }),
        }).catch((err) => console.warn("Trigger.dev queue error (non-fatal):", err));
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

    // Non-blocking: mark order complete and remove the cart so the abandoned
    // cart Journey does not fire for customers who already paid.
    if (patch.completedAt && updated.email) {
      tagOrderCompleted(updated.email)
        .catch((err) => console.error("Mailchimp order_completed error:", err));
      deleteCart(sessionId)
        .catch((err) => console.error("Mailchimp deleteCart error:", err));
    }

    return NextResponse.json({ session: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Trigger.dev abandoned cart processor queries this
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
