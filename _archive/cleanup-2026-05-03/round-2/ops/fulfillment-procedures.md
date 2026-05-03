# Uncle May's Produce - Order Fulfillment Procedures

**Owner:** COO  
**Last Updated:** 2026-04-17  
**Version:** 1.1

## Overview

This document outlines standard operating procedures for fulfilling produce box orders, including the new additional protein add-on feature (UNC-372).

---

## Daily Fulfillment Workflow

### 1. Order Review (Day Before Delivery)

**Timing:** Tuesday 4:00 PM (for Wednesday delivery)

1. **Pull order data from Stripe:**
   - Login to Stripe Dashboard
   - Navigate to Payments → Filter by "Succeeded" (last 24h)
   - Export to CSV or review in dashboard

2. **For each order, note:**
   - Customer name
   - Product (Starter, Family, or Community Box)
   - Protein selections (if applicable)
   - Additional protein selections (if applicable)
   - Delivery address
   - Special instructions (if any)

3. **Generate packing list:**
   - Use `scripts/generate-packing-list.py` (to be created by CTO)
   - Or manually create list in Google Sheets template

---

### 2. Protein Procurement

**Timing:** Tuesday 5:00 PM (after order review)

**Protein Options:**
- **Chicken:** Pasture-Raised Whole Chicken (~3-4 lbs)
- **Pork Chops:** Heritage Pork Chops (bone-in, 2-pack, ~1.5 lbs total)
- **Beef Short Ribs:** Grass-Fed Beef Short Ribs (1.5 lb package)
- **Salmon:** Wild-Caught Salmon Fillet (1 lb, skin-on)

**Procurement Steps:**
1. Count total protein needs from order list:
   - Included proteins (Family Box: chicken only; Community Box: customer choice)
   - Additional proteins (Community Box only)
2. Contact suppliers to confirm availability
3. Place orders with suppliers (or pull from inventory if stocked)
4. Receive proteins Tuesday evening or Wednesday morning

**Suppliers (to be confirmed):**
- Chicken: [TBD - local farm partnership]
- Pork: [TBD]
- Beef: [TBD]
- Salmon: [TBD]

---

### 3. Produce Packing

**Timing:** Wednesday 6:00 AM - 10:00 AM

**Box Configurations:**

#### Starter Box (Produce Only, No Protein)
- Collard greens — 1 bunch
- Asparagus — 1 lb
- Spring onions — 1 bunch
- Heirloom cherry tomatoes — 1 pint
- Persian cucumbers — 4 ct
- Snap peas — 1/2 lb

#### Family Box (Chicken Included)
- Collard greens — 2 bunches
- Asparagus — 1.5 lb
- Spring onions — 2 bunches
- Heirloom cherry tomatoes — 1 pint
- Persian cucumbers — 6 ct
- Snap peas — 1 lb
- Rainbow chard — 1 bunch
- Strawberries — 1 quart
- Early beets with tops — 1 bunch
- Zucchini — 2 ct
- **Protein:** Pasture-raised whole chicken (included, no substitutions)

#### Community Box (Customer Choice Protein)
- Watermelon radishes — 1 bunch
- Fairy tale eggplant — 1/2 lb
- Shishito peppers — 1/2 lb
- Hakurei turnips with greens — 1 bunch
- Sunburst cherry tomatoes — 1 pint
- Pattypan squash — 1/2 lb
- Dragon tongue beans — 1/2 lb
- Rainbow chard — 1 bunch
- Heirloom cucumber — 2 ct
- Ramps — 1/2 lb
- **Protein:** Customer selects 1 from (Chicken, Pork Chops, Beef Short Ribs, or Salmon)
- **Additional Proteins (NEW):** Customer may add 0-3 extra proteins (+$18-$24 each)

---

### 4. Protein Packing (Community Box Orders)

**CRITICAL:** Community Box customers can now order multiple proteins.

**How to Read Order Data:**

In Stripe Dashboard, each payment will have metadata fields:
- `protein_selections` → The included protein (1 selection, no extra charge)
- `additional_protein_selections` → Extra proteins customer paid for (0-3 selections, +$18-$24 each)

**Example Order:**
```
Customer: Jane Smith
Product: Community Box
protein_selections: "beef-short-ribs"
additional_protein_selections: "chicken, salmon"
```

**Packing Instructions for this order:**
1. Pack standard Community Box produce items
2. Add beef short ribs (1.5 lb package) — included in base price
3. Add chicken (whole, 3-4 lbs) — additional (+$20)
4. Add salmon fillet (1 lb, skin-on) — additional (+$22)
5. **Label box clearly:** "Community Box + 3 Proteins: Beef (inc), Chicken, Salmon"

---

### 5. Packing Checklist Template

Use this checklist for each Community Box with additional proteins:

```
[ ] Standard produce items packed
[ ] Included protein: _____________ (from protein_selections)
[ ] Additional protein 1: _____________ (+$__) (if applicable)
[ ] Additional protein 2: _____________ (+$__) (if applicable)
[ ] Additional protein 3: _____________ (+$__) (if applicable)
[ ] Box labeled with customer name
[ ] Delivery address confirmed
[ ] Invoice/receipt included (if applicable)
```

