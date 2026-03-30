import type { Metadata } from "next";
import PrivacyContent from "@/page-content/Privacy";

export const metadata: Metadata = {
  title: "Privacy Policy | Uncle Mays Produce",
  description: "Privacy policy for Uncle Mays Produce.",
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
