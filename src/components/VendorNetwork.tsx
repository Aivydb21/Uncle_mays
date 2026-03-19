import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export const VendorNetwork = () => {
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
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Who the platform serves</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The platform connects farmers, brands, and distribution so the right products reach the right communities.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-card rounded-2xl p-8 shadow-soft border border-border/50">
            <h3 className="text-2xl font-bold mb-3">Farmers</h3>
            <p className="text-foreground/70 leading-relaxed">
              Clear demand signals for better planning and stronger matching to community needs.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-soft border border-border/50">
            <h3 className="text-2xl font-bold mb-3">Brands</h3>
            <p className="text-foreground/70 leading-relaxed">
              A route to distribution powered by real retail demand, not guesswork.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-soft border border-border/50">
            <h3 className="text-2xl font-bold mb-3">Distribution partners</h3>
            <p className="text-foreground/70 leading-relaxed">
              Better sourcing and planning when demand is measurable and consistent.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-12 flex flex-col sm:flex-row gap-3 justify-center text-center">
          <a
            href="mailto:info@unclemays.com?subject=Partner%20With%20Us%20-%20Uncle%20May%27s%20Produce"
            className="text-base font-semibold text-primary underline underline-offset-4"
          >
            Partner With Us
          </a>
          <Link to="/investors" className="text-base font-semibold text-primary underline underline-offset-4">
            Investors
          </Link>
        </div>
      </div>
    </section>
  );
};

