"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * MobileCTA — sticky bottom bar shown on mobile only.
 * Appears after the user scrolls past the hero (~300px).
 * Keeps the shop CTA thumb-reachable at all times on mobile.
 * Routes the customer straight into the build-your-own catalog.
 */
export const MobileCTA = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur border-t border-border/50 px-3 py-3 shadow-medium"
        >
          <Link
            href="/shop"
            className="flex w-full flex-col items-center justify-center rounded-xl bg-primary text-primary-foreground py-3 text-center shadow-soft"
          >
            <span className="text-xs opacity-80">Build your own order</span>
            <span className="text-base font-bold">Shop the catalog · $25 min</span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
