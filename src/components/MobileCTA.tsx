import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * MobileCTA — sticky bottom bar shown on mobile only.
 * Appears after the user scrolls past the hero (~300px).
 * Keeps the shop CTA thumb-reachable at all times on mobile.
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
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur border-t border-border/50 px-4 py-3 shadow-medium"
        >
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate">
                Fresh produce from Black farmers, delivered to your door.
              </p>
            </div>
            <Button
              size="sm"
              className="flex-shrink-0 font-semibold text-sm px-4 py-2 rounded-lg"
              asChild
            >
              <a href="#boxes">Order Now</a>
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
