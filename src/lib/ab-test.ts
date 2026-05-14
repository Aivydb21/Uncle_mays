/**
 * A/B Test Infrastructure
 *
 * Session-based variant assignment with deterministic hashing to ensure
 * users see consistent variants across page loads. Metrics are captured
 * to PostgreSQL via API routes for analysis.
 */

import type { ABTestConfig, ABTestVariant } from "./ab-test-config";

/**
 * Storage keys for localStorage
 */
const STORAGE_PREFIX = "unc_ab_";

/**
 * Simple hash function for deterministic variant assignment
 * Uses the same session across page loads
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Get or create a stable session ID for this browser
 * Stored in localStorage for consistency across page loads
 */
function getSessionId(): string {
  if (typeof window === "undefined") return "";

  const key = "unc_session_id";
  try {
    let sessionId = localStorage.getItem(key);
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      localStorage.setItem(key, sessionId);
    }
    return sessionId;
  } catch {
    // Fallback if localStorage is blocked
    return `fallback-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
}

/**
 * Assign a variant for the given test based on session ID
 * Uses deterministic hashing to ensure consistent assignment
 */
export function assignVariant(testConfig: ABTestConfig): ABTestVariant {
  if (typeof window === "undefined") {
    // SSR: return control variant
    return testConfig.variants.find((v) => v.id === "control") || testConfig.variants[0];
  }

  const storageKey = `${STORAGE_PREFIX}${testConfig.id}`;

  // Check if already assigned
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const variant = testConfig.variants.find((v) => v.id === stored);
      if (variant) return variant;
    }
  } catch {
    // Ignore storage errors
  }

  // Check rollout percentage
  const sessionId = getSessionId();
  const rolloutHash = hashString(`${testConfig.id}-rollout-${sessionId}`) % 100;

  if (rolloutHash >= testConfig.rolloutPercentage) {
    // User not in test, assign control
    const control = testConfig.variants.find((v) => v.id === "control") || testConfig.variants[0];
    try {
      localStorage.setItem(storageKey, control.id);
    } catch {
      // Ignore storage errors
    }
    return control;
  }

  // Assign variant based on weighted distribution
  const hash = hashString(`${testConfig.id}-${sessionId}`) % 100;
  let cumulative = 0;

  for (const variant of testConfig.variants) {
    cumulative += variant.weight;
    if (hash < cumulative) {
      try {
        localStorage.setItem(storageKey, variant.id);
      } catch {
        // Ignore storage errors
      }
      return variant;
    }
  }

  // Fallback (should never reach here if weights sum to 100)
  const fallback = testConfig.variants[0];
  try {
    localStorage.setItem(storageKey, fallback.id);
  } catch {
    // Ignore storage errors
  }
  return fallback;
}

/**
 * Get the assigned variant for a test (without assigning if not already assigned)
 */
export function getAssignedVariant(testId: string): string | null {
  if (typeof window === "undefined") return null;

  const storageKey = `${STORAGE_PREFIX}${testId}`;
  try {
    return localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

/**
 * Track an event for A/B test metrics
 */
export interface ABTestEvent {
  testId: string;
  variantId: string;
  eventType: "session_start" | "checkout_step" | "checkout_complete" | "checkout_abandon" | "payment_error";
  metadata?: Record<string, unknown>;
}

/**
 * Send an A/B test event to the metrics API
 */
export async function trackABTestEvent(event: ABTestEvent): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const sessionId = getSessionId();
    await fetch("/api/ab-test/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        ...event,
        sessionId,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch {
    // Metrics failures must never block user experience
  }
}

/**
 * Feature flag check: is a specific variant active for a test?
 */
export function isVariantActive(testId: string, variantId: string): boolean {
  const assigned = getAssignedVariant(testId);
  return assigned === variantId;
}
