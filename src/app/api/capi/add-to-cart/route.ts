import { NextRequest, NextResponse } from "next/server";
import { sendCapiEvent } from "@/lib/meta-capi";

// Server-side CAPI companion for AddToCart events.
// The browser Pixel (fbq) fires AddToCart client-side; this route fires the
// deduped CAPI version so the event survives iOS ATT / Safari ITP and carries
// hashed em when the user's email is known (e.g. returned from checkout).
// eventId must match the one passed to fbq so Meta deduplicates correctly.
export async function POST(req: NextRequest) {
  try {
    const { sku, contentName, value, quantity = 1, eventId: clientEventId, email, fbc, fbp } =
      (await req.json()) as {
        sku: string;
        contentName: string;
        value: number;
        quantity?: number;
        eventId?: string;
        email?: string;
        fbc?: string;
        fbp?: string;
      };

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "";
    const userAgent = req.headers.get("user-agent") || "";
    const referer = req.headers.get("referer") || "";
    const origin = req.headers.get("origin") || "https://unclemays.com";
    const eventSourceUrl = referer || `${origin}/shop`;

    const eventId = clientEventId || `atc-${sku}-${Date.now()}`;

    await sendCapiEvent({
      eventName: "AddToCart",
      eventSourceUrl,
      userData: {
        client_ip_address: clientIp,
        client_user_agent: userAgent,
        email: typeof email === "string" && email.length > 3 ? email : undefined,
        fbc: typeof fbc === "string" && fbc.length > 0 ? fbc : undefined,
        fbp: typeof fbp === "string" && fbp.length > 0 ? fbp : undefined,
      },
      customData: {
        content_ids: [sku],
        content_name: contentName,
        content_type: "product",
        value,
        currency: "USD",
        num_items: quantity,
      },
      eventId,
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[CAPI] /api/capi/add-to-cart error:", message);
    // Always 200 — CAPI failures must never interrupt the shopping experience
    return NextResponse.json({ ok: false });
  }
}
