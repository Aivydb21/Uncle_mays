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
  // Homepage Pricing is one-time-only as of April 2026. Stripe data showed
  // 14 of 15 real subscription attempts abandoning at the payment form,
  // multiple customers explicitly saying they didn't want a recurring
  // commitment, and one (Nicole) writing back unprompted to confirm the
  // pattern. Subscription routes still exist (Doina is on $55/wk and
  // /subscribe/[product] still works), but they're no longer surfaced to
  // cold traffic.
  //
  // The deep-link path is preserved: visiting "/?mode=subscription" flips
  // this component into subscription pricing for paid ads / direct emails
  // that explicitly target subscribe-ready customers. The toggle UI is
  // hidden — there's no way to switch modes on the page itself.
  const [isSubscription, setIsSubscription] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "subscription") setIsSubscription(true);
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
            Now Delivering Across the Chicago Metro Area
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Box</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Seasonal produce, sourced directly from our Black farmer partners, delivered across the Chicago metro area every Wednesday.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            Use code <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs font-bold tracking-wider">FRESH10</span> for $10 off your first box
          </div>
        </motion.div>

        {/* Toggle removed April 2026. Microcopy below conveys the same
            "no commitment" reassurance without surfacing the subscription
            option at the discovery step. Visitors arriving via
            "?mode=subscription" still see subscription pricing because
            isSubscription is set in useEffect above. */}
        <p className="text-center text-sm text-muted-foreground mb-8">
          {isSubscription
            ? "Free delivery. Cancel anytime."
            : "Free delivery. One-time order, no subscription, no auto-renewal."}
        </p>

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
                    {product.items.map((feature) => {
                      // Star icon (no border wrap) on items marked "(included)"
                      // so the chicken inclusion on Full Harvest stands out
                      // without the heavy bordered card treatment. All other
                      // items, including "Everything in the Spring Box", use
                      // the regular checkmark.
                      const isIncluded = feature.includes("(included)");
                      return (
                        <li key={feature} className="flex items-start gap-3">
                          {isIncluded ? (
                            <span className="text-primary flex-shrink-0 mt-0.5 text-xl leading-none">★</span>
                          ) : (
                            <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          )}
                          <span className={isIncluded ? "font-semibold text-foreground" : "text-foreground/80"}>
                            {feature}
                          </span>
                        </li>
                      );
                    })}
                    <li className="text-xs text-muted-foreground italic mt-2 pt-2 border-t border-border/50">
                      {product.weightEstimate}
                    </li>
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
                        ? `Subscribe ${sub}/wk`
                        : `Order Now ${oneTime}`}
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
          Add chicken, short ribs, or lamb chops at checkout. $12 per pound, pasture-raised, slaughtered fresh.
        </p>

        {/* Produce box image removed 2026-04-28 — Clarity recordings showed
            mobile users scrolling past the pricing into the image area and
            losing interest. Image read as a distraction, not a hook. */}
      </div>
    </section>
  );
};
