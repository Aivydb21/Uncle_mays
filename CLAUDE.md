# Uncle May's Produce — Project Context for Claude Code

## Business Overview
- **Business:** Uncle May's Produce
- **URL:** https://www.unclemays.com
- **Type:** E-commerce + Local Business (Chicago)
- **Model:** Seasonal produce boxes sourced from Black farmers, delivered across Chicago
- **Pricing:** Starter $35 / Family $65 / Community $95
- **No subscription required** — this is a deliberate brand differentiator; keep the tagline "No subscription. No commitment. Just good food."
- **Revenue:** Stripe embedded checkout on-site (customers never leave unclemays.com)
- **Stage:** Live commerce site, active Meta ads campaign running

## Delivery Schedule
Orders are delivered **every Wednesday** across Chicago (temporary schedule; confirm before changing copy site-wide). Customers should order **by Tuesday night** when possible for the upcoming Wednesday route. Placeholder example: order placed Monday April 6, delivered Wednesday April 8. This copy should stay aligned in Pricing, FAQ, Hero/Mobile CTA, and JSON-LD where delivery is mentioned.

## Key URLs & Integrations
- **Primary contact email:** info@unclemays.com (use for ALL contact, investor, and support mailto: links)
- **Instagram:** @unclemaysproduce → https://www.instagram.com/unclemaysproduce/
- **Physical address:** 73 W Monroe Ave #3002, Chicago, IL 60603
- **Phone:** +1-312-972-2595
- **GitHub repo:** https://github.com/Aivydb21/Uncle_mays.git
- **Source code location:** `C:\Users\Anthony\Desktop\um_website`
- **Hosting:** Vercel (auto-deploys from GitHub main branch)

## Environment Variables
All secrets and external service IDs live in `.env` (gitignored). Server-side vars (no `NEXT_PUBLIC_` prefix) are available only in API routes. Client-side vars are inlined at build time.

| Variable | Purpose |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe secret key (server-side only, used by API route) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (client-side, loads embedded checkout) |
| `NEXT_PUBLIC_STRIPE_STARTER_URL` | Legacy Stripe payment link for Starter Box (fallback) |
| `NEXT_PUBLIC_STRIPE_FAMILY_URL` | Legacy Stripe payment link for Family Box (fallback) |
| `NEXT_PUBLIC_STRIPE_COMMUNITY_URL` | Legacy Stripe payment link for Community Box (fallback) |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 measurement ID |
| `NEXT_PUBLIC_FB_PIXEL_ID` | Facebook/Meta Pixel ID |
| `NEXT_PUBLIC_EMAIL_FORM_URL` | Google Form URL for email capture |

When updating analytics IDs, edit `.env` only. Do not hardcode these values in source files. Stripe Price IDs are in `src/app/api/checkout/route.ts`.

## Tech Stack
- **Framework:** Next.js 15 + React 18 + TypeScript (App Router, server-side on Vercel)
- **Build output:** Hybrid static + dynamic. Most pages pre-rendered; `/api/checkout` and `/checkout/[product]` are server-rendered on demand.
- **UI:** shadcn/ui component library (components in `src/components/ui/`)
- **Animation:** Framer Motion
- **Routing:** Next.js App Router (file-based: src/app/)
- **Fonts:** next/font/google (Playfair Display + Work Sans via CSS variables)
- **Payments:** Stripe Embedded Checkout (`@stripe/react-stripe-js`) — checkout form rendered on-site at `/checkout/[product]`, backed by server API route at `/api/checkout`
- **Analytics:** GA4 + Facebook Pixel (loaded via next/script, afterInteractive)
- **SEO:** All pages SSG with per-page metadata, 4 JSON-LD schemas on homepage

