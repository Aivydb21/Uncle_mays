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

            {/* Headline — under test 2026-04-27 (was: "Cleaner than Whole Foods.
                Cheaper than Aldi.") to reduce skepticism on cold paid traffic. */}
            <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
              Farm-fresh produce from{" "}
              <span className="text-primary">Black farmers</span>, delivered weekly across the Chicago metro area.
            </h1>

            {/* Instant proof — survey stat (we have ~3 active subscribers; the
                "100+" number comes from the pre-launch shopper survey, not from
                paying customers). */}
            <div className="flex items-center gap-2 mb-5 text-base">
              <span aria-label="five stars" className="text-amber-500 tracking-tight">
                &#x2605;&#x2605;&#x2605;&#x2605;&#x2605;
              </span>
              <span className="font-medium text-foreground/85">
                97% of 100+ Chicago shoppers said they&apos;d buy
              </span>
            </div>

            {/* Tightened subhead */}
            <p className="text-xl md:text-2xl mb-6 text-foreground/80 font-light">
              From <span className="font-semibold text-foreground">$40</span> a box. Delivered Wednesday. No subscription.
            </p>

            {/* Dominant above-fold CTA + subtext */}
            <div className="flex flex-col items-start gap-2">
              <Button
                size="lg"
                asChild
                className="text-xl font-bold px-10 py-7 rounded-xl shadow-lg w-full sm:w-auto"
              >
                <Link href="/#boxes">
                  Get Your Box
                </Link>
              </Button>
              <span className="text-sm text-foreground/70 ml-1">
                Delivered this Wednesday
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
            <span className="font-semibold text-foreground/90">Free Chicago metro delivery</span>
            <span aria-hidden="true">•</span>
            <span className="font-semibold text-foreground/90">Cancel anytime</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
