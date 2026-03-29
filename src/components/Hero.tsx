import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import heroImage from "@/assets/hero-produce.jpg";

const WAITLIST_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfmaSTz-8JuH3RXsL3sCBakVjBcqGQML6muiYeFOdLQ-FwqoA/viewform?usp=sharing&ouid=110071880161586206166";

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
            {/* Social proof badge — above the fold */}
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-sm font-semibold text-primary mb-6">
              <Users className="h-4 w-4" />
              500+ Chicagoans already on the list
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Fresh Produce from Black Farmers.{" "}
              <span className="text-primary">Dropping in Chicago Soon.</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl md:text-2xl mb-8 text-foreground/80 font-light"
          >
            Curated seasonal boxes. Neighborhood pop-up markets. Every box puts
            money directly in the hands of Black farmers and brings
            restaurant-quality produce to your block.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start"
          >
            <div className="flex flex-col gap-2">
              <Button
                size="lg"
                asChild
                className="group text-lg font-semibold px-8 py-6 rounded-xl"
              >
                <a href={WAITLIST_FORM_URL} target="_blank" rel="noopener noreferrer">
                  Claim My Early Access Spot
                </a>
              </Button>
              {/* Risk-reversal microcopy */}
              <p className="text-sm text-foreground/60 text-center sm:text-left">
                Free to join. No spam. We'll only reach out about drops and pickup spots.
              </p>
            </div>
            <Button
              size="lg"
              variant="outline"
              className="text-lg font-semibold px-8 py-6 rounded-xl border-2"
              asChild
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
            <span className="font-semibold text-foreground/90">Chicago neighborhood drops</span>
            <span aria-hidden="true">•</span>
            <span className="font-semibold text-foreground/90">Boxes starting at $35</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