---

### 6. Quality Control

**Before sealing each box:**
1. Verify all produce items match box type
2. Verify protein count and types match order metadata
3. Check for damaged/wilted produce (replace if needed)
4. Verify proteins are properly refrigerated and packaged
5. Ensure box is not overpacked (items should fit comfortably)

**For Multi-Protein Orders (Additional Cold-Chain & Safety Protocols):**

#### Temperature Monitoring
- [ ] All proteins stored at ≤40°F (4°C) before packing
- [ ] Use calibrated thermometer to verify cooler temp every 2 hours
- [ ] Record temps on Cold Chain Log (see template below)
- [ ] Proteins packed within 2 hours of removal from refrigeration
- [ ] Ice packs (2-4 per box, depending on protein count) added before sealing

#### Cross-Contamination Prevention
- [ ] **Separate handling zones:** Chicken → Pork → Beef → Fish (in this order)
- [ ] Wash hands between handling different protein types
- [ ] Use separate cutting boards/surfaces if trimming needed
- [ ] Chicken and pork MUST be in sealed bags (double-bag if needed)
- [ ] Salmon skin-on side down in leak-proof packaging
- [ ] Beef can be in single vacuum-sealed package
- [ ] **Packing order in box (bottom to top):**
  1. Ice packs (bottom layer)
  2. Beef (most stable, least leak risk)
  3. Pork (sealed bag)
  4. Salmon (leak-proof container)
  5. Chicken (sealed bag, top layer for easy access)
  6. Produce items above or around proteins

#### Weight Verification
- [ ] Each protein weighed on calibrated scale
- [ ] Verify weight matches supplier spec ±10%:
  - Chicken: 3-4 lbs (acceptable: 2.7-4.4 lbs)
  - Pork Chops: 1.5 lbs (acceptable: 1.35-1.65 lbs)
  - Beef Short Ribs: 1.5 lbs (acceptable: 1.35-1.65 lbs)
  - Salmon: 1 lb (acceptable: 0.9-1.1 lbs)
- [ ] If out of range, contact COO before packing

#### Expiration Date Checks
- [ ] Verify "Sell By" or "Use By" date on each protein package
- [ ] **Minimum shelf life:** 5 days from delivery date (Wednesday + 5 = Monday)
- [ ] Flag any proteins expiring before Monday to COO
- [ ] Record expiration dates on packing checklist
- [ ] If no date visible, do NOT pack (contact supplier)

#### Multi-Protein QC Sign-Off
After completing the above checks, packer initials here:

```
Packer: _______ | Temp: ___°F | Time: _____ | QC: Pass/Fail
```

---

### 7. Delivery Preparation

**Timing:** Wednesday 10:00 AM - 11:00 AM

1. **Route planning:**
   - Group orders by neighborhood
   - Create efficient delivery route (use Google Maps route planner)
   - Assign boxes to delivery drivers

2. **Loading:**
   - Load refrigerated items last (proteins, berries, greens)
   - Use insulated bags/coolers for protein boxes
   - Verify delivery addresses on each box

3. **Delivery window:**
   - Target: Wednesday 12:00 PM - 5:00 PM
   - Communicate ETAs to customers via SMS/email (future enhancement)

---

## Handling Edge Cases

### Missing Protein Selections in Order Metadata
**Problem:** Order has no `protein_selections` field but product is Family/Community Box

**Action:**
1. Contact customer immediately via phone/email
2. Ask for protein preference
3. Update Stripe metadata manually
4. Proceed with packing once confirmed

---

### Out of Stock Protein
**Problem:** Customer ordered beef short ribs, but supplier is out of stock

**Action:**
1. Contact customer immediately (call, then email if no answer)
2. Offer substitution at same price:
   - Beef → Pork or Salmon (closest value)
   - Salmon → Beef (if in stock)
3. If customer declines substitution, issue partial refund for that protein
4. Document substitution in order notes

**Refund amounts:**
- Chicken: $20
- Pork Chops: $18
- Beef Short Ribs: $24
- Salmon: $22

---

### Customer Requests Change After Order Placed
**Problem:** Customer emails Tuesday night saying "I want to change my protein"

**Action:**
1. Check if we've already packed the box
2. If **before packing:** Make the change, update Stripe metadata, note in order
3. If **after packing:** Apologize, explain we've already sourced proteins, offer credit for next order

---

### Protein Quality Issue Discovered During Packing
**Problem:** Chicken arrives from supplier but looks/smells off

**Action:**
1. **Do NOT pack the questionable protein**
2. Contact customer to offer:
   - Substitute protein (if available)
   - Produce-only box + full refund for protein
3. Document quality issue and notify supplier
4. Consider backup supplier for future orders

---

## Data Recording & Analytics

### Cold Chain Log (Daily)

Record temperatures during packing shift:

