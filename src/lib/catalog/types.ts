// Categories expand in waves per research/product-mix-2026-05-16/. New entries
// here are inert until at least one SKU in Airtable Catalog uses the value;
// CatalogGrid filters CATEGORY_ORDER by present categories, so empty rails
// never render. Order below is the customer-facing display order.
export type CatalogCategory =
  // Wave A (regional produce + soul food staples)
  | "Greens"
  | "Roots"
  | "Microgreens"
  | "Vegetables"
  | "Fruit"
  | "Meat & Seafood"
  | "Protein"
  | "Dairy"
  | "Eggs"
  | "Bakery"
  | "Pantry"
  | "Spices & Condiments"
  | "Snacks"
  | "Beverages"
  | "Frozen Foods"
  | "Prepared Foods"
  // Wave E (Black-owned personal care, added 2026-05-17 per CEO decision)
  | "Personal Care"
  | "Hair Care";

export type CatalogUnit =
  | "lb"
  | "bunch"
  | "each"
  | "dozen"
  | "pint"
  | "oz"
  // Wave A additions: jarred condiments, hot sauce bottles
  | "jar"
  | "bottle"
  // Wave B additions: dairy, bread, bulk bags, packaged staples
  | "gallon"
  | "half_gallon"
  | "loaf"
  | "bag"
  | "can"
  | "box"
  | "tub"
  // Wave E additions: personal care formats
  | "bar"
  | "tube";

export type TaxCategory = "grocery" | "prepared";

export interface CatalogItem {
  sku: string;
  name: string;
  description: string | null;
  category: CatalogCategory;
  unit: CatalogUnit;
  priceCents: number;
  active: boolean;
  availableQty: number | null;
  imageUrl: string | null;
  sortOrder: number;
  taxCategory: TaxCategory;
  // Optional badges (operator-set in Airtable). Empty/null = no badge.
  freshnessLabel: string | null;
  scarcityNote: string | null;
  // Customer-facing display override for the unit. When null, the cart and
  // catalog card show the bare `unit` (e.g. "lb"). When set, it overrides
  // the displayed text only — internal accounting still uses `unit`.
  // Examples: "½ lb", "bunch", "head", "pair (2 chops)", "bird (~4.5 lb)".
  unitLabel: string | null;
  // How many units the "Add to cart" button adds on first click. Lets us
  // default sweet potatoes to 2, smalls to 4, etc., without forcing the
  // shopper to bump quantity manually for the typical purchase.
  defaultAddQty: number;
  // True when this SKU's supplier is Black-owned. Resolved from the linked
  // Suppliers record in Airtable (Catalog.Supplier → Suppliers.Black-owned,
  // mirrored to Catalog as a lookup field). Renders a "Black-owned" badge
  // on shop cards and cart line items. Default false when unset.
  blackOwnedSupplier: boolean;
  // Business days from order placement to ship-out. Drives the per-SKU
  // "Ships in N days" badge and the minimum delivery date enforced at
  // checkout. 0 or 1 = stocked at the hub (default delivery promise);
  // 3-4 = perishable batched (RAB Wednesday cycle); 5-10 = made-to-order
  // shelf-stable from a vendor PO. The aggregate cart lead time is
  // max(leadTimeDays) across the cart.
  leadTimeDays: number;
}

export interface CatalogItemInternal extends CatalogItem {
  costCents: number;
}

export interface CartLine {
  sku: string;
  quantity: number;
}

export interface PricedLine {
  sku: string;
  name: string;
  unit: CatalogUnit;
  unitLabel: string | null;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  blackOwnedSupplier: boolean;
  leadTimeDays: number;
}

export type FulfillmentMode = "delivery" | "pickup";

export interface PickupSlot {
  slotId: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  booked: number;
  active: boolean;
  locationLabel: string;
}

export interface PricingResult {
  ok: true;
  lineItems: PricedLine[];
  subtotalCents: number;
  discountCents: number;
  postDiscountSubtotalCents: number;
  shippingCents: number;
  /** Illinois state grocery tax portion (0% on qualifying food since 2026-01-01). */
  stateTaxCents: number;
  /** Chicago + Cook County + RTA local grocery tax portion (0% on qualifying food). */
  localTaxCents: number;
  /** Sum of stateTaxCents + localTaxCents, kept for backward-compat. */
  taxCents: number;
  totalCents: number;
  appliedPromoCode: string | null;
  fulfillmentMode: FulfillmentMode;
  minMet: true;
}

export type PricingErrorCode =
  | "empty_cart"
  | "below_minimum"
  | "unknown_sku"
  | "out_of_zone"
  | "catalog_unavailable"
  | "missing_zip"
  | "invalid_quantity";

export interface PricingError {
  ok: false;
  code: PricingErrorCode;
  message: string;
  shortfallCents?: number;
  unknownSkus?: string[];
  // Soft errors (below_minimum, missing_zip, out_of_zone) still include the
  // resolved line items + subtotal so the cart drawer can render its contents
  // while the customer fixes the issue.
  lineItems?: PricedLine[];
  subtotalCents?: number;
}

export type PricingResponse = PricingResult | PricingError;
