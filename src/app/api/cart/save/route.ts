import { NextRequest, NextResponse } from "next/server";
import { sendTransactional } from "@/lib/email/resend";
import { upsertContact } from "@/lib/mailchimp";
import { priceCart } from "@/lib/cart-pricing";
import { isSuppressed } from "@/lib/email/suppression";
import type { CartLine, FulfillmentMode } from "@/lib/catalog/types";
import { formatCents } from "@/lib/format";

// "Save my cart" — the customer is not ready to check out, but wants to come
// back to the same cart later (or pick it up on a different device). We email
// them a deep link that restores the cart contents from the URL param.
//
// Why this exists: customers used to enter email at the start of checkout, so
// abandoned-cart sequences had a high firing rate. The new catalog model
// captures email only at checkout. This endpoint re-creates the early-funnel
// email capture path without forcing a gate before the catalog.

interface SaveCartPayload {
  email?: unknown;
  firstName?: unknown;
  cart?: unknown;
  fulfillmentMode?: unknown;
  shippingZip?: unknown;
  promoCode?: unknown;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SaveCartPayload;

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json(
        { ok: false, error: "invalid_email" },
        { status: 400 }
      );
    }

    if (isSuppressed(email)) {
      // Don't reveal that the address is suppressed; pretend it worked.
      return NextResponse.json({ ok: true, suppressed: true });
    }

    const cart = sanitizeCart(body.cart);
    if (cart.length === 0) {
      return NextResponse.json(
        { ok: false, error: "empty_cart" },
        { status: 400 }
      );
    }

    const firstName =
      typeof body.firstName === "string" ? body.firstName.trim() : "";
    const fulfillmentMode: FulfillmentMode =
      body.fulfillmentMode === "pickup" ? "pickup" : "delivery";
    const shippingZip =
      typeof body.shippingZip === "string" ? body.shippingZip.trim() : null;
    const promoCode =
      typeof body.promoCode === "string" ? body.promoCode.trim() : null;

    // Re-price so the email shows accurate item names + line totals; if the
    // cart can't be priced (below_minimum is fine, just shows partial totals),
    // we still send the recovery link.
    const pricing = await priceCart({
      cart,
      fulfillmentMode,
      promoCode,
      shippingZip,
    });

    const restoreUrl = buildRestoreUrl({
      cart,
      fulfillmentMode,
      shippingZip,
      promoCode,
    });

    // Add to Mailchimp audience as a marketing-eligible signup. Tag so the
    // newsletter program can segment "saved-cart never-converted" later.
    upsertContact(email, firstName || "friend", "", ["cart_save"]).catch((err) =>
      console.warn("[cart/save] mailchimp upsert error:", err)
    );

    const lineItemsForEmail =
      pricing.ok || (!pricing.ok && pricing.lineItems)
        ? pricing.lineItems ?? []
        : [];
    const subtotalCents = pricing.ok
      ? pricing.subtotalCents
      : pricing.subtotalCents ?? 0;

    const html = renderHtml({
      firstName: firstName || "there",
      lineItems: lineItemsForEmail,
      subtotalCents,
      restoreUrl,
    });
    const text = renderText({
      firstName: firstName || "there",
      lineItems: lineItemsForEmail,
      subtotalCents,
      restoreUrl,
    });

    const result = await sendTransactional({
      to: email,
      subject: "Your Uncle May's cart is saved",
      html,
      text,
      tags: [
        { name: "type", value: "cart_save" },
        { name: "lines", value: String(cart.length) },
      ],
    });

    if (!result.sent) {
      return NextResponse.json(
        { ok: false, error: result.reason || result.error || "send_failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, id: result.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[cart/save] error:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
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
    if (sku && quantity > 0 && quantity <= 99) out.push({ sku, quantity });
  }
  return out.slice(0, 50); // hard cap on cart size in URL
}

function buildRestoreUrl(args: {
  cart: CartLine[];
  fulfillmentMode: FulfillmentMode;
  shippingZip: string | null;
  promoCode: string | null;
}): string {
  // Short-form encoding to keep the URL under most email-client limits:
  //   sku1:qty1,sku2:qty2,...
  const cartParam = args.cart.map((l) => `${l.sku}:${l.quantity}`).join(",");
  const params = new URLSearchParams({
    cart: cartParam,
    fm: args.fulfillmentMode,
    utm_source: "email",
    utm_medium: "cart_save",
    utm_campaign: "cart_recovery",
  });
  if (args.shippingZip) params.set("zip", args.shippingZip);
  if (args.promoCode) params.set("promo", args.promoCode);
  return `https://unclemays.com/shop?${params.toString()}`;
}

interface RenderArgs {
  firstName: string;
  lineItems: Array<{ name: string; quantity: number; lineTotalCents: number; unitLabel: string | null; unit: string }>;
  subtotalCents: number;
  restoreUrl: string;
}

function renderHtml(a: RenderArgs): string {
  const rows = a.lineItems
    .map(
      (it) =>
        `<tr><td style="padding:6px 0;font-size:14px;color:#1a1a1a;">${escapeHtml(it.name)} <span style="color:#888;">× ${it.quantity}</span></td><td style="padding:6px 0;font-size:14px;color:#1a1a1a;text-align:right;">${formatCents(it.lineTotalCents)}</td></tr>`
    )
    .join("");
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,sans-serif;color:#1a1a1a;background:#fff;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
    <h2 style="font-size:22px;margin-bottom:12px;color:#2d7a2d;">Your cart is saved</h2>
    <p style="font-size:16px;line-height:1.6;">Hi ${escapeHtml(a.firstName)},</p>
    <p style="font-size:16px;line-height:1.6;">
      Here's what's in it. Pick up where you left off whenever you're ready.
    </p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;border-top:1px solid #eee;border-bottom:1px solid #eee;">
      ${rows}
      ${
        a.subtotalCents > 0
          ? `<tr><td style="padding:10px 0 0;font-size:14px;color:#1a1a1a;font-weight:bold;">Subtotal</td><td style="padding:10px 0 0;font-size:14px;color:#1a1a1a;text-align:right;font-weight:bold;">${formatCents(a.subtotalCents)}</td></tr>`
          : ""
      }
    </table>
    <p style="margin:28px 0;">
      <a href="${a.restoreUrl}"
         style="background:#2d7a2d;color:white;padding:14px 28px;text-decoration:none;border-radius:6px;font-size:16px;font-weight:bold;display:inline-block;">
        Open My Cart
      </a>
    </p>
    <p style="font-size:14px;color:#666;line-height:1.6;">
      Use code <strong>FRESH10</strong> at checkout for $10 off your first order ($25 minimum).
    </p>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
    <p style="font-size:12px;color:#999;line-height:1.6;">
      Uncle May's Produce · Hyde Park, Chicago, IL<br>
      <a href="https://unclemays.com" style="color:#999;">unclemays.com</a> ·
      <a href="mailto:info@unclemays.com" style="color:#999;">info@unclemays.com</a>
    </p>
  </div>
</body>
</html>`;
}

function renderText(a: RenderArgs): string {
  const lines = a.lineItems
    .map((it) => `  ${it.name} × ${it.quantity}    ${formatCents(it.lineTotalCents)}`)
    .join("\n");
  return `Hi ${a.firstName},

Your Uncle May's cart is saved. Pick up where you left off whenever you're ready.

${lines}
${a.subtotalCents > 0 ? `\nSubtotal: ${formatCents(a.subtotalCents)}\n` : ""}
Open your cart: ${a.restoreUrl}

Use code FRESH10 at checkout for $10 off your first order ($25 minimum).

---
Uncle May's Produce · Hyde Park, Chicago, IL
unclemays.com · info@unclemays.com`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
