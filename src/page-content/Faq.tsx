"use client";

import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    q: "Do I need a subscription?",
    a: "No. Every box is a one-time purchase. Order when it works for you. If you'd like regular deliveries, reach out to info@unclemays.com and we can set up a recurring schedule.",
  },
  {
    q: "What if I have an issue with my order?",
    a: "We stand behind every box. If anything is wrong with your delivery (missing items, quality issues, anything), email us at info@unclemays.com and we'll make it right, no questions asked.",
  },
  {
    q: "How does delivery work?",
    a: "We deliver directly to your Chicago address every Wednesday. Place your order any day of the week and it will be delivered the following Wednesday. You'll receive a confirmation email with your delivery window as soon as your order is placed.",
  },
  {
    q: "What's actually in the box?",
    a: "Every box is sourced from a Black-owned farm and packed with what's freshest. The Starter Box includes sweet potatoes, Carola potatoes, Candy orange carrots, green curly kale, and fresh salad mix (~12-15 lbs). The Family Box adds Tuscan kale, rainbow chard, a dozen farm eggs, and your choice of protein: whole chicken, beef short ribs, or lamb chops. The Community Box includes the full produce spread plus organic pinto beans, organic black turtle beans, and your choice of protein.",
  },
  {
    q: "How much does a box cost?",
    a: "The Starter Box is $35 (~12-15 lbs of produce). The Family Box is $65 and includes sweet potatoes, carrots, four greens, a dozen farm eggs, and one protein choice (whole chicken, beef short ribs, or lamb chops). The Community Box is $95 and includes the full harvest, pantry beans, and your choice of protein. No subscription required. Order when you want.",
  },
  {
    q: "How do I cancel my order?",
    a: "There's nothing to cancel. Every box is a one-time purchase with no recurring charges. If you need to modify or cancel an order you've already placed, email info@unclemays.com as soon as possible and we'll take care of it.",
  },
];

const FaqContent = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know before you order.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div
              key={faq.q}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.07 }}
              className="bg-card rounded-2xl p-6 shadow-soft border border-border/50"
            >
              <div className="flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-2">{faq.q}</p>
                  <p className="text-foreground/70 leading-relaxed text-sm">
                    {faq.a}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            size="lg"
            className="text-base font-semibold px-8 py-5 rounded-xl"
            asChild
          >
            <a href="/#boxes">Shop Produce Boxes</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FaqContent;
