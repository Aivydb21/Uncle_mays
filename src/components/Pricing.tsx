import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
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
            The first store opens soon. Join the waitlist for launch updates and early platform access.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" variant="default" className="w-full sm:w-auto">
            <Link to="/investors">Join the Waitlist</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-2">
            <Link to="/partners">Partner With Us</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
