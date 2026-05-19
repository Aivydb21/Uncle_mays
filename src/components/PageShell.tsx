"use client";

import { usePathname } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { MobileCTA } from "@/components/MobileCTA";

// Routes that suppress global navigation and footer (dedicated ad landing
// pages). Currently empty: /shop and /starter-box used to be here but are
// now next.config redirects, so they never reach this component. Add a
// path here if a future cold-traffic ad landing page should render
// without the site chrome.
const LANDING_PAGE_PATHS: string[] = [];

// Routes inside the active conversion funnel. The footer is hidden on
// mobile here (Clarity 2026-04-28: mobile users were scrolling into the
// footer dead-area below the boxes and bouncing). Desktop keeps the
// footer because real-estate isn't the constraint there.
function isInCheckoutFunnel(pathname: string): boolean {
  return pathname.startsWith("/checkout/") || pathname.startsWith("/subscribe/");
}

export function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const isLandingPage = LANDING_PAGE_PATHS.includes(pathname);
  const inFunnel = isInCheckoutFunnel(pathname);
  // MobileCTA is the "Shop the catalog" thumb-reach button used on top-of-
  // funnel pages (home, faq, about). It must NOT render on /shop (the
  // catalog page renders its own MobileCartTotal which links to /checkout
  // — MobileCTA was overlaying it at z-50 > z-40 and re-routing customers
  // back to /shop, breaking the bottom-of-funnel conversion path) or on
  // /checkout itself (where it would be nonsensical).
  const showMobileCTA =
    !isLandingPage && pathname !== "/shop" && pathname !== "/checkout" && !inFunnel;

  return (
    <div className="flex min-h-screen flex-col">
      {!isLandingPage && <Navigation />}
      <main className="flex-1">{children}</main>
      {!isLandingPage && (
        <div className={inFunnel ? "hidden md:block" : ""}>
          <Footer />
        </div>
      )}
      {showMobileCTA && <MobileCTA />}
    </div>
  );
}
