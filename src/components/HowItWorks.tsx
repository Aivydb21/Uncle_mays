import { motion } from "framer-motion";
import { Package, Truck, Heart } from "lucide-react";

const steps = [
  {
    icon: Package,
    title: "Choose Your Box",
    description: "Select from our curated subscription plans tailored to your household size and preferences.",
  },
  {
    icon: Truck,
    title: "We Deliver Fresh",
    description: "Receive farm-fresh produce at your doorstep, harvested at peak ripeness from our partner farmers.",
  },
  {
    icon: Heart,
    title: "Support & Enjoy",
    description: "Savor quality produce while directly supporting Black farmers and celebrating agricultural heritage.",
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
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Fresh produce from Black farmers, delivered to your door in three simple steps.
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
