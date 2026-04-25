// Proteins available as optional add-ons across every box.
// Prices target ~30% gross margin on wholesale cost for the typical portion
// size shipped. Do not add proteins we cannot actually source week-to-week.
export const PROTEIN_OPTIONS = [
  { id: "chicken", label: "Pasture-Raised Whole Chicken (4–5 lb)", price: 45 },
  { id: "beef-short-ribs", label: "Grass-Fed Beef Short Ribs, bone-in (~3 lb)", price: 38 },
  { id: "lamb-chops", label: "Lamb Chops (~1.5 lb)", price: 42 },
] as const;

export type ProteinId = (typeof PROTEIN_OPTIONS)[number]["id"];

/**
 * Two tiers. Contents are built from the current supplier's produce list
 * (asparagus, kales, chard, salad mix, microgreens, carrots, sweet potatoes,
 * dry beans). No eggs, no tomatoes, no cucumbers, no summer produce
 * unless/until a second supplier is onboarded.
 *
 * Proteins are optional paid add-ons selected at checkout (see
 * PROTEIN_OPTIONS above). No box includes protein in the base price.
 */
export const PRODUCTS = {
  starter: {
    name: "Small Box",
    price: 40,
    subPrice: 36,
    items: [
      "Salad mix — 1 clamshell (5 oz)",
      "Kale — 1 bunch (chef's pick: green curly, red, or tuscan)",
      "Candy orange carrots — 1 lb",
      "Sweet potatoes — 1.5 lb",
      "Organic pinto beans — 1 lb",
      "Microgreens — 1 clamshell (chef's pick)",
    ],
    servingNote: "Fresh greens, roots, and pantry staples for the week",
    servingBadge: "for 1–2 people",
  },
  family: {
    name: "Family Box",
    price: 70,
    subPrice: 63,
    items: [
      "Asparagus — 1 lb (spring only; rotates seasonally)",
      "Kale — 2 bunches (mix of varieties)",
      "Rainbow chard — 1 bunch",
      "Salad mix — 1 clamshell (5 oz)",
      "Candy orange carrots — 2 lb",
      "Sweet potatoes — 2 lb",
      "Organic pinto beans — 1 lb",
      "Organic kidney beans — 1 lb",
      "Microgreens — 1 clamshell (chef's pick)",
    ],
    servingNote: "A full week of greens, roots, and pantry staples",
    servingBadge: "for 3–4 people",
  },
} as const;

export type ProductSlug = keyof typeof PRODUCTS;
