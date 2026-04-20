import type { Metadata } from "next";
import PressContent from "@/page-content/Press";

export const metadata: Metadata = {
  title: "Press | Uncle May's Produce",
  description:
    "Press resources for Uncle May's Produce: awards, recognition, company facts, story angles, and media contact for journalists covering Black food, Chicago retail, and food systems innovation.",
  alternates: {
    canonical: "/press",
  },
  openGraph: {
    title: "Press | Uncle May's Produce",
    description:
      "Press resources for Uncle May's Produce — 2025 TechRise Award, World Business Chicago Food Innovation Award, SXSW 2026 Speaker.",
  },
};

export default function PressPage() {
  return <PressContent />;
}
