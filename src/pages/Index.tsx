import { motion } from "framer-motion";
import { Package, Truck, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { Hero } from "@/components/Hero";
import { Pricing } from "@/components/Pricing";

const Index = () => {
  return (
    <Layout>
      <Hero />

      {/* 2. WHAT WE DO */}
      <section className="py-24 bg-background">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">A New Food System, Built for Us</h2>
            <p className="text-xl text-foreground/80 leading-relaxed">
              Retail is the acquisition engine for data, demand, and supply. We build a modern grocery ecosystem where real buying
              signals become smarter sourcing, pricing intelligence, and distribution decisions - starting with fresh produce and scaling to national retail.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="py-24 bg-muted/20">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How it Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A clear loop that turns retail touchpoints into durable advantage over time.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Package,
                title: "Source",
                description: "Black farmers and vendors are matched with demand signals captured from real retail buying.",
              },
              {
                icon: Truck,
                title: "Distribute",
                description: "Distribution planning improves as the dataset grows, so the right products reach the right communities.",
              },
              {
                icon: TrendingUp,
                title: "Scale",
                description: "As demand becomes measurable, network decisions compound - shifting the business from retail to infrastructure economics.",
              },
            ].map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.08 }}
                className="bg-card rounded-2xl p-8 shadow-soft border border-border/50"
              >
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                <p className="text-foreground/70 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WHY THIS MATTERS */}
      <section className="py-24 bg-foreground text-background">
        <div className="container px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Why This Matters</h2>
              <p className="text-xl text-background/80 leading-relaxed">
                A $100B+ underserved market with no system of record. We are building the data and distribution infrastructure that
                connects Black food demand to the supply chain - so sourcing, pricing, and delivery decisions improve with every retail signal.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. PRODUCT SECTION */}
      <Pricing />

      {/* 6. VISION SECTION */}
      <section className="py-24 bg-background">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Building the Future of Black Food Retail</h2>
            <p className="text-xl text-foreground/80 leading-relaxed">
              A grocery ecosystem that captures real demand and turns it into better decisions for Black communities.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            {[
              "Retail touchpoints capture real demand signals.",
              "Proprietary food data powers sourcing and pricing intelligence.",
              "A vendor network routes products to where demand actually is.",
              "Compounding data moat improves matching and distribution over time.",
            ].map((bullet, idx) => (
              <motion.div
                key={bullet}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.08 }}
                className="bg-card rounded-2xl p-8 shadow-soft border border-border/50"
              >
                <div className="flex items-start gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p className="text-foreground/80 leading-relaxed">{bullet}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. GET INVOLVED */}
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
              Choose your path. We will build the system around real participation and real demand.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-card rounded-2xl p-8 shadow-soft border border-border/50">
              <h3 className="text-2xl font-semibold mb-3">Customers</h3>
              <p className="text-foreground/70 leading-relaxed mb-6">
                Shop the boxes and help turn Black food demand into a compounding data layer.
              </p>
              <Button asChild size="lg" className="w-full">
                <a href="#boxes">Shop Produce Boxes</a>
              </Button>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-soft border border-border/50">
              <h3 className="text-2xl font-semibold mb-3">Partners</h3>
              <p className="text-foreground/70 leading-relaxed mb-6">
                Help routes become real - with demand that improves sourcing and distribution decisions.
              </p>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full border-2"
              >
                <a href="mailto:info@unclemays.com?subject=Partner%20With%20Us%20-%20Uncle%20May%27s%20Produce">
                  Partner With Us
                </a>
              </Button>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-soft border border-border/50">
              <h3 className="text-2xl font-semibold mb-3">Investors</h3>
              <p className="text-foreground/70 leading-relaxed mb-6">
                Support the build of retail-first infrastructure that evolves into a compounding data and distribution platform.
              </p>
              <Button asChild size="lg" variant="outline" className="w-full border-2">
                <a href="mailto:anthony@unclemays.com">
                  Request Pitch Book
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
