# Checkout Mystery Shopping Protocol
**Created:** 2026-04-16  
**Purpose:** Identify friction points causing 97% abandon rate  
**Priority:** CRITICAL

## Code Review Findings (Pre-Test)

### HIGH-RISK FRICTION POINTS IDENTIFIED:

1. **Delivery Calendar Widget (HIGHEST RISK)**
   - Only Wednesdays are selectable (all other dates disabled/grayed out)
   - Uses `react-day-picker` library (may not be mobile-optimized)
   - **Risk:** Users don't understand why they can't select dates, or calendar doesn't render on mobile
   - **Location:** `/checkout/[product]/delivery` page, lines 527-565

2. **Required Delivery Date + Time Window**
   - Both fields are REQUIRED for form submission
   - No "skip" or "call me later" option
   - **Risk:** If calendar fails to capture input (mobile bug, touch issue), checkout is blocked

3. **SessionStorage/LocalStorage Dependencies**
   - Checkout flow stores data in sessionStorage and localStorage
   - Payment page reads from localStorage (no fallback)
   - **Risk:** Private browsing mode or storage blockers break checkout completely

4. **Strict Form Validation**
   - ZIP code: Must match `/^\d{5}(-\d{4})?$/` exactly
   - Email: Must match `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
   - State: Must be exactly 2 characters (IL)
   - **Risk:** Edge cases rejected (international formats, typos trigger unhelpful errors)

5. **Mobile Responsiveness Unknown**
   - Calendar widget is centered in a flex container
   - Time window buttons use grid layout (may stack poorly)
   - No explicit mobile optimization detected in code

6. **Stripe Elements Rendering**
   - Payment page uses Stripe PaymentElement
   - **Risk:** If Stripe iframe doesn't load or render, payment is blocked

---

## Mystery Shopping Test Protocol

### Test Matrix

| Device | Browser | Product Type | Test ID |
|--------|---------|--------------|---------|
| Desktop | Chrome | One-time | D-CHR-OT |
| Desktop | Firefox | Subscription | D-FF-SUB |
| Desktop | Safari | One-time | D-SAF-OT |
| iPhone (iOS Safari) | Safari | Subscription | M-IOS-SUB |
| Android | Chrome | One-time | M-AND-OT |

### For Each Test:

#### Step 1: Product Selection Page
- [ ] Page loads without errors
- [ ] Product image displays correctly
- [ ] Price is clearly visible
- [ ] "Continue to Delivery" button is clickable
- [ ] Email capture field accepts input
- **Screenshot:** Product selection page

#### Step 2: Delivery Information Page
- [ ] Page loads without errors
- [ ] Step indicator shows "Step 2 of 3"
- [ ] All form fields render correctly
- [ ] Form fields accept typed input

**CALENDAR WIDGET TEST (CRITICAL):**
- [ ] Calendar widget renders on screen
- [ ] Calendar shows current month
- [ ] Non-Wednesday dates appear disabled (grayed out)
- [ ] Wednesday dates are clickable
- [ ] Clicking a Wednesday selects it (shows "Delivering on [date]")
- [ ] Can navigate between months (left/right arrows work)
- **Mobile:** Touch interaction works (no double-tap required)
- **Mobile:** Calendar doesn't overflow screen or require horizontal scroll
- **Screenshot:** Calendar widget (before selection)
- **Screenshot:** Calendar widget (after selection)

**DELIVERY WINDOW TEST:**
- [ ] 4 time window buttons render (9am-12pm, 12pm-3pm, 3pm-6pm, 6pm-9pm)
- [ ] Clicking a window selects it (visual feedback: border/background change)
- [ ] Selected window remains selected after clicking
- **Screenshot:** Time window selection

**FORM SUBMISSION TEST:**
- [ ] Fill all required fields with valid data
- [ ] Submit form
- [ ] Form submits successfully (no error message)
- [ ] Redirects to payment page (Step 3)
- **If errors occur:** Screenshot error message and document exact error text

**ERROR SCENARIO TESTS:**
- [ ] Try submitting without selecting delivery date → Error message shown?
- [ ] Try submitting without selecting time window → Error message shown?
- [ ] Try invalid ZIP code (e.g., "606011") → Error message shown?
- [ ] Try submitting in private/incognito mode → Does it work?

#### Step 3: Payment Page
- [ ] Page loads without errors
- [ ] Step indicator shows "Step 3 of 3"
- [ ] Order summary displays correct price
- [ ] Stripe payment form renders (card number field visible)
- [ ] Can type in card number field
- **Screenshot:** Payment page loaded

**DO NOT COMPLETE PAYMENT** — Stop here and document findings.

---

## Data Collection Form

For each test, record:

```
Test ID: ___________
Device: ___________
Browser: ___________
Product: ___________
Started: ___________ (timestamp)

