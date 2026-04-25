import type { Metadata } from "next";
import { GetStartedContent } from "./GetStartedContent";

export const metadata: Metadata = {
  title: "Get Your First Box — Uncle May's Produce",
  description:
    "Fresh seasonal produce delivered weekly across Chicago. Use code FRESH10 for $10 off your first box. Free delivery, cancel anytime.",
  openGraph: {
    title: "Get Your First Box — $10 off with FRESH10",
    description:
      "Fresh seasonal produce delivered weekly across Chicago. $10 off your first box.",
    url: "https://unclemays.com/get-started",
    type: "website",
  },
  alternates: { canonical: "https://unclemays.com/get-started" },
};

export default function GetStartedPage() {
  return <GetStartedContent />;
}
