import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import produceBoxImage from "@/assets/produce-box.jpg";

const plans = [
  {
    name: "Starter Box",
    price: "$35",
    frequency: "per delivery",
    description: "Perfect for individuals or couples",
    features: [
      "5-7 seasonal items",
      "Bi-weekly deliveries",
      "Recipe cards included",
      "Support Black farmers",
    ],
    stripeUrl: "https://buy.stripe.com/14AfZh2IT0sces75l29Zm03",
  },
  {
    name: "Family Box",
    price: "$65",
    frequency: "per delivery",
    description: "Ideal for families of 3-5",
    features: [
      "12-15 seasonal items",
      "Weekly deliveries available",
      "Recipe cards & meal plans",
      "Priority farmer selection",
      "Free delivery",
    ],
    popular: true,
    stripeUrl: "https://buy.stripe.com/14A3cvablej2fwb00I9Zm04",
  },
  {
    name: "Community Box",
    price: "$95",
    frequency: "per delivery",
    description: "For large families or sharing",
    features: [
      "20-25 seasonal items",
      "Weekly deliveries",
      "Exclusive recipe content",
      "Meet your farmers events",
      "Free delivery",
      "Customization options",
    ],
    stripeUrl: "https://buy.stripe.com/dRm00jerB3Eo97N8xe9Zm05",
  },
];

export const Pricing = () => {
  
  return (
    <section id="pricing" className="py-24 bg-muted/30 relative" style={{ zIndex: 1 }}>
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Box</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Flexible subscription plans to fit your lifestyle and support Black farmers.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className="relative z-10"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-secondary text-white px-6 py-1.5 rounded-full text-sm font-semibold z-20">
                  Most Popular
                </div>
              )}
              <div
                className={`bg-card rounded-2xl p-8 shadow-soft h-full flex flex-col relative z-10 ${
                  plan.popular ? "border-2 border-secondary shadow-medium" : ""
                }`}
              >
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-primary">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">{plan.frequency}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={plan.stripeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-semibold h-12 px-6 py-3 transition-all duration-300 ${
                    plan.popular 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-medium" 
                      : "border-2 border-primary bg-background text-primary hover:bg-primary hover:text-primary-foreground shadow-soft"
                  }`}
                  style={{
                    display: 'flex',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    zIndex: 9999,
                    position: 'relative',
                    textAlign: 'center'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Let the browser handle navigation naturally
                  }}
                >
                  <span className="text-center">Subscribe Now</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-medium"
        >
          <img
            src={produceBoxImage}
            alt="Fresh produce box with colorful vegetables"
            className="w-full h-64 object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
};
