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
      // /starter-box: legacy landing page superseded by /get-started.
      { source: "/starter-box", destination: "/get-started", permanent: false },
      // (/shop redirect removed 2026-05-02: /shop is now the live custom-cart
      //  catalog page. Re-enable only if /shop is retired again.)
    ];
  },
};

export default nextConfig;
