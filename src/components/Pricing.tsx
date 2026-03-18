import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import produceBoxImage from "@/assets/produce-box.jpg";
import { Link } from "react-router-dom";

export const Pricing = () => {
  return (
    <section id="waitlist" className="py-24 bg-muted/30 relative" style={{ zIndex: 1 }}>
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Join the Waitlist</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join the waitlist to access the platform as it grows. Each retail signal strengthens the proprietary demand
            dataset that powers sourcing, pricing intelligence, and distribution decisions.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto mb-16 mt-10 rounded-2xl bg-card border border-border/50 p-8 shadow-soft">
          <h3 className="text-3xl font-bold text-center mb-3">For investors and partners</h3>
          <p className="text-center text-muted-foreground mb-6">
            Retail stores + vendor network + proprietary food data. This combination powers the system of record that connects demand
            to supply decisions as the network expands.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="default" className="w-full sm:w-auto">
              <Link to="/investors">Join the Waitlist</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-2">
              <Link to="/partners">Partner With Us</Link>
            </Button>
          </div>
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
            alt="Fresh produce"
            className="w-full h-64 object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
};
