"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { Users, Instagram, ShoppingBag, Bell, Package, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/Hero";
import { Pricing } from "@/components/Pricing";

const testimonials = [
  {
    quote: "The Family Box lasted us almost two weeks. The collard greens were better than anything I've found at Jewel-Osco, and the tomatoes from the farm actually tasted like tomatoes. Already ordered again.",
    name: "Kiesha",
    location: "South Shore, Chicago",
    box: "Family Box",
  },
  {
    quote: "I ordered the Starter Box on a Monday and it was on my porch by Wednesday afternoon. Everything was fresh, nothing wilted. The asparagus and greens were gone in two days.",
    name: "Rob",
    location: "Bronzeville, Chicago",
    box: "Starter Box",
  },
  {
    quote: "We split a Community Box between three families on our block. Came out to about $32 each for produce that would've cost us double at the store. Already planning our next order.",
    name: "Shonda",
    location: "Hyde Park, Chicago",
    box: "Community Box",
  },
];

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
                  "Pick the box size that works for your household: Starter, Family, or Community. All boxes are one-time purchases. No subscription required.",
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
                  "We deliver straight to your Chicago address every Wednesday. You'll get a confirmation and delivery window by email as soon as your order is placed.",
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

      {/* 7. SOCIAL PROOF — Community Voices */}
      <section className="py-24 bg-muted/20">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-sm font-semibold text-primary mb-6">
              <Users className="h-4 w-4" />
              Rooted in Chicago community
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">From our Chicago community</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((t, idx) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="bg-card rounded-2xl p-8 shadow-soft border border-border/50"
              >
                <p className="text-foreground/80 leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.location}</p>
                  <p className="text-xs font-medium text-primary mt-1">{t.box}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* EMAIL CAPTURE */}
      <section className="py-20 bg-background">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-sm font-semibold text-primary mb-6">
              <Mail className="h-4 w-4" />
              Stay in the loop
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Stay connected to what's growing
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Get first access to seasonal box drops, farmer spotlights, and what's coming out of the ground this week. Good food news from Chicago, nothing else.
            </p>
            <a
              href={process.env.NEXT_PUBLIC_EMAIL_FORM_URL!}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="text-base font-semibold px-8 py-5 rounded-xl">
                Join the Mailing List
              </Button>
            </a>
            <p className="text-xs text-muted-foreground mt-3">Free to join. Unsubscribe anytime.</p>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Index;
