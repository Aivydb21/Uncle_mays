export const PRODUCTS = {
  starter: {
    name: "Starter Box",
    price: 35,
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
    items: [
      "8–10 seasonal produce items",
      "Greens, roots, and seasonal variety",
      "1 dozen eggs",
      "1 protein: pastured whole chicken or beef short ribs",
    ],
  },
  community: {
    name: "Community Box",
    price: 95,
    items: [
      "10+ seasonal produce items",
      "Full range of greens, roots, and microgreens",
      "2 dozen eggs",
      "2 protein choices: whole chicken, beef short ribs, or lamb chops",
    ],
  },
} as const;

export type ProductSlug = keyof typeof PRODUCTS;
