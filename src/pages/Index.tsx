import { motion } from "framer-motion";
import { Leaf, MapPin, RotateCcw, ShieldCheck, HelpCircle, Users, Instagram, ShoppingBag, Bell, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { Hero } from "@/components/Hero";
import { Pricing } from "@/components/Pricing";

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
    q: "How does delivery work?",
    a: "We deliver directly to your Chicago address. After placing your order, you'll receive a confirmation email with your estimated delivery window. We deliver across Chicago — enter your address at checkout to confirm your area.",
  },
  {
    q: "What's actually in the box?",
    a: "Every box is seasonal and rotating — so you get what's freshest, not what's been sitting in a warehouse. A Starter Box typically includes 5–7 items like sweet corn, heirloom tomatoes, collard greens, squash, and fresh herbs. The contents vary each delivery.",
  },
  {
    q: "How much does a box cost?",
    a: "Boxes start at $35 for a Starter Box (5–7 seasonal items, 12–15 lbs), $65 for a Family Box (12–15 items, 22–26 lbs), and $95 for a Community Box (20–25 items, 30–35 lbs). No subscription required — order when you want.",
  },
  {
    q: "Do I need a subscription?",
    a: "No. Every box is a one-time purchase — order when it works for you. If you'd like regular deliveries, reach out to info@unclemays.com and we can set up a recurring schedule.",
  },
  {
    q: "What if I have an issue with my order?",
    a: "We stand behind every box. If anything is wrong with your delivery — missing items, quality issues, anything — email us at info@unclemays.com and we'll make it right, no questions asked.",
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
                  "Pick the box size that works for your household — Starter, Family, or Community. All boxes are one-time purchases. No subscription required.",
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
                  "We deliver straight to your Chicago address. You'll get a confirmation and delivery window by email as soon as your order is placed.",
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
                  "We deliver across Chicago — no pickup required. Fresh produce arrives at your door on your schedule.",
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
                  "Order when you want. No lock-in, no commitment. Boxes start at $35 — pay only when you order.",
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
              A taste of what to expect — contents rotate each delivery based on what's freshest.
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

      {/* 4. PRODUCT / BOXES */}
      <Pricing />

      {/* 5. WHY UNCLE MAY'S — Mission & Trust */}
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
                Uncle May's is building it — starting with the most direct connection possible: fresh
                produce from Black farmers to Black households in Chicago.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Every dollar you spend goes directly to Black farmers — not middlemen.",
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

      {/* 7. SOCIAL PROOF — Customer Testimonials */}
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
              Loved by Chicago families
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What Customers Are Saying</h2>
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
                <a href="mailto:anthony@unclemays.com">Request Pitch Book</a>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 10. BOTTOM CTA */}
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
              Fresh produce from Black farmers, delivered straight to your Chicago door. Order today — no subscription, no commitment.
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
                Boxes from $35. Delivered across Chicago.
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
