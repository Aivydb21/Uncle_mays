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
      "Finally. An opportunity to buy from Black people all in one place. And I could just order it directly without doing all the networking myself.",
    name: "Antoinette W.",
    source: "Customer interview, May 2026 (3x repeat customer, Auburn Gresham)",
  },
  {
    quote: "Y'all had me at all Black farmers.",
    name: "Miriam J.",
    source: "Customer interview, May 2026",
  },
  {
    quote:
      "Always searching for real food, given the limited options on the Southside. I was happy to support a Black farmer.",
    name: "Morgan W.",
    source: "Customer interview, May 2026",
  },
  {
    quote: "Beautiful veggies.",
    name: "Maria T.",
    source: "Customer review, April 2026",
  },
];
