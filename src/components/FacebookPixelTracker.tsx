"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export const FacebookPixelTracker = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Capture UTM params to localStorage on every page load so they survive
  // through the Stripe redirect and are available at checkout submission time.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      UTM_KEYS.forEach((k) => {
        const val = searchParams.get(k);
        if (val) localStorage.setItem(`unc-${k}`, val);
      });
    } catch {
      // ignore storage errors
    }
  }, [searchParams]);

  // Skip the first mount: the inline Meta Pixel init script in layout.tsx
  // already fires PageView on initial load. Firing here too would double-count.
  // Fire on subsequent client-side route changes only.
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [pathname]);

  return null;
};