## Project File Map
```
um_website/
├── next.config.ts               ← images: unoptimized (no static export; server routes enabled)
├── tsconfig.json                 ← single config, @/* → ./src/*
├── tailwind.config.ts            ← custom earth-tone palette, next/font CSS vars
├── postcss.config.js
├── components.json               ← shadcn/ui config (rsc: true)
├── package.json
├── .env                          ← secrets (gitignored)
├── src/
│   ├── app/
│   │   ├── layout.tsx            ← root layout (fonts, metadata, analytics, Nav/Footer)
│   │   ├── page.tsx              ← homepage (JSON-LD schemas + <HomePageContent />)
│   │   ├── globals.css           ← design system (CSS variables, Tailwind)
│   │   ├── not-found.tsx         ← 404 page
│   │   ├── api/checkout/route.ts ← server API: creates Stripe Checkout Sessions
│   │   ├── checkout/[product]/page.tsx ← embedded Stripe checkout (starter/family/community)
│   │   ├── order-success/        ← post-checkout confirmation page
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
│   │   ├── Pricing.tsx           ← 3 box tiers with checkout links and price anchoring
│   │   ├── Navigation.tsx        ← sticky nav, "Order Now" → /#boxes
│   │   ├── Footer.tsx            ← links, social, contact (uses next/link)
│   │   ├── MobileCTA.tsx         ← sticky mobile bottom bar (appears after 300px scroll)
│   │   ├── Providers.tsx         ← TooltipProvider + Toasters (client wrapper)
│   │   ├── FacebookPixelTracker.tsx ← tracks PageView on route change (usePathname)
│   │   └── ui/                   ← shadcn/ui components (all "use client")
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
4. Farmer Profiles (3 farms)
5. Pricing (#boxes — 3 tiers with price anchoring, real box contents including meat)
6. Testimonials (3 post-delivery customer quotes with box tier)
7. FAQ (5 questions)
8. Email Capture (Google Form link — "Stay connected to what's growing")
9. Bottom CTA

## Brand Voice & Rules
- Tone: Direct, warm, mission-driven, community-oriented, unpretentious
- Never corporate-speak; always specific over vague
- The brand is named after a person — "Uncle May" — but no founder story is on the site yet
- Mission framing: "Fresh produce from Black farmers to Chicago"
- Always use "produce boxes" not "subscription boxes" (there is no subscription)
- No em dashes in copy — they look AI-generated. Use periods or commas instead.
- Pricing copy uses per-pound anchoring (see Pricing.tsx for current values)

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
- External service IDs and URLs come from `.env` via `process.env.NEXT_PUBLIC_*`

## Development
```bash
npm run dev          # local dev server (http://localhost:3000)
npm run build        # production build — must pass before deploying
```
- Always run `npm run build` after changes to verify no TypeScript errors or broken exports
- Vercel auto-deploys from the `main` branch — a passing build locally means a clean deploy
- Box contents and pricing are in `Pricing.tsx` — update there when seasonal items change
- Farmer profiles are in `Index.tsx` — update there when farm partners change

## Critical Paths — Don't Break
These flows directly affect revenue and trust. Test after any related changes:

1. **Stripe checkout flow** — "Order Now" buttons in Pricing.tsx route to `/checkout/[product]` which loads embedded Stripe checkout via the `/api/checkout` server route. Broken API route or missing env vars = lost sales.
2. **Mobile CTA** — `MobileCTA.tsx` sticky bar appears after 300px scroll on mobile. This is the primary conversion path for phone users.
3. **Analytics firing** — GA4 and Facebook Pixel in `layout.tsx` must load on every page. The Meta ads campaign depends on Pixel events for optimization.
4. **JSON-LD schemas** — 4 schemas in `page.tsx` (LocalBusiness, Organization, ItemList, FAQPage). Google uses these for rich results. Malformed JSON breaks all of them silently.

## P1 — Fix Soon
- [ ] Canonical/OG URL trailing slash inconsistency (sitemap uses no slash, canonical resolves with slash)
- [ ] Per-page canonical tags on /investors, /privacy, /terms
- [ ] Image optimization: add `loading="lazy"` and explicit `width`/`height` to `<img>` tags
- [ ] Hero background image: convert from CSS backgroundImage to `<img>` tag with alt text
- [ ] OG image: verify uncle-mays-logo.png is 1200x630; if not, create a proper social share card

## Backlog
- [ ] Founder/About page ("Why Uncle May's" copy is ready to use)
- [ ] Embedded email capture form (replace Google Form with Mailchimp/ConvertKit)
- [ ] Neighborhood-specific landing pages (South Shore, Bronzeville, Hyde Park, Chatham) for SEO
- [ ] "No subscription produce delivery Chicago" as dedicated SEO page
- [ ] "Produce + protein box Chicago" angle — no competitor offers this
