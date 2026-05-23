# Vendor Self-Onboarding Form Spec

**Prepared:** 2026-05-23
**Owner:** Anthony Ivy
**Tool:** Branded form at [`unclemays.com/vendor-onboarding`](https://unclemays.com/vendor-onboarding) (Next.js page that writes to the Suppliers table via the `/api/vendor-onboarding` route). The Airtable Form view remains as a backup if the site form is ever down.
**Distribution:** form URL emailed to all Wave A / Wave E candidates plus any net-new vendor introductions

This spec defines the questions, the field mapping into the Suppliers table, and the customer-facing copy. The form replaces ~50 individualized diligence emails with one link. Vendors complete it at their pace; we batch-review responses weekly.

---

## How to build it in Airtable

1. Open base `appm6F6H9obydzAM2` → `Suppliers` table.
2. Click `+ Form` in the views panel → "Create form view" → name it **"Uncle May's Supplier Onboarding"**.
3. Drag the fields below into the form in the order shown. Mark required where indicated.
4. Set form properties (top of the form-editor panel):
   - **Title:** "Uncle May's Supplier Onboarding"
   - **Description:** Use the intro copy in [Section A](#section-a--intro-copy).
   - **After submit:** "Show a custom message" → use the [thank-you copy](#thank-you-copy).
   - **Email me at this address each time the form is submitted:** `anthony@unclemays.com`
5. Copy the public form URL and store it in [`research/product-mix-2026-05-16/_form-url.txt`](./_form-url.txt) for the outreach scripts to reference.

---

## Section A — Intro copy

> **Help us stock your products at Uncle May's Produce.**
>
> Uncle May's is a Chicago-based grocery and produce platform sourcing primarily from Black farmers and Black-owned brands. We're expanding our catalog and we're inviting suppliers to apply.
>
> This form takes about 8 minutes. We use what you share here to evaluate fit, build a vendor profile, and plan our first order with you. There's no commitment on either side.
>
> If anything's unclear, email Anthony at anthony@unclemays.com or text (312) 972-2595.

---

## Section B — Form questions and field mapping

### Business basics

| Question shown to vendor | Field in Suppliers | Type | Required | Notes |
|---|---|---|---|---|
| Business name | `Business Name` | singleLineText | Yes | |
| What kind of business are you? | `Supplier Type` | singleSelect | Yes | Existing options: Farm, Brand, Distributor, Co-op, Other |
| Your first name | `First Name` | singleLineText | Yes | |
| Your last name | `Last Name` | singleLineText | Yes | |
| Email | `Email` | email | Yes | |
| Phone (optional, for urgent questions) | `Phone` | phoneNumber | No | |
| City | `City` | singleLineText | Yes | |
| State | `State` | multipleSelects | Yes | |
| Website or social link (optional) | `Website` | url | No | |

### What you sell

| Question shown to vendor | Field in Suppliers | Type | Required | Notes |
|---|---|---|---|---|
| Which category best describes your products? (pick all that apply) | `Category` | multipleSelects | Yes | Existing options |
| Subcategory or specialty (optional) | `Subcategory` | multipleSelects | No | |
| List the products you want us to consider stocking. Include sizes, units, and seasonality if relevant. | `Products Offered` | multilineText | Yes | Free text — encourage detail |
| Any certifications? (USDA Organic, Certified Naturally Grown, Halal, Kosher, etc.) | `Certifications` | multipleSelects | No | Existing options |
| Are you a Black-owned business? | `BlackOwnedSelfAttested` | checkbox | Yes | One question, one box. Self-attestation only. |

### Operations and fulfillment

| Question shown to vendor | Field in Suppliers | Type | Required | Notes |
|---|---|---|---|---|
| How many business days from order acceptance to ship-out? | `LeadTimeDays` | number | Yes | Drives the "Ships in N days" badge on the website |
| How often do you prefer to receive our orders? | `OrderBatchingCadence` | singleSelect | Yes | On-demand / Daily / Weekly / Biweekly / Monthly |
| Minimum order quantity (per SKU, per shipment, or per dollar amount — describe in your terms) | `Min Order Qty` | singleLineText | Yes | Existing field, free text |
| Do your products require refrigerated or frozen shipping? | `ColdChainRequired` | checkbox | Yes | Determines whether we can drop-ship |
| Can you ship directly to our customer (with our packing slip)? | `DropShipCapable` | checkbox | Yes | Saves us hub staging on shelf-stable SKUs |
| Wholesale pricing — describe your tiers (e.g. case price at 1, 5, 10 cases) | `WholesalePricingNotes` | multilineText | Yes | Free text. Per-SKU prices live on the Catalog table later. |
| Payment terms you accept | `PaymentTerms` | singleSelect | Yes | Prepaid / Net-7 / Net-15 / Net-30 / Net-60 / COD / Other |
| If demand for one of your SKUs jumped to 50 units a week, could you fill that? In how long? | `ScaleCapacityNotes` | multilineText | Yes | Free text. Capacity-risk flag. |
| Do you offer samples for us to merchandise / photograph / taste before we commit? | `SampleAvailable` | checkbox | Yes | Important — we need product photos before listing |
| How do you prefer to ship to our Chicago hub? (We pick up / You ship / Either works.) | `Transportation` | singleSelect | Yes | Existing field |
| Anything else we should know? | (notes — append to `Products Offered`) | multilineText | No | Catch-all |

### File upload (optional but encouraged)

| Question shown to vendor | Field in Suppliers | Type | Required | Notes |
|---|---|---|---|---|
| Upload a product photo, catalog, or line sheet (PDF or image) | `Attachments` | multipleAttachments | No | Existing field; lets vendors send us their own merchandising assets |

---

## Section C — Submission handling

When a vendor submits the form:

1. **A new row appears in the Suppliers table** with `OnboardingStatus = "Form returned"` (manually set by the ops reviewer; the form view itself doesn't write to this field by default).
2. Anthony receives an email notification (configured in form settings).
3. Within 5 business days, Anthony or Zoe reviews the row, sets `OnboardingStatus` to either `Sample requested`, `Onboarded`, `Declined`, or `Paused`, and emails the vendor with the next step.
4. If `SampleAvailable = true`, request a sample. If `DropShipCapable = true` and `ColdChainRequired = false`, prioritize for the pre-sell launch wave.

---

## Thank-you copy

> **Thanks for sending this through.**
>
> We review every submission within 5 business days. If you're a fit for our launch wave, you'll hear from Anthony or Zoe with a next step — usually that's a small sample order so we can photograph your product and add it to the catalog.
>
> If we're not a fit right now, we'll tell you that directly so you can move on. We keep your profile on file either way.
>
> Questions: anthony@unclemays.com / (312) 972-2595

---

## Distribution

### First batch (~50 invitations)

Send the form URL to:

- **Wave E personal-care candidates (15)** — AMBI Skincare, Dr. Nettles Beauty, Elements of Nature, Earthly Holistic & Organic Garden, Thirdday Soaps Garden Wellness, Hempress Farms, Zizis Bee Company, Lee Hemp Farms, B Free Organics, Bossville Farms, Hidden Gems Farm, L4S Farms, Mystic Pine Farm, Out the Mud Farm, Perma-Pastures Farm. Plus 3-5 net-new for batana hair oil (Qhemet Biologics, Camille Rose, Mielle Organics, etc.).
- **Wave A shelf-stable pantry / spices (~14)** — Eden Place Farms, We the People Opportunity Farm, We Sow We Grow, Nurturing Our Seeds, Human Agricultural Cooperative, Cutino Sauce Co., Chauncey's, Pearson Farms, Hitchrick Family Farm, Long Walk Spring Farm, Lesedi Farm, EXAU, Chef Calvin, Gustus Vitae.
- **Wave A meat — Midwest near (4)** — Prairie Hills Farm, Oakland Avenue Urban Farm, Agape Organic Farms, Willowbrook Farms.
- **Wave A produce — pick the top 6 from the 19 regional list** based on proximity, business name signal, and any prior touchpoint. Skip the others until Wave A pantry/spices return signal.

Email subject line: **"Stock your products at Uncle May's — 8-minute application"**

Form URL to share: **`https://unclemays.com/vendor-onboarding`**

Email body (template, fill in `{name}`):

> Hi {name},
>
> I'm Anthony Ivy, founder of Uncle May's Produce. We're a Chicago-based grocery and produce platform sourcing primarily from Black farmers and Black-owned brands. We're expanding our catalog and reaching out to suppliers we'd want to work with.
>
> I'd love to consider your products. Could you fill out our 8-minute supplier application?
>
> https://unclemays.com/vendor-onboarding
>
> We use what you share to evaluate fit, plan our first order with you, and (if you opt in) feature your story to our customers. No commitment on either side.
>
> Thanks,
> Anthony Ivy
> anthony@unclemays.com · (312) 972-2595

### Cadence

- **Day 0:** send batch of 50.
- **Day 5:** review submissions. Set status. Email next-step to qualified vendors.
- **Day 7:** send a single-line reminder to anyone who hasn't opened or hasn't completed the form.
- **Day 10:** close the first batch. Anything still un-returned drops to `OnboardingStatus = "Paused"`.

---

## Notes for the next operator

- **The form is the single source of truth for diligence data.** Do not duplicate this data in spreadsheets or in Paperclip comments. If a field needs updating, do it on the Suppliers row.
- **OnboardingStatus is the workflow signal.** Filter the Suppliers view by status to plan the week.
- **Sample workflow is in scope but not in this form.** When `OnboardingStatus = "Sample requested"`, the operator (Anthony or Zoe) emails the vendor for a 1-2 unit sample shipment, photographs it on arrival, and uploads the photo to the Catalog row when listing the SKU.
- **The form does not capture per-SKU pricing or photos** — that work happens in the Catalog table after onboarding. Keep the form short.
- **All `Black-owned`-related decisions flow through human verification.** `BlackOwnedSelfAttested` is the vendor's claim. The site's `Black-owned` badge reads from the operator-verified `Black-owned` checkbox. Do not auto-promote one to the other.
