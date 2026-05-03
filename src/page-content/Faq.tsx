"use client";

import { motion } from "framer-motion";
import {
  HelpCircle,
  Leaf,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Package,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Leaf,
    title: "From Black Farmers",
    description:
      "Every item is sourced from Black-owned farms. Your purchase goes directly to the farmers who grew it.",
  },
  {
    icon: MapPin,
    title: "Chicago Delivery or Pickup",
    description:
      "Flat $7.99 delivery to most Chicago and south-suburb ZIPs, or free pickup at the Polsky Center in Hyde Park.",
  },
  {
    icon: ShoppingBag,
    title: "Build Your Own Order",
    description:
      "Pick exactly what you want, in any quantity. Greens, roots, microgreens, pantry staples, and pasture-raised protein. $25 minimum.",
  },
  {
    icon: ShieldCheck,
    title: "One-Time Orders",
    description:
      "Every order is a one-time purchase. No subscription, no auto-renewal, no card on file.",
  },
];

const steps = [
  {
    icon: ShoppingBag,
    step: "01",
    title: "Browse the Catalog",
    description:
      "Open the shop, scroll through fresh produce, pantry staples, and pasture-raised protein. Add what you want to your cart in any quantity.",
  },
  {
    icon: Package,
    step: "02",
    title: "Choose Delivery or Pickup",
    description:
      "Chicago delivery for $7.99 flat to most local ZIPs, or free pickup at the Polsky Center in Hyde Park. Pick a window that works for you.",
  },
  {
    icon: Truck,
    step: "03",
    title: "We Pack It Fresh",
    description:
      "Your order is hand-packed with what was harvested that week. You get a confirmation email with the details and your scheduled window.",
  },
];

const faqs = [
  {
    q: "Is this a subscription? Will my card be auto-charged?",
    a: "No. Every order is a one-time purchase. You order, you get charged once for that order, that's it. No recurring billing, no auto-renewal, no card kept on file. The next time you want groceries, you come back and order again.",
  },
  {
    q: "How does ordering work?",
    a: "Browse the catalog at unclemays.com/shop, fill your cart with the items you want (any quantity), and check out. $25 minimum. Use code FRESH10 for $10 off your first order.",
  },
  {
    q: "How does delivery work?",
    a: "We deliver to most Chicago and south-suburb ZIPs for a flat $7.99 fee. You can also pick up for free at the Polsky Center, 1452 E 53rd St in Hyde Park, during one of the available pickup windows. Both options are picked at checkout.",
  },
  {
    q: "What's in the catalog?",
    a: "A rotating selection of premium produce (greens like kale, chard, lettuces, mustards, ramps; roots like sweet potatoes, candy carrots, daikon radishes), microgreens (broccoli, sunflower, pea shoot, spicy mix), pantry staples (organic beans), and pasture-raised protein (whole chicken, beef short ribs, lamb chops, farm-fresh eggs). Items rotate seasonally based on what's harvesting that week.",
  },
  {
    q: "What's the minimum order?",
    a: "$25. Most customers fill a cart of $40-80. There's no upper limit.",
  },
  {
    q: "What if I have an issue with my order?",
    a: "We stand behind every order. If anything is wrong (missing items, quality issues, anything), email us at info@unclemays.com or text (312) 972-2595 and we'll make it right, no questions asked.",
  },
  {
    q: "How do I cancel an order?",
    a: "There's nothing recurring to cancel. If you need to modify or cancel a one-time order you've already placed, email info@unclemays.com as soon as possible and we'll take care of it.",
  },
];

const FaqContent = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 md:py-24">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              How It Works
            </h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about ordering, delivery, and what
              makes our catalog different.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What You're Getting */}
      <section className="pb-20 bg-background">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              What You&rsquo;re Getting
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Build your own order from a rotating catalog of seasonal produce,
              pantry staples, and pasture-raised protein from Black farmers.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.08 }}
                className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 text-center"
              >
                <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-foreground/70 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Order */}
      <section className="py-20 bg-muted/20">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Three Simple Steps
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From cart to your kitchen.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, idx) => (
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
                <p className="text-foreground/70 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-background">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
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
              <Link href="/shop">Shop the catalog</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FaqContent;
