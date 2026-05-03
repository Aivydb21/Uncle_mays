import type { Metadata } from "next";
import { GetStartedContent } from "./GetStartedContent";

export const metadata: Metadata = {
  title: "Get Your First Order — Uncle May's Produce",
  description:
    "Build your own grocery order from Uncle May's catalog — produce, pantry, and pasture-raised protein. Use code FRESH10 for $10 off your first order. Free Chicago delivery, $25 minimum.",
  openGraph: {
    title: "Get Your First Order — $10 off with FRESH10",
    description:
      "Build your own order from Uncle May's catalog. $10 off your first order with FRESH10. Free Chicago delivery, $25 minimum.",
    url: "https://unclemays.com/get-started",
    type: "website",
  },
  alternates: { canonical: "https://unclemays.com/get-started" },
};

export default function GetStartedPage() {
  return <GetStartedContent />;
}
