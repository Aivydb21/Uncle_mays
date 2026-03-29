import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Truck, Star } from "lucide-react";
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
            {/* Live delivery badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-sm font-semibold text-primary mb-6">
              <Truck className="h-4 w-4" />
              Now Delivering in Chicago
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Fresh Produce from Black Farmers,{" "}
              <span className="text-primary">Delivered to Your Door.</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl md:text-2xl mb-8 text-foreground/80 font-light"
          >
            Curated seasonal boxes sourced directly from Black farmers. Every
            purchase puts money in the hands of the people who grew your food
            and brings restaurant-quality produce straight to your Chicago home.
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
              <a href="#boxes">Shop Produce Boxes</a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-foreground/70"
          >
            <span className="font-semibold text-foreground/90">Black-farmed produce</span>
            <span aria-hidden="true">•</span>
            <span className="font-semibold text-foreground/90">Chicago-wide delivery</span>
            <span aria-hidden="true">•</span>
            <span className="font-semibold text-foreground/90">Boxes starting at $35</span>
            <span aria-hidden="true">•</span>
            <span className="inline-flex items-center gap-1 font-semibold text-foreground/90">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              Rooted in Chicago community
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
