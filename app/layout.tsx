import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { GoogleAnalytics } from "@/components/GoogleAnalytics"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "UNCLE MAY'S Produce & Provisions - Supporting Black Farmers",
  description: "Chicago's first Black American grocery store. Get fresh produce from Black farmers across the local area and Southern United States delivered to your door, while supporting our community. Heritage since 1930.",
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
      </body>
    </html>
  )
}
