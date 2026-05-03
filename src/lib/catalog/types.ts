export type CatalogCategory =
  | "Greens"
  | "Roots"
  | "Pantry"
  | "Protein"
  | "Microgreens";

export type CatalogUnit = "lb" | "bunch" | "each" | "dozen" | "pint" | "oz";

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
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
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
}

export type PricingResponse = PricingResult | PricingError;
