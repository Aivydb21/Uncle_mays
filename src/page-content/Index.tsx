"use client";

import { motion } from "framer-motion";
import { HelpCircle, Users, Instagram, ShoppingBag, Bell, Package, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/Hero";
import { Pricing } from "@/components/Pricing";

const homepageFaqs = [
  {
    q: "Do I need a subscription?",
    a: "No. Every box is a one-time purchase. Order when it works for you. If you'd like regular deliveries, reach out to info@unclemays.com and we can set up a recurring schedule.",
  },
  {
    q: "What if I have an issue with my order?",
    a: "We stand behind every box. If anything is wrong with your delivery (missing items, quality issues, anything), email us at info@unclemays.com and we'll make it right, no questions asked.",
  },
];

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
      <Pricing />

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

      {/* 8. FAQ (2 conversion-critical questions; full FAQ at /faq) */}
      <section className="py-24 bg-background">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Quick Answers</h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {homepageFaqs.map((faq, idx) => (
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
                    <p className="text-foreground/70 leading-relaxed text-sm">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
            <p className="text-center text-sm text-muted-foreground pt-2">
              <a href="/faq" className="underline hover:text-foreground transition-colors">
                View all frequently asked questions
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* 10. EMAIL CAPTURE (moved below FAQ) */}
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

      {/* BOTTOM CTA */}
      <section className="py-20 bg-foreground text-background">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to eat better?
            </h2>
            <p className="text-xl text-background/80 mb-8">
              Fresh produce from Black farmers, delivered straight to your Chicago door. Order today. No subscription, no commitment.
            </p>
            <div className="flex flex-col items-center gap-3">
              <Button
                size="lg"
                className="text-lg font-semibold px-10 py-6 rounded-xl bg-background text-foreground hover:bg-background/90"
                asChild
              >
                <a href="#boxes">Shop Produce Boxes</a>
              </Button>
              <p className="text-sm text-background/60">
                Boxes from $35. Delivered across Chicago every Wednesday.
              </p>
            </div>
            <div className="mt-10 flex justify-center gap-4">
              <a
                href="https://www.instagram.com/unclemaysproduce/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-background/70 hover:text-background transition-colors text-sm"
              >
                <Instagram className="h-4 w-4" />
                Follow us on Instagram
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Index;
