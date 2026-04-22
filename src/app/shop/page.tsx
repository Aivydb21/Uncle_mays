"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Truck,
  ShieldCheck,
  Star,
  Check,
  ArrowRight,
  Leaf,
  Users,
} from "lucide-react";
import { PRODUCTS, type ProductSlug } from "@/lib/products";

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    gtag: (...args: unknown[]) => void;
  }
}

const boxes: {
  slug: ProductSlug;
  description: string;
  servings: string;
  popular?: boolean;
  proteinNote?: string;
}[] = [
  {
    slug: "starter",
    description: "A focused weekly haul for 1-2 people",
    servings: "~12-15 lbs",
  },
  {
    slug: "family",
    description: "Feeds a family of 4. Enough variety to fill out the week",
    servings: "~22-26 lbs",
    popular: true,
    proteinNote: "Whole chicken included",
  },
  {
    slug: "community",
    description: "Specialty and heirloom varieties for the adventurous cook",
    servings: "~30-35 lbs",
    proteinNote: "Your choice of protein included",
  },
];

const testimonials = [
  {
    quote:
      "I ordered the Starter Box on a Monday and it was on my porch by Wednesday afternoon. Everything was fresh, nothing wilted. The asparagus and greens were gone in two days.",
    name: "Rob",
    location: "Bronzeville",
  },
  {
    quote:
      "The Family Box feeds my household for most of the week. The chicken is restaurant quality. We cancelled our other grocery delivery.",
    name: "Keisha",
    location: "Hyde Park",
  },
  {
    quote:
      "Ramps, fairy tale eggplant, dragon tongue beans. Produce I never see at the store. Worth every penny.",
    name: "Marcus",
    location: "South Shore",
  },
];

function fireTrackingEvent(slug: string, name: string, price: number) {
  try {
    if (typeof window === "undefined") return;
    if (window.fbq) {
      window.fbq("track", "InitiateCheckout", {
        content_name: name,
        content_ids: [slug],
        content_type: "product",
        value: price,
        currency: "USD",
      });
    }
    if (window.gtag) {
      window.gtag("event", "begin_checkout", {
        currency: "USD",
        value: price,
        items: [
          {
            item_id: slug,
            item_name: name,
            affiliation: "Uncle May's Produce",
            price,
            quantity: 1,
            item_category: "Produce Box",
          },
        ],
      });
    }
  } catch {
    // Never block navigation for tracking failures
  }
}

