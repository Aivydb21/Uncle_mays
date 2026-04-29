import type { Metadata } from "next";
import { AskForm } from "@/components/AskForm";

export const metadata: Metadata = {
  title: "Tell us what you'd want | Uncle May's Produce",
  description:
    "Tell us what you want in your produce box and what would make you buy. Get 35% off your first box as a thank-you.",
  robots: { index: false, follow: true },
};

export default function AskPage() {
  return (
    <section className="py-12 md:py-20 bg-muted/30 min-h-screen">
      <div className="container px-4 max-w-2xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">
            What would you want in your box?
          </h1>
          <p className="text-sm md:text-base text-foreground/75">
            We&apos;re a Black-owned grocery delivery serving the Chicago metro, sourcing from
            Black farmers and Black vendors, starting with Run A Way Buckers Club in
            Pembroke, IL. We restock weekly based on what people ask for, and we&apos;re open
            to anything: produce, proteins, seasonings, baked goods, pantry items, you name
            it. Tell us what you&apos;d want and what would make you buy, and we&apos;ll send
            you 35% off your first box.
          </p>
        </div>

        <AskForm />
      </div>
    </section>
  );
}
