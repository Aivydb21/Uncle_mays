import type { Metadata } from "next";
import { Playfair_Display, Work_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import { Providers } from "@/components/Providers";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { MobileCTA } from "@/components/MobileCTA";
import { FacebookPixelTracker } from "@/components/FacebookPixelTracker";

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
  title: "Uncle Mays Produce - Fresh Produce from Black Farmers, Delivered in Chicago",
  description:
    "Curated seasonal produce boxes sourced directly from Black farmers, delivered to your Chicago door. Boxes from $35. No subscription required. Order today.",
  authors: [{ name: "Uncle Mays Produce" }],
  metadataBase: new URL("https://unclemays.com"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: "Uncle Mays Produce - Fresh Produce from Black Farmers, Delivered in Chicago",
    description:
      "Curated seasonal produce boxes sourced directly from Black farmers, delivered to your Chicago door. Boxes from $35. No subscription required. Order today.",
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
    title: "Uncle Mays Produce - Fresh Produce from Black Farmers, Delivered in Chicago",
    description:
      "Curated seasonal produce boxes sourced directly from Black farmers, delivered to your Chicago door. Boxes from $35. No subscription required. Order today.",
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
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-W82QVGZL');`}
        </Script>

        {/* Google Analytics + Google Ads */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}');${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ? `gtag('config','${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}');` : ""}`}
        </Script>

        {/* Facebook Pixel — ID hardcoded to prevent undefined in static export */}
        <Script id="fb-pixel" strategy="afterInteractive">
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
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-W82QVGZL"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navigation />
            <main className="flex-1">{children}</main>
            <Footer />
            <MobileCTA />
          </div>
          <FacebookPixelTracker />
        </Providers>
      </body>
    </html>
  );
}