export default function ShopLandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Minimal header */}
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
            alt="Fresh seasonal produce box from Black farmers delivered in Chicago"
            className="absolute inset-0 h-full w-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/96 to-background/80" />
        </div>

        <div className="relative z-10 container px-6 py-16 md:py-24">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm font-bold shadow mb-4">
                <span>Starter Box: $30 first order</span>
                <span className="opacity-60">.</span>
                <span className="line-through opacity-60 font-normal">$35</span>
              </div>

              <div className="flex items-center gap-2 text-sm font-medium text-primary mb-5">
                <Truck className="h-4 w-4 shrink-0" />
                <span>
                  Chicago-wide delivery every Wednesday
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4">
                Fresh produce from Black farmers.{" "}
                <span className="text-primary">Delivered.</span>
              </h1>

              <p className="text-lg sm:text-xl text-foreground/75 mb-8 leading-relaxed">
                Three curated boxes, seasonal and rotating, sourced directly from
                Black farmers and delivered to your Chicago door. Pick your size
                below.
              </p>

              <a
                href="#boxes"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold text-lg rounded-xl px-8 py-4 shadow-lg hover:bg-primary/90 transition-all duration-200 active:scale-95"
              >
                See the Boxes
                <ArrowRight className="h-5 w-5" />
              </a>

              <p className="mt-3 text-xs text-muted-foreground">
                No subscription required. 100% freshness guarantee.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Box cards */}
      <section id="boxes" className="py-16 md:py-20 bg-muted/30">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Leaf className="h-5 w-5 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                This week&apos;s boxes
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Choose Your Box
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Seasonal, rotating produce delivered every Wednesday. Order any day,
              it ships the following Wednesday.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {boxes.map((box, idx) => {
              const product = PRODUCTS[box.slug];
              const price = product.price;
              const displayPrice =
                "firstOrderPrice" in product && product.firstOrderPrice
                  ? product.firstOrderPrice
                  : price;
              const hasDiscount = displayPrice < price;

              return (
                <motion.div
                  key={box.slug}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="relative"
                >
                  {box.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-white px-5 py-1 rounded-full text-xs font-bold z-10">
                      Most Popular
                    </div>
                  )}
                  <div
                    className={`bg-card rounded-2xl shadow-sm border overflow-hidden h-full flex flex-col ${
                      box.popular
                        ? "border-secondary border-2 shadow-md"
                        : "border-border"
                    }`}
                  >
                    {/* Box image */}
                    <div className="relative">
                      <img
                        src="/images/produce-box.jpg"
                        alt={`${product.name} - fresh seasonal produce`}
                        className="w-full h-44 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      <div className="absolute bottom-3 left-4">
                        <span className="bg-background/90 text-foreground text-xs font-semibold px-3 py-1 rounded-full">
                          {box.servings}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold mb-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {box.description}
                      </p>

                      {/* Price */}
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-3xl font-bold text-primary">
                          ${displayPrice}
                        </span>
                        {hasDiscount && (
                          <>
                            <span className="text-sm line-through text-muted-foreground">
                              ${price}
                            </span>
                            <span className="text-xs font-semibold text-primary/70">
                              first order
                            </span>
                          </>
                        )}
                      </div>

                      {/* Items list */}
                      <ul className="space-y-2 mb-5 flex-grow">
                        {product.items.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2 text-sm"
                          >
                            <span className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="h-2.5 w-2.5 text-primary" />
                            </span>
                            <span className="text-foreground/80">{item}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Protein note */}
                      {box.proteinNote && (
                        <p className="text-xs text-primary/70 font-medium text-center mb-3">
                          {box.proteinNote}
                        </p>
                      )}

                      {/* CTA */}
                      <Link
                        href={`/checkout/${box.slug}`}
                        onClick={() =>
                          fireTrackingEvent(box.slug, product.name, displayPrice)
                        }
                        className={`w-full inline-flex items-center justify-center gap-2 rounded-xl font-semibold h-12 px-6 transition-all duration-200 active:scale-[0.98] ${
                          box.popular
                            ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                            : "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        }`}
                      >
                        Order Now - ${displayPrice}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Want to subscribe and save 10%?{" "}
            <Link
              href="/#boxes"
              className="text-primary font-semibold hover:underline"
            >
              View subscription pricing
            </Link>
          </p>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-12 border-y border-border">
        <div className="container px-6 max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              {
                icon: <Truck className="h-6 w-6 text-primary mx-auto mb-2" />,
                title: "Wednesday delivery",
                body: "Order any day. Arrives fresh every Wednesday.",
              },
              {
                icon: (
                  <ShieldCheck className="h-6 w-6 text-primary mx-auto mb-2" />
                ),
                title: "Freshness guarantee",
                body: "Not happy? Full refund, no questions asked.",
              },
              {
                icon: (
                  <Star className="h-6 w-6 text-primary mx-auto mb-2 fill-primary" />
                ),
                title: "No subscription",
                body: "Every box is one-time. Buy once, see how you like it.",
              },
              {
                icon: <Users className="h-6 w-6 text-primary mx-auto mb-2" />,
                title: "Black-farmed",
                body: "Sourced directly from Black farmers across the Midwest.",
              },
            ].map(({ icon, title, body }) => (
              <div key={title}>
                {icon}
                <p className="font-semibold text-sm mb-1">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-14 bg-muted/20">
        <div className="container px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
              What Chicago is saying
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="bg-card rounded-xl border border-border p-6"
                >
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <blockquote className="text-sm leading-relaxed text-foreground/85 mb-4">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <p className="text-xs text-muted-foreground font-medium">
                    {t.name}, {t.location}
                  </p>
                </div>
              ))}
            </div>
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
              Starter Box: $30 first order
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Ready for fresh produce?
            </h2>
            <p className="text-muted-foreground mb-7">
              Chicago delivery every Wednesday. Pick your box above, or start
              with the most popular:
            </p>
            <Link
              href="/checkout/family"
              onClick={() => fireTrackingEvent("family", "Family Box", 65)}
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold text-lg rounded-xl px-8 py-4 shadow-lg hover:bg-primary/90 transition-all duration-200 active:scale-95"
            >
              Order the Family Box - $65
              <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="mt-4 text-xs text-muted-foreground">
              No subscription. No commitment. 100% freshness guarantee.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Minimal footer */}
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} Uncle May&apos;s Produce &middot;{" "}
          <a
            href="mailto:info@unclemays.com"
            className="hover:text-primary transition-colors"
          >
            info@unclemays.com
          </a>{" "}
          &middot; Chicago, IL
        </p>
      </footer>
    </div>
  );
}
