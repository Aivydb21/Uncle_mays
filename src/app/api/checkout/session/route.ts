import { NextRequest, NextResponse } from "next/server";
import { createSession, updateSession, getAbandonedSessions } from "@/lib/checkout-store";
import { upsertContact, addTag } from "@/lib/mailchimp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product, price, productName, email, firstName, lastName, phone, address, deliveryNotes } = body;

    if (!product || !price || !email || !firstName || !lastName || !address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const session = createSession({
      product,
      price: Number(price),
      productName: productName || product,
      email,
      firstName,
      lastName,
      phone,
      address,
      deliveryNotes,
    });

    // Non-blocking: upsert contact then tag as checkout_started for abandoned cart recovery
    upsertContact(email, firstName, lastName)
      .then(() => addTag(email, "checkout_started"))
      .catch((err) => console.error("Mailchimp checkout_started error:", err));

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

    // Non-blocking: tag as order_completed to remove from abandoned cart sequence
    if (patch.completedAt && updated.email) {
      addTag(updated.email, "order_completed")
        .catch((err) => console.error("Mailchimp order_completed error:", err));
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
