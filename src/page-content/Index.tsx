"use client";

import { Suspense, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Bell, Package, ChevronDown } from "lucide-react";
import { Hero } from "@/components/Hero";
import { Pricing } from "@/components/Pricing";
import { HomeEmailCapture } from "@/components/HomeEmailCapture";
import { AskCapture } from "@/components/AskCapture";
import { TESTIMONIALS } from "@/lib/testimonials";

const faqs = [
  {
    question: "Is this a subscription? Will my card be auto-charged?",
    answer:
      "No. Every box is a one-time purchase. You order, you get charged once for that one box, that's it. No recurring billing, no auto-renewal, no card on file. The next time you want a box, you come back and order again.",
  },
  {
    question: "How does delivery work?",
    answer:
      "We deliver directly to your door across the Chicago metro area (city plus south suburbs) every Wednesday. Order by Sunday 11:59 PM CT and your box ships that Wednesday. After placing your order, you'll receive a confirmation email with your estimated delivery window.",
  },
  {
    question: "What if I have an issue with my order?",
    answer:
      "We stand behind every box. If anything is wrong with your delivery (missing items, quality issues, anything), email us at info@unclemays.com and we'll make it right, no questions asked.",
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

const Index = ({ productSection }: { productSection?: ReactNode } = {}) => {
  return (
    <>
      <Hero />

      {/* PRODUCT section. When the custom-cart flag is on, the parent server
          page passes <ShopCTA/>; otherwise we fall back to the legacy
          <Pricing/> tier card. */}
      <Suspense>{productSection ?? <Pricing />}</Suspense>

      {/* CUSTOMER FEEDBACK — Source B of the feedback program. Captures
          top-of-funnel visitors who never reach checkout. */}
      <AskCapture />

      {/* 2. HOW IT WORKS — compact 3-step strip */}
      <section className="py-10 bg-background border-t border-border/40">
        <div className="container px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto text-center">
            {[
              { icon: ShoppingBag, title: "Order by Sunday 11:59 PM" },
              { icon: Package, title: "We pack it fresh Wednesday" },
              { icon: Bell, title: "At your door Wednesday" },
            ].map((step) => (
              <div key={step.title} className="flex items-center justify-center sm:justify-start gap-3">
                <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground/80">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

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
