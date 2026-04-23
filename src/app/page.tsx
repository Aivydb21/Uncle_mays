import HomePageContent from "@/page-content/Index";

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://unclemays.com/",
  name: "Uncle Mays Produce",
  description:
    "Seasonal produce boxes sourced directly from Black farmers, delivered to Chicago households every Wednesday. Boxes start at $35. No subscription required.",
  url: "https://unclemays.com",
  logo: "https://www.unclemays.com/uncle-mays-logo.png",
  image: "https://www.unclemays.com/uncle-mays-logo.png",
  address: {
    "@type": "PostalAddress",
    streetAddress: "73 W Monroe Ave #3002",
    addressLocality: "Chicago",
    addressRegion: "IL",
    postalCode: "60603",
    addressCountry: "US",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+1-312-972-2595",
    contactType: "Customer Service",
    email: "info@unclemays.com",
  },
  sameAs: ["https://www.instagram.com/unclemaysproduce/"],
  priceRange: "$$",
  areaServed: {
    "@type": "City",
    name: "Chicago",
    sameAs: "https://www.wikidata.org/wiki/Q1297",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Uncle Mays Produce",
  url: "https://unclemays.com",
  logo: "https://www.unclemays.com/uncle-mays-logo.png",
  description:
    "Uncle May's Produce connects Black farmers directly to Chicago through curated seasonal produce boxes. Delivering every Wednesday. Boxes from $40, no subscription required.",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+1-312-972-2595",
    contactType: "Customer Service",
    email: "info@unclemays.com",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "73 W Monroe Ave #3002",
    addressLocality: "Chicago",
    addressRegion: "IL",
    postalCode: "60603",
    addressCountry: "US",
  },
  sameAs: ["https://www.instagram.com/unclemaysproduce/"],
};

const productListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Uncle Mays Produce Boxes",
  description:
    "Seasonal produce boxes sourced from Black farmers, delivered across Chicago every Wednesday.",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "Product",
        name: "Small Box",
        description:
          "6 seasonal items from our Black farmer partners: salad mix, kale, candy orange carrots, sweet potatoes, organic pinto beans, and microgreens. Built for 1–2 people.",
        url: "https://unclemays.com/#boxes",
        brand: { "@type": "Brand", name: "Uncle Mays Produce" },
        offers: {
          "@type": "Offer",
          price: "40.00",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://unclemays.com/checkout/starter",
        },
      },
    },
    {
      "@type": "ListItem",
      position: 2,
      item: {
        "@type": "Product",
        name: "Family Box",
        description:
          "9 seasonal items from our Black farmer partners: asparagus (spring; rotates seasonally), kale, rainbow chard, salad mix, candy orange carrots, sweet potatoes, organic pinto beans, organic kidney beans, and microgreens. Built for 3–4 people.",
        url: "https://unclemays.com/#boxes",
        brand: { "@type": "Brand", name: "Uncle Mays Produce" },
        offers: {
          "@type": "Offer",
          price: "70.00",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://unclemays.com/checkout/family",
        },
      },
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How does delivery work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We deliver directly to your Chicago address every Wednesday. Place your order any day of the week and it will be delivered the following Wednesday. After placing your order, you'll receive a confirmation email with your estimated delivery window.",
      },
    },
    {
      "@type": "Question",
      name: "What's actually in the box?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Every box is seasonal and rotating, so you get what's freshest, not what's been sitting in a warehouse. A Small Box currently includes items like salad mix, kale, candy orange carrots, sweet potatoes, organic pinto beans, and microgreens. Contents vary each delivery based on what our farmer partners are harvesting.",
      },
    },
    {
      "@type": "Question",
      name: "How much does a box cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Two tiers: $40 for a Small Box (6 items, built for 1–2 people) or $70 for a Family Box (9 items, built for 3–4 people). Proteins (pasture-raised chicken, beef short ribs, or lamb chops) are optional paid add-ons at checkout. No subscription required — but Subscribe & Save takes 10% off every box.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need a subscription?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Every box is a one-time purchase. Order when it works for you.",
      },
    },
    {
      "@type": "Question",
      name: "What if I have an issue with my order?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We stand behind every box. If anything is wrong with your delivery (missing items, quality issues, anything), email us at info@unclemays.com and we'll make it right, no questions asked.",
      },
    },
    {
      "@type": "Question",
      name: "How do I cancel my order?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "There's nothing to cancel. Every box is a one-time purchase with no recurring charges. If you need to modify or cancel an order you've already placed, email info@unclemays.com as soon as possible and we'll take care of it.",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomePageContent />
    </>
  );
}
