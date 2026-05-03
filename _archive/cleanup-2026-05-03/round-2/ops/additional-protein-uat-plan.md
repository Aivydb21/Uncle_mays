# Additional Protein Feature - UAT Test Plan

**Issue:** UNC-372  
**Feature:** Community Box additional protein checkout  
**Test Date:** 2026-04-17  
**Tester:** COO

## Code Review Summary ✅

All technical requirements have been verified in code:

### Product Configuration (`src/lib/products.ts`)
- ✅ `additionalProteinAllowed: true` on Community Box
- ✅ Additional protein pricing configured:
  - Chicken: +$20 (2000 cents)
  - Pork Chops: +$18 (1800 cents)
  - Beef Short Ribs: +$24 (2400 cents)
  - Salmon: +$22 (2200 cents)

### Checkout UI (`src/app/checkout/[product]/page.tsx`)
- ✅ Lines 76-77: `additionalProteins` state management
- ✅ Lines 161-172: Toggle function with 3-protein max limit
- ✅ Lines 175-181: Additional protein cost calculation
- ✅ Lines 318-364: Optional protein section with checkboxes
- ✅ Lines 328: Filters out selected included protein from additional options
- ✅ Lines 229-237: Price display with breakdown (Box: $X + Proteins: $Y)

### Delivery Page (`src/app/checkout/[product]/delivery/page.tsx`)
- ✅ Lines 281-284: Reads `unc-additional-proteins-${slug}` from sessionStorage
- ✅ Line 325: Passes to session API

### Payment Page (`src/app/checkout/[product]/payment/page.tsx`)
- ✅ Line 227: Passes additional proteins to intent API
- ✅ Lines 383-394: Displays additional proteins in order summary sidebar

### API Routes
- ✅ Session API (`api/checkout/session/route.ts` line 27): Stores additional proteins
- ✅ Intent API (`api/checkout/intent/route.ts`):
  - Lines 18-23: `ADDITIONAL_PROTEIN_PRICING` constant (cents)
  - Lines 43-50: Adds costs to payment amount
  - Lines 118-120: Stores in `additional_protein_selections` metadata

## UAT Test Cases

### Test 1: Basic Additional Protein Selection
**Path:** `/checkout/community`

1. Navigate to Community Box checkout
2. Select included protein (e.g., Chicken)
3. Verify "Add More Proteins — Optional" section appears
4. Verify selected protein (Chicken) does NOT appear in additional options
5. Select 1 additional protein (e.g., Pork Chops +$18)
6. Verify price updates: $95 → $113
7. Verify breakdown shows: "Box: $95 + Proteins: $18"
8. Click "Continue to Delivery"
9. Verify delivery page shows both proteins in session data
10. Complete checkout and verify Stripe payment intent = $11300 cents

**Expected:** ✅ Price calculates correctly, both proteins stored

---

### Test 2: Multiple Additional Proteins
**Path:** `/checkout/community`

1. Select included protein: Salmon
2. Add 3 additional proteins:
   - Chicken: +$20
   - Pork Chops: +$18
   - Beef Short Ribs: +$24
3. Verify total additional cost: $62
4. Verify total price: $95 + $62 = $157
5. Verify breakdown: "Box: $95 + Proteins: $62"
6. Continue through delivery and payment
7. Verify order summary shows:
   - Protein: Salmon
   - Additional Proteins: Chicken, Pork Chops, Beef Short Ribs
8. Verify Stripe payment intent = $15700 cents

**Expected:** ✅ All 4 proteins (1 included + 3 additional) processed correctly

---

### Test 3: Add/Remove Additional Proteins
**Path:** `/checkout/community`

1. Select included protein: Beef Short Ribs
2. Add Chicken (+$20) → verify price = $115
3. Add Salmon (+$22) → verify price = $137
4. Remove Chicken → verify price = $117
5. Add Pork Chops (+$18) → verify price = $135
6. Remove all additional proteins → verify price = $95

**Expected:** ✅ Price updates dynamically, no UI errors

---

### Test 4: Maximum Additional Proteins (3)
**Path:** `/checkout/community`

1. Select included protein: Chicken
2. Add Pork Chops (+$18)
3. Add Beef Short Ribs (+$24)
4. Add Salmon (+$22)
5. Attempt to add 4th additional protein (should be impossible)
6. Verify toggle function enforces 3-protein max

**Expected:** ✅ Cannot select more than 3 additional proteins

---

