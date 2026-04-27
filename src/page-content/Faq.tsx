"use client";

import { motion } from "framer-motion";
import {
  HelpCircle,
  Leaf,
  MapPin,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Package,
  Bell,
} from "lucide-react";
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
    title: "Chicago Metro Delivery",
    description:
      "We deliver across the Chicago metro area, city and south suburbs. No pickup required. Fresh produce arrives at your door every Wednesday.",
  },
  {
    icon: RotateCcw,
    title: "Seasonal & Rotating",
    description:
      "You'll never get the same box twice. Always what's freshest, always what's in season.",
  },
  {
    icon: ShieldCheck,
    title: "One-Time Orders",
    description:
      "Every box is a one-time purchase. No subscription, no auto-renewal, no card on file. Order when you want a box.",
  },
];

const steps = [
  {
    icon: ShoppingBag,
    step: "01",
    title: "Choose Your Box",
    description:
      "Pick the box size that works for your household: Small or Family. One-time order, no subscription, no auto-renewal.",
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
];

const faqs = [
  {
    q: "Is this a subscription? Will my card be auto-charged?",
    a: "No. Every box is a one-time purchase. You order, you get charged once for that one box, that's it. No recurring billing, no auto-renewal, no card kept on file. The next time you want a box, you come back and order again.",
  },
  {
    q: "What if I have an issue with my order?",
    a: "We stand behind every box. If anything is wrong with your delivery (missing items, quality issues, anything), email us at info@unclemays.com and we'll make it right, no questions asked.",
  },
  {
    q: "How does delivery work?",
    a: "We deliver directly to your door across the Chicago metro area (city plus south suburbs) every Wednesday. Place your order any day of the week and it will be delivered the following Wednesday. You'll receive a confirmation email with your delivery window as soon as your order is placed.",
  },
  {
    q: "What's actually in the box?",
    a: "Every box is sourced from our Black-owned farm partners and packed with what's freshest that week. The Spring Box includes salad mix, candy orange carrots, sweet potatoes, potatoes, broccoli, and organic black beans, about 6 lbs of fresh food, built for 1 to 2 people. The Full Harvest Box includes everything in the Spring Box plus pea shoots, radishes, a customer choice of bean (black, pinto, or kidney), and pasture-raised chicken thighs, about 10 lbs of fresh food, built for 3 to 4 people. Contents rotate each delivery based on what's in season.",
  },
  {
    q: "How much does a box cost?",
    a: "The Spring Box is $40 and the Full Harvest Box is $70, one-time and no subscription. The Full Harvest Box includes pasture-raised chicken thighs at no extra charge. Additional proteins (chicken, beef short ribs, or lamb chops) can be added at checkout for $12 each.",
  },
  {
    q: "How do I cancel an order?",
    a: "There's nothing recurring to cancel. If you need to modify or cancel a one-time order you've already placed, email info@unclemays.com as soon as possible and we'll take care of it.",
  },
];

const sampleStarterBox = [
  "Salad mix",
  "Candy orange carrots",
  "Sweet potatoes",
  "Potatoes",
  "Broccoli",
  "Organic black beans",
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
              makes our produce boxes different.
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
              What You're Getting
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every box is different. Always seasonal, always sourced from Black
              farmers, always fresh.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
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

          {/* Sample box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-card rounded-2xl p-8 shadow-soft border border-border/50 max-w-3xl mx-auto"
          >
            <h3 className="text-2xl font-bold mb-2 text-center">
              Sample Spring Box
            </h3>
            <p className="text-muted-foreground text-center mb-6">
              Contents rotate each delivery based on what's freshest. Here's a
              sample.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {sampleStarterBox.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-sm text-foreground/80"
                >
                  <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
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
              From order to your door.
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
              <a href="/#boxes">Shop Produce Boxes</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FaqContent;
