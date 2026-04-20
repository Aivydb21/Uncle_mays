import { NextRequest, NextResponse } from "next/server";
import { sendCapiEvent } from "@/lib/meta-capi";

// Server-side CAPI endpoint called by the checkout summary client page.
// Fires ViewContent + InitiateCheckout so these events bypass ITP/ad blockers.
export async function POST(req: NextRequest) {
  try {
    const { slug, contentName, value } = await req.json() as {
      slug: string;
      contentName: string;
      value: number;
    };

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "";
    const userAgent = req.headers.get("user-agent") || "";
    const referer = req.headers.get("referer") || "";
    const origin = req.headers.get("origin") || "https://unclemays.com";
    const eventSourceUrl = referer || `${origin}/checkout/${slug}`;

    const userData = {
      client_ip_address: clientIp,
      client_user_agent: userAgent,
    };

    const [viewEventId, initiateEventId] = [
      `view-${slug}-${Date.now()}`,
      `initiate-${slug}-${Date.now()}`,
    ];

    // Fire both in parallel — neither should block the response
    await Promise.allSettled([
      sendCapiEvent({
        eventName: "ViewContent",
        eventSourceUrl,
        userData,
        customData: {
          content_ids: [slug],
          content_name: contentName,
          content_type: "product",
          value,
          currency: "USD",
        },
        eventId: viewEventId,
      }),
      sendCapiEvent({
        eventName: "InitiateCheckout",
        eventSourceUrl,
        userData,
        customData: {
          content_ids: [slug],
          content_name: contentName,
          content_type: "product",
          value,
          currency: "USD",
          num_items: 1,
        },
        eventId: initiateEventId,
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[CAPI] /api/capi/view error:", message);
    // Always return 200 so client errors never interrupt checkout flow
    return NextResponse.json({ ok: false });
  }
}
