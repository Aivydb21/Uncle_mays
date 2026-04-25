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
      { source: "/products/:slug*", destination: "/#boxes", permanent: false },
      // /shop and /starter-box: legacy landing pages superseded by
      // /get-started for cold traffic and /#boxes for warm traffic.
      { source: "/shop", destination: "/#boxes", permanent: false },
      { source: "/starter-box", destination: "/get-started", permanent: false },
    ];
  },
};

export default nextConfig;
