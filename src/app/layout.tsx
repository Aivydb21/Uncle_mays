import type { Metadata } from "next";
import { Playfair_Display, Work_Sans } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

import { Providers } from "@/components/Providers";
import { PageShell } from "@/components/PageShell";
import { FacebookPixelTracker } from "@/components/FacebookPixelTracker";
import { UTMCapture } from "@/components/UTMCapture";
import { DeferredAnalytics } from "@/components/DeferredAnalytics";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-playfair",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-work-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Uncle Mays Produce - Fresh Produce from Black Farmers, Delivered Across the Chicago Metro Area",
  description:
    "Build your own grocery order from Uncle May's catalog: premium produce, pantry staples, and pasture-raised protein from Black farmers. Chicago delivery or free Hyde Park pickup. $25 minimum, no subscription required.",
  authors: [{ name: "Uncle Mays Produce" }],
  metadataBase: new URL("https://unclemays.com"),
  openGraph: {
    type: "website",
    title: "Uncle Mays Produce - Fresh Produce from Black Farmers, Delivered Across the Chicago Metro Area",
    description:
      "Build your own grocery order from Uncle May's catalog: premium produce, pantry staples, and pasture-raised protein from Black farmers. Chicago delivery or free Hyde Park pickup. $25 minimum, no subscription required.",
    images: [
      {
        url: "https://www.unclemays.com/og-social.png",
        width: 1200,
        height: 630,
        alt: "Uncle May's Produce. No subscription. Just good food.",
      },
    ],
    url: "https://unclemays.com/",
  },
  twitter: {
    card: "summary_large_image",
    site: "@unclemaysproduce",
    title: "Uncle Mays Produce - Fresh Produce from Black Farmers, Delivered Across the Chicago Metro Area",
    description:
      "Build your own grocery order from Uncle May's catalog: premium produce, pantry staples, and pasture-raised protein from Black farmers. Chicago delivery or free Hyde Park pickup. $25 minimum, no subscription required.",
    images: ["https://www.unclemays.com/og-social.png"],
  },
  icons: {
    icon: "/uncle-mays-logo.png",
    apple: "/uncle-mays-logo.png",
    shortcut: "/uncle-mays-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${workSans.variable}`}>
      <body>
        {/*
          All tracking scripts (GTM, GA4, Google Ads, Meta Pixel, Clarity) are
          injected by <DeferredAnalytics />. They wait 3s after mount OR until
          the user scrolls/taps/types — whichever fires first — before any
          third-party script tag is added to the DOM. This keeps the
          12.7s mobile Time-to-Interactive measured on 2026-05-05 from
          blocking the catalog grid for paid-traffic landings.

          PageView events still fire because the deferred load uses Next.js
          strategy="lazyOnload"; the only attribution loss is the small
          fraction of users who bounce within 3s without scrolling/tapping —
          which is exactly the audience the deferral is meant to retain.

          Authorized by CEO Anthony Ivy on 2026-05-05 against the Marketing
          Infrastructure Standing Order.
        */}
        <DeferredAnalytics />

        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=2276705169443313&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-W82QVGZL"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        <Providers>
          <PageShell>{children}</PageShell>
          <Suspense fallback={null}><FacebookPixelTracker /></Suspense>
          <UTMCapture />
        </Providers>
      </body>
    </html>
  );
}
