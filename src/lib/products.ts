export const PROTEIN_OPTIONS = [
  { id: "chicken", label: "Whole pastured chicken (4\u20135 lbs)" },
  { id: "short-ribs-bone-in", label: "Beef short ribs (bone-in)" },
  { id: "short-ribs-boneless", label: "Beef short ribs (boneless)" },
  { id: "lamb-chops", label: "Lamb chops" },
] as const;

export type ProteinId = (typeof PROTEIN_OPTIONS)[number]["id"];

export const PRODUCTS = {
  starter: {
    name: "Starter Box",
    price: 35,
    proteinCount: 0,
    items: [
      "Asparagus",
      "Lettuce",
      "Radishes",
      "Sweet potatoes",
      "Rainbow chard or kale",
      "Rotating microgreens",
    ],
  },
  family: {
    name: "Family Box",
    price: 65,
    proteinCount: 1,
    items: [
      "8\u201310 seasonal produce items",
      "Greens, roots, and seasonal variety",
      "1 dozen eggs",
      "1 protein: pastured whole chicken or beef short ribs",
    ],
  },
  community: {
    name: "Community Box",
    price: 95,
    proteinCount: 2,
    items: [
      "10+ seasonal produce items",
      "Full range of greens, roots, and microgreens",
      "2 dozen eggs",
      "2 protein choices: whole chicken, beef short ribs, or lamb chops",
    ],
  },
} as const;

export type ProductSlug = keyof typeof PRODUCTS;
