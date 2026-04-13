import type { Metadata } from "next";
import FaqContent from "@/page-content/Faq";

export const metadata: Metadata = {
  title: "How It Works | Uncle Mays Produce",
  description:
    "Learn how Uncle Mays Produce works: what's in the box, how delivery works, pricing, and frequently asked questions.",
  alternates: {
    canonical: "/faq",
  },
};

export default function FaqPage() {
  return <FaqContent />;
}
