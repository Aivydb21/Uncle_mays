import type { Metadata } from "next";
import HomePageContent from "@/page-content/Index";
import { ShopCTA } from "@/components/ShopCTA";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://unclemays.com/",
  name: "Uncle Mays Produce",
  description:
    "Premium produce, pantry staples, and pasture-raised protein sourced directly from Black farmers. Build your own grocery order from the catalog. Chicago delivery or free pickup at the Polsky Center in Hyde Park. $25 minimum, no subscription required.",
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
    "Uncle May's Produce connects Black farmers directly to households across the Chicago metro area through a curated catalog of premium produce, pantry staples, and pasture-raised protein. Build your own grocery order. $25 minimum, no subscription required.",
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

// Catalog/store schema (replaces the 2-box ItemList that listed Spring/Full
// Harvest as fixed Products). Now we point search engines at /shop, where
// individual SKUs are rendered server-side from the live Airtable catalog.
const storeSchema = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "Uncle Mays Produce — Shop",
  description:
    "Build your own grocery order from Uncle May's curated catalog. Premium produce, pantry staples, and pasture-raised protein from Black farmers. $25 minimum.",
  url: "https://unclemays.com/shop",
  image: "https://www.unclemays.com/uncle-mays-logo.png",
  priceRange: "$$",
  paymentAccepted: "Credit Card",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Uncle May's Catalog",
    url: "https://unclemays.com/shop",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How does ordering work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Browse the catalog at unclemays.com/shop, fill your cart with the items you want (any quantity), and check out. $25 minimum. Pay once per order. No subscription, no auto-renewal, no card on file.",
      },
    },
    {
      "@type": "Question",
      name: "What's in the catalog?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A rotating selection of premium produce (greens, roots, microgreens), pantry staples (organic beans), and pasture-raised protein (chicken, beef short ribs, lamb chops, farm eggs). All sourced from Black farmer partners. Items rotate seasonally based on what's harvesting that week.",
      },
    },
    {
      "@type": "Question",
      name: "How does delivery work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Choose Chicago delivery ($7.99 flat rate to most Chicago and south-suburb ZIPs) or free pickup at the Polsky Center, 1452 E 53rd St in Hyde Park. Delivery and pickup windows are picked at checkout.",
      },
    },
    {
      "@type": "Question",
      name: "Is this a subscription? Will my card be auto-charged?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Every order is a one-time purchase. You order, you get charged once for that order, that's it. No recurring billing, no auto-renewal, no card on file.",
      },
    },
    {
      "@type": "Question",
      name: "What if I have an issue with my order?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We stand behind every order. If anything is wrong (missing items, quality issues, anything), email us at info@unclemays.com and we'll make it right, no questions asked.",
      },
    },
    {
      "@type": "Question",
      name: "How do I cancel my order?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "There's nothing to cancel. Every order is a one-time purchase with no recurring charges. If you need to modify or cancel an order you've already placed, email info@unclemays.com as soon as possible and we'll take care of it.",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomePageContent productSection={<ShopCTA />} />
    </>
  );
}
