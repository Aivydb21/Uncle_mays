import type { Metadata } from "next";
import FaqContent from "@/page-content/Faq";

export const metadata: Metadata = {
  title: "FAQ | Uncle Mays Produce",
  description:
    "Frequently asked questions about Uncle Mays Produce boxes, delivery, pricing, and more.",
  alternates: {
    canonical: "/faq",
  },
};

export default function FaqPage() {
  return <FaqContent />;
}