| Time | Cooler Temp (°F) | Ice Pack Inventory | Initials |
|------|------------------|-------------------|----------|
| 6:00 AM | | | |
| 8:00 AM | | | |
| 10:00 AM | | | |
| 12:00 PM | | | |

**Critical:** If temp rises above 40°F, notify COO immediately and move proteins to backup refrigeration.

---

### Track These Metrics Weekly

**Order Volume:**
- Total boxes packed (by type: Starter, Family, Community)
- Total proteins packed (by type: Chicken, Pork, Beef, Salmon)
- Additional proteins per Community Box (average)

**Revenue Impact (UNC-373 Target Metrics):**
- **% of Community Box orders with additional proteins** (TARGET: 30%)
- **Average order value (AOV) for Community Box WITH additional proteins** (TARGET: $95 + $20-24 = ~$115-119)
- **Average order value for Community Box WITHOUT additional proteins** ($95 baseline)
- **Total additional protein revenue per week** (sum of all +$18-24 charges)
- **Revenue lift per Community Box** (AOV difference = target +$6-7 based on 30% adoption)

**Adoption Breakdown:**
- % of Community Box customers adding 1 additional protein
- % of Community Box customers adding 2 additional proteins
- % of Community Box customers adding 3 additional proteins
- Most popular additional protein (Chicken/Pork/Beef/Salmon)

**Operational Metrics:**
- Packing time per box (avg) - track if multi-protein orders take longer
- Fulfillment time impact: avg time for 1-protein vs. 2-3 protein orders
- Protein substitution rate (%)
- Cold-chain quality issues (temp excursions, packaging failures)
- Customer feedback on multi-protein orders (quality, portion size, variety)

**Success Criteria (from UNC-373):**
- ✅ 30% adoption rate (baseline target)
- ✅ +$6-7 average order value increase across all Community Boxes
- ✅ No increase in fulfillment errors
- ✅ Zero cold-chain quality issues (temp control, cross-contamination)

**Reporting:** COO reviews weekly, reports to CEO in Sunday ops summary. Use Weekly Revenue Report template (see `ops/weekly-revenue-report-template.md`).

---

## Future Enhancements

### Automated Packing List Generation
**Status:** Pending CTO (UNC-XXX)

Create `scripts/generate-packing-list.py` that:
1. Pulls Stripe orders from last 24h
2. Parses protein metadata
3. Generates printer-friendly packing list with:
   - Customer name
   - Box type
   - Included protein
   - Additional proteins (highlighted)
   - Delivery address

### Supplier Integration
**Status:** Backlog

Integrate with supplier APIs to:
- Auto-order proteins based on weekly order volume
- Track inventory levels
- Receive delivery confirmations

### Customer Communication
**Status:** Backlog

Send automated delivery updates:
- Tuesday: "Your box is being packed tomorrow!"
- Wednesday AM: "Out for delivery! ETA 2-4 PM"
- Wednesday PM: "Delivered! Enjoy your Uncle May's box"

---

## Training Checklist for Packing Staff

New staff must complete this checklist before solo packing:

- [ ] Shadow experienced packer for 1 full Wednesday shift
- [ ] Review all 3 box configurations (Starter, Family, Community)
- [ ] Practice reading Stripe metadata (protein_selections vs additional_protein_selections)
- [ ] Pack 5+ Community Box orders with additional proteins under supervision
- [ ] Demonstrate proper protein handling (refrigeration, packaging)
- [ ] Review quality control checklist
- [ ] Understand substitution/refund procedures
- [ ] Solo pack 3+ orders with QC review before certification

**Trainer signature:** ________________  
**New staff signature:** ________________  
**Certification date:** ________________

---

## Contact Information

**COO:** [Contact info TBD]  
**Kitchen Manager:** [Name TBD]  
**Delivery Coordinator:** [Name TBD]  
**Customer Support:** support@unclemays.com  
**Emergency Line:** (312) 972-2595

---

## Related Documents (UNC-373)

All fulfillment documentation for additional protein orders is located in the `ops/` folder:

1. **`fulfillment-procedures.md`** (this document) - Main SOP for all fulfillment workflows
2. **`multi-protein-qc-checklist.md`** - Printable QC checklist for multi-protein orders (print one per order)
3. **`weekly-revenue-report-template.md`** - Weekly revenue tracking for COO → CEO reporting
4. **`order-manifest-template.md`** - Daily order manifest for packing team (will be auto-generated by CTO script)

**Print copies:**
- Multi-Protein QC Checklist: Print fresh copies daily for packing shift
- Order Manifest: Print Tuesday evening after order review for next-day packing

---

## Document Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-04-17 | 1.2 | Enhanced cold-chain protocols, QC procedures, revenue tracking (UNC-373) | COO |
| 2026-04-17 | 1.1 | Added additional protein procedures (UNC-372) | COO |
| 2026-04-01 | 1.0 | Initial fulfillment procedures | COO |

---

**Next Review Date:** 2026-05-01 (or after first 30 additional protein orders)
