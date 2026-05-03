import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Redirect retired routes to the active pricing section so old Meta ad
  // URLs and any organic backlinks don't 404. Add new entries here whenever
  // we retire a route that may still appear in external places.
  async redirects() {
    return [
      // /products/weekly-produce-box: never existed as a route but was
      // referenced by older Meta ad creatives that are now paused.
      { source: "/products/:slug*", destination: "/shop", permanent: false },
      // /starter-box: legacy landing page superseded by /get-started.
      { source: "/starter-box", destination: "/get-started", permanent: false },
      // Legacy /checkout/[product]/** routes (the pre-cart 2-step flow) were
      // deleted 2026-05-02. Old Meta/Google ad URLs and customer bookmarks
      // still reference these paths; route them to the new catalog.
      { source: "/checkout/starter", destination: "/shop", permanent: false },
      { source: "/checkout/family", destination: "/shop", permanent: false },
      { source: "/checkout/community", destination: "/shop", permanent: false },
      { source: "/checkout/:product/delivery", destination: "/shop", permanent: false },
      { source: "/checkout/:product/payment", destination: "/shop", permanent: false },
      // Legacy /subscribe/[product]/{delivery,payment} subroutes were deleted
      // 2026-05-02. Parent /subscribe/[product] still serves the "paused"
      // banner so deep-linked confirmation emails still resolve.
      { source: "/subscribe/:product/delivery", destination: "/subscribe/:product", permanent: false },
      { source: "/subscribe/:product/payment", destination: "/subscribe/:product", permanent: false },
    ];
  },
};

export default nextConfig;
