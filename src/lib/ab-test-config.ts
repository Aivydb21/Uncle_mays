/**
 * A/B Test Configuration
 *
 * Centralized configuration for all active checkout experiments.
 * Each test has a unique ID, variant definitions, rollout percentage,
 * and rollback conditions.
 */

export interface ABTestVariant {
  id: string;
  name: string;
  weight: number; // 0-100, must sum to 100 across all variants
  description: string;
}

export interface ABTestConfig {
  id: string;
  name: string;
  description: string;
  active: boolean;
  variants: ABTestVariant[];
  rolloutPercentage: number; // 0-100, percentage of users enrolled in test
  rollbackConditions: {
    maxCompletionRateDropPercent?: number; // e.g., 5 = rollback if completion drops >5%
    maxPaymentErrorRatePercent?: number; // e.g., 10 = rollback if payment errors >10%
    minSampleSize?: number; // Wait for this many sessions before evaluating
  };
  startDate?: string; // ISO date
  endDate?: string; // ISO date
}

/**
 * Test 1: Apple Pay / Google Pay via Payment Request Button
 *
 * Hypothesis: Payment method friction is primary abandonment driver (30% expect wallet options)
 * Treatment: Add Apple Pay and Google Pay buttons above payment form
 * Metrics: Checkout completion rate, payment method distribution, time-to-complete
 * Sample size: Run until statistical significance at 95% confidence (~200-300 sessions)
 */
export const APPLE_PAY_TEST: ABTestConfig = {
  id: "checkout-apple-pay-v1",
  name: "Apple Pay / Google Pay Payment Request Button",
  description:
    "Show Apple Pay / Google Pay buttons above payment form for faster checkout",
  active: true, // Set to false to disable test and route 100% to control
  variants: [
    {
      id: "control",
      name: "Control (Standard Payment Form)",
      weight: 50,
      description: "Existing checkout flow with PaymentElement only",
    },
    {
      id: "treatment",
      name: "Treatment (Wallet Buttons + Payment Form)",
      weight: 50,
      description: "Payment Request Button (Apple Pay/Google Pay) + PaymentElement fallback",
    },
  ],
  rolloutPercentage: 100, // 100% of users see the test (50/50 split between variants)
  rollbackConditions: {
    maxCompletionRateDropPercent: 5, // Rollback if completion rate drops >5%
    maxPaymentErrorRatePercent: 10, // Rollback if payment errors exceed 10%
    minSampleSize: 50, // Collect at least 50 sessions per variant before evaluating
  },
  startDate: new Date().toISOString(),
  endDate: undefined, // Run until statistical significance
};

/**
 * All active tests. Add new test configs here as they're created.
 */
export const ACTIVE_TESTS: ABTestConfig[] = [
  APPLE_PAY_TEST,
  // Future tests (from UNC-1004 roadmap):
  // - Test 2: Delivery date picker earlier in flow
  // - Test 3: Pre-apply FRESH10 promo code
  // - Test 4: Trust signals above payment form
];

/**
 * Get a test config by ID
 */
export function getTestConfig(testId: string): ABTestConfig | undefined {
  return ACTIVE_TESTS.find((t) => t.id === testId);
}

/**
 * Get all active test IDs
 */
export function getActiveTestIds(): string[] {
  return ACTIVE_TESTS.filter((t) => t.active).map((t) => t.id);
}