STEP 1 (Product Selection):
- Loaded successfully: Y/N
- Errors observed: ___________
- Friction points: ___________

STEP 2 (Delivery):
- Loaded successfully: Y/N
- Calendar rendered: Y/N
- Calendar usable: Y/N
- Time window buttons rendered: Y/N
- Time window buttons clickable: Y/N
- Form submitted: Y/N
- Errors observed: ___________
- Friction points: ___________

STEP 3 (Payment):
- Loaded successfully: Y/N
- Stripe form rendered: Y/N
- Errors observed: ___________
- Friction points: ___________

OVERALL ABANDON LIKELIHOOD (1-10): ___________
REASON FOR ABANDON: ___________
```

---

## Hypothesis Testing

Based on code review, test these specific hypotheses:

### Hypothesis 1: Calendar Widget Doesn't Render on Mobile
**Test:** Open delivery page on iPhone Safari and Android Chrome
**Expected Failure:** Calendar doesn't show, or shows but isn't clickable
**Impact:** CRITICAL (blocks 100% of mobile checkouts)

### Hypothesis 2: Calendar Widget Confuses Users
**Test:** Observe first reaction to calendar (most dates grayed out)
**Expected Failure:** Users try to click disabled dates, get frustrated
**Impact:** HIGH (users abandon thinking "no delivery available")

### Hypothesis 3: Private Browsing Breaks Checkout
**Test:** Complete checkout in Chrome Incognito mode
**Expected Failure:** Payment page shows "no data" or crashes
**Impact:** MEDIUM (affects privacy-conscious users)

### Hypothesis 4: Mobile Time Window Buttons Don't Work
**Test:** Tap time window buttons on mobile
**Expected Failure:** Buttons don't respond to touch, or require multiple taps
**Impact:** HIGH (blocks mobile checkout completion)

### Hypothesis 5: Stripe Elements Don't Load on Mobile
**Test:** Navigate to payment page on mobile
**Expected Failure:** Card input field doesn't render or is unusable
**Impact:** CRITICAL (blocks 100% of mobile payments)

---

## Quick Test (5 Minutes)

If time is limited, run this abbreviated test:

1. **Desktop Chrome:** Complete full flow (all 3 steps) without submitting payment
2. **iPhone Safari:** Test delivery page calendar widget ONLY
3. **Android Chrome:** Test delivery page calendar widget ONLY

Document any errors, broken UI, or confusing elements.

---

## Immediate Next Steps After Testing

1. **If calendar widget is broken on mobile:**
   - Emergency hotfix: Replace calendar with simple dropdown (Next Wed, 2 weeks, 3 weeks, 4 weeks)
   - File CTO task for calendar replacement

2. **If calendar widget is confusing:**
   - Add explainer text: "We deliver on Wednesdays. Select your preferred delivery date."
   - Highlight available Wednesdays more clearly

3. **If private browsing breaks checkout:**
   - Add localStorage availability check
   - Fall back to sessionStorage or cookies
   - Show error message: "Please disable private browsing to complete checkout"

4. **If mobile responsiveness is broken:**
   - Emergency mobile CSS fixes
   - Consider mobile-specific layout for calendar

5. **If Stripe Elements don't load:**
   - Check Stripe publishable key configuration
   - Check for JavaScript errors in console
   - File CTO task for Stripe integration debugging

---

## Test Completion Checklist

- [ ] All 5 device/browser combos tested
- [ ] Screenshots captured for each step
- [ ] Error messages documented verbatim
- [ ] Friction points ranked by severity
- [ ] Hypothesis validation complete
- [ ] Test results documented in `checkout-mystery-shop-results.md`
- [ ] Findings shared with CTO and RevOps
