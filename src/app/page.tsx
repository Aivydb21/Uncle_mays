import HomePageContent from "@/page-content/Index";

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://unclemays.com/",
  name: "Uncle Mays Produce",
  description:
    "Seasonal produce boxes sourced directly from Black farmers, delivered to Chicago households every Sunday. Boxes start at $35. No subscription required.",
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
  sameAs: ["https://www.instagram.com/unclemays"],
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
    "Uncle May's Produce connects Black farmers directly to Chicago through curated seasonal produce boxes. Delivering every Sunday. Boxes from $35, no subscription required.",
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
  sameAs: ["https://www.instagram.com/unclemays"],
};

const productListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Uncle Mays Produce Boxes",
  description:
    "Seasonal produce boxes sourced from Black farmers, delivered across Chicago every Sunday.",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "Product",
        name: "Starter Box",
        description:
          "5–7 seasonal items, 12–15 lbs of fresh produce. Perfect for individuals or couples.",
        url: "https://unclemays.com/#boxes",
        brand: { "@type": "Brand", name: "Uncle Mays Produce" },
        offers: {
          "@type": "Offer",
          price: "35.00",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://buy.stripe.com/cNidR983d5Mw83JcNu9Zm08",
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
          "12–15 seasonal items, 22–26 lbs of fresh produce. Ideal for families of 3–5.",
        url: "https://unclemays.com/#boxes",
        brand: { "@type": "Brand", name: "Uncle Mays Produce" },
        offers: {
          "@type": "Offer",
          price: "65.00",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://buy.stripe.com/dRmbJ1erB2AkcjZeVC9Zm09",
        },
      },
    },
    {
      "@type": "ListItem",
      position: 3,
      item: {
        "@type": "Product",
        name: "Community Box",
        description:
          "20–25 seasonal items, 30–35 lbs of fresh produce. For large families or sharing.",
        url: "https://unclemays.com/#boxes",
        brand: { "@type": "Brand", name: "Uncle Mays Produce" },
        offers: {
          "@type": "Offer",
          price: "95.00",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://buy.stripe.com/8x25kD5V5b6QabR7ta9Zm0a",
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
        text: "We deliver directly to your Chicago address every Sunday. Place your order any day of the week and it will be delivered the following Sunday. After placing your order, you'll receive a confirmation email with your estimated delivery window.",
      },
    },
    {
      "@type": "Question",
      name: "What's actually in the box?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Every box is seasonal and rotating, so you get what's freshest, not what's been sitting in a warehouse. A Starter Box typically includes 5-7 items like sweet corn, heirloom tomatoes, collard greens, squash, and fresh herbs. The contents vary each delivery.",
      },
    },
    {
      "@type": "Question",
      name: "How much does a box cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Boxes start at $35 for a Starter Box (5-7 seasonal items, 12-15 lbs), $65 for a Family Box (12-15 items, 22-26 lbs), and $95 for a Community Box (20-25 items, 30-35 lbs). No subscription required. Order when you want.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need a subscription?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Every box is a one-time purchase. Order when it works for you. If you'd like regular deliveries, reach out to info@unclemays.com and we can set up a recurring schedule.",
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
