"use client";

import { Suspense, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Hero } from "@/components/Hero";
import { HomeEmailCapture } from "@/components/HomeEmailCapture";
import { TESTIMONIALS } from "@/lib/testimonials";

const faqs = [
  {
    question: "How does ordering work?",
    answer:
      "Browse the catalog, fill your cart with the items you want (any quantity), and check out. $25 minimum. Pay once per order. No subscription, no auto-renewal, no card on file.",
  },
  {
    question: "How does delivery work?",
    answer:
      "Choose Chicago delivery ($7.99 flat to most Chicago and south-suburb ZIPs) or free pickup at the Polsky Center, 1452 E 53rd St in Hyde Park. Delivery and pickup windows are picked at checkout.",
  },
  {
    question: "What if I have an issue with my order?",
    answer:
      "We stand behind every order. If anything is wrong (missing items, quality issues, anything), email us at info@unclemays.com and we'll make it right, no questions asked.",
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-base font-semibold">{question}</span>
        <ChevronDown
          className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <p className="pb-5 text-foreground/70 leading-relaxed -mt-1">
          {answer}
        </p>
      )}
    </div>
  );
}

const Index = ({ productSection }: { productSection: ReactNode }) => {
  return (
    <>
      <Hero />

      {/* Shop CTA + 4-tile catalog preview. Provided by the parent server
          page (src/app/page.tsx) so the catalog fetch happens server-side. */}
      <Suspense>{productSection}</Suspense>

      {/* Customer voice — real, attributed quotes only (see src/lib/testimonials.ts) */}
      {TESTIMONIALS.length > 0 ? (
        <section className="py-12 bg-muted/20">
          <div className="container px-6 max-w-3xl mx-auto">
            <div className="grid gap-6">
              {TESTIMONIALS.map((t) => (
                <motion.figure
                  key={t.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-card rounded-2xl p-8 shadow-soft border border-border/50"
                >
                  <blockquote className="text-lg leading-relaxed text-foreground/85 italic">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4 text-sm font-semibold text-foreground">
                    {t.name}
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* FAQ — top 3 only */}
      <section className="py-12 bg-background">
        <div className="container px-6">
          <h2 className="text-center text-2xl md:text-3xl font-bold mb-6">
            Quick answers
          </h2>
          <div className="max-w-2xl mx-auto bg-card rounded-2xl shadow-soft border border-border/50 px-6 md:px-8">
            {faqs.map((faq) => (
              <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* EMAIL CAPTURE */}
      <section className="py-10 bg-background">
        <div className="container px-6">
          <HomeEmailCapture source="home_newsletter" />
        </div>
      </section>
    </>
  );
};

export default Index;
