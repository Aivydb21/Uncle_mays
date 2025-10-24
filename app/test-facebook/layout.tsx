import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Facebook Conversions Test - UNCLE MAY'S Produce",
  description: "Test Facebook conversion tracking for UNCLE MAY'S Produce & Provisions. Debug and verify Facebook pixel events.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://unclemays.com/test-facebook',
  },
}

export default function TestFacebookLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

