"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { DeadlineCountdown } from "@/components/DeadlineCountdown";
import { PRODUCTS } from "@/lib/products";

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    gtag: (...args: unknown[]) => void;
  }
}

const produceBoxImage = "/images/produce-box.jpg";

const plans = [
  {
    name: "Starter Box",
    description: "A focused weekly haul for 1–2 people",
    oneTimePrice: "$35",
    subPrice: "$31.50",
    subFrequency: "/wk",
    priceAnchor: "Updated weekly · Spring/Summer mix",
    features: [
      "Collard greens — 1 bunch",
      "Asparagus — 1 lb",
      "Spring onions — 1 bunch",
      "Heirloom cherry tomatoes — 1 pint",
      "Persian cucumbers — 4 ct",
      "Snap peas — 1/2 lb",
    ],
    checkoutSlug: "starter",
  },
  {
    name: "Family Box",
    description: "Feeds a family of 4. Enough variety to fill out the week",
    oneTimePrice: "$65",
    subPrice: "$58.50",
    subFrequency: "/wk",
    priceAnchor: "Updated weekly · Spring/Summer mix",
    features: [
      "Collard greens — 2 bunches",
      "Asparagus — 1.5 lb",
      "Spring onions — 2 bunches",
      "Heirloom cherry tomatoes — 1 pint",
      "Persian cucumbers — 6 ct",
      "Snap peas — 1 lb",
      "Rainbow chard — 1 bunch",
      "Strawberries — 1 quart",
      "Early beets with tops — 1 bunch",
      "Zucchini — 2 ct",
      "Farm eggs — 1 dozen",
      "Pasture-raised whole chicken — included",
    ],
    popular: true,
    proteinAddon: "included-chicken" as const,
    checkoutSlug: "family",
  },
  {
    name: "Community Box",
    description: "Specialty and heirloom varieties for the adventurous cook",
    oneTimePrice: "$95",
    subPrice: "$85.50",
    subFrequency: "/wk",
    priceAnchor: "Updated weekly · Spring/Summer mix",
    features: [
      "Watermelon radishes — 1 bunch",
      "Fairy tale eggplant — 1/2 lb",
      "Shishito peppers — 1/2 lb",
      "Hakurei turnips with greens — 1 bunch",
      "Sunburst cherry tomatoes — 1 pint",
      "Pattypan squash — 1/2 lb",
      "Dragon tongue beans — 1/2 lb",
      "Rainbow chard — 1 bunch",
      "Heirloom cucumber — 2 ct",
      "Ramps — 1/2 lb",
      "Farm eggs — 1 dozen",
    ],
    proteinAddon: "included-choice" as const,
    checkoutSlug: "community",
  },
];

export const Pricing = () => {
  const searchParams = useSearchParams();
  const [isSubscription, setIsSubscription] = useState(
    searchParams.get("mode") === "subscription"
  );
  const router = useRouter();

  const handleOrder = (plan: typeof plans[0]) => {
    // Extract price value from string (e.g., "$35" -> 35)
    const price = parseFloat(isSubscription ? plan.subPrice.replace('$', '') : plan.oneTimePrice.replace('$', ''));

    // Fire tracking events
    try {
      if (typeof window !== "undefined") {
        // Meta Pixel
        if (window.fbq) window.fbq("track", "InitiateCheckout");

        // GA4 begin_checkout event with enhanced e-commerce parameters
        if (window.gtag) {
          window.gtag("event", "begin_checkout", {
            currency: "USD",
            value: price,
            items: [{
              item_id: plan.checkoutSlug,
              item_name: plan.name,
              affiliation: "Uncle May's Produce",
              price: price,
              quantity: 1,
              item_category: "Produce Box",
            }]
          });
        }
      }
    } catch {
      // Never block checkout for tracking failures
    }

    if (isSubscription) {
      router.push(`/subscribe/${plan.checkoutSlug}`);
    } else {
      // One-time purchase: use embedded Stripe Elements checkout
      router.push(`/checkout/${plan.checkoutSlug}`);
    }
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
          {/* Live availability badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-sm font-semibold text-primary mb-6">
            Now Delivering Across Chicago
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Box</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Seasonal, rotating produce sourced directly from Black farmers and delivered to your Chicago door every Wednesday.
          </p>
          <div className="flex justify-center mt-4">
            <DeadlineCountdown variant="inline" />
          </div>
        </motion.div>

        {/* Subscription / One-Time toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center rounded-xl bg-card border border-border shadow-soft p-1 gap-1">
            <button
              onClick={() => setIsSubscription(true)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isSubscription
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Subscribe &amp; Save
              <span className="ml-1.5 text-xs font-normal opacity-80">10% off</span>
            </button>
            <button
              onClick={() => setIsSubscription(false)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                !isSubscription
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              One-Time Box
            </button>
          </div>
        </div>

        {isSubscription && (
          <p className="text-center text-sm text-muted-foreground mb-8 -mt-6">
            Free delivery. Cancel anytime.
          </p>
        )}

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-10">
          {plans.map((plan, index) => (
            <div key={index} className="relative z-10">
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
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-6">{plan.description}</p>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-5xl font-bold text-primary">
                      {isSubscription ? plan.subPrice : plan.oneTimePrice}
                    </span>
                    {isSubscription && (
                      <span className="text-muted-foreground text-base">{plan.subFrequency}</span>
                    )}
                  </div>
                  {isSubscription && (
                    <p className="text-xs text-muted-foreground line-through">
                      {plan.oneTimePrice} one-time
                    </p>
                  )}
                  <p className="text-xs font-medium text-primary/80 mt-1">{plan.priceAnchor}</p>
                  <p className="text-sm text-primary/80 font-medium mt-2">
                    {PRODUCTS[plan.checkoutSlug as keyof typeof PRODUCTS].servingNote}
                  </p>
                  <p className="text-sm font-semibold mt-3">
                    Order by Tuesday 11:59pm. Delivered this Wednesday.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    100% freshness guarantee. Not happy? Full refund, no questions.
                  </p>
                </div>
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.proteinAddon === "included-chicken" && (
                  <p className="text-xs text-primary/70 font-medium text-center mb-2">
                    🍗 Whole chicken included — no extra charge
                  </p>
                )}
                {plan.proteinAddon === "included-choice" && (
                  <p className="text-xs text-primary/70 font-medium text-center mb-2">
                    🥩 Your choice of protein included — chicken, pork, beef, or salmon
                  </p>
                )}
                <p className="text-xs text-muted-foreground text-center mb-4">
                  🔒 Checkout is handled securely through Stripe. Takes under 60 seconds.
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOrder(plan);
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
                      ? `Subscribe — ${plan.subPrice}/wk`
                      : `Order Now — ${plan.oneTimePrice}`}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Tier recommendation bar */}
        <div className="max-w-6xl mx-auto mt-4 rounded-xl bg-muted/50 px-6 py-3 text-sm text-muted-foreground text-center">
          <span className="font-semibold text-foreground">Not sure which box?</span>{" "}
          1-2 people: Starter. &middot; Family of 4: Family (chicken included, best value). &middot; Large household or splitting with neighbors: Community.
        </div>

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
            alt="Fresh seasonal produce box filled with colorful vegetables from Black-owned farms"
            className="w-full h-64 object-cover"
          />
        </motion.div>
      </div>

    </section>
  );
};
