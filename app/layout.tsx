import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { GoogleAnalytics } from "@/components/GoogleAnalytics"
import { FacebookPixel } from "@/components/FacebookPixel"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "UNCLE MAY'S Produce & Provisions - Supporting Black Farmers",
  description: "Chicago's first Black American grocery store. Get fresh produce from Black farmers across the local area and Southern United States delivered to your door, while supporting our community. Heritage since 1930.",
  
  // Open Graph / Facebook Meta Tags
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://unclemays.com', // Update with your actual domain
    siteName: "UNCLE MAY'S Produce & Provisions",
    title: "UNCLE MAY'S Produce & Provisions - Supporting Black Farmers",
    description: "Chicago's first Black American grocery store. Get fresh produce from Black farmers across the local area and Southern United States delivered to your door, while supporting our community. Heritage since 1930.",
    images: [
      {
        url: '/uncle-mays-logo.png', // Your logo for social sharing
        width: 1200,
        height: 630,
        alt: "UNCLE MAY'S Produce & Provisions Logo",
      },
      {
        url: '/hero-farmers.jpg', // Hero image for social sharing
        width: 1200,
        height: 630,
        alt: "Fresh produce from Black farmers",
      }
    ],
  },
  
  // Twitter Card Meta Tags
  twitter: {
    card: 'summary_large_image',
    title: "UNCLE MAY'S Produce & Provisions - Supporting Black Farmers",
    description: "Chicago's first Black American grocery store. Get fresh produce from Black farmers across the local area and Southern United States delivered to your door, while supporting our community. Heritage since 1930.",
    images: ['/hero-farmers.jpg'],
    creator: '@unclemays', // Update with your Twitter handle
    site: '@unclemays', // Update with your Twitter handle
  },
  
  // Additional SEO Meta Tags
  keywords: [
    'Black farmers',
    'fresh produce',
    'Chicago grocery store',
    'Black American business',
    'local produce delivery',
    'community supported agriculture',
    'heritage farming',
    'Southern produce',
    'organic vegetables',
    'farm to table'
  ],
  
  // Social Media and Business Meta Tags
  authors: [{ name: "UNCLE MAY'S Produce & Provisions" }],
  creator: "UNCLE MAY'S Produce & Provisions",
  publisher: "UNCLE MAY'S Produce & Provisions",
  
  // Business Information
  other: {
    'business:contact_data:street_address': 'Chicago, IL', // Update with actual address
    'business:contact_data:locality': 'Chicago',
    'business:contact_data:region': 'IL',
    'business:contact_data:postal_code': '60601', // Update with actual zip
    'business:contact_data:country_name': 'United States',
    'business:contact_data:phone_number': '+1-XXX-XXX-XXXX', // Update with actual phone
    'business:contact_data:email': 'info@unclemays.com', // Update with actual email
    'business:contact_data:website': 'https://unclemays.com', // Update with actual domain
    'business:contact_data:hours': 'Mon-Fri 9AM-6PM, Sat 9AM-4PM', // Update with actual hours
  },
  
  // Robots and Indexing
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Verification
  verification: {
    google: 'your-google-verification-code', // Add when you have it
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
  
  // Additional SEO meta tags
  alternates: {
    canonical: 'https://unclemays.com', // Update with your actual domain
  },
  
  // Open Graph additional properties
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://unclemays.com', // Update with your actual domain
    siteName: "UNCLE MAY'S Produce & Provisions",
    title: "UNCLE MAY'S Produce & Provisions - Supporting Black Farmers",
    description: "Chicago's first Black American grocery store. Get fresh produce from Black farmers across the local area and Southern United States delivered to your door, while supporting our community. Heritage since 1930.",
    images: [
      {
        url: '/uncle-mays-logo.png', // Your logo for social sharing
        width: 1200,
        height: 630,
        alt: "UNCLE MAY'S Produce & Provisions Logo",
      },
      {
        url: '/hero-farmers.jpg', // Hero image for social sharing
        width: 1200,
        height: 630,
        alt: "Fresh produce from Black farmers",
      }
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''} />
        <FacebookPixel pixelId={process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || ''} />
      </body>
    </html>
  )
}
