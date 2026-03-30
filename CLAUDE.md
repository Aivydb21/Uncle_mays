# Uncle May's Produce — Project Context for Claude Code

## Business Overview
- **Business:** Uncle May's Produce
- **URL:** https://www.unclemays.com
- **Type:** E-commerce + Local Business (Chicago)
- **Model:** Seasonal produce boxes sourced from Black farmers, delivered across Chicago
- **Pricing:** Starter $35 / Family $65 / Community $95
- **No subscription required** — this is a deliberate brand differentiator; keep the tagline "No subscription. No commitment. Just good food."
- **Revenue:** Stripe checkout (external links per box tier)
- **Stage:** Live commerce site, active Meta ads campaign running

## Delivery Schedule
Orders are delivered **every Sunday at the end of the order week**. If a customer places an order any day of a given week, delivery is the Sunday following that week. Example: order placed Wednesday March 25 → delivered Sunday March 30. This copy should appear in Pricing and FAQ contexts.

## Key URLs & Integrations
- **Email capture form:** `https://docs.google.com/forms/d/e/1FAIpQLSfmaSTz-8JuH3RXsL3sCBakVjBcqGQML6muiYeFOdLQ-FwqoA/viewform?usp=header`
- **Primary contact email:** info@unclemays.com (use for ALL contact, investor, and support mailto: links)
- **Instagram:** @unclemaysproduce → https://www.instagram.com/unclemaysproduce/
- **Physical address:** 73 W Monroe Ave #3002, Chicago, IL 60603
- **Phone:** +1-312-972-2595
- **GitHub repo:** https://github.com/Aivydb21/Uncle_mays.git
- **Source code location:** `C:\Users\Anthony\Desktop\Desktop Sweep 12_19\um_website`
- **Hosting:** Vercel (auto-deploys from GitHub main branch)
- **Google Analytics:** G-QWY5HRLX12
- **Facebook Pixel:** 2276705169443313 (connected to "Uncle Mays Ads" ad account, receiving events)

## Stripe Payment Links (current, updated March 30, 2026)
- **Starter Box ($35):** https://buy.stripe.com/14AfZh2IT0sces75l29Zm03
- **Family Box ($65):** https://buy.stripe.com/4gM7sL2ITej2gAf3cU9Zm07
- **Community Box ($95):** https://buy.stripe.com/5kQ28r0AL6QA83J4gY9Zm06

## Box Contents (actual, as of March 30, 2026)
**Starter Box ($35) — ~12-15 lbs:**
- Sweet potatoes, russet potatoes, yellow onions, bell peppers, mixed greens or kale, heirloom tomatoes

**Family Box ($65) — ~22-26 lbs:**
- Sweet potatoes, russet potatoes, onions, bell peppers, kale, collard greens, mustard greens, winter squash + 1 dozen eggs
- Choose 1 meat: whole chicken (4.5 lbs), ground beef (2 lbs), or pork bratwurst (3 lbs)

**Community Box ($95) — ~30-35 lbs:**
- Sweet potatoes, russet potatoes, onions, bell peppers, kale, collards, mustard greens, heirloom tomatoes, winter squash + 2 dozen eggs
- Choose 2 proteins: whole chicken, ground beef, pork chops (3 lbs), lamb stew (1 lb), or pork ribs (2-3 lbs)

## Tech Stack
- **Framework:** Next.js 15 + React 18 + TypeScript (App Router, static export)
- **Build output:** Static HTML via `output: 'export'` — all pages pre-rendered at build time
- **UI:** shadcn/ui component library (48 components, all with "use client")
- **Animation:** Framer Motion
- **Routing:** Next.js App Router (file-based: src/app/)
- **Fonts:** next/font/google (Playfair Display + Work Sans via CSS variables)
- **Payments:** Stripe (external checkout links, not embedded)
- **Analytics:** GA4 + Facebook Pixel (loaded via next/script, afterInteractive)
- **SEO:** All pages SSG with per-page metadata, 4 JSON-LD schemas on homepage

