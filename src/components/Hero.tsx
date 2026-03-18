import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-produce.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(to right, hsl(var(--background) / 0.95), hsl(var(--background) / 0.7)), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      
      <div className="container relative z-10 px-6 py-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center rounded-full bg-secondary/20 px-5 py-2 text-sm font-semibold text-secondary-foreground mb-4">
              First store opens soon. Retail signals demand.
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              The first data and distribution system for Black food consumption in the U.S.
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl md:text-2xl mb-8 text-foreground/80 font-light"
          >
            Retail signals demand. That powers sourcing, pricing, and distribution through the platform.
            First store opens soon.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start"
          >
            <Button
              size="lg"
              asChild
              className="group text-lg font-semibold px-8 py-6 rounded-xl"
            >
              <Link to="/investors">
              <span className="text-center">Join the Waitlist</span>
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg font-semibold px-8 py-6 rounded-xl border-2" 
              asChild
            >
              <Link to="/about">Learn About the Platform</Link>
            </Button>
          </motion.div>

          {/* Keep hero CTAs minimal: waitlist + platform */}
        </div>
      </div>
    </section>
  );
};
