import type { Metadata } from "next";
import { Playfair_Display, Work_Sans } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";

import { Providers } from "@/components/Providers";
import { PageShell } from "@/components/PageShell";
import { FacebookPixelTracker } from "@/components/FacebookPixelTracker";
import { UTMCapture } from "@/components/UTMCapture";

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
    "Curated seasonal produce boxes sourced directly from Black farmers, delivered across the Chicago metro area (city plus south suburbs). Boxes from $40. No subscription required. Order today.",
  authors: [{ name: "Uncle Mays Produce" }],
  metadataBase: new URL("https://unclemays.com"),
  openGraph: {
    type: "website",
    title: "Uncle Mays Produce - Fresh Produce from Black Farmers, Delivered Across the Chicago Metro Area",
    description:
      "Curated seasonal produce boxes sourced directly from Black farmers, delivered across the Chicago metro area (city plus south suburbs). Boxes from $40. No subscription required. Order today.",
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
      "Curated seasonal produce boxes sourced directly from Black farmers, delivered across the Chicago metro area (city plus south suburbs). Boxes from $40. No subscription required. Order today.",
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
        {/* Google Tag Manager.
            All tracking scripts use strategy="lazyOnload" — they fire after
            the page is idle. This keeps mobile TBT below the "good" threshold
            (~200ms) and protects LCP. PageView events still fire reliably
            because lazyOnload runs once `window.load` completes; the data
            quality cost is negligible vs. the conversion cost of a slow
            mobile checkout. */}
        <Script id="gtm-init" strategy="lazyOnload">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-W82QVGZL');`}
        </Script>

        {/* Google Analytics + Google Ads */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="lazyOnload"
        />
        <Script id="gtag-init" strategy="lazyOnload">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}');${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ? `gtag('config','${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}');` : ""}`}
        </Script>

        {/* Facebook Pixel — ID hardcoded to prevent undefined in static export */}
        <Script id="fb-pixel" strategy="lazyOnload">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','2276705169443313');fbq('track','PageView');`}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=2276705169443313&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-W82QVGZL"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {/* Microsoft Clarity — session replay + heatmaps. Only loads when the
            env var is set so local dev and preview deploys don't pollute the
            production replay stream. */}
        {process.env.NEXT_PUBLIC_CLARITY_ID ? (
          <Script id="ms-clarity" strategy="lazyOnload">
            {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${process.env.NEXT_PUBLIC_CLARITY_ID}");`}
          </Script>
        ) : null}
        <Providers>
          <PageShell>{children}</PageShell>
          <Suspense fallback={null}><FacebookPixelTracker /></Suspense>
          <UTMCapture />
        </Providers>
      </body>
    </html>
  );
}