## Project File Map
```
um_website/
├── next.config.ts               ← output: 'export', images: unoptimized
├── tsconfig.json                 ← single config, @/* → ./src/*
├── tailwind.config.ts            ← custom earth-tone palette, next/font CSS vars
├── postcss.config.js
├── components.json               ← shadcn/ui config (rsc: true)
├── package.json
├── src/
│   ├── app/
│   │   ├── layout.tsx            ← root layout (fonts, metadata, analytics, Nav/Footer)
│   │   ├── page.tsx              ← homepage (JSON-LD schemas + <HomePageContent />)
│   │   ├── globals.css           ← design system (CSS variables, Tailwind)
│   │   ├── not-found.tsx         ← 404 page
│   │   ├── investors/page.tsx    ← investor pitch page
│   │   ├── privacy/page.tsx
│   │   └── terms/page.tsx
│   ├── page-content/
│   │   ├── Index.tsx             ← homepage sections (How It Works, Farmers, Pricing, Testimonials, FAQ, etc.)
│   │   ├── Investors.tsx
│   │   ├── Privacy.tsx
│   │   ├── Terms.tsx
│   │   └── NotFound.tsx
│   ├── components/
│   │   ├── Hero.tsx              ← headline, primary CTA, trust chips
│   │   ├── Pricing.tsx           ← 3 box tiers with Stripe links and price anchoring (no mini FAQ)
│   │   ├── Navigation.tsx        ← sticky nav, "Order Now" → /#boxes
│   │   ├── Footer.tsx            ← links, social, contact (uses next/link)
│   │   ├── MobileCTA.tsx         ← sticky mobile bottom bar (appears after 300px scroll)
│   │   ├── Providers.tsx         ← TooltipProvider + Toasters (client wrapper)
│   │   ├── FacebookPixelTracker.tsx ← tracks PageView on route change (usePathname)
│   │   └── ui/                   ← 48 shadcn/ui components (all "use client")
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   └── lib/
│       └── utils.ts              ← cn() utility
└── public/
    ├── uncle-mays-logo.png
    ├── favicon.ico
    ├── robots.txt
    ├── sitemap.xml
    └── images/
        ├── hero-produce.jpg
        ├── produce-box.jpg
        └── heritage.jpg
```

