import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Investors - UNCLE MAY'S Produce & Provisions",
  description: "Investment opportunity in Chicago's first Black American grocery store. Supporting Black farmers and building community through fresh produce delivery.",
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
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
