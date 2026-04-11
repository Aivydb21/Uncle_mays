export const PROTEIN_OPTIONS = [
  { id: "chicken", label: "Pasture-Raised Whole Chicken", price: 18 },
  { id: "pork-chops", label: "Heritage Pork Chops (bone-in, 2-pack)", price: 16 },
  { id: "beef-short-ribs", label: "Grass-Fed Beef Short Ribs (1.5 lb)", price: 22 },
  { id: "salmon", label: "Wild-Caught Salmon Fillet (1 lb, skin-on)", price: 20 },
] as const;

export type ProteinId = (typeof PROTEIN_OPTIONS)[number]["id"];

// proteinCount = max proteins selectable. Protein is always optional (add-on, not required).
export const PRODUCTS = {
  starter: {
    name: "Starter Box",
    price: 35,
    subPrice: 31.50,
    proteinCount: 1,
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
    proteinCount: 1,
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
    ],
  },
  community: {
    name: "Community Box",
    price: 95,
    subPrice: 85.50,
    proteinCount: 1,
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
    ],
  },
} as const;

export type ProductSlug = keyof typeof PRODUCTS;
