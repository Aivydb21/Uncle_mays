"use client";

import { motion } from "framer-motion";
import { Package, Truck, Heart } from "lucide-react";

const steps = [
  {
    icon: Package,
    title: "Shop through retail",
    description: "Buy Black food through retail touchpoints - where demand becomes real signals.",
  },
  {
    icon: Truck,
    title: "Your purchase becomes demand data",
    description: "Every purchase strengthens proprietary demand signals captured from real retail behavior.",
  },
  {
    icon: Heart,
    title: "Demand powers sourcing & distribution",
    description: "That dataset compounds - so vendor network decisions improve as the platform scales.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Retail is the acquisition engine.</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Every purchase creates proprietary demand signals. That dataset compounds - so sourcing and distribution improve as the platform scales.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative"
            >
              <div className="bg-card rounded-2xl p-8 shadow-soft hover:shadow-medium transition-shadow">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                <p className="text-foreground/70 leading-relaxed">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <div className="h-0.5 w-8 bg-primary/30" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
