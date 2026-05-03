# Canva Brand Template Setup Guide

## Overview

3 blank designs have been created via the API at the correct dimensions. Anthony needs to style them in the Canva editor and publish each as a brand template. Once published, the autofill validation script can generate ad variants programmatically.

**Time estimate:** 15-20 minutes total (5-7 min per template)

---

## Designs to Set Up

| # | Title | Dimensions | Design ID | Use Case |
|---|-------|-----------|-----------|----------|
| 1 | Uncle Mays - Brand Template - Instagram Post 1080x1080 | 1080x1080 | `DAHGr7UEH74` | Instagram feed ads + organic posts |
| 2 | Uncle Mays - Brand Template - Facebook Ad 1200x628 | 1200x628 | `DAHGrygozEY` | Facebook feed ads |
| 3 | Uncle Mays - Brand Template - Story Reel 1080x1920 | 1080x1920 | `DAHGr7F9q1Q` | IG/FB stories and reels |

---

## Step-by-Step (Repeat for Each Design)

### Step 1: Open the Design

Go to canva.com, find the design by name (they will appear in your recent designs), or search by title.

### Step 2: Add Brand Elements

Add the following to each design:

**Background:**
- Use the produce photo already uploaded (asset ID `MAHGqpAdAR0`) as a background or hero image
- Alternatively, use a solid brand color background (#1B5E20 deep green or #2E7D32)

**Logo:**
- Add the Uncle May's Produce logo (asset ID `MAHGqhNKUqA`) in the top-left or top-center
- Size: ~150px wide for 1080x1080, ~180px for 1200x628, ~120px for 1080x1920

**Text Elements (3 required):**
1. **Headline** - Large, bold text. Position: center or upper-third. Font: Bold sans-serif (Montserrat Bold or similar). Size: 48-64pt for 1080x1080.
   - Placeholder text: `Fresh Produce Box, $30`
2. **Subhead** - Medium text below headline. Font: Regular weight. Size: 24-32pt.
   - Placeholder text: `Hand-curated seasonal fruits & vegetables`
3. **CTA** - Button-style text at the bottom. Bold, contrasting color. Size: 28-36pt.
   - Placeholder text: `Order Now at unclemays.com`

**Image Placeholder:**
- Add a frame or image placeholder where the produce photo goes
- This will be swapped via autofill for different product shots

### Step 3: Enable Data Autofill on Each Element

This is the critical step that makes programmatic variant generation work.

For each text element and the image placeholder:

1. **Select the element** (click on it)
2. **Right-click** or use the **"..."** menu
3. Select **"Connect data"** (or **"Data autofill"** depending on your Canva version)
4. **Name the field** exactly as follows:
   - Headline text: `Headline`
   - Subhead text: `Subhead`
   - CTA text: `CTA`
   - Image placeholder: `Product_Photo`

**Important:** The field names must match exactly (case-sensitive) for the autofill script to work.

### Step 4: Publish as Brand Template

1. Click the **"Share"** button (top-right)
2. Select **"Brand template"** or go to **Brand > Brand Templates**
3. Click **"Publish as brand template"**
4. Confirm publication

The template will now appear in the Brand Templates section and be accessible via the API.

---

## Validation

After publishing all 3 templates, run the validation script:

```bash
cd ~/Desktop/um_website
python scripts/canva-validate-autofill.py           # verify templates + datasets
python scripts/canva-validate-autofill.py --generate # generate 5 test variants per template
```

Expected output:
- Script lists 3 brand templates
- Shows autofill fields (Headline, Subhead, CTA, Product_Photo) for each
- With `--generate`: creates 15 variant designs (5 per template) with different copy

---

## Brand Styling Reference

| Element | Value |
|---------|-------|
| Primary Green | #1B5E20 |
| Accent Green | #2E7D32 |
| Text on Dark | #FFFFFF |
| Text on Light | #1B5E20 |
| Font (Headlines) | Montserrat Bold or similar bold sans-serif |
| Font (Body) | Montserrat Regular or Open Sans |
| Logo Asset | `MAHGqhNKUqA` |
| Produce Photo | `MAHGqpAdAR0` |

---

## What This Unlocks

Once brand templates are published and validated:
- Programmatic generation of ad variant sets (5+ variants in one script run)
- Rapid A/B test creative for Meta campaigns
- Consistent brand across all formats (Instagram, Facebook, Stories)
- Automated creative pipeline for the Advertising Creative agent
