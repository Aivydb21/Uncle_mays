"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Truck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
const heroImage = "/images/hero-produce.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImage}
          alt="Fresh seasonal produce box from Black farmers delivered in Chicago"
          fill
          priority
          sizes="100vw"
          className="object-cover"
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
              <span>Now delivering across the Chicago metro area</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
              Farm-fresh produce from{" "}
              <span className="text-primary">Black farmers</span>, in Chicago.
            </h1>

            {/* Instant proof line. */}
            <div className="flex items-center gap-2 mb-5 text-base">
              <span aria-label="five stars" className="text-amber-500 tracking-tight">
                &#x2605;&#x2605;&#x2605;&#x2605;&#x2605;
              </span>
              <span className="font-medium text-foreground/85">
                Serving hundreds across Chicago
              </span>
            </div>

            {/* Subhead — cart model */}
            <p className="text-xl md:text-2xl mb-6 text-foreground/80 font-light">
              Build your order from our catalog. Chicago delivery or free Hyde Park pickup. No subscription.
            </p>

            {/* Dominant above-fold CTA */}
            <div className="flex flex-col items-start gap-2">
              <Button
                size="lg"
                asChild
                className="text-xl font-bold px-10 py-7 rounded-xl shadow-lg w-full sm:w-auto"
              >
                <Link href="/shop">
                  Shop the catalog
                </Link>
              </Button>
              <span className="text-sm text-foreground/70 ml-1">
                $25 minimum. Use code FRESH10 for $10 off.
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-foreground/70"
          >
            <span className="font-semibold text-foreground/90">100% fresh or refunded</span>
            <span aria-hidden="true">•</span>
            <span className="font-semibold text-foreground/90">Direct from Black farmers</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
