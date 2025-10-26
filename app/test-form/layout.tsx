import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Form Test Page - UNCLE MAY'S Produce",
  description: "Test subscription form functionality for UNCLE MAY'S Produce & Provisions. Debug form submissions and API integration.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://unclemays.com/test-form',
  },
}

export default function TestFormLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


