import type { Metadata } from "next";
import TermsContent from "@/page-content/Terms";

export const metadata: Metadata = {
  title: "Terms of Service | Uncle Mays Produce",
  description: "Terms of service for Uncle Mays Produce.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return <TermsContent />;
}
