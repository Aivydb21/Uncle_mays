"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Truck } from "lucide-react";
import Link from "next/link";
const heroImage = "/images/hero-produce.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Fresh seasonal produce box from Black farmers delivered in Chicago"
          className="absolute inset-0 h-full w-full object-cover"
          width={1920}
          height={1080}
          fetchPriority="high"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-background/95 to-background/70"
          aria-hidden="true"
        />
      </div>

      <div className="container relative z-10 px-6 py-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Delivery badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-sm font-semibold text-primary mb-4">
              <Truck className="h-4 w-4 shrink-0" />
              <span>Now delivering in Chicago</span>
            </div>

            {/* Value anchor — primary headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
              Cleaner than Whole Foods.{" "}
              <span className="text-primary">Cheaper than Aldi.</span>
            </h1>

            {/* Offer subhead */}
            <p className="text-xl md:text-2xl mb-6 text-foreground/80 font-light">
              Black-farmed seasonal produce, delivered to your Chicago door every Wednesday.
              Boxes from <span className="font-semibold text-foreground">$40</span>. No subscription required.
            </p>

            {/* Dominant above-fold CTA */}
            <Button
              size="lg"
              asChild
              className="text-xl font-bold px-10 py-7 rounded-xl shadow-lg w-full sm:w-auto"
            >
              <Link href="/#boxes">
                Get Your Box
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-foreground/70"
          >
            <span className="font-semibold text-foreground/90">Black-farmed produce</span>
            <span aria-hidden="true">•</span>
            <span className="font-semibold text-foreground/90">Chicago-wide delivery</span>
            <span aria-hidden="true">•</span>
            <span className="font-semibold text-foreground/90">One-time or subscribe &amp; save</span>
            <span aria-hidden="true">•</span>
            <span className="font-semibold text-foreground/90">
              Give this a try, we would love your support
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
