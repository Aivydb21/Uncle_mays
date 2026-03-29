import { motion } from "framer-motion";
import { Leaf, MapPin, RotateCcw, ShieldCheck, Clock, HelpCircle, Users, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { Hero } from "@/components/Hero";
import { Pricing } from "@/components/Pricing";

const WAITLIST_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfmaSTz-8JuH3RXsL3sCBakVjBcqGQML6muiYeFOdLQ-FwqoA/viewform?usp=sharing&ouid=110071880161586206166";

const farmers = [
  {
    name: "Roots & Soil Farm",
    location: "Pembroke Township, IL",
    specialty: "Root vegetables, greens, sweet corn",
    fact: "Family-operated for 3 generations — one of the oldest Black-owned farms in Illinois.",
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
    q: "Will this actually launch?",
    a: "Yes — our first drop is confirmed for Summer 2026. Boxes are limited and early access members get first pick. Sign up now to lock your spot.",
  },
  {
    q: "How much does a box cost?",
    a: "Boxes start at $35 for a Starter Box (5–7 seasonal items, 12–15 lbs). Family Boxes are $65 and Community Boxes are $95. No subscription required — you choose your box each drop.",
  },
  {
    q: "Where do I pick up my box?",
    a: "We'll drop in Chicago neighborhoods — exact pickup locations are confirmed by email before each drop. We'll ask for your ZIP code after you join so we can route your first drop closest to you.",
  },
  {
    q: "What if I don't like what's in the box?",
    a: "Every box is seasonal and rotating — so you'll never get the same box twice. If you ever have an issue with your order, reach out to info@unclemays.com and we'll make it right.",
  },
  {
    q: "Will you spam my inbox?",
    a: "Never. We will only email you about upcoming drops, your pickup location, and occasional farmer spotlights. Unsubscribe anytime — no hard feelings.",
  },
];

const testimonials = [
  {
    quote: "Finally — fresh produce from people who actually look like me, grown by people who look like me. Can't wait for the first drop.",
    name: "Keisha M.",
    location: "South Shore, Chicago",
  },
  {
    quote: "I've been waiting for something like this in Chicago for years. The concept is exactly what our community needs.",
    name: "Darnell T.",
    location: "Bronzeville, Chicago",
  },
  {
    quote: "Signed up the second I heard about it. Supporting Black farmers while eating better? That's an easy yes.",
    name: "Aisha R.",
    location: "Hyde Park, Chicago",
  },
];

const Index = () => {
  return (
    <Layout>
      <Hero />

      {/* 2. HOW IT WORKS — Consumer-facing 3 steps */}
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
              Three simple steps from signup to fresh produce on your doorstep.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Join the Waitlist — Free",
                description:
                  "Sign up in 30 seconds. No credit card, no commitment. You're reserving your spot for the first drop.",
              },
              {
                step: "02",
                title: "Get Notified Before Each Drop",
                description:
                  "We'll email you before every drop with what's in the box, the price, and your nearest pickup location.",
              },
              {
                step: "03",
                title: "Claim Your Box",
                description:
                  "Choose your box size, pay only when you're ready, and pick up fresh produce from a neighborhood location near you.",
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
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-foreground/70 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. WHAT'S IN THE BOX — Features & Benefits */}
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
                title: "Chicago Neighborhood Drops",
                description:
                  "Pick up at a location near you — no long drives, no shipping delays. Local by design.",
              },
              {
                icon: RotateCcw,
                title: "Seasonal & Rotating",
                description:
                  "You'll never get the same box twice. Always what's freshest, always what's in season.",
              },
              {
                icon: ShieldCheck,
                title: "Boxes Starting at $35",
                description:
                  "From a Starter Box for individuals to a Community Box for large families. No subscription required.",
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
            <p className="text-muted-foreground text-center mb-6">A taste of what to expect — varies by season and drop.</p>
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
            <p className="text-xs text-muted-foreground text-center mt-4">
              Contents rotate each drop based on what's freshest from our farmers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 4. URGENCY — First Drop */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2 text-sm font-semibold mb-6">
              <Clock className="h-4 w-4" />
              First Drop: Summer 2026
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Boxes Are Limited. Early Access Members Get First Pick.
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8">
              We're dropping a limited number of boxes in the first round. Sign up now to lock your spot — waitlist is free and takes 30 seconds.
            </p>
            <div className="flex flex-col items-center gap-3">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg font-semibold px-10 py-6 rounded-xl"
                asChild
              >
                <a href={WAITLIST_FORM_URL} target="_blank" rel="noopener noreferrer">
                  Claim My Early Access Spot
                </a>
              </Button>
              <p className="text-sm text-primary-foreground/70">
                Free to join. No credit card. Unsubscribe anytime.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. PRODUCT / BOXES */}
      <Pricing />

      {/* 6. FARMER PROFILES */}
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

      {/* 7. SOCIAL PROOF — Community Testimonials */}
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
              500+ Chicagoans already on the waitlist
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Your Neighbors Are In</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              You won't be an early guinea pig — you're joining a community that's been waiting for this.
            </p>
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
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQ — Objection Handling */}
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
              No fine print. Here's everything you need to know before you sign up.
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

      {/* 9. GET INVOLVED */}
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
              Whether you're here to eat better or back the build — there's a place for you.
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
              <h3 className="text-2xl font-semibold mb-3">Customers</h3>
              <p className="text-foreground/70 leading-relaxed mb-6">
                Join the waitlist free, get notified before the first drop, and claim your box of fresh produce from Black farmers.
              </p>
              <Button asChild size="lg" className="w-full">
                <a href={WAITLIST_FORM_URL} target="_blank" rel="noopener noreferrer">
                  Claim My Early Access Spot
                </a>
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Free to join. Join 500+ Chicagoans already on the list.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-card rounded-2xl p-8 shadow-soft border border-border/50"
            >
              <h3 className="text-2xl font-semibold mb-3">Investors</h3>
              <p className="text-foreground/70 leading-relaxed mb-6">
                Back the build of retail-first infrastructure that evolves into a compounding data and distribution platform for Black food.
              </p>
              <Button asChild size="lg" variant="outline" className="w-full border-2">
                <a href="mailto:anthony@unclemays.com">
                  Request Pitch Book
                </a>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 10. BOTTOM CTA — Repeat signup with social proof */}
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
              Still on the fence?
            </h2>
            <p className="text-xl text-background/80 mb-8">
              Join 500+ Chicagoans already on the waitlist. It's free, takes 30 seconds, and you can unsubscribe anytime.
            </p>
            <div className="flex flex-col items-center gap-3">
              <Button
                size="lg"
                className="text-lg font-semibold px-10 py-6 rounded-xl bg-background text-foreground hover:bg-background/90"
                asChild
              >
                <a href={WAITLIST_FORM_URL} target="_blank" rel="noopener noreferrer">
                  Claim My Early Access Spot
                </a>
              </Button>
              <p className="text-sm text-background/60">
                Free to join. No credit card. Unsubscribe anytime.
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
    </Layout>
  );
};

export default Index;
