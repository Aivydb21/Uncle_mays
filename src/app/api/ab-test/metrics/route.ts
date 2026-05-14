import { NextRequest, NextResponse } from "next/server";

/**
 * A/B Test Metrics Capture API
 *
 * Captures checkout funnel events for A/B test analysis. Currently stores
 * events in-memory (server restarts will clear data). For production scale,
 * migrate to PostgreSQL or append to a log file.
 *
 * Event types:
 * - session_start: User lands on checkout page
 * - checkout_step: User progresses through checkout (e.g., fills email, address)
 * - checkout_complete: User successfully completes payment
 * - checkout_abandon: User leaves checkout without completing
 * - payment_error: Payment attempt fails
 */

interface MetricsEvent {
  testId: string;
  variantId: string;
  sessionId: string;
  eventType: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// In-memory store for metrics events
// TODO: Migrate to PostgreSQL when test scales beyond POC
const metricsStore: MetricsEvent[] = [];
const MAX_EVENTS = 10000; // Prevent memory bloat

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const event: MetricsEvent = {
      testId: body.testId,
      variantId: body.variantId,
      sessionId: body.sessionId,
      eventType: body.eventType,
      timestamp: body.timestamp || new Date().toISOString(),
      metadata: body.metadata || {},
    };

    // Validate required fields
    if (!event.testId || !event.variantId || !event.sessionId || !event.eventType) {
      return NextResponse.json(
        { error: "Missing required fields: testId, variantId, sessionId, eventType" },
        { status: 400 }
      );
    }

    // Store event (with size limit to prevent memory issues)
    metricsStore.push(event);
    if (metricsStore.length > MAX_EVENTS) {
      metricsStore.shift(); // Remove oldest event
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("ab-test/metrics error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to retrieve metrics for analysis
 * Query params:
 *   - testId: Filter by test ID
 *   - variantId: Filter by variant ID
 *   - eventType: Filter by event type
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const testId = searchParams.get("testId");
    const variantId = searchParams.get("variantId");
    const eventType = searchParams.get("eventType");

    let filtered = metricsStore;

    if (testId) {
      filtered = filtered.filter((e) => e.testId === testId);
    }
    if (variantId) {
      filtered = filtered.filter((e) => e.variantId === variantId);
    }
    if (eventType) {
      filtered = filtered.filter((e) => e.eventType === eventType);
    }

    // Calculate summary statistics
    const summary = calculateSummary(filtered);

    return NextResponse.json({
      events: filtered,
      summary,
      totalEvents: metricsStore.length,
    });
  } catch (err) {
    console.error("ab-test/metrics GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Calculate summary statistics for the filtered events
 */
function calculateSummary(events: MetricsEvent[]) {
  const sessionIds = new Set(events.map((e) => e.sessionId));
  const completions = events.filter((e) => e.eventType === "checkout_complete");
  const errors = events.filter((e) => e.eventType === "payment_error");

  const uniqueSessions = sessionIds.size;
  const completionCount = new Set(
    completions.map((e) => e.sessionId)
  ).size;
  const errorCount = new Set(errors.map((e) => e.sessionId)).size;

  const completionRate = uniqueSessions > 0 ? (completionCount / uniqueSessions) * 100 : 0;
  const errorRate = uniqueSessions > 0 ? (errorCount / uniqueSessions) * 100 : 0;

  return {
    uniqueSessions,
    completions: completionCount,
    completionRate: Math.round(completionRate * 100) / 100,
    errors: errorCount,
    errorRate: Math.round(errorRate * 100) / 100,
  };
}
