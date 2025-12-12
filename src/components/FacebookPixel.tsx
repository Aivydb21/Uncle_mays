import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Facebook Pixel tracker component
 * Tracks PageView events on route changes for Single Page Application (SPA)
 */
export const FacebookPixel = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [location.pathname]);

  return null; // This component doesn't render anything
};

