import "server-only";
import { getInternalCatalogMap } from "./catalog/airtable";
import { validatePromo, getDiscountCents } from "./promo";
import { SERVICE_AREA_ZIPS } from "./service-area";
import {
  MIN_SUBTOTAL_CENTS,
  SHIPPING_CHICAGO_CENTS,
  TAX_RATE,
  MAX_QTY_PER_LINE,
} from "./cart-pricing-constants";
import type {
  CartLine,
  FulfillmentMode,
  PricedLine,
  PricingResponse,
} from "./catalog/types";

export {
  MIN_SUBTOTAL_CENTS,
  SHIPPING_CHICAGO_CENTS,
  TAX_RATE,
  MAX_QTY_PER_LINE,
};

const SERVICE_ZIP_SET = new Set<string>(SERVICE_AREA_ZIPS);

export interface PriceCartInput {
  cart: CartLine[];
  fulfillmentMode: FulfillmentMode;
  promoCode?: string | null;
  shippingZip?: string | null;
}

export async function priceCart(input: PriceCartInput): Promise<PricingResponse> {
  const { cart, fulfillmentMode, promoCode, shippingZip } = input;

  if (!Array.isArray(cart) || cart.length === 0) {
    return { ok: false, code: "empty_cart", message: "Your cart is empty." };
  }

  const consolidated = consolidateLines(cart);
  for (const line of consolidated) {
    if (
      !Number.isInteger(line.quantity) ||
      line.quantity <= 0 ||
      line.quantity > MAX_QTY_PER_LINE
    ) {
      return {
        ok: false,
        code: "invalid_quantity",
        message: `Invalid quantity for ${line.sku}.`,
      };
    }
  }

  let catalogMap;
  try {
    catalogMap = await getInternalCatalogMap();
  } catch (err) {
    console.error("[cart-pricing] catalog unavailable:", err);
    return {
      ok: false,
      code: "catalog_unavailable",
      message: "We're updating the catalog. Please try again in a moment.",
    };
  }

  const lineItems: PricedLine[] = [];
  const unknown: string[] = [];
  let subtotalCents = 0;

  for (const line of consolidated) {
    const item = catalogMap.get(line.sku);
    if (!item || !item.active) {
      unknown.push(line.sku);
      continue;
    }
    const lineTotalCents = item.priceCents * line.quantity;
    lineItems.push({
      sku: item.sku,
      name: item.name,
      unit: item.unit,
      unitLabel: item.unitLabel,
      quantity: line.quantity,
      unitPriceCents: item.priceCents,
      lineTotalCents,
    });
    subtotalCents += lineTotalCents;
  }

  if (unknown.length > 0 && lineItems.length === 0) {
    return {
      ok: false,
      code: "unknown_sku",
      message: "Items in your cart are no longer available.",
      unknownSkus: unknown,
    };
  }

  if (subtotalCents < MIN_SUBTOTAL_CENTS) {
    return {
      ok: false,
      code: "below_minimum",
      message: "Add a few more items to reach the $25 minimum.",
      shortfallCents: MIN_SUBTOTAL_CENTS - subtotalCents,
      lineItems,
      subtotalCents,
    };
  }

  let discountCents = 0;
  let appliedPromoCode: string | null = null;
  const validPromo = validatePromo(promoCode, "one-time");
  if (validPromo) {
    const raw = getDiscountCents(validPromo.entry, subtotalCents);
    discountCents = Math.min(raw, Math.max(0, subtotalCents - 100));
    appliedPromoCode = validPromo.code;
  }

  const postDiscountSubtotalCents = subtotalCents - discountCents;

  let shippingCents = 0;
  if (fulfillmentMode === "delivery") {
    const zip = (shippingZip || "").trim().slice(0, 5);
    if (!/^\d{5}$/.test(zip)) {
      return {
        ok: false,
        code: "missing_zip",
        message: "Enter a valid ZIP to see delivery cost.",
        lineItems,
        subtotalCents,
      };
    }
    if (!SERVICE_ZIP_SET.has(zip)) {
      return {
        ok: false,
        code: "out_of_zone",
        message: "We don't deliver there yet. Pick Polsky Center pickup or join the waitlist.",
        lineItems,
        subtotalCents,
      };
    }
    shippingCents = SHIPPING_CHICAGO_CENTS;
  }

  const taxCents = Math.round(postDiscountSubtotalCents * TAX_RATE);
  const totalCents = postDiscountSubtotalCents + shippingCents + taxCents;

  return {
    ok: true,
    lineItems,
    subtotalCents,
    discountCents,
    postDiscountSubtotalCents,
    shippingCents,
    taxCents,
    totalCents,
    appliedPromoCode,
    fulfillmentMode,
    minMet: true,
  };
}

function consolidateLines(cart: CartLine[]): CartLine[] {
  const map = new Map<string, number>();
  for (const line of cart) {
    if (!line || typeof line.sku !== "string") continue;
    const sku = line.sku.trim();
    if (!sku) continue;
    const qty = Math.floor(Number(line.quantity) || 0);
    map.set(sku, (map.get(sku) ?? 0) + qty);
  }
  return Array.from(map.entries()).map(([sku, quantity]) => ({ sku, quantity }));
}

export function summarizeLineItems(items: PricedLine[], maxChars = 480): string {
  const parts = items.map((it) => `${it.name} x${it.quantity}`);
  let joined = parts.join(", ");
  if (joined.length <= maxChars) return joined;
  let included = 0;
  let acc = "";
  for (const part of parts) {
    const tentative = acc ? `${acc}, ${part}` : part;
    if (tentative.length > maxChars - 24) break;
    acc = tentative;
    included += 1;
  }
  const remaining = items.length - included;
  return remaining > 0 ? `${acc} and ${remaining} more` : acc;
}

export function serializeCartForMetadata(items: PricedLine[]): string {
  return JSON.stringify(
    items.map((it) => [it.sku, it.quantity, it.unitPriceCents])
  );
}
