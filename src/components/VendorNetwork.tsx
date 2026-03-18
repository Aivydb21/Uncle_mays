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
          <h2 className="text-4xl md:text-5xl font-bold mb-4">For Black farmers and food brands</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Access to demand, then distribution - powered by proprietary food data and a vendor network designed to scale.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-card rounded-2xl p-8 shadow-soft border border-border/50">
            <h3 className="text-2xl font-bold mb-3">Farmers</h3>
            <p className="text-foreground/70 leading-relaxed mb-6">
              Clear purchasing signals that align production with what communities actually want.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span className="text-foreground/80">Better route-to-market planning</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span className="text-foreground/80">Demand visibility that compounds</span>
              </li>
            </ul>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-soft border border-border/50">
            <h3 className="text-2xl font-bold mb-3">Brands</h3>
            <p className="text-foreground/70 leading-relaxed mb-6">
              Retail touchpoints where demand is real - so you can reach customers and grow sustainably.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span className="text-foreground/80">Distribution decisions guided by data</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span className="text-foreground/80">A vendor network built for scale</span>
              </li>
            </ul>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-soft border border-border/50">
            <h3 className="text-2xl font-bold mb-3">Distribution partners</h3>
            <p className="text-foreground/70 leading-relaxed mb-6">
              Smarter inventory and sourcing that match demand instead of guesswork.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span className="text-foreground/80">Pricing intelligence informed by real demand</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span className="text-foreground/80">Inventory optimization as the network grows</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="mailto:info@unclemays.com?subject=Partner%20With%20Us%20-%20Uncle%20May%27s%20Produce"
            className="inline-flex items-center justify-center rounded-xl text-base font-semibold h-12 px-8 py-3 transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/90 shadow-medium"
          >
            Partner With Us
          </a>
          <Link
            to="/about"
            className="inline-flex items-center justify-center rounded-xl text-base font-semibold h-12 px-8 py-3 transition-all duration-300 border-2 border-primary bg-background text-primary hover:bg-primary hover:text-primary-foreground shadow-soft"
          >
            Learn About the Platform
          </Link>
        </div>
      </div>
    </section>
  );
};

