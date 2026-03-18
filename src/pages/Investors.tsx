import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";

const Investors = () => {
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
                The first data and distribution system for Black food consumption.
              </h1>
              <p className="text-xl text-primary-foreground/80 mb-10 leading-relaxed">
                Retail is the wedge. Demand is the compounding asset. Uncle May's
                unifies fragmented supply and demand through retail stores + vendor
                network + proprietary food data.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-background text-primary hover:bg-background/90"
                >
                  <a href="mailto:info@unclemays.com?subject=Investor%20Waitlist%20-%20Uncle%20May%27s%20Produce">
                    Join the Waitlist
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
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  A $100B+ underserved market with no system of record.
                </h2>
                <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                  Black food demand is real - the signals are fragmented across retail,
                  suppliers, and distribution. Retail is the acquisition engine for data,
                  demand, and supply, so the platform can compound over time.
                </p>
                <div className="space-y-3">
                  <div className="rounded-2xl bg-card border border-border/50 p-6 shadow-soft">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Retail + supply network
                    </p>
                    <p className="text-foreground/80 leading-relaxed">
                      Retail stores + vendor network + proprietary food data unify fragmented
                      supply and demand through a single system.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="bg-card rounded-2xl border border-border/50 p-8 shadow-soft">
                  <h3 className="text-3xl font-bold mb-4">Compounding data moat.</h3>
                  <p className="text-foreground/80 leading-relaxed mb-6">
                    We're building the first scalable consumer interface for Black food demand.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-foreground/80">
                        The first scalable consumer interface for Black food demand.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-foreground/80">
                        No competitor owns both the consumer interface and supplier network at scale.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-foreground/80">
                        This dataset cannot be replicated without owning both the consumer interface and the supplier network.
                      </span>
                    </li>
                  </ul>

                  <div className="mt-8 rounded-xl bg-primary/10 border border-primary/30 p-6">
                    <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">
                      AI-driven operating system
                    </p>
                    <p className="text-foreground/80 leading-relaxed">
                      An AI-driven operating system is part of what we're building - turning demand signals
                      into better sourcing, pricing intelligence, and inventory optimization as the network grows.
                    </p>
                  </div>
                </div>
              </motion.div>
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
              className="text-center max-w-4xl mx-auto"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Transitions from low-margin retail to higher-margin platform economics over time.
              </h2>
              <p className="text-xl text-foreground/80 leading-relaxed">
                Retail is real today. The platform is the strategic layer that compounds -
                expanding distribution as demand signals improve.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <a href="mailto:info@unclemays.com?subject=Investor%20Waitlist%20-%20Uncle%20May%27s%20Produce">
                    Request Investor Materials
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-2">
                  <Link to="/partners">Partner Network</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Investors;

