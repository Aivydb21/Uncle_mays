import { NextRequest, NextResponse } from "next/server";
import { createSession, updateSession, getAbandonedSessions } from "@/lib/checkout-store";

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
