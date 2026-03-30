"use client";

import { motion } from "framer-motion";
import { Leaf, MapPin, RotateCcw, ShieldCheck, HelpCircle, Users, Instagram, ShoppingBag, Bell, Package, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/Hero";
import { Pricing } from "@/components/Pricing";

const farmers = [
  {
    name: "Roots & Soil Farm",
    location: "Pembroke Township, IL",
    specialty: "Root vegetables, greens, sweet corn",
    fact: "Family-operated for 3 generations, one of the oldest Black-owned farms in Illinois.",
  },
  {
    name: "South Side Harvest Co.",
    location: "Chicago, IL",
    specialty: "Urban greens, herbs, microgreens",
    fact: "Growing on reclaimed South Side land to bring hyperlocal produce to city neighborhoods.",
  },
  {
    name: "Freedom Fields Farm",
    location: "Kankakee, IL",
    specialty: "Seasonal stone fruit, squash, heirloom tomatoes",
    fact: "Every season, they donate 5% of their harvest to local food pantries.",
  },
];

const faqs = [
  {
    q: "How does delivery work?",
    a: "We deliver directly to your Chicago address every Sunday. Place your order any day of the week and it will be delivered the following Sunday. You'll receive a confirmation email with your delivery window as soon as your order is placed.",
  },
  {
    q: "What's actually in the box?",
    a: "Every box is seasonal and rotating, so you get what's freshest, not what's been sitting in a warehouse. A Starter Box typically includes 5–7 items like sweet corn, heirloom tomatoes, collard greens, squash, and fresh herbs. The contents vary each delivery.",
  },
  {
    q: "How much does a box cost?",
    a: "Boxes start at $35 for a Starter Box (5–7 seasonal items, 12–15 lbs), $65 for a Family Box (12–15 items, 22–26 lbs), and $95 for a Community Box (20–25 items, 30–35 lbs). No subscription required. Order when you want.",
  },
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
    name: "Keisha M.",
    location: "South Shore, Chicago",
    box: "Family Box",
  },
  {
    quote: "I ordered the Starter Box on a Tuesday and it was on my porch by Sunday morning. Everything was fresh, nothing wilted. My kids ate the sweet corn straight off the cob that night.",
    name: "Darnell T.",
    location: "Bronzeville, Chicago",
    box: "Starter Box",
  },
  {
    quote: "We split a Community Box between three families on our block. Came out to about $32 each for produce that would've cost us double at the store. Already planning our next order.",
    name: "Aisha R.",
    location: "Hyde Park, Chicago",
    box: "Community Box",
  },
];

