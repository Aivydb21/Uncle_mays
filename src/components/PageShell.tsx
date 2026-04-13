"use client";

import { usePathname } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { MobileCTA } from "@/components/MobileCTA";

// Routes that suppress global navigation and footer (dedicated ad landing pages)
const LANDING_PAGE_PATHS = ["/starter-box"];

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
