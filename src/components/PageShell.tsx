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

export function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const isLandingPage = LANDING_PAGE_PATHS.includes(pathname);

  return (
    <div className="flex min-h-screen flex-col">
      {!isLandingPage && <Navigation />}
      <main className="flex-1">{children}</main>
      {!isLandingPage && <Footer />}
      {!isLandingPage && <MobileCTA />}
    </div>
  );
}
