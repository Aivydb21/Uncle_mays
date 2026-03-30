"use client";

import { motion } from "framer-motion";

export const BrokenEcosystem = () => {
  return (
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
            <p className="text-lg text-foreground/80 mb-6 leading-relaxed">
              Black food demand is real. But the signals are fragmented across retail,
              suppliers, and distribution - so sourcing, pricing intelligence, and inventory
              decisions happen without a unified view of what communities actually want.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-primary rounded-full mt-2" />
                <p className="text-foreground/80 leading-relaxed">
                  No single dataset connects what people buy to how supply is sourced and
                  routed.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-primary rounded-full mt-2" />
                <p className="text-foreground/80 leading-relaxed">
                  Retail is optimized for execution, not compounding demand data.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-primary rounded-full mt-2" />
                <p className="text-foreground/80 leading-relaxed">
                  Suppliers don't get consistent, proprietary visibility that scales.
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
                The missing layer
              </p>
              <h3 className="text-2xl font-bold mb-4">A single system that unifies supply + demand.</h3>
              <p className="text-foreground/70 leading-relaxed">
                A system of record that connects demand signals to sourcing, pricing intelligence,
                and distribution decisions over time.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

