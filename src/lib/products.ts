export const PROTEIN_OPTIONS = [
  { id: "chicken", label: "Pasture-Raised Whole Chicken", price: 18 },
  { id: "pork-chops", label: "Heritage Pork Chops (bone-in, 2-pack)", price: 16 },
  { id: "beef-short-ribs", label: "Grass-Fed Beef Short Ribs (1.5 lb)", price: 22 },
  { id: "salmon", label: "Wild-Caught Salmon Fillet (1 lb, skin-on)", price: 20 },
] as const;

export type ProteinId = (typeof PROTEIN_OPTIONS)[number]["id"];

/**
 * proteinIncluded: true  → protein is part of the box price (no extra charge)
 * proteinIncluded: false → protein is an optional add-on at extra cost
 * proteinOptions: string[] → restrict which proteins are available for this box
 *   (undefined = all PROTEIN_OPTIONS shown)
 * proteinCount: 1 → customer selects exactly 1 (radio behavior); enforced UI-side
 */
export const PRODUCTS = {
  starter: {
    name: "Starter Box",
    price: 35,
    firstOrderPrice: 30,
    subPrice: 31.50,
    // Produce only — no protein section
    proteinCount: 0,
    proteinIncluded: false as const,
    items: [
      "Collard greens — 1 bunch",
      "Asparagus — 1 lb",
      "Spring onions — 1 bunch",
      "Heirloom cherry tomatoes — 1 pint",
      "Persian cucumbers — 4 ct",
      "Snap peas — 1/2 lb",
    ],
  },
  family: {
    name: "Family Box",
    price: 65,
    subPrice: 58.50,
    // Chicken included in price — only chicken available, no upcharge
    proteinCount: 1,
    proteinIncluded: true as const,
    proteinOptions: ["chicken"] as ProteinId[],
    items: [
      "Collard greens — 2 bunches",
      "Asparagus — 1.5 lb",
      "Spring onions — 2 bunches",
      "Heirloom cherry tomatoes — 1 pint",
      "Persian cucumbers — 6 ct",
      "Snap peas — 1 lb",
      "Rainbow chard — 1 bunch",
      "Strawberries — 1 quart",
      "Early beets with tops — 1 bunch",
      "Zucchini — 2 ct",
      "Farm eggs — 1 dozen",
      "Pasture-raised whole chicken — included",
    ],
  },
  community: {
    name: "Community Box",
    price: 95,
    subPrice: 85.50,
    // Protein included in price — customer picks 1 from full options, no upcharge
    proteinCount: 1,
    proteinIncluded: true as const,
    // Allow customers to add 2nd/3rd proteins as paid add-ons
    additionalProteinAllowed: true as const,
    additionalProteinPricing: {
      chicken: 20,
      "pork-chops": 18,
      "beef-short-ribs": 24,
      salmon: 22,
    } as Record<ProteinId, number>,
    items: [
      "Watermelon radishes — 1 bunch",
      "Fairy tale eggplant — 1/2 lb",
      "Shishito peppers — 1/2 lb",
      "Hakurei turnips with greens — 1 bunch",
      "Sunburst cherry tomatoes — 1 pint",
      "Pattypan squash — 1/2 lb",
      "Dragon tongue beans — 1/2 lb",
      "Rainbow chard — 1 bunch",
      "Heirloom cucumber — 2 ct",
      "Ramps — 1/2 lb",
      "Farm eggs — 1 dozen",
    ],
  },
} as const;

export type ProductSlug = keyof typeof PRODUCTS;
