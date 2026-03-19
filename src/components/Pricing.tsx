import { motion } from "framer-motion";
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

        <div className="max-w-4xl mx-auto mt-10 flex justify-center">
          <Link
            to="/investors"
            className="inline-flex items-center justify-center rounded-xl text-base font-semibold h-12 px-8 py-3 transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/90 shadow-medium"
          >
            Join the Waitlist
          </Link>
        </div>
      </div>
    </section>
  );
};