## Homepage Section Order (current)
1. Hero (headline, CTA, trust chips)
2. How It Works (3 steps)
3. What You're Getting (4 features + sample box)
4. Farmer Profiles (3 farms, no subtitle)
5. Pricing (#boxes — 3 tiers with price anchoring and real box contents including meat)
6. Testimonials (3 post-delivery customer quotes with box tier — placed AFTER pricing)
7. FAQ (5 questions)
8. Email Capture (Google Form link — "Stay connected to what's growing")
9. Bottom CTA

**Removed sections:** "Why Uncle May's" (saved for future About page), "Get Involved" (Order + Invest cards)

## Brand Voice & Rules
- Tone: Direct, warm, mission-driven, community-oriented, unpretentious
- Never corporate-speak; always specific over vague
- The brand is named after a person — "Uncle May" — but no founder story is on the site yet
- Mission framing: "Fresh produce from Black farmers to Chicago"
- Always use "produce boxes" not "subscription boxes" (there is no subscription)
- No em dashes in copy — they look AI-generated. Use periods or commas instead.
- Pricing copy uses per-pound anchoring:
  - Starter: ~$2.33/lb delivered
  - Family: ~$2.17/lb with produce, eggs, and meat
  - Community: ~$2.26/lb with produce, 2 dozen eggs, and 2 proteins

## Farmer Profiles (as shown on site)
1. **Roots & Soil Farm** — Pembroke Township, IL — Specialty: root vegetables, greens, sweet corn
2. **South Side Harvest Co.** — Chicago, IL — Specialty: urban greens, herbs, microgreens
3. **Freedom Fields Farm** — Kankakee, IL — Specialty: seasonal stone fruit, squash, heirloom tomatoes

## Marketing Files (in C:\Users\Anthony\Desktop\Marketing_repo\)
- **LAUNCH-PLAYBOOK.md** — Updated Phase 1 (first 10 customers, no product photos) and Phase 2 (scale to 50 orders/week) launch strategy
- **COMPETITOR-REPORT.md** — Full competitive intelligence report (8 competitors analyzed, March 30, 2026)
- **MARKETING-AUDIT.md** — Site audit (62/100 score)

## Meta Ads Status (as of March 30, 2026)
- **Ad account:** Uncle Mays Ads
- **Pixel:** 2276705169443313 (connected, receiving events)
- **Active campaign:** Conversions objective, Initiate Checkout event
- **Budget:** $10/day (Phase 1), increasing to $20/day after first 10 customers
- **Targeting:** Chicago South Side ZIP codes (60615, 60653, 60649, 60619, 60620, 60637, 60617, 60628, 60621, 60616), ages 25-55
- **Ad graphic:** Square format image from previous hire (placeholder until real product photos after first delivery)
- **Key ad copy angle:** Black farmer sourcing + no subscription + $35 entry price

## Known Pending Issues (as of March 30, 2026)

### Completed (prior sessions)
- [x] Migrated from Vite SPA to Next.js SSG (all pages pre-rendered as static HTML)
- [x] JSON-LD schemas updated for live commerce (LocalBusiness, Organization, ItemList, FAQPage)
- [x] OG + Twitter image fixed to absolute URL
- [x] LocalBusiness schema: areaServed → Chicago, sameAs → Instagram, servesCuisine removed
- [x] FAQPage and Product JSON-LD schemas added
- [x] Stripe bridge copy added to Pricing
- [x] Delivery window copy added to Pricing
- [x] Email capture section added (Google Form link)
- [x] Testimonials replaced with post-delivery customer quotes
- [x] Price anchoring added to pricing cards
- [x] Email capture moved below FAQ, headline changed to "Stay connected to what's growing"
- [x] Investors link removed from navigation

### Completed (March 30, 2026 session)
- [x] Instagram handle corrected to @unclemaysproduce across all files (Footer, Index, layout, page.tsx, CLAUDE.md)
- [x] Stripe payment links updated to new URLs (all three tiers)
- [x] Box contents updated to real items including meat options (Pricing cards, FAQ, Sample Box, JSON-LD)
- [x] Pricing anchors updated to reflect meat/eggs value on Family and Community boxes
- [x] "Why Uncle May's" section removed from homepage (content saved for future About page)
- [x] "Get Involved" section removed from homepage
- [x] Duplicate mini FAQ removed from Pricing.tsx
- [x] Testimonials moved to AFTER Pricing section
- [x] Farmer section subtitle ("Real names, real farms, real impact") removed
- [x] Em dashes replaced with natural punctuation throughout all visible copy
- [x] Mission paragraph updated (removed "to Black households" framing)
- [x] JSON-LD schema description updated to match
- [x] Instagram URL inconsistency fixed (all instances now use www.instagram.com/unclemaysproduce/)
- [x] LAUNCH-PLAYBOOK.md fully rewritten for Phase 1 (no photos, first 10 customers)
- [x] COMPETITOR-REPORT.md created (8 competitors, full analysis)
- [x] Meta ads campaign set up (conversions objective, South Side ZIP targeting)

### P1 — Fix soon
- [ ] Canonical/OG URL trailing slash inconsistency (sitemap uses no slash, canonical resolves with slash)
- [ ] Per-page canonical tags on /investors, /privacy, /terms
- [ ] Image optimization: add `loading="lazy"` and explicit `width`/`height` to `<img>` tags
- [ ] Hero background image: convert from CSS backgroundImage to `<img>` tag with alt text
- [ ] OG image: verify uncle-mays-logo.png is 1200x630; if not, create a proper social share card

### Backlog — Consider implementing
- [ ] Founder/About page (highest trust-building action; "Why Uncle May's" copy is ready to use)
- [ ] Real product photography (first delivery day — photograph everything)
- [ ] Post-purchase email sequence (build after first 10 customers)
- [ ] Referral program ("Give $10, Get $10" — build after first 10 customers)
- [ ] Embedded email capture form (replace Google Form with Mailchimp/ConvertKit)
- [ ] "Why Uncle May's" comparison section (vs CSA vs grocery delivery) — competitive report has the data
- [ ] Google Business Profile (claim and optimize)
- [ ] Press outreach to Block Club Chicago, Eater Chicago
- [ ] Neighborhood-specific content (South Shore, Bronzeville, Hyde Park, Chatham) for SEO
- [ ] Farm story posts (one per farm partner per month)
- [ ] Community partnerships (South Side churches, neighborhood orgs, group order discount)
- [ ] "No subscription produce delivery Chicago" as dedicated SEO page or ad campaign
- [ ] "Produce + protein box Chicago" angle — no competitor offers this

## Coding Conventions
- TypeScript (strict null checks enabled by Next.js)
- Tailwind CSS for all styling (no inline styles unless Framer Motion requires it)
- shadcn/ui components preferred over custom UI
- All links to external URLs open in `target="_blank" rel="noopener noreferrer"`
- All `mailto:` links use `info@unclemays.com`
- Mobile-first responsive design
- Framer Motion for entrance animations (keep subtle — this is a food brand, not a SaaS)
- `"use client"` at component level, not page level — app/ page files are Server Components
- Images served from `public/images/` as static paths (no next/image due to static export)
- Anchor links use `/#boxes` (not `#boxes`) for cross-page navigation
- No em dashes in any user-facing copy
