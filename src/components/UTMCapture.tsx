"use client";

import { useEffect } from "react";
import { captureUTMParams } from "@/lib/utm";

/**
 * Captures UTM parameters from URL on page load and stores in sessionStorage
 * for attribution tracking through the checkout flow.
 */
export function UTMCapture() {
  useEffect(() => {
    // Capture UTM params on initial page load
    captureUTMParams();
  }, []);

  return null; // No UI, just runs the capture logic
}
