import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";

const Partners = () => {
  return (
    <Layout>
      <div className="min-h-screen">
        <section className="relative py-24 bg-primary text-primary-foreground">
          <div className="container px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                Access to demand, then distribution.
              </h1>
              <p className="text-xl text-primary-foreground/80 mb-10 leading-relaxed">
                For Black farmers and food brands - built on retail's consumer interface, a vendor network, and proprietary food data.
                Retail stores + vendor network + proprietary food data unify fragmented supply and demand through a single system.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-background text-primary hover:bg-background/90"
                >
                  <a href="mailto:info@unclemays.com?subject=Partner%20With%20Us%20-%20Uncle%20May%27s%20Produce">
                    Partner With Us
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-2">
                  <Link to="/about">Learn About the Platform</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-24 bg-background">
          <div className="container px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Route-to-market powered by real demand signals.
              </h2>
              <p className="text-xl text-muted-foreground">
                Retail is the acquisition engine for data, demand, and supply. As demand signals compound, so do the decisions that move your products to customers.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-card rounded-2xl p-8 shadow-soft border border-border/50">
                <h3 className="text-2xl font-bold mb-3">Farmers</h3>
                <p className="text-foreground/70 leading-relaxed mb-6">
                  Better alignment between what you produce and what communities actually buy.
                </p>
                <p className="text-foreground/80 font-semibold mb-3">You get:</p>
                <ul className="space-y-3 text-foreground/70">
                  <li>Demand visibility that compounds</li>
                  <li>Consistent sourcing signals</li>
                  <li>Smarter distribution planning</li>
                </ul>
              </div>

              <div className="bg-card rounded-2xl p-8 shadow-soft border border-border/50">
                <h3 className="text-2xl font-bold mb-3">Brands</h3>
                <p className="text-foreground/70 leading-relaxed mb-6">
                  A distribution path built on proprietary consumer demand data - without guessing.
                </p>
                <p className="text-foreground/80 font-semibold mb-3">You get:</p>
                <ul className="space-y-3 text-foreground/70">
                  <li>Route-to-market through retail touchpoints</li>
                  <li>Pricing intelligence informed by real demand</li>
                  <li>Long-term network growth</li>
                </ul>
              </div>

              <div className="bg-card rounded-2xl p-8 shadow-soft border border-border/50">
                <h3 className="text-2xl font-bold mb-3">Distribution partners</h3>
                <p className="text-foreground/70 leading-relaxed mb-6">
                  Inventory and sourcing decisions guided by what people want - so execution improves as the platform scales.
                </p>
                <p className="text-foreground/80 font-semibold mb-3">You get:</p>
                <ul className="space-y-3 text-foreground/70">
                  <li>Demand-aware planning</li>
                  <li>Compounding improvements over time</li>
                  <li>Better matching to community needs</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-muted/30">
          <div className="container px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto text-center"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Built for Black food consumption at scale.
              </h2>
              <p className="text-xl text-foreground/80 leading-relaxed mb-10">
                We unify fragmented supply and demand through a single system - so partners don't wait on guesswork.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <a href="mailto:info@unclemays.com?subject=Partner%20With%20Us%20-%20Uncle%20May%27s%20Produce">
                    Partner With Us
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-2">
                  <Link to="/investors">For Investors</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Partners;

