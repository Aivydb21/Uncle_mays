# Checkout A/B Test Infrastructure Documentation

## Overview

This document describes the A/B testing infrastructure for the checkout flow, including Test 1 (Apple Pay / Google Pay Payment Request Button).

**Status:** Ready for board approval
**Created:** 2026-05-12
**Test ID:** `checkout-apple-pay-v1`

---

## Architecture

### Components

1. **Variant Assignment** (`src/lib/ab-test.ts`)
   - Deterministic hash-based assignment using session ID
   - Ensures consistent variant across page reloads
   - Stored in localStorage for persistence

2. **Test Configuration** (`src/lib/ab-test-config.ts`)
   - Centralized test definitions
   - Rollout percentage, variant weights, rollback conditions
   - Single source of truth for all active tests

3. **Metrics Capture** (`src/app/api/ab-test/metrics/route.ts`)
   - In-memory event store (upgrade to PostgreSQL for scale)
   - Tracks: session_start, checkout_complete, payment_error
   - Never blocks user experience (fire-and-forget)

4. **Statistical Analysis** (`src/lib/ab-test-stats.ts`)
   - Two-proportion z-test for significance
   - Sample size calculator
   - Confidence intervals at 90%, 95%, 99%

5. **Results Dashboard** (`src/app/api/ab-test/results/route.ts`)
   - Aggregated metrics by variant
   - Statistical significance calculation
   - Recommendation engine (continue/roll_out/roll_back)

---

## Test 1: Apple Pay / Google Pay

### Hypothesis
Payment method friction is the primary driver of 70% cart abandonment. 30% of users expect wallet payment options (Apple Pay, Google Pay).

### Treatment
Add Payment Request Button above the standard payment form. Users with compatible devices see a prominent wallet button for one-tap checkout.

### Metrics
- **Primary:** Checkout completion rate (target: 40%, baseline: 19%)
- **Secondary:** Payment method distribution, time-to-complete, payment error rate

### Variants
- **Control (50%):** Standard PaymentElement only
- **Treatment (50%):** Payment Request Button + PaymentElement fallback

### Sample Size
- **Target:** ~242 sessions per variant (for 20% minimum detectable effect at 95% confidence)
- **Estimated duration:** 1-2 weeks at current traffic (512 landing page views/week)

### Rollback Conditions
Test automatically recommends rollback if:
1. Completion rate drops >5% (statistically significant)
2. Payment error rate exceeds 10%
3. Sample size < 50 per variant (insufficient data)

---

## Monitoring Test Results

### API Endpoints

#### 1. View Raw Metrics
```bash
# All events for a test
GET /api/ab-test/metrics?testId=checkout-apple-pay-v1

# Filter by variant
GET /api/ab-test/metrics?testId=checkout-apple-pay-v1&variantId=treatment

# Filter by event type
GET /api/ab-test/metrics?testId=checkout-apple-pay-v1&eventType=checkout_complete
```

#### 2. View Statistical Analysis
```bash
# Get significance results (default 95% confidence)
GET /api/ab-test/results?testId=checkout-apple-pay-v1

# Change confidence level
GET /api/ab-test/results?testId=checkout-apple-pay-v1&confidenceLevel=99
```

### Key Metrics to Monitor

**Daily (manual checks):**
- Sessions per variant (should be ~50/50 split)
- Completion rate per variant
- Payment error rate

**Weekly (or at 100+ sessions per variant):**
- Statistical significance (p-value < 0.05)
- Relative uplift (% improvement)
- Recommendation (continue/roll_out/roll_back)

### Example Analysis Request
```bash
curl https://unclemays.com/api/ab-test/results?testId=checkout-apple-pay-v1
```

**Response includes:**
```json
{
  "testId": "checkout-apple-pay-v1",
  "confidenceLevel": 95,
  "variants": {
    "control": {
      "variantId": "control",
      "sessions": 150,
      "conversions": 28,
      "conversionRate": 0.187
    },
    "treatment": {
      "variantId": "treatment",
      "sessions": 148,
      "conversions": 45,
      "conversionRate": 0.304
    }
  },
  "significance": {
    "zScore": 3.42,
    "pValue": 0.0006,
    "isSignificant": true,
    "relativeUplift": 62.6,
    "recommendation": "roll_out",
    "interpretation": "Treatment shows significant improvement (+62.6%, p=0.0006). Recommend rolling out treatment to 100% of users."
  },
  "sampleSize": {
    "recommended": 242,
    "current": { "control": 150, "treatment": 148 },
    "progress": {
      "controlProgress": 0.62,
      "treatmentProgress": 0.61,
      "isComplete": false
    }
  }
}
```

---

## Rollback Procedure

### When to Rollback

