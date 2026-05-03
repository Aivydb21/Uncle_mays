import { NextRequest, NextResponse } from "next/server";
import { priceCart } from "@/lib/cart-pricing";
import type { CartLine, FulfillmentMode } from "@/lib/catalog/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cart = sanitizeCart(body?.cart);
    const fulfillmentMode: FulfillmentMode =
      body?.fulfillmentMode === "pickup" ? "pickup" : "delivery";
    const promoCode =
      typeof body?.promoCode === "string" ? body.promoCode : null;
    const shippingZip =
      typeof body?.shippingZip === "string" ? body.shippingZip : null;

    const result = await priceCart({
      cart,
      fulfillmentMode,
      promoCode,
      shippingZip,
    });

    const status = result.ok ? 200 : 400;
    return NextResponse.json(result, { status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/cart/quote] error:", message);
    return NextResponse.json(
      { ok: false, code: "server_error", message },
      { status: 500 }
    );
  }
}

function sanitizeCart(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return [];
  const out: CartLine[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const e = entry as Record<string, unknown>;
    const sku = typeof e.sku === "string" ? e.sku.trim() : "";
    const quantity = Math.floor(Number(e.quantity) || 0);
    if (sku && quantity > 0) out.push({ sku, quantity });
  }
  return out;
}
