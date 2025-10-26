import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
import { FacebookPixel } from '@/components/FacebookPixel'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "UNCLE MAY'S Produce & Provisions - Supporting Black Farmers",
  description: "Chicago's first Black American grocery store. Get fresh produce from Black farmers across the local area and Southern United States delivered to your door, while supporting our community. Heritage since 1930.",
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
  authors: [{ name: "UNCLE MAY'S Produce & Provisions" }],
  creator: "UNCLE MAY'S Produce & Provisions",
  publisher: "UNCLE MAY'S Produce & Provisions",
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
  openGraph: {
    title: "UNCLE MAY'S Produce & Provisions - Supporting Black Farmers",
    description: "Chicago's first Black American grocery store. Get fresh produce from Black farmers across the local area and Southern United States delivered to your door, while supporting our community. Heritage since 1930.",
    url: 'https://unclemays.com/',
    siteName: "UNCLE MAY'S Produce & Provisions",
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: "UNCLE MAY'S Produce & Provisions - Supporting Black Farmers",
    description: "Chicago's first Black American grocery store. Get fresh produce from Black farmers across the local area and Southern United States delivered to your door, while supporting our community. Heritage since 1930.",
  },
  alternates: {
    canonical: 'https://unclemays.com/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32', type: 'image/x-icon' },
      { url: '/uncle-mays-logo.png', sizes: 'any', type: 'image/png' },
    ],
    apple: [
      { url: '/uncle-mays-logo.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  verification: {
    google: 'your-google-verification-code',
  },
  other: {
    'business:contact_data:street_address': 'Chicago, IL',
    'business:contact_data:locality': 'Chicago',
    'business:contact_data:region': 'IL',
    'business:contact_data:postal_code': '60601',
    'business:contact_data:country_name': 'United States',
    'business:contact_data:phone_number': '+1-XXX-XXX-XXXX',
    'business:contact_data:email': 'info@unclemays.com',
    'business:contact_data:website': 'https://unclemays.com',
    'business:contact_data:hours': 'Mon-Fri 9AM-6PM, Sat 9AM-4PM',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="16x16 32x32" type="image/x-icon" />
        <link rel="icon" href="/uncle-mays-logo.png" sizes="any" type="image/png" />
        <link rel="apple-touch-icon" href="/uncle-mays-logo.png" sizes="180x180" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        {children}
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''} />
        <FacebookPixel pixelId={process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || ''} />
      </body>
    </html>
  )
}