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
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Fresh from{" "}
              <span className="text-primary">Black Farmers</span>
              <br />
              to Your Table
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 text-foreground/80 font-light"
          >
            Premium produce boxes celebrating the rich agricultural heritage of Black American farmers across the United States.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start"
          >
            <Button 
              size="lg" 
              className="group text-lg font-semibold px-8 py-6 rounded-xl"
              onClick={() => {
                const pricingSection = document.getElementById('pricing');
                if (pricingSection) {
                  pricingSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <span className="text-center">Get Started</span>
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg font-semibold px-8 py-6 rounded-xl border-2" 
              asChild
            >
              <Link to="/about">Learn More</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12 flex flex-wrap gap-8 items-center"
          >
            <div className="flex items-center gap-2">
              <div className="h-1 w-12 bg-primary rounded-full" />
              <span className="text-sm font-medium text-muted-foreground">Award-Winning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-12 bg-secondary rounded-full" />
              <span className="text-sm font-medium text-muted-foreground">Chicago-Based</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
