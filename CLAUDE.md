# Uncle May's Produce — Project Context for Claude Code

## Business Overview
- **Business:** Uncle May's Produce
- **URL:** https://www.unclemays.com
- **Type:** E-commerce + Local Business (Chicago)
- **Model:** Seasonal produce boxes sourced from Black farmers, delivered across Chicago
- **Pricing:** Starter $35 / Family $65 / Community $95
- **No subscription required** — deliberate brand differentiator; keep tagline "No subscription. No commitment. Just good food."
- **Revenue:** Stripe checkout (external links per box tier)
- **Stage:** Live commerce site, recently launched

## Delivery Schedule
Orders are delivered **every Sunday at the end of the order week**. If a customer places an order any day of a given week, delivery is the following Sunday. Example: order placed Wednesday → delivered the following Sunday. This copy belongs in Pricing, FAQ, and any delivery-related sections.

## Key URLs & Integrations
- **Email capture / mailing list form:** `https://docs.google.com/forms/d/e/1FAIpQLSfmaSTz-8JuH3RXsL3sCBakVjBcqGQML6muiYeFOdLQ-FwqoA/viewform?usp=header`
- **Primary contact email:** info@unclemays.com — use for ALL contact, investor, and support mailto: links
- **Instagram:** @unclemays → https://www.instagram.com/unclemays
- **Physical address:** 73 W Monroe Ave #3002, Chicago, IL 60603
- **Phone:** +1-312-972-2595
- **GitHub repo:** https://github.com/Aivydb21/Uncle_mays.git
- **Hosting:** Vercel (auto-deploys from GitHub main branch)
- **Google Analytics:** G-QWY5HRLX12
- **Facebook Pixel:** 2276705169443313

## Stripe Checkout Links (by tier)
- Starter $35: `https://buy.stripe.com/cNidR983d5Mw83JcNu9Zm08`
- Family $65: `https://buy.stripe.com/dRmbJ1erB2AkcjZeVC9Zm09`
- Community $95: `https://buy.stripe.com/8x25kD5V5b6QabR7ta9Zm0a`

## Tech Stack
- **Framework:** Vite + React + TypeScript (SPA — NOT Next.js, no SSR/SSG)
- **UI:** shadcn/ui component library
- **Animation:** Framer Motion
- **Router:** React Router (routes: /, /investors, /privacy, /terms, /404)
- **Payments:** Stripe (external checkout links, not embedded)
- **Analytics:** GA4 + Facebook Pixel (both in index.html)
- **SEO risk:** All content is JS-rendered — Googlebot must execute JavaScript to index it

## File Map
```
um_website/
├── CLAUDE.md                    ← this file
├── index.html                   ← title, meta, JSON-LD schemas, OG/Twitter tags
├── src/
│   ├── pages/
│   │   ├── Index.tsx            ← main homepage (How It Works, Pricing, Farmers, FAQ, etc.)
│   │   ├── Investors.tsx        ← investor pitch page
│   │   ├── Privacy.tsx
│   │   └── Terms.tsx
│   ├── components/
│   │   ├── Hero.tsx             ← headline, primary CTA, trust chips
│   │   ├── Pricing.tsx          ← 3 box tiers with Stripe links
│   │   ├── Navigation.tsx       ← sticky nav, "Order Now" → #boxes
│   │   ├── Footer.tsx           ← links, social, contact
│   │   ├── MobileCTA.tsx        ← sticky mobile bottom bar (appears after 300px scroll)
│   │   └── Layout.tsx           ← wraps Navigation + MobileCTA + Footer
│   └── App.tsx
└── public/
    └── uncle-mays-logo.png
```

## Marketing Audit Reports (in separate folder)
Reports live at: `C:\Users\Anthony\Desktop\Marketing_repo\`
- `MARKETING-AUDIT.md` — full audit, overall score 60/100
- `LANDING-CRO.md` — CRO audit, score 38/100

## Brand Voice & Rules
- Tone: Direct, warm, mission-driven, community-oriented, unpretentious
- Never corporate-speak; always specific over vague
- The brand is named after a person — "Uncle May" — but no founder story is on the site yet (high-priority gap)
- Mission framing: "Fresh produce from Black farmers to Black households in Chicago"
- Always say "produce boxes" not "subscription boxes" — there is no subscription
- All links to external URLs: `target="_blank" rel="noopener noreferrer"`

## Farmer Partners (real, named)
1. **Johnson Family Farm** — Pemberton, NJ — leafy greens and root vegetables
2. **Sunrise Acres** — Kalamazoo, MI — heirloom tomatoes and sweet corn
3. **Green Roots Farm** — Gary, IN — herbs and seasonal squash

## Coding Conventions
- TypeScript strict — no `any` types
- Tailwind CSS for all styling (no inline styles unless Framer Motion requires it)
- shadcn/ui components preferred over custom UI
- Mobile-first responsive design
- Framer Motion for entrance animations (keep subtle — food brand, not SaaS)

## Pending Work

### Completed ✅
- Shifted site from waitlist/pre-launch to live commerce
- Hero, Pricing, Navigation, Footer, MobileCTA all updated for live service
- Removed Invest button from hero (kept in footer only)
- All mailto links → info@unclemays.com
- Fixed stale JSON-LD schemas (removed waitlist/Summer 2026 references)
- Fixed OG + Twitter image to absolute URLs
- Fixed canonical/OG URL trailing slash consistency
- Added FAQPage JSON-LD schema
- Added Product JSON-LD schema (ItemList with 3 tiers)
- Fixed LocalBusiness schema (areaServed → Chicago, sameAs → Instagram, removed servesCuisine)
- Added Stripe bridge copy to Pricing.tsx
- Added delivery window copy to Pricing.tsx ("Orders deliver every Sunday")
- Added freshness/delivery guarantee to Pricing.tsx
- Added mini FAQ accordion (4 questions) directly in Pricing section
- Corrected testimonials section headers (overclaim removed)
- Resequenced page: mission + farmers now appear BEFORE pricing
- Added email capture section linking to Google Form
- Added alt text to produce box image
- Updated delivery copy in How It Works step 3 and FAQ to reference Sunday delivery

### Still To Do
- [ ] Founder/About page — user wants to get first orders in before adding photo/story
- [ ] Referral or group order program
- [ ] Consider opt-in seasonal subscription (keep no-subscription as default)
- [ ] Press outreach: Block Club Chicago, Eater Chicago, Chicago Tribune Food
- [ ] SSG/SSR migration (Next.js or Astro) for full SEO indexability — long-term