### Test 5: Zero Additional Proteins (Edge Case)
**Path:** `/checkout/community`

1. Select included protein: Salmon
2. Do NOT select any additional proteins
3. Verify price = $95 (base box price)
4. Continue through checkout
5. Verify Stripe payment intent = $9500 cents
6. Verify metadata has `protein_selections: "salmon"` but NO `additional_protein_selections`

**Expected:** ✅ Checkout works with 0 additional proteins

---

### Test 6: Session Persistence
**Path:** `/checkout/community` → leave → return

1. Select included protein: Chicken
2. Add additional proteins: Pork Chops, Beef Short Ribs
3. Leave page (navigate to `/`)
4. Return to `/checkout/community`
5. Verify included protein (Chicken) is still selected
6. Verify additional proteins (Pork Chops, Beef Short Ribs) are still selected
7. Verify price is correct: $95 + $18 + $24 = $137

**Expected:** ✅ SessionStorage persists selections across page navigation

---

### Test 7: Starter/Family Box (No Additional Proteins)
**Paths:** `/checkout/starter`, `/checkout/family`

1. Navigate to Starter Box checkout
2. Verify NO additional protein section appears (Starter has 0 proteins)
3. Navigate to Family Box checkout
4. Verify NO additional protein section appears (Family has chicken-only, no `additionalProteinAllowed`)

**Expected:** ✅ Additional protein UI only shows for Community Box

---

### Test 8: Stripe Metadata Verification
**Path:** Complete Community Box purchase

1. Select included: Salmon
2. Add additional: Chicken, Pork Chops
3. Complete purchase through Stripe test mode
4. Check Stripe Dashboard → Payment Intent metadata
5. Verify:
   - `protein_selections: "salmon"`
   - `additional_protein_selections: "chicken, pork-chops"`
   - `amount: 13300` (95 + 20 + 18)

**Expected:** ✅ Metadata accurately reflects customer selections

---

### Test 9: First-Order Discount Interaction (Edge Case)
**Path:** `/checkout/starter` (has first-order discount)

Note: Starter Box doesn't have proteins, but verify logic doesn't break if we add proteins to Starter in future.

**Expected:** ✅ No UI/logic conflicts (N/A for current setup)

---

### Test 10: Mobile Responsiveness
**Path:** `/checkout/community` on mobile device

1. Test all checkbox interactions on mobile
2. Verify price breakdown doesn't overflow/wrap awkwardly
3. Verify checkboxes are touch-friendly (adequate tap targets)

**Expected:** ✅ UI works on mobile (320px - 1920px)

---

## Fulfillment Testing

### Test 11: Order Fulfillment Data
**Requirement:** Kitchen/packing team needs clear instructions

1. Complete test purchase with:
   - Included: Beef Short Ribs
   - Additional: Chicken, Salmon
2. Verify Stripe webhook fires (check logs at `/api/webhook`)
3. Check order data includes:
   - `protein_selections`
   - `additional_protein_selections`
4. **Manual step:** Print or display order for kitchen team
5. Verify packing instructions are clear:
   - "Box: Community"
   - "Proteins: Beef Short Ribs (included), Chicken (+$20), Salmon (+$22)"

**Expected:** ✅ Kitchen staff can clearly identify what to pack

---

## Critical Issues to Watch For

1. **Price calculation errors** → Incorrect Stripe charge
2. **SessionStorage not persisting** → Lost selections on page navigation
3. **API metadata missing** → Fulfillment team can't see protein selections
4. **UI doesn't filter included protein** → Customer could select same protein twice
5. **Mobile checkbox hit targets too small** → Poor mobile UX
6. **No max limit enforcement** → Customer could add unlimited proteins

---

## Post-UAT Actions

### If Tests Pass ✅
1. Mark UNC-372 as `done`
2. Close parent issue UNC-371
3. Document fulfillment procedures in `ops/fulfillment-procedures.md`
4. Train kitchen/packing staff on reading protein metadata from orders
5. Monitor first 10 real orders for any edge cases

### If Tests Fail ❌
1. Document failing test cases
2. Create new issue(s) for bugs found
3. Assign back to CTO for fixes
4. Re-run UAT after fixes deployed

---

## Browser UAT Status

**Browser Access:** ❌ Not available during this code review  
**Next Step:** Manual UAT required by COO or QA with browser access

**Recommendation:** Anthony or team member with browser access should run Tests 1-11 on staging/production before marking as complete.
