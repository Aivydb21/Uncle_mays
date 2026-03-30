"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, ShieldCheck } from "lucide-react";

const produceBoxImage = "/images/produce-box.jpg";

const plans = [
  {
    name: "Starter Box",
    price: "$35",
    frequency: "per delivery",
    description: "Perfect for individuals or couples",
    features: [
      "5-7 seasonal items",
      "Weekly deliveries",
      "12-15 lbs of produce",
      "Support local Black farmers",
    ],
    stripeUrl: "https://buy.stripe.com/cNidR983d5Mw83JcNu9Zm08",
  },
  {
    name: "Family Box",
    price: "$65",
    frequency: "per delivery",
    description: "Ideal for families of 3-5",
    features: [
      "12-15 seasonal items",
      "Weekly deliveries available",
      "22-26 lbs of produce",
      "Priority farmer selection",
      "Free delivery",
    ],
    popular: true,
    stripeUrl: "https://buy.stripe.com/dRmbJ1erB2AkcjZeVC9Zm09",
  },
  {
    name: "Community Box",
    price: "$95",
    frequency: "per delivery",
    description: "For large families or sharing",
    features: [
      "20-25 seasonal items",
      "Weekly deliveries",
      "30-35 lbs of produce",
      "Meet your farmers events",
      "Free delivery",
      "Customization options",
    ],
    stripeUrl: "https://buy.stripe.com/8x25kD5V5b6QabR7ta9Zm0a",
  },
];

const miniFaqs = [
  {
    q: "When will my box arrive?",
    a: "Orders deliver every Sunday. Place yours any day of the week and it ships the following Sunday. No cutoff stress.",
  },
  {
    q: "What's actually in the box?",
    a: "Every box is seasonal and rotating. You get what's freshest, not what's been sitting in a warehouse. A Starter Box typically includes sweet corn, heirloom tomatoes, collard greens, squash, and fresh herbs.",
  },
  {
    q: "Is this a subscription?",
    a: "No. Every box is a one-time purchase. Order when it works for you. No lock-in, no cancellation needed.",
  },
  {
    q: "What if something arrives wrong?",
    a: "Email us at info@unclemays.com and we'll make it right. Full credit or replacement, no questions asked.",
  },
];

export const Pricing = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section id="boxes" className="py-24 bg-muted/30 relative" style={{ zIndex: 1 }}>
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          {/* Live availability badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-sm font-semibold text-primary mb-6">
            Now Delivering Across Chicago
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Box</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Seasonal, rotating produce sourced directly from Black farmers and delivered to your Chicago door. No subscription. Order when you want.
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            🚚 Orders deliver every Sunday. Place yours any day and it ships the following Sunday.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-10">
          {plans.map((plan, index) => (
            <div key={index} className="relative z-10">
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-secondary text-white px-6 py-1.5 rounded-full text-sm font-semibold z-20">
                  Most Popular
                </div>
              )}
              <div
                className={`bg-card rounded-2xl p-8 shadow-soft h-full flex flex-col relative z-10 ${
                  plan.popular ? "border-2 border-secondary shadow-medium" : ""
                }`}
              >
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-6">{plan.description}</p>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-5xl font-bold text-primary">{plan.price}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{plan.frequency}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground text-center mb-4">
                  🔒 Checkout is handled securely through Stripe. Takes under 60 seconds.
                </p>
                <a
                  href={plan.stripeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-semibold h-12 px-6 py-3 transition-all duration-300 ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-medium"
                      : "border-2 border-primary bg-background text-primary hover:bg-primary hover:text-primary-foreground shadow-soft"
                  }`}
                  style={{
                    display: "flex",
                    textDecoration: "none",
                    cursor: "pointer",
                    zIndex: 9999,
                    position: "relative",
                    textAlign: "center",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <span className="text-center">Get My Box</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Freshness Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto mb-10 bg-primary/5 border border-primary/20 rounded-2xl px-8 py-5 flex items-start gap-4"
        >
          <ShieldCheck className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-foreground/80 leading-relaxed">
            <span className="font-semibold text-foreground">Freshness guaranteed.</span>{" "}
            Every box is packed fresh the day it ships. If anything arrives damaged or unsatisfactory,
            email us at{" "}
            <a href="mailto:info@unclemays.com" className="text-primary underline underline-offset-2">
              info@unclemays.com
            </a>{" "}
            and we'll make it right. Full credit or replacement, no questions asked.
          </p>
        </motion.div>

        {/* Mini FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto mb-16"
        >
          <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-5">
            Quick answers before you order
          </p>
          <div className="space-y-2">
            {miniFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-card border border-border/50 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/30 transition-colors"
                  aria-expanded={openFaq === idx}
                >
                  <span className="font-medium text-sm">{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground flex-shrink-0 ml-4 transition-transform duration-200 ${
                      openFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="px-6 pb-4 text-sm text-foreground/70 leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Produce box image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-medium"
        >
          <img
            src={produceBoxImage}
            alt="Fresh seasonal produce box filled with colorful vegetables from Black-owned farms"
            className="w-full h-64 object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
};
