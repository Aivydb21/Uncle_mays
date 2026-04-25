// Proteins available as optional add-ons across every box.
// Single price point ($15) with smaller, taste-test portions. The story is
// quality and freshness, not bulk: pasture-raised, no antibiotics, no chemicals,
// slaughtered fresh — the opposite of supermarket meat that ships for weeks.
export const PROTEIN_OPTIONS = [
  { id: "chicken", label: "Pasture-Raised Chicken Thighs (~1.5 lb)", price: 15 },
  { id: "beef-short-ribs", label: "Grass-Fed Beef Short Ribs (~3/4 lb)", price: 15 },
  { id: "lamb-chops", label: "Lamb Chop (1, ~6 oz)", price: 15 },
] as const;

export type ProteinId = (typeof PROTEIN_OPTIONS)[number]["id"];

// One-line differentiator shown above the protein options at checkout.
// Keep it short — customers are deciding whether to add, not reading a story.
export const PROTEIN_TAGLINE =
  "Pasture-raised. No antibiotics, no chemicals. Slaughtered fresh, never shipped — better than organic.";

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
