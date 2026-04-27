"use client";

import { Suspense, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Bell, Package, ChevronDown } from "lucide-react";
import { Hero } from "@/components/Hero";
import { Pricing } from "@/components/Pricing";
import { HomeEmailCapture } from "@/components/HomeEmailCapture";
import { TESTIMONIALS } from "@/lib/testimonials";

const faqs = [
  {
    question: "How does delivery work?",
    answer:
      "We deliver directly to your door across the Chicago metro area (city plus south suburbs) every Wednesday. Order by Sunday 11:59 PM CT and your box ships that Wednesday. After placing your order, you'll receive a confirmation email with your estimated delivery window.",
  },
  {
    question: "What's actually in the box?",
    answer:
      "Every box is seasonal and rotating, so you get what's freshest, not what's been sitting in a warehouse. The Spring Box currently includes salad mix, candy orange carrots, sweet potatoes, potatoes, broccoli, and organic black beans (about 6 lbs total). The Full Harvest Box includes everything in the Spring Box plus pea shoots, radishes, a customer choice of bean, and pasture-raised chicken thighs (about 10 lbs total). Contents vary each delivery based on what our farmer partners are harvesting.",
  },
  {
    question: "How much does a box cost?",
    answer:
      "Two tiers. The Spring Box is $40, built for 1 to 2 people, about 6 lbs of fresh food. The Full Harvest Box is $70, built for 3 to 4 people, about 10 lbs of fresh food. The Full Harvest Box includes pasture-raised chicken thighs at no extra charge. Additional proteins (chicken, beef short ribs, or lamb chops) can be added at checkout for $12 each. Every box is a one-time order with no subscription and no auto-renewal.",
  },
  {
    question: "Is this a subscription? Will my card be auto-charged?",
    answer:
      "No. Every box is a one-time purchase. You order, you get charged once for that one box, that's it. No recurring billing, no auto-renewal, no card on file. The next time you want a box, you come back and order again.",
  },
  {
    question: "What if I have an issue with my order?",
    answer:
      "We stand behind every box. If anything is wrong with your delivery (missing items, quality issues, anything), email us at info@unclemays.com and we'll make it right, no questions asked.",
  },
  {
    question: "How do I cancel my order?",
    answer:
      "There's nothing to cancel. Every box is a one-time purchase with no recurring charges. If you need to modify or cancel an order you've already placed, email info@unclemays.com as soon as possible and we'll take care of it.",
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

const Index = () => {
  return (
    <>
      <Hero />

      {/* 6. PRODUCT / BOXES — moved above fold to reduce scroll-to-order distance */}
      <Suspense>
        <Pricing />
      </Suspense>

      {/* 2. HOW IT WORKS — Live ordering flow */}
      <section className="py-24 bg-background">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From order to your door in three simple steps.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: ShoppingBag,
                step: "01",
                title: "Choose Your Box",
                description:
                  "Pick the box size that works for your household: Small or Family. Order one-time or subscribe weekly and save 10%.",
              },
              {
                icon: Package,
                step: "02",
                title: "We Pack It Fresh",
                description:
                  "Your box is packed with seasonal produce sourced directly from Black farmers. Every item is selected for freshness at time of packing.",
              },
              {
                icon: Bell,
                step: "03",
                title: "Delivered to Your Door",
                description:
                  "We deliver straight to your door across the Chicago metro area every Wednesday. You'll get a confirmation and delivery window by email as soon as your order is placed.",
              },
            ].map((step, idx) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="bg-card rounded-2xl p-8 shadow-soft border border-border/50 relative"
              >
                <div className="text-6xl font-bold text-primary/10 absolute top-6 right-6 leading-none select-none">
                  {step.step}
                </div>
                <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mb-5">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-foreground/70 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer voice — real, attributed quotes only (see src/lib/testimonials.ts) */}
      {TESTIMONIALS.length > 0 ? (
        <section className="py-20 bg-muted/20">
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

      {/* FAQ */}
      <section className="py-24 bg-background">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know before your first box.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-2xl mx-auto bg-card rounded-2xl shadow-soft border border-border/50 px-6 md:px-8"
          >
            {faqs.map((faq) => (
              <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* EMAIL CAPTURE */}
      <section className="py-20 bg-background">
        <div className="container px-6">
          <HomeEmailCapture source="home_newsletter" />
        </div>
      </section>
    </>
  );
};

export default Index;
