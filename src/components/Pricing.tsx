"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { PRODUCTS, type ProductSlug } from "@/lib/products";

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    gtag: (...args: unknown[]) => void;
  }
}

const produceBoxImage = "/images/produce-box.jpg";

// Two tiers only. Box contents are the single source of truth in
// src/lib/products.ts — do not duplicate item lists here.
const plans: Array<{
  slug: ProductSlug;
  description: string;
  popular?: boolean;
}> = [
  {
    slug: "starter",
    description: "Weekly greens, roots, and pantry staples for 1–2 people",
  },
  {
    slug: "family",
    description: "A full week of produce for a household of 3–4",
    popular: true,
  },
];

function formatPrice(n: number) {
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
}

export const Pricing = () => {
  const [isSubscription, setIsSubscription] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    if (mode === "subscription") setIsSubscription(true);
    else if (mode === "one-time" || mode === "onetime") setIsSubscription(false);
  }, []);

  const handleOrder = (slug: ProductSlug) => {
    const product = PRODUCTS[slug];
    const price = isSubscription ? product.subPrice : product.price;

    try {
      if (typeof window !== "undefined") {
        if (window.fbq) {
          window.fbq("track", "AddToCart", {
            content_name: product.name,
            content_ids: [slug],
            content_type: "product",
            value: price,
            currency: "USD",
          });
        }
        if (window.gtag) {
          window.gtag("event", "select_item", {
            item_list_name: "Home - Pricing",
            items: [{
              item_id: slug,
              item_name: product.name,
              affiliation: "Uncle May's Produce",
              price: price,
              quantity: 1,
              item_category: "Produce Box",
            }],
          });
        }
      }
    } catch {
      // Never block checkout for tracking failures
    }

    router.push(isSubscription ? `/subscribe/${slug}` : `/checkout/${slug}`);
  };

  return (
    <section id="boxes" className="py-24 bg-muted/30 relative" style={{ zIndex: 1 }}>
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-sm font-semibold text-primary mb-6">
            Now Delivering Across Chicago
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Box</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Seasonal produce, sourced directly from our Black farmer partners, delivered to your Chicago door every Wednesday.
          </p>
        </motion.div>

        {/* One-Time / Subscribe toggle */}
        <div className="flex flex-col items-center mb-8">
          <div className="inline-flex items-center rounded-xl bg-card border border-border shadow-soft p-1 gap-1">
            <button
              type="button"
              onClick={() => setIsSubscription(false)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                !isSubscription
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              One-Time Box
            </button>
            <button
              type="button"
              onClick={() => setIsSubscription(true)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isSubscription
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-primary/90 hover:text-primary"
              }`}
            >
              Subscribe &amp; Save
              <span className={`ml-1.5 text-xs font-bold px-1.5 py-0.5 rounded ${
                isSubscription
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-primary/15 text-primary"
              }`}>
                10% off
              </span>
            </button>
          </div>

          <p className="mt-3 text-center text-sm text-muted-foreground">
            {isSubscription
              ? "Free delivery. Cancel anytime."
              : "Free delivery. Order when you want."}
          </p>
        </div>

        {/* Two tiers side-by-side */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-10">
          {plans.map((plan) => {
            const product = PRODUCTS[plan.slug];
            const oneTime = formatPrice(product.price);
            const sub = formatPrice(product.subPrice);
            return (
              <div key={plan.slug} className="relative z-10">
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-secondary text-white px-6 py-1.5 rounded-full text-sm font-semibold z-20">
                    Most Popular
                  </div>
                )}
                <div
                  className={`bg-card rounded-2xl p-8 shadow-soft h-full flex flex-col relative z-10 ${
                    plan.popular ? "border-2 border-secondary shadow-medium" : ""
                  }`}
                >
                  <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                  <p className="text-muted-foreground mb-6">{plan.description}</p>
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-5xl font-bold text-primary">
                        {isSubscription ? sub : oneTime}
                      </span>
                      {isSubscription && (
                        <span className="text-muted-foreground text-base">/wk</span>
                      )}
                    </div>
                    {isSubscription && (
                      <p className="text-xs text-muted-foreground line-through">
                        {oneTime} one-time
                      </p>
                    )}
                    <p className="text-sm text-primary/80 font-medium mt-2">
                      {product.servingNote}
                    </p>
                  </div>
                  <ul className="space-y-3 mb-8 flex-grow">
                    {product.items.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOrder(plan.slug);
                    }}
                    className={`w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-semibold h-12 px-6 py-3 transition-all duration-300 ${
                      plan.popular
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-medium"
                        : "border-2 border-primary bg-background text-primary hover:bg-primary hover:text-primary-foreground shadow-soft"
                    }`}
                    style={{ cursor: "pointer", zIndex: 9999, position: "relative" }}
                  >
                    <span className="text-center">
                      {isSubscription
                        ? `Subscribe — ${sub}/wk`
                        : `Order Now — ${oneTime}`}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* One-line protein add-on note — explicit so customers know protein is
            available without cluttering the tier cards with pricing tables. */}
        <p className="text-center text-sm text-muted-foreground mb-10 max-w-xl mx-auto">
          Add a pasture-raised chicken, short ribs, or lamb chops at checkout.
        </p>

        {/* Produce box image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-medium"
        >
          <img
            src={produceBoxImage}
            alt="Fresh seasonal produce box filled with greens and roots from Black-owned farms"
            className="w-full h-64 object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
};
