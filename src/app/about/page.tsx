import type { Metadata } from "next";
import AboutContent from "@/page-content/About";

export const metadata: Metadata = {
  title: "About | Uncle Mays Produce",
  description:
    "Meet the story behind Uncle May's Produce and our mission to bring fresh produce from Black farmers to Chicago.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
