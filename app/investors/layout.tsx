import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Investor Portal - UNCLE MAY'S Produce & Provisions",
  description: "Access the investor pitch deck and learn about investment opportunities with UNCLE MAY'S Produce & Provisions.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://unclemays.com/investors',
  },
}

export default function InvestorsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      {children}
    </>
  )
}
