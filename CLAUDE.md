# Uncle May's Produce — Project Context for Claude Code

## Business Overview
- **Business:** Uncle May's Produce
- **URL:** https://www.unclemays.com
- **Type:** E-commerce + Local Business (Chicago)
- **Model:** Seasonal produce boxes sourced from Black farmers, delivered across Chicago
- **Pricing:** Starter $35 / Family $65 / Community $95
- **No subscription required** — this is a deliberate brand differentiator; keep the tagline "No subscription. No commitment. Just good food."
- **Revenue:** Stripe checkout (external links per box tier)
- **Stage:** Live commerce site

## Delivery Schedule
Orders are delivered **every Sunday at the end of the order week**. If a customer places an order any day of a given week, delivery is the Sunday following that week. Example: order placed Wednesday March 25 → delivered Sunday March 30. This copy should appear in Pricing and FAQ contexts.

## Key URLs & Integrations
- **Email capture form:** `https://docs.google.com/forms/d/e/1FAIpQLSfmaSTz-8JuH3RXsL3sCBakVjBcqGQML6muiYeFOdLQ-FwqoA/viewform?usp=header`
- **Primary contact email:** info@unclemays.com (use for ALL contact, investor, and support mailto: links)
- **Instagram:** @unclemays → https://www.instagram.com/unclemays
- **Physical address:** 73 W Monroe Ave #3002, Chicago, IL 60603
- **Phone:** +1-312-972-2595
- **GitHub repo:** https://github.com/Aivydb21/Uncle_mays.git
- **Source code location:** `C:\Users\Anthony\Desktop\Desktop Sweep 12_19\um_website`
- **Hosting:** Vercel (auto-deploys from GitHub main branch)
- **Google Analytics:** G-QWY5HRLX12
- **Facebook Pixel:** 2276705169443313

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
│   │   ├── Index.tsx             ← homepage sections (How It Works, Farmers, Testimonials, FAQ, etc.)
│   │   ├── Investors.tsx
│   │   ├── Privacy.tsx
│   │   ├── Terms.tsx
│   │   └── NotFound.tsx
│   ├── components/
│   │   ├── Hero.tsx              ← headline, primary CTA, trust chips
│   │   ├── Pricing.tsx           ← 3 box tiers with Stripe links, price anchoring, mini FAQ
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

## Homepage Section Order
1. Hero (headline, CTA, trust chips)
2. How It Works (3 steps)
3. What You're Getting (4 features + sample box)
4. Why Uncle May's (mission points)
5. Farmer Profiles (3 farms)
6. **Testimonials** (3 post-delivery customer quotes with box tier)
7. **Pricing** (#boxes — 3 tiers with price anchoring)
8. FAQ (5 questions)
9. **Email Capture** (Google Form link — "Stay connected to what's growing")
10. Get Involved (Order + Invest CTAs)
11. Bottom CTA

## Brand Voice & Rules
- Tone: Direct, warm, mission-driven, community-oriented, unpretentious
- Never corporate-speak; always specific over vague
- The brand is named after a person — "Uncle May" — but no founder story is on the site yet
- Mission framing: "Fresh produce from Black farmers to Black households in Chicago"
- Always use "produce boxes" not "subscription boxes" (there is no subscription)
- Pricing copy uses per-pound anchoring (~$2.33/lb, ~$2.50/lb, ~$2.71/lb)

## Farmer Profiles (as shown on site)
1. **Roots & Soil Farm** — Pembroke Township, IL — Specialty: root vegetables, greens, sweet corn
2. **South Side Harvest Co.** — Chicago, IL — Specialty: urban greens, herbs, microgreens
3. **Freedom Fields Farm** — Kankakee, IL — Specialty: seasonal stone fruit, squash, heirloom tomatoes

## Known Pending Issues (as of March 30, 2026)

### Completed (this session)
- [x] Migrated from Vite SPA to Next.js SSG (all pages pre-rendered as static HTML)
- [x] JSON-LD schemas updated for live commerce (LocalBusiness, Organization, ItemList, FAQPage)
- [x] OG + Twitter image fixed to absolute URL
- [x] LocalBusiness schema: areaServed → Chicago, sameAs → Instagram, servesCuisine removed
- [x] FAQPage and Product JSON-LD schemas added
- [x] Stripe bridge copy added to Pricing
- [x] Delivery window copy added to Pricing
- [x] Email capture section added (Google Form link)
- [x] Testimonials replaced with post-delivery customer quotes
- [x] Testimonials moved above Pricing section
- [x] Price anchoring added to pricing cards
- [x] "Weekly deliveries" copy fixed to "Order anytime — delivered Sundays"
- [x] Email capture moved below FAQ, headline changed to "Stay connected to what's growing"
- [x] Investors link removed from navigation

### P1 — Fix soon
- [ ] Canonical/OG URL trailing slash inconsistency (sitemap uses no slash, canonical resolves with slash)
- [ ] Per-page canonical tags on /investors, /privacy, /terms
- [ ] Image optimization: add `loading="lazy"` and explicit `width`/`height` to `<img>` tags
- [ ] Hero background image: convert from CSS backgroundImage to `<img>` tag with alt text
- [ ] OG image: verify uncle-mays-logo.png is 1200x630; if not, create a proper social share card
- [ ] Instagram URL inconsistency: footer uses `instagram.com`, schema uses `www.instagram.com`

### Backlog — Consider implementing
- [ ] Founder/About page or section (highest trust-building action available)
- [ ] Post-purchase email sequence (delivery confirmation, satisfaction check, reorder nudge)
- [ ] Referral program ("Give $10, Get $10")
- [ ] Embedded email capture form (replace Google Form with Mailchimp/ConvertKit)
- [ ] "Why Uncle May's" comparison section (vs CSA vs grocery delivery)
- [ ] Google Business Profile (claim and optimize)
- [ ] Press outreach to Block Club Chicago, Eater Chicago
- [ ] Content strategy: monthly farm stories as blog posts
- [ ] Community partnerships (churches, neighborhood orgs)
- [ ] Group order / gifting options

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
