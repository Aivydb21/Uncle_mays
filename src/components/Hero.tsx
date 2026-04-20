"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Truck, Star, ArrowRight } from "lucide-react";
import Link from "next/link";

const heroImage = "/images/hero-produce.jpg";

const HERO_BOXES = [
  { name: "Starter Box", price: "$30", priceNote: "first order", regularPrice: "$35", slug: "starter", note: "~12–15 lbs · 1–2 people" },
  { name: "Family Box", price: "$65", slug: "family", note: "~22–26 lbs · feeds 4 · chicken included", popular: true },
  { name: "Community Box", price: "$95", slug: "community", note: "~30–35 lbs · large families · protein included" },
];

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
            {/* First-order offer badge — message-match to Meta ads */}
            <div className="inline-flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-1 mb-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm font-bold shadow-md">
                <span>$30 first order</span>
                <span className="opacity-70">·</span>
                <span className="line-through opacity-60 font-normal">$35</span>
              </div>
            </div>

            {/* Delivery badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-sm font-semibold text-primary mb-6">
              <Truck className="h-4 w-4 shrink-0" />
              <span>Now delivering in Chicago</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
              Your first produce box:{" "}
              <span className="text-primary">$30.</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl md:text-2xl mb-8 text-foreground/80 font-light"
          >
            Fresh, curated, home delivery. Starter Box — normally $35.{" "}
            First-order pricing ends this week.
          </motion.p>

          {/* Inline box pricing CTAs — primary conversion path */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6"
          >
            {HERO_BOXES.map((box) => (
              <Link
                key={box.slug}
                href={`/subscribe/${box.slug}`}
                className={`group flex flex-col gap-1 rounded-xl px-5 py-4 border transition-all duration-200 ${
                  box.popular
                    ? "bg-primary text-primary-foreground border-primary shadow-md hover:bg-primary/90"
                    : "bg-background/80 text-foreground border-border hover:border-primary hover:bg-background"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm">{box.name}</span>
                  {box.popular && (
                    <span className="text-xs font-semibold bg-white/20 rounded-full px-2 py-0.5">
                      Popular
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold ${box.popular ? "text-primary-foreground" : "text-primary"}`}>
                      {box.price}
                    </span>
                    {"priceNote" in box && box.priceNote && (
                      <span className={`text-xs font-semibold ${box.popular ? "text-primary-foreground/70" : "text-primary/70"}`}>
                        {box.priceNote}
                      </span>
                    )}
                    {"regularPrice" in box && box.regularPrice && (
                      <span className={`text-xs line-through ${box.popular ? "text-primary-foreground/50" : "text-muted-foreground"}`}>
                        {box.regularPrice}
                      </span>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className={`text-xs leading-tight ${box.popular ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {box.note}
                </p>
              </Link>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start"
          >
            <Button
              size="lg"
              asChild
              className="group text-lg font-semibold px-8 py-6 rounded-xl"
            >
              <Link href="/checkout/starter">
                Claim Your $30 Box
              </Link>
            </Button>
            <Button
              size="lg"
              asChild
              variant="outline"
              className="group text-lg font-semibold px-8 py-6 rounded-xl border-primary/40 bg-background/70 hover:bg-background"
            >
              <a href="#boxes">See All Boxes</a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-foreground/70"
          >
            <span className="font-semibold text-foreground/90">Black-farmed produce</span>
            <span aria-hidden="true">•</span>
            <span className="font-semibold text-foreground/90">Chicago-wide delivery</span>
            <span aria-hidden="true">•</span>
            <span className="font-semibold text-foreground/90">No subscription required</span>
            <span aria-hidden="true">•</span>
            <span className="inline-flex items-center gap-1 font-semibold text-foreground/90">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              100% freshness guarantee
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
