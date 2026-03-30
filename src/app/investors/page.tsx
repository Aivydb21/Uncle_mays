import type { Metadata } from "next";
import InvestorsContent from "@/page-content/Investors";

export const metadata: Metadata = {
  title: "Investors | Uncle Mays Produce",
  description:
    "Uncle May's is building the first data and distribution system for Black food. Request our pitch book.",
};

export default function InvestorsPage() {
  return <InvestorsContent />;
}
