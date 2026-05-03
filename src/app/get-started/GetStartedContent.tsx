"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Truck,
  ShieldCheck,
  Leaf,
  Clock,
  Check,
} from "lucide-react";
import { TESTIMONIALS } from "@/lib/testimonials";

const HERO_IMAGE = "/images/hero-produce.jpg";

const STEPS = [
  {
    title: "Build your order",
    body: "Browse the catalog and fill your cart with what you actually want. $25 minimum.",
  },
  {
    title: "Choose delivery or pickup",
    body: "Chicago delivery $7.99 flat, or free pickup at the Polsky Center in Hyde Park.",
  },
  {
    title: "We pack it fresh",
    body: "Hand-packed with what was harvested that week. Confirmation email with your window.",
  },
];

export function GetStartedContent() {
  return (
    <main className="min-h-screen bg-background">
      {/* HERO — FRESH10 is the lede */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={HERO_IMAGE}
            alt="Uncle May's seasonal produce delivery in Chicago"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/85 to-background/95" />
        </div>

        <div className="container relative z-10 px-6 pt-12 pb-16 md:pt-20 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-5 py-2 text-sm font-semibold text-primary mb-5">
              <Truck className="h-4 w-4" />
              Now delivering across the Chicago metro area
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight">
              $10 off your first order
              <span className="block text-primary">with code FRESH10</span>
            </h1>

            <p className="text-lg md:text-xl text-foreground/80 mb-7 leading-relaxed">
              Premium produce, pantry staples, and pasture-raised protein from
              Black farmers. Build your own grocery order. $25 minimum, no
              subscription.
            </p>

            <Link
              href="/shop?promo=FRESH10"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold text-lg rounded-xl px-10 py-5 shadow-lg hover:bg-primary/90 transition-all duration-200 active:scale-95"
            >
              Shop the catalog →
            </Link>

            <p className="mt-4 text-sm text-muted-foreground">
              Enter code FRESH10 in the cart to claim your discount
            </p>
          </motion.div>
        </div>
      </section>

      {/* TRUST STRIP — three signals, no farm-name */}
      <section className="border-y border-border bg-muted/20">
        <div className="container px-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="flex items-center gap-2 text-sm text-foreground/80 justify-center sm:justify-start">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
              <span>100% fresh or refunded</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground/80 justify-center">
              <Truck className="h-5 w-5 text-primary shrink-0" />
              <span>Chicago delivery or free Hyde Park pickup</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground/80 justify-center sm:justify-end">
              <Leaf className="h-5 w-5 text-primary shrink-0" />
              <span>Local farms, freshly picked</span>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF — real, attributed quote.
          framer-motion removed from below-fold sections (this one + the
          how-it-works cards) on 2026-04-26 because the cumulative JS
          execution was pushing mobile TBT past 600ms. The visual polish
          on the hero animation is enough; below-fold decoration was not
          worth the per-click latency cost on cold ad traffic. */}
      {TESTIMONIALS.length > 0 ? (
        <section className="py-14 bg-background">
          <div className="container px-6 max-w-2xl mx-auto">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="bg-card rounded-2xl p-7 md:p-8 shadow-soft border border-border/50"
              >
                <blockquote className="text-base md:text-lg leading-relaxed text-foreground/85 italic">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-4 text-sm font-semibold text-foreground">
                  {t.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {/* HOW IT WORKS — three crisp steps */}
      <section className="py-14 bg-muted/20">
        <div className="container px-6 max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <div
                key={s.title}
                className="bg-card rounded-xl p-6 border border-border"
              >
                <div className="text-primary text-2xl font-bold mb-2">
                  0{i + 1}
                </div>
                <h3 className="font-semibold mb-1.5">{s.title}</h3>
                <p className="text-sm text-foreground/70">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SHOP CTA — sends visitors into the catalog. */}
      <section id="choose" className="py-16 bg-muted/30">
        <div className="container px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Build your order
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-6">
            Pick the produce, pantry items, and protein you actually want.
            $25 minimum. Use FRESH10 for $10 off your first order.
          </p>
          <Link
            href="/shop"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-medium hover:bg-primary/90 transition-colors"
          >
            Shop the catalog →
          </Link>
        </div>
      </section>

      {/* CUTOFF + GUARANTEE — last reassurance before the next click */}
      <section className="py-12 bg-background">
        <div className="container px-6 max-w-2xl mx-auto">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
            <div className="inline-flex items-center gap-2 text-amber-800 font-semibold mb-2">
              <Clock className="h-4 w-4" />
              Pick your delivery or pickup window at checkout
            </div>
            <p className="text-sm text-amber-700">
              First order not perfect? We&apos;ll refund it, no questions asked.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-foreground/80">
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>One-time orders, no subscription</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>$25 minimum, no upper limit</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>Free pickup at Polsky Center, Hyde Park</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>Apple Pay &amp; Google Pay supported</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
