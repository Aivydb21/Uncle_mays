// Single source of truth for customer testimonials.
// Only add quotes from real, attributable customers. If a quote was sourced
// from a public post (Facebook, Instagram, Google review), include the source
// so we can defend the attribution if asked.
export type Testimonial = {
  quote: string;
  name: string;
  source?: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Loved my first box from them, looking to order more. Friendly customer service, fresh quality produce. Can't wait until I receive my next box next week.",
    name: "Antoinette W.",
    source: "Facebook comment, April 2026",
  },
];
