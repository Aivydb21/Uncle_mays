import type { Metadata } from "next";
import { Playfair_Display, Work_Sans } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";

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
    "Build your own grocery order from Uncle May's catalog: premium produce, pantry staples, and pasture-raised protein from Black farmers. Chicago delivery or free Hyde Park pickup. $20 minimum, no subscription required.",
  authors: [{ name: "Uncle Mays Produce" }],
  metadataBase: new URL("https://unclemays.com"),
  openGraph: {
    type: "website",
    title: "Uncle Mays Produce - Fresh Produce from Black Farmers, Delivered Across the Chicago Metro Area",
    description:
      "Build your own grocery order from Uncle May's catalog: premium produce, pantry staples, and pasture-raised protein from Black farmers. Chicago delivery or free Hyde Park pickup. $20 minimum, no subscription required.",
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
      "Build your own grocery order from Uncle May's catalog: premium produce, pantry staples, and pasture-raised protein from Black farmers. Chicago delivery or free Hyde Park pickup. $20 minimum, no subscription required.",
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
          Tracking-script bootstrap.

          Step 1 (this inline stub, fires immediately, ~0.4 KB): defines
          window.fbq and window.gtag as queueing stubs so that any
          AddToCart / InitiateCheckout event triggered before the
          full pixels load is buffered, not dropped. Mirrors the queue
          pattern inside Meta's own pixel snippet.

          Step 2 (<DeferredAnalytics />, mounts after 3s OR first user
          interaction): swaps the network <script> tags for GTM, GA4,
          Google Ads, Meta Pixel, and lazy-imports LogRocket (the session
          replay + Galileo AI intelligence layer that replaced Clarity on
          2026-05-14). When fbevents.js / gtag.js load, they read the queued
          calls from f._fbq.queue and window.dataLayer respectively, so all
          earlier events fire retroactively with their correct payload.

          This split keeps the 12.7s mobile TTI measured on 2026-05-05 from
          blocking the catalog grid for paid-traffic landings, without
          losing the AddToCart / InitiateCheckout events that drive Meta's
          optimization signal.

          Authorized by CEO Anthony Ivy on 2026-05-05 against the Marketing
          Infrastructure Standing Order.
        */}
        <Script id="analytics-stubs" strategy="beforeInteractive">
          {`!function(){var w=window;w.dataLayer=w.dataLayer||[];if(!w.gtag){w.gtag=function(){w.dataLayer.push(arguments)}}if(!w.fbq){var n=w.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};w._fbq=w._fbq||n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[]}}();`}
        </Script>
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

        <PageShell>{children}</PageShell>
        <Suspense fallback={null}><FacebookPixelTracker /></Suspense>
        <UTMCapture />
      </body>
    </html>
  );
}