Rollback immediately if:
1. Results API returns `recommendation: "roll_back"`
2. Payment error rate spikes above 10%
3. User complaints about checkout issues
4. Technical error with Payment Request Button

### How to Rollback

**Option 1: Disable Test (Emergency)**
```typescript
// src/lib/ab-test-config.ts
export const APPLE_PAY_TEST: ABTestConfig = {
  id: "checkout-apple-pay-v1",
  active: false, // ← Set to false
  // ...rest of config
};
```
- Routes 100% of users to control
- Takes effect immediately on next deploy
- No code changes needed

**Option 2: Adjust Rollout Percentage**
```typescript
// Reduce exposure to 10% while investigating
rolloutPercentage: 10, // ← Was 100
```

**Option 3: Force Control for All Users**
```typescript
variants: [
  {
    id: "control",
    weight: 100, // ← Force 100% control
  },
  {
    id: "treatment",
    weight: 0, // ← Disable treatment
  },
],
```

### Rollback Checklist
1. [ ] Set `active: false` in `ab-test-config.ts`
2. [ ] Commit changes with clear message: "Rollback Test 1 (Apple Pay) due to [reason]"
3. [ ] Deploy immediately via `git push`
4. [ ] Verify rollback via `/api/ab-test/metrics` (should see only control sessions after deploy)
5. [ ] Document reason and next steps in UNC-1024
6. [ ] Notify CEO and CRO

---

## Roll-Out Procedure (When Treatment Wins)

When results show `recommendation: "roll_out"`:

1. **Verify Results**
   - Confirm statistical significance (p < 0.05)
   - Confirm positive relative uplift
   - Confirm sample size > 200 per variant

2. **Remove A/B Test Code**
   - Remove variant assignment logic from CheckoutClient
   - Keep only the treatment variant code (Payment Request Button)
   - Remove control-specific code paths

3. **Clean Up Infrastructure**
   - Archive test config in `ab-test-config.ts`
   - Keep metrics API for future tests
   - Document learnings in UNC-1024

4. **Deploy**
   - Standard board approval process for code changes
   - Monitor for 48 hours post-rollout
   - Track completion rate to confirm sustained improvement

---

## Configuration Reference

### Test Config Structure
```typescript
export interface ABTestConfig {
  id: string;                    // Unique test identifier
  name: string;                  // Human-readable name
  description: string;           // What is being tested
  active: boolean;               // Master kill switch
  variants: ABTestVariant[];     // Variant definitions
  rolloutPercentage: number;     // 0-100, % of users in test
  rollbackConditions: {
    maxCompletionRateDropPercent?: number;
    maxPaymentErrorRatePercent?: number;
    minSampleSize?: number;
  };
  startDate?: string;
  endDate?: string;
}
```

### Event Types
- `session_start`: User lands on checkout page with items in cart
- `checkout_step`: User progresses through form (not currently tracked)
- `checkout_complete`: Payment succeeds, order confirmed
- `checkout_abandon`: User leaves checkout (not currently tracked)
- `payment_error`: Payment attempt fails (Stripe error)

---

## Future Tests (Roadmap from UNC-1004)

1. **Test 2:** Delivery date picker earlier in flow
2. **Test 3:** Pre-apply FRESH10 promo code
3. **Test 4:** Trust signals above payment form

Each new test follows this infrastructure:
1. Add config to `ACTIVE_TESTS` in `ab-test-config.ts`
2. Integrate variant assignment + tracking in the relevant component
3. Monitor via `/api/ab-test/results`
4. Roll out winner or rollback loser

---

## Technical Notes

### Browser Compatibility
- Payment Request Button shows only on devices with wallet support:
  - Apple Pay: Safari on iOS/macOS with Apple Pay enabled
  - Google Pay: Chrome on Android or Chrome/Edge on desktop with saved cards
  - Falls back gracefully to standard payment form if unsupported

### Metrics Storage
- Current: In-memory (survives until server restart)
- Limitation: Max 10,000 events, then FIFO eviction
- Upgrade path: Write to PostgreSQL or append to log file for scale

### Session ID Consistency
- Stored in localStorage as `unc_session_id`
- Format: `{timestamp}-{random}`
- Survives page reloads, does not survive browser clear/private mode

---

## Questions or Issues?

- **Test not assigning variant?** Check browser localStorage for `unc_ab_checkout-apple-pay-v1`
- **Metrics not tracking?** Check Network tab for POST to `/api/ab-test/metrics`
- **Payment Request Button not showing?** Check browser console for wallet availability
- **Statistical analysis confusing?** See `src/lib/ab-test-stats.ts` for calculation details

**Owner:** CTO (agent 3f827c01-38a9-435b-826c-64192188a8cb)
**Related Issue:** UNC-1024
