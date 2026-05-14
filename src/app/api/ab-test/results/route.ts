import { NextRequest, NextResponse } from "next/server";
import { calculateSignificance, calculateSampleSize } from "@/lib/ab-test-stats";
import type { VariantStats } from "@/lib/ab-test-stats";

/**
 * A/B Test Results & Statistical Analysis API
 *
 * Returns aggregated metrics and statistical significance analysis for a given test.
 * This endpoint fetches data from the metrics API and calculates whether the
 * treatment variant shows statistically significant improvement over control.
 *
 * Query params:
 *   - testId: Test ID to analyze (required)
 *   - confidenceLevel: 90, 95, or 99 (default: 95)
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const testId = searchParams.get("testId");
    const confidenceLevelParam = searchParams.get("confidenceLevel");
    const confidenceLevel = [90, 95, 99].includes(Number(confidenceLevelParam))
      ? (Number(confidenceLevelParam) as 90 | 95 | 99)
      : 95;

    if (!testId) {
      return NextResponse.json(
        { error: "Missing required parameter: testId" },
        { status: 400 }
      );
    }

    // Fetch metrics from the metrics API
    const baseUrl = req.nextUrl.origin;
    const metricsRes = await fetch(`${baseUrl}/api/ab-test/metrics?testId=${testId}`);

    if (!metricsRes.ok) {
      throw new Error("Failed to fetch metrics");
    }

    const metricsData = await metricsRes.json();
    const events = metricsData.events || [];

    // Group events by variant
    const variantEvents: Record<string, typeof events> = {};
    for (const event of events) {
      if (!variantEvents[event.variantId]) {
        variantEvents[event.variantId] = [];
      }
      variantEvents[event.variantId].push(event);
    }

    // Calculate stats for each variant
    const variantStats: Record<string, VariantStats> = {};
    for (const [variantId, variantEventList] of Object.entries(variantEvents)) {
      const sessionIds = new Set(
        variantEventList.map((e: { sessionId: string }) => e.sessionId)
      );
      const completedSessions = new Set(
        variantEventList
          .filter((e: { eventType: string }) => e.eventType === "checkout_complete")
          .map((e: { sessionId: string }) => e.sessionId)
      );

      const sessions = sessionIds.size;
      const conversions = completedSessions.size;
      const conversionRate = sessions > 0 ? conversions / sessions : 0;

      variantStats[variantId] = {
        variantId,
        sessions,
        conversions,
        conversionRate,
      };
    }

    // Find control and treatment variants
    const control = variantStats["control"];
    const treatment = variantStats["treatment"];

    if (!control || !treatment) {
      return NextResponse.json({
        testId,
        variants: variantStats,
        error: "Missing control or treatment variant data",
        message: "Not enough data to calculate significance. Both control and treatment must have sessions.",
      });
    }

    // Calculate statistical significance
    const significance = calculateSignificance(control, treatment, confidenceLevel);

    // Calculate recommended sample size based on current baseline
    const baselineRate = control.conversionRate || 0.19; // Fallback to 19% if no data
    const minimumDetectableEffect = 0.2; // Detect 20% relative improvement
    const recommendedSampleSize = calculateSampleSize(baselineRate, minimumDetectableEffect);

    // Calculate progress toward sample size goal
    const progress = {
      controlSessions: control.sessions,
      treatmentSessions: treatment.sessions,
      targetPerVariant: recommendedSampleSize,
      controlProgress: control.sessions / recommendedSampleSize,
      treatmentProgress: treatment.sessions / recommendedSampleSize,
      isComplete: control.sessions >= recommendedSampleSize && treatment.sessions >= recommendedSampleSize,
    };

    return NextResponse.json({
      testId,
      confidenceLevel,
      variants: variantStats,
      significance,
      sampleSize: {
        recommended: recommendedSampleSize,
        current: {
          control: control.sessions,
          treatment: treatment.sessions,
        },
        progress,
      },
      rawEvents: events.length,
    });
  } catch (err) {
    console.error("ab-test/results error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
