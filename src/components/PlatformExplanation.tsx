"use client";

import { motion } from "framer-motion";

export const PlatformExplanation = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Retail stores + vendor network + proprietary food data.
            </h2>
            <p className="text-lg text-foreground/80 leading-relaxed mb-6">
              The components work together as a single operating layer. Retail touchpoints
              capture real demand signals. Proprietary food data turns those signals into
              sourcing, pricing intelligence, and distribution decisions that improve over time.
            </p>
            <div className="space-y-4">
              <div className="rounded-2xl bg-card border border-border/50 p-6 shadow-soft">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  What we're building
                </p>
                <p className="text-xl font-semibold">
                  The infrastructure platform for Black food consumption.
                </p>
              </div>
              <div className="rounded-2xl bg-card border border-border/50 p-6 shadow-soft">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Built to compound
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  Compounding demand signals become a compounding data moat.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="bg-card rounded-2xl p-8 shadow-soft border border-border/50">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                Platform model
              </p>
              <div className="space-y-4">
                <div>
                  <p className="text-lg font-semibold mb-1">Retail stores</p>
                  <p className="text-foreground/70 leading-relaxed">
                    The consumer interface where demand becomes real data.
                  </p>
                </div>
                <div className="h-px bg-border/60" />
                <div>
                  <p className="text-lg font-semibold mb-1">Vendor network</p>
                  <p className="text-foreground/70 leading-relaxed">
                    The supply backbone that can scale when demand is clear.
                  </p>
                </div>
                <div className="h-px bg-border/60" />
                <div>
                  <p className="text-lg font-semibold mb-1">Proprietary food data</p>
                  <p className="text-foreground/70 leading-relaxed">
                    The system of record that improves sourcing, pricing intelligence,
                    and inventory optimization over time.
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-xl bg-primary/10 border border-primary/30 p-6">
                <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">
                  AI-driven operating system
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  An AI-driven operating system is part of the platform we're building-
                  turning demand signals into better decisions as the network grows.
                </p>
                <p className="text-sm text-foreground/70 mt-3">
                  Transitions from low-margin retail to higher-margin platform economics
                  over time.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

