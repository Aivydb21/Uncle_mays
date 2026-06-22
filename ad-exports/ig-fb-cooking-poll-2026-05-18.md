# Instagram + Facebook Cooking-Demo Poll Post

**Drafted:** 2026-05-18
**Channels:** Instagram (@unclemaysproduce), Facebook Page (Uncle May's Produce, 755316477673748)
**Format:** Single image, identical caption on both
**Cross-post:** Use `--also-facebook` flag on `scripts/post-to-instagram.py`
**Goal:** Engagement (comments), surface customer preference, generate downstream short-form video content tied to a real Black farmer relationship

---

## Caption (final)

Quick favor.

We're filming a short series this month showing how to cook with the produce and proteins from Run A Way Buckers Club, the Black farming partner in Pembroke, IL that grows everything we ship.

Tell us which one we should film first.

🥕 Candy orange carrots
🥬 Tuscan kale
🍠 Sweet potatoes
🥩 Grass-fed beef short ribs

Drop your pick in the comments. The item with the most love by Friday gets the first video.

Everything we cook with is on the catalog at unclemays.com/shop. First order is $10 off with code FRESH10 ($20 minimum cart). We deliver every day across the south side, the Loop, Pilsen, and the south suburbs.

#UncleMaysProduce #BlackFarmers #PembrokeIL #ChicagoFood #SouthSideChicago #BlackOwnedGrocery #FarmToTable

---

## Image guidance

One feed image, 1080x1080 (square is safest for cross-post; Instagram crops 4:5 portrait but Facebook prefers landscape and square renders cleanly on both).

**Option A (recommended):** A clean overhead shot showing all four candidate items side-by-side on a wooden surface, each labeled. Reads as a "vote board" the second someone scrolls past.

**Option B:** A produce-only hero shot (the candy carrots and kale are the most photogenic of the four) with text overlay: "Which should we cook first?"

**Option C:** A four-panel collage (one panel per item) with vote-style numbering.

If a hero image is not ready, post Option B with a stock-style overhead of the candy carrots; they are visually the most distinctive and tie cleanly to the partner-farm story.

---

## Verification against customer-facts.md (read before posting)

- ✅ Run A Way Buckers Club is the named farmer partner (line 14 of customer-facts.md)
- ✅ All 4 items are on the live catalog: candy orange carrots ($1.50), Tuscan kale ($3.00), sweet potato ($2.50), beef short ribs ($8.50 bone-in / $12.50 boneless)
- ✅ `FRESH10` is the live promo code, $10 off, $20 minimum cart (line 62)
- ✅ Service area phrasing matches: south side + Loop + Pilsen + south suburbs (line 27)
- ✅ Delivery cadence "every day" matches (line 23)
- ✅ No em dashes anywhere in the caption
- ✅ No retired claims (no "Spring Box", no `WELCOME20`, no "Thursday delivery", no "subscribe & save", no "auto-apply promo")

---

## Posting commands

```bash
# 1. Stage the image to Vercel Blob
py scripts/upload-to-blob.py path/to/cooking-poll.jpg \
  --pathname social/2026-05-18/cooking-poll.jpg

# 2. Cross-post to Instagram + Facebook with the caption from this file
py scripts/post-to-instagram.py \
  --image-url <blob-url-from-step-1> \
  --caption "$(cat ad-exports/ig-fb-cooking-poll-2026-05-18.md | sed -n '/^Quick favor/,/^#FarmToTable/p')" \
  --also-facebook
```

(In practice it's faster to just copy the caption block above and paste it inline with `--caption "..."`.)

---

## Follow-up tasks (after posting)

- **Friday cutoff:** Tally comments. Winner becomes Demo #1.
- **Production:** Single 60-second vertical video, shot in kitchen, captioned, exportable to Reels and Facebook video. Phone is fine for this — production polish is not the differentiator, the farmer story is.
- **Reciprocal post:** Tag Run A Way Buckers Club in the recipe video (confirm their handle first).
- **Paperclip audit trail:** Open a Paperclip issue describing the post + expected engagement + rollback path, per the CRO-at-will standing order.
