import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "session_id required" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price.product"],
    });

    const items = (session.line_items?.data ?? []).map((item) => {
      const product = item.price?.product as Stripe.Product | undefined;
      return {
        item_id: item.price?.id ?? "",
        item_name: product?.name ?? "Produce Box",
        price: item.amount_total ? item.amount_total / 100 : 0,
        quantity: item.quantity ?? 1,
      };
    });

    return NextResponse.json({
      transactionId: session.id,
      value: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency?.toUpperCase() ?? "USD",
      items,
      mode: session.mode,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