const Index = () => {
  return (
    <>
      <Hero />

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
                  "We deliver straight to your Chicago address every Sunday. You'll get a confirmation and delivery window by email as soon as your order is placed.",
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

      {/* 3. WHAT YOU'RE GETTING — Features & Benefits */}
      <section className="py-24 bg-muted/20">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What You're Getting</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Every box is different. Always seasonal, always sourced from Black farmers, always fresh.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
            {[
              {
                icon: Leaf,
                title: "From Black Farmers",
                description:
                  "Every item is sourced from Black-owned farms. Your purchase goes directly to the farmers who grew it.",
              },
              {
                icon: MapPin,
                title: "Chicago-Wide Delivery",
                description:
                  "We deliver across Chicago. No pickup required. Fresh produce arrives at your door every Sunday.",
              },
              {
                icon: RotateCcw,
                title: "Seasonal & Rotating",
                description:
                  "You'll never get the same box twice. Always what's freshest, always what's in season.",
              },
              {
                icon: ShieldCheck,
                title: "No Subscription",
                description:
                  "Order when you want. No lock-in, no commitment. Boxes start at $35. Pay only when you order.",
              },
            ].map((feature, idx) => (
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
                <p className="text-foreground/70 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Sample box contents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-card rounded-2xl p-8 shadow-soft border border-border/50 max-w-3xl mx-auto"
          >
            <h3 className="text-2xl font-bold mb-2 text-center">Sample Starter Box</h3>
            <p className="text-muted-foreground text-center mb-6">
              Contents rotate each delivery based on what's freshest. Here's a sample.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                "Sweet corn (4 ears)",
                "Heirloom tomatoes (1 lb)",
                "Collard greens (1 bunch)",
                "Yellow squash (2–3 ct)",
                "Red bell peppers (2 ct)",
                "Fresh herbs (basil or thyme)",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-foreground/80">
                  <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button asChild size="sm" className="px-6">
                <a href="#boxes">Order a Box</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. WHY UNCLE MAY'S — Mission & Trust (moved above pricing) */}
      <section className="py-24 bg-foreground text-background">
        <div className="container px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Uncle May's</h2>
              <p className="text-xl text-background/80 leading-relaxed">
                There is a $100B+ market for Black food that has never had a dedicated supply chain.
                Uncle May's is building it, starting with the most direct connection possible: fresh
                produce from Black farmers to Black households in Chicago.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Every dollar you spend goes directly to Black farmers, not middlemen.",
                "Sourced from farms within Illinois and the surrounding region.",
                "Seasonal rotation means better quality and lower cost than year-round imports.",
                "Building the demand data that helps Black farmers grow sustainable businesses.",
              ].map((point, idx) => (
                <motion.div
                  key={point}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <div className="h-2.5 w-2.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p className="text-background/80 leading-relaxed">{point}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. FARMER PROFILES (moved above pricing) */}
      <section className="py-24 bg-background">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Farmers We Source From</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Real names, real farms, real impact. You know exactly who grew your food.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {farmers.map((farmer, idx) => (
              <motion.div
                key={farmer.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="bg-card rounded-2xl p-8 shadow-soft border border-border/50"
              >
                <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                  <Leaf className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-1">{farmer.name}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                  <MapPin className="h-3.5 w-3.5" />
                  {farmer.location}
                </div>
                <p className="text-sm font-medium text-primary mb-3">{farmer.specialty}</p>
                <p className="text-sm text-foreground/70 leading-relaxed">{farmer.fact}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SOCIAL PROOF — Community Voices (moved above pricing) */}
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

      {/* 7. PRODUCT / BOXES */}
      <Pricing />

      {/* 8. FAQ */}
      <section className="py-24 bg-background">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Your Questions, Answered</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know before you order.
            </p>
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
                    <p className="text-foreground/70 leading-relaxed text-sm">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
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
              href="https://docs.google.com/forms/d/e/1FAIpQLSfmaSTz-8JuH3RXsL3sCBakVjBcqGQML6muiYeFOdLQ-FwqoA/viewform?usp=header"
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

      {/* 11. GET INVOLVED */}
      <section className="py-24 bg-muted/20">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Get Involved</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Whether you're here to eat better or back the build, there's a place for you.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-card rounded-2xl p-8 shadow-soft border border-border/50"
            >
              <h3 className="text-2xl font-semibold mb-3">Order Fresh Produce</h3>
              <p className="text-foreground/70 leading-relaxed mb-6">
                Choose your box, place your order online, and get fresh produce from Black farmers delivered to your Chicago door. No subscription. No commitment.
              </p>
              <Button asChild size="lg" className="w-full">
                <a href="#boxes">Shop Produce Boxes</a>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-card rounded-2xl p-8 shadow-soft border border-border/50"
            >
              <h3 className="text-2xl font-semibold mb-3">Invest</h3>
              <p className="text-foreground/70 leading-relaxed mb-6">
                Back the build of retail-first infrastructure that evolves into a compounding data and distribution platform for Black food.
              </p>
              <Button asChild size="lg" variant="outline" className="w-full border-2">
                <a href="mailto:info@unclemays.com">Request Pitch Book</a>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 11. BOTTOM CTA */}
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
                Boxes from $35. Delivered across Chicago every Sunday.
              </p>
            </div>
            <div className="mt-10 flex justify-center gap-4">
              <a
                href="https://instagram.com/unclemays"
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
