"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";
import { Truck, ShieldCheck, Star, Check, ArrowRight, Leaf } from "lucide-react";
import { PRODUCTS } from "@/lib/products";

const starterBox = PRODUCTS.starter;
const FIRST_ORDER_PRICE = starterBox.firstOrderPrice; // $30
const REGULAR_PRICE = starterBox.price; // $35

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

const testimonial = {
  quote:
    "I ordered the Starter Box on a Monday and it was on my porch by Wednesday afternoon. Everything was fresh, nothing wilted. The asparagus and greens were gone in two days.",
  name: "Rob",
  location: "Bronzeville, Chicago",
};

function CTAButton({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/checkout/starter"
      className={`inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold text-lg rounded-xl px-8 py-4 shadow-lg hover:bg-primary/90 transition-all duration-200 active:scale-95 ${className}`}
      onClick={() => {
        // Fire Meta pixel ViewContent + InitiateCheckout for conversion tracking
        if (typeof window !== "undefined" && typeof (window as Window & { fbq?: (...a: unknown[]) => void }).fbq === "function") {
          (window as Window & { fbq: (...a: unknown[]) => void }).fbq("track", "InitiateCheckout", {
            content_name: "Starter Box",
            content_ids: ["starter"],
            content_type: "product",
            value: FIRST_ORDER_PRICE,
            currency: "USD",
          });
        }
      }}
    >
      Claim Your $30 Box
      <ArrowRight className="h-5 w-5" />
    </Link>
  );
}

export default function StarterBoxLandingPage() {
  // Fire Meta Pixel ViewContent event when page loads
  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("track", "ViewContent", {
        content_name: "Starter Box",
        content_ids: ["starter"],
        content_type: "product",
        value: FIRST_ORDER_PRICE,
        currency: "USD",
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal header — logo only, no nav links */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container px-6 h-14 flex items-center justify-center">
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Uncle May&apos;s Produce
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero-produce.jpg"
            alt="Fresh seasonal produce box"
            className="absolute inset-0 h-full w-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/96 to-background/75" />
        </div>

        <div className="relative z-10 container px-6 py-16 md:py-24">
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              {/* Offer badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm font-bold shadow mb-4">
                <span>$30 first order</span>
                <span className="opacity-60">·</span>
                <span className="line-through opacity-60 font-normal">${REGULAR_PRICE}</span>
              </div>

              {/* Delivery badge */}
              <div className="flex items-center gap-2 text-sm font-medium text-primary mb-5">
                <Truck className="h-4 w-4 shrink-0" />
                <span>Hyde Park &amp; Chicago-wide delivery · every Wednesday</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-4">
                Your first produce box:{" "}
                <span className="text-primary">$30.</span>
              </h1>

              <p className="text-xl text-foreground/75 mb-8 leading-relaxed">
                Seasonal produce from Black farmers, delivered to your door in
                Hyde Park and across Chicago. Starter Box — normally $
                {REGULAR_PRICE}. First-order pricing.
              </p>

              <CTAButton />

              <p className="mt-3 text-xs text-muted-foreground">
                No subscription · Delivered this Wednesday · 100% freshness guarantee
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What's in the box */}
      <section className="py-14 bg-muted/30">
        <div className="container px-6 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Leaf className="h-5 w-5 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                This week&apos;s Starter Box
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              What&apos;s inside your $30 box
            </h2>

            <div className="rounded-2xl bg-background shadow-sm border border-border overflow-hidden">
              <div className="relative">
                <img
                  src="/images/produce-box.jpg"
                  alt="Starter Box — fresh seasonal produce"
                  className="w-full h-52 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-4 left-5">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    ~12–15 lbs · perfect for 1–2 people
                  </span>
                </div>
              </div>

              <ul className="p-6 space-y-3">
                {starterBox.items.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-primary" />
                    </span>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="px-6 pb-6">
                <div className="flex items-center justify-between rounded-xl bg-muted/50 px-5 py-3 text-sm">
                  <span className="text-muted-foreground">First order price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-primary">${FIRST_ORDER_PRICE}</span>
                    <span className="line-through text-muted-foreground text-sm">${REGULAR_PRICE}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-12 border-y border-border">
        <div className="container px-6 max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              {
                icon: <Truck className="h-6 w-6 text-primary mx-auto mb-2" />,
                title: "Wednesday delivery",
                body: "Order any day — arrives fresh every Wednesday, right to your door.",
              },
              {
                icon: <ShieldCheck className="h-6 w-6 text-primary mx-auto mb-2" />,
                title: "100% freshness guarantee",
                body: "If anything is off, email us and we make it right. No questions asked.",
              },
              {
                icon: <Star className="h-6 w-6 text-primary mx-auto mb-2 fill-primary" />,
                title: "No subscription",
                body: "Every box is a one-time order. Buy once, see how you like it.",
              },
            ].map(({ icon, title, body }) => (
              <div key={title}>
                {icon}
                <p className="font-semibold text-sm mb-1">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-14 bg-muted/20">
        <div className="container px-6 max-w-xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-primary text-primary" />
              ))}
            </div>
            <blockquote className="text-lg font-medium leading-relaxed mb-4 text-foreground/90">
              &ldquo;{testimonial.quote}&rdquo;
            </blockquote>
            <p className="text-sm text-muted-foreground font-medium">
              {testimonial.name} &mdash; {testimonial.location}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-primary/5">
        <div className="container px-6 max-w-xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-xs font-bold mb-4">
              $30 first order · normally ${REGULAR_PRICE}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Ready for fresh produce?
            </h2>
            <p className="text-muted-foreground mb-7">
              Hyde Park delivery · order today, delivered this Wednesday.
            </p>
            <CTAButton className="w-full sm:w-auto" />
            <p className="mt-4 text-xs text-muted-foreground">
              No subscription · No commitment · Cancel anytime by not reordering
            </p>
          </motion.div>
        </div>
      </section>

      {/* Minimal footer */}
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} Uncle May&apos;s Produce &middot;{" "}
          <a href="mailto:info@unclemays.com" className="hover:text-primary transition-colors">
            info@unclemays.com
          </a>{" "}
          &middot; Chicago, IL
        </p>
      </footer>
    </div>
  );
}
