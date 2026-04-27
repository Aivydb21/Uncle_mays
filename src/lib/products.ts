// Proteins available as optional add-ons across every box.
// Flat $12 per 1 lb portion. Pasture-raised, no antibiotics, no chemicals,
// slaughtered fresh. Chicken is the featured option (and is also INCLUDED
// in the Full Harvest Box base price; the add-on stays available so
// customers can buy additional quantity).
export const PROTEIN_OPTIONS = [
  { id: "chicken", label: "Pasture-Raised Chicken Thighs (1 lb)", price: 12, featured: true },
  { id: "beef-short-ribs", label: "Grass-Fed Beef Short Ribs (1 lb)", price: 12 },
  { id: "lamb-chops", label: "Lamb Chops (1 lb)", price: 12 },
] as const;

export type ProteinId = (typeof PROTEIN_OPTIONS)[number]["id"];

// Bean varieties for the Full Harvest Box. Customer chooses one at
// checkout; default is "black" if no choice is made (mirrors the Spring
// Box's fixed black-bean inclusion). All same price (no upcharge).
export const BEAN_OPTIONS = [
  { id: "black", label: "Black beans" },
  { id: "pinto", label: "Pinto beans" },
  { id: "kidney", label: "Kidney beans" },
] as const;

export type BeanId = (typeof BEAN_OPTIONS)[number]["id"];

export const DEFAULT_BEAN: BeanId = "black";

// One-line differentiator shown above the protein options at checkout.
// Keep it short. Customers are deciding whether to add, not reading a story.
export const PROTEIN_TAGLINE =
  "Pasture-raised. No antibiotics, no chemicals. Slaughtered fresh, never shipped. Better than organic.";

/**
 * Two tiers. Contents are built from the current supplier's produce list
 * (greens, salad mix, carrots, sweet potatoes, potatoes, broccoli, dry beans,
 * pea shoots, radishes). No eggs, no tomatoes, no cucumbers, no summer
 * produce unless and until a second supplier is onboarded.
 *
 * Proteins are optional paid add-ons selected at checkout (see
 * PROTEIN_OPTIONS above). No box includes protein in the base price.
 *
 * Renamed 2026-04-27: Small Box to Spring Box, Family Box to Full Harvest
 * Box. Slugs ("starter" and "family") kept stable so existing URLs, Stripe
 * Price IDs, and database records continue to resolve.
 */
export const PRODUCTS = {
  starter: {
    name: "Spring Box",
    price: 40,
    subPrice: 36,
    items: [
      "Salad mix, 1 clamshell (5 oz)",
      "Candy orange carrots, 1 lb",
      "Sweet potatoes, 1.5 lb",
      "Potatoes, 1.5 lb",
      "Broccoli, 1 head",
      "Organic black beans, 1 lb",
    ],
    servingNote: "Fresh greens, roots, and pantry staples for the week",
    servingBadge: "for 1–2 people",
  },
  family: {
    name: "Full Harvest Box",
    price: 70,
    subPrice: 63,
    items: [
      "Everything in the Spring Box",
      "Pea shoots, 1 clamshell",
      "Radishes, 1 bunch",
      "Choose your bean: black, pinto, or kidney (1 lb)",
      "Pasture-raised chicken thighs, 1 lb (included)",
    ],
    servingNote: "A full week of greens, roots, pantry staples, and protein",
    servingBadge: "for 3–4 people",
  },
} as const;

export type ProductSlug = keyof typeof PRODUCTS;
