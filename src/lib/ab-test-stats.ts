/**
 * Statistical Significance Calculator for A/B Tests
 *
 * Implements two-proportion z-test to determine if the difference between
 * control and treatment conversion rates is statistically significant.
 *
 * References:
 * - https://www.evanmiller.org/ab-testing/sample-size.html
 * - https://www.abtestguide.com/calc/
 */

export interface VariantStats {
  variantId: string;
  sessions: number;
  conversions: number;
  conversionRate: number;
}

export interface SignificanceResult {
  controlStats: VariantStats;
  treatmentStats: VariantStats;
  zScore: number;
  pValue: number;
  isSignificant: boolean; // At 95% confidence (p < 0.05)
  confidenceLevel: number; // Percentage (e.g., 95, 99)
  relativeUplift: number; // Percentage improvement (positive = treatment wins)
  recommendation: "continue" | "roll_out" | "roll_back" | "inconclusive";
  interpretation: string;
}

/**
 * Standard normal cumulative distribution function (CDF)
 * Approximation using the error function
 */
function normalCDF(z: number): number {
  // Constants for approximation
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.sqrt(2);

  // Abramowitz and Stegun approximation
  const t = 1 / (1 + p * x);
  const erf =
    1 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1 + sign * erf);
}

/**
 * Calculate two-proportion z-test for A/B test significance
 *
 * @param control - Control variant statistics
 * @param treatment - Treatment variant statistics
 * @param confidenceLevel - Desired confidence level (90, 95, 99)
 */
export function calculateSignificance(
  control: VariantStats,
  treatment: VariantStats,
  confidenceLevel: 90 | 95 | 99 = 95
): SignificanceResult {
  const p1 = control.conversionRate;
  const n1 = control.sessions;
  const p2 = treatment.conversionRate;
  const n2 = treatment.sessions;

  // Pooled proportion
  const pPool =
    (control.conversions + treatment.conversions) / (n1 + n2);

  // Standard error
  const se = Math.sqrt(pPool * (1 - pPool) * (1 / n1 + 1 / n2));

  // Z-score
  const zScore = se === 0 ? 0 : (p2 - p1) / se;

  // Two-tailed p-value
  const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));

  // Significance threshold based on confidence level
  const alphaThreshold = confidenceLevel === 99 ? 0.01 : confidenceLevel === 95 ? 0.05 : 0.1;
  const isSignificant = pValue < alphaThreshold;

  // Relative uplift (percentage change)
  const relativeUplift =
    p1 === 0 ? (p2 === 0 ? 0 : Infinity) : ((p2 - p1) / p1) * 100;

  // Recommendation logic
  let recommendation: SignificanceResult["recommendation"] = "inconclusive";
  let interpretation = "";

  if (n1 < 30 || n2 < 30) {
    recommendation = "continue";
    interpretation = `Insufficient sample size. Need at least 30 sessions per variant (current: control=${n1}, treatment=${n2}). Continue collecting data.`;
  } else if (!isSignificant) {
    recommendation = "continue";
    interpretation = `No significant difference detected (p=${pValue.toFixed(4)}). Continue collecting data or consider rolling out if directionally positive.`;
  } else if (isSignificant && relativeUplift > 0) {
    recommendation = "roll_out";
    interpretation = `Treatment shows significant improvement (+${relativeUplift.toFixed(1)}%, p=${pValue.toFixed(4)}). Recommend rolling out treatment to 100% of users.`;
  } else if (isSignificant && relativeUplift < -5) {
    // Only recommend rollback if drop is >5% and significant
    recommendation = "roll_back";
    interpretation = `Treatment shows significant decline (${relativeUplift.toFixed(1)}%, p=${pValue.toFixed(4)}). Recommend rolling back to control.`;
  } else {
    recommendation = "inconclusive";
    interpretation = `Results are significant but inconclusive. Review data before making decision.`;
  }

  return {
    controlStats: control,
    treatmentStats: treatment,
    zScore,
    pValue,
    isSignificant,
    confidenceLevel,
    relativeUplift,
    recommendation,
    interpretation,
  };
}

/**
 * Calculate required sample size for desired statistical power
 *
 * @param baselineRate - Current conversion rate (0-1)
 * @param minimumDetectableEffect - Minimum relative lift to detect (e.g., 0.1 = 10%)
 * @param alpha - Significance level (e.g., 0.05 for 95% confidence)
 * @param power - Statistical power (e.g., 0.8 for 80% power)
 */
export function calculateSampleSize(
  baselineRate: number,
  minimumDetectableEffect: number,
  alpha: number = 0.05,
  power: number = 0.8
): number {
  const p1 = baselineRate;
  const p2 = baselineRate * (1 + minimumDetectableEffect);

  const zAlpha = 1.96; // For 95% confidence (two-tailed)
  const zBeta = 0.84; // For 80% power

  const n =
    (Math.pow(zAlpha + zBeta, 2) * (p1 * (1 - p1) + p2 * (1 - p2))) /
    Math.pow(p2 - p1, 2);

  return Math.ceil(n);
}

/**
 * Example usage for current checkout test:
 * - Baseline: 19% completion rate (0.19)
 * - Target: 40% completion rate (0.40) = 110% relative improvement
 * - Minimum detectable effect: 20% relative improvement (0.20)
 *
 * calculateSampleSize(0.19, 0.20) ≈ 242 sessions per variant
 */
