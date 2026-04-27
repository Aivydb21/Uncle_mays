import type { Metadata } from "next";
import HomePageContent from "@/page-content/Index";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://unclemays.com/",
  name: "Uncle Mays Produce",
  description:
    "Seasonal produce boxes sourced directly from Black farmers, delivered to households across the Chicago metro area every Wednesday. Boxes start at $40. No subscription required.",
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
    "@type": "AdministrativeArea",
    name: "Chicago metropolitan area",
    sameAs: "https://www.wikidata.org/wiki/Q683732",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Uncle Mays Produce",
  url: "https://unclemays.com",
  logo: "https://www.unclemays.com/uncle-mays-logo.png",
  description:
    "Uncle May's Produce connects Black farmers directly to households across the Chicago metro area through curated seasonal produce boxes. Delivering every Wednesday. Boxes from $40, no subscription required.",
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
    "Seasonal produce boxes sourced from Black farmers, delivered across the Chicago metro area every Wednesday.",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "Product",
        name: "Spring Box",
        description:
          "6 seasonal items from our Black farmer partners: salad mix, candy orange carrots, sweet potatoes, potatoes, broccoli, and organic black beans. About 6 lbs of fresh food. Built for 1 to 2 people.",
        url: "https://unclemays.com/#boxes",
        brand: { "@type": "Brand", name: "Uncle Mays Produce" },
        offers: {
          "@type": "Offer",
          price: "40.00",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://unclemays.com/#boxes",
        },
      },
    },
    {
      "@type": "ListItem",
      position: 2,
      item: {
        "@type": "Product",
        name: "Full Harvest Box",
        description:
          "Everything in the Spring Box, plus pea shoots, radishes, a customer choice of bean (black, pinto, or kidney), and pasture-raised chicken thighs (included). About 10 lbs of fresh food. Built for 3 to 4 people. Additional proteins available at checkout for $12 each.",
        url: "https://unclemays.com/#boxes",
        brand: { "@type": "Brand", name: "Uncle Mays Produce" },
        offers: {
          "@type": "Offer",
          price: "70.00",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://unclemays.com/#boxes",
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
        text: "We deliver directly to your door across the Chicago metro area (city plus south suburbs) every Wednesday. Place your order any day of the week and it will be delivered the following Wednesday. After placing your order, you'll receive a confirmation email with your estimated delivery window.",
      },
    },
    {
      "@type": "Question",
      name: "What's actually in the box?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Every box is seasonal and rotating, so you get what's freshest, not what's been sitting in a warehouse. The Spring Box currently includes salad mix, candy orange carrots, sweet potatoes, potatoes, broccoli, and organic black beans (about 6 lbs total). The Full Harvest Box includes everything in the Spring Box plus pea shoots, radishes, a customer choice of bean, and pasture-raised chicken thighs (about 10 lbs total). Contents vary each delivery based on what our farmer partners are harvesting.",
      },
    },
    {
      "@type": "Question",
      name: "How much does a box cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Two tiers. The Spring Box is $40, built for 1 to 2 people, about 6 lbs of fresh food. The Full Harvest Box is $70, built for 3 to 4 people, about 10 lbs of fresh food. The Full Harvest Box includes pasture-raised chicken thighs at no extra charge. Additional proteins can be added at checkout for $12 each. Every box is a one-time order with no subscription and no auto-renewal.",
      },
    },
    {
      "@type": "Question",
      name: "Is this a subscription? Will my card be auto-charged?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Every box is a one-time purchase. You order, you get charged once for that one box, that's it. No recurring billing, no auto-renewal, no card on file. The next time you want a box, you come back and order again.",
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
