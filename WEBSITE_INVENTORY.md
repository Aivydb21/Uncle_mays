# Uncle Mays Produce - Website Inventory

**Last Updated:** January 27, 2025  
**Domain:** uncle-mays.vercel.app  
**Repository:** https://github.com/Aivydb21/Uncle_mays.git

---

## 📋 Table of Contents
1. [Technology Stack](#technology-stack)
2. [Pages & Routes](#pages--routes)
3. [Components](#components)
4. [Features & Functionality](#features--functionality)
5. [Assets & Media](#assets--media)
6. [SEO & Analytics](#seo--analytics)
7. [External Integrations](#external-integrations)
8. [Configuration Files](#configuration-files)
9. [Contact Information](#contact-information)
10. [Awards & Recognition](#awards--recognition)

---

## 🛠 Technology Stack

### Core Framework
- **React:** 18.3.1
- **TypeScript:** 5.8.3
- **Vite:** 7.2.4 (Build Tool)
- **React Router DOM:** 6.30.1 (Routing)

### UI & Styling
- **Tailwind CSS:** 3.4.17
- **shadcn/ui:** Component library (Radix UI primitives)
- **Framer Motion:** 12.23.24 (Animations)
- **Lucide React:** 0.462.0 (Icons)

### State Management & Data
- **TanStack Query:** 5.83.0 (Data fetching)
- **React Hook Form:** 7.61.1 (Forms)
- **Zod:** 3.25.76 (Validation)

### Development Tools
- **ESLint:** 9.32.0
- **TypeScript ESLint:** 8.38.0
- **PostCSS:** 8.5.6
- **Autoprefixer:** 10.4.21

---

## 📄 Pages & Routes

### Active Routes
1. **`/`** - Home Page (Index)
   - Hero section
   - Mission statement
   - How it works
   - Awards section
   - Pricing/Subscription boxes

2. **`/about`** - About Page
   - Company story
   - Values section
   - Awards section

3. **`/faq`** - FAQ Page
   - Frequently asked questions

4. **`/privacy`** - Privacy Policy
   - Privacy policy and data handling

5. **`/terms`** - Terms of Service
   - Terms and conditions

6. **`/*`** - 404 Not Found
   - Custom 404 error page

### External Links
- **Investors:** https://publuu.com/flip-book/996063/2263639 (in footer)

---

## 🧩 Components

### Main Components
- **`Layout.tsx`** - Page layout wrapper
- **`Navigation.tsx`** - Main navigation header (sticky, responsive)
- **`Footer.tsx`** - Footer with contact info and links
- **`Hero.tsx`** - Hero section with CTA buttons
- **`Mission.tsx`** - Mission statement section
- **`HowItWorks.tsx`** - How it works section
- **`Awards.tsx`** - Awards and recognition section
- **`Pricing.tsx`** - Box pricing tiers with on-site checkout links
- **`NavLink.tsx`** - Navigation link component

### UI Components (shadcn/ui)
Located in `src/components/ui/`:
- accordion, alert, alert-dialog, aspect-ratio, avatar
- badge, breadcrumb, button, calendar, card, carousel
- chart, checkbox, collapsible, command, context-menu
- dialog, drawer, dropdown-menu, form, hover-card
- input, input-otp, label, menubar, navigation-menu
- pagination, popover, progress, radio-group, resizable
- scroll-area, select, separator, sheet, sidebar
- skeleton, slider, sonner, switch, table, tabs
- textarea, toast, toaster, toggle, toggle-group, tooltip

### Custom Hooks
- **`use-mobile.tsx`** - Mobile detection hook
- **`use-toast.ts`** - Toast notification hook

---

## ✨ Features & Functionality

### Produce Boxes
1. **Starter Box** - $35/delivery
   - 6 seasonal produce items (~12-15 lbs)
   - Checkout: `/checkout/starter` (embedded Stripe)

2. **Family Box** - $65/delivery (Most Popular)
   - 9+ produce items, 1 dozen eggs, 1 protein choice
   - Checkout: `/checkout/family` (embedded Stripe)

3. **Community Box** - $95/delivery
   - 10+ produce items, 2 dozen eggs, 2 protein choices
   - Checkout: `/checkout/community` (embedded Stripe)

### Navigation Features
- Sticky navigation bar
- Responsive mobile menu
- Smooth scroll to pricing section
- Active route highlighting

### Animations
- Framer Motion animations throughout
- Scroll-triggered animations
- Smooth transitions

---

## 🖼 Assets & Media

### Images
- **Logo:** `public/uncle-mays-logo.png`
- **Hero Image:** `src/assets/hero-produce.jpg`
- **Heritage Image:** `src/assets/heritage.jpg`
- **Produce Box Image:** `src/assets/produce-box.jpg`
- **Placeholder:** `public/placeholder.svg`

### Fonts
- **Playfair Display:** 400, 500, 600, 700, 800
- **Work Sans:** 300, 400, 500, 600, 700

---

## 🔍 SEO & Analytics

### SEO Elements
- ✅ Meta tags (title, description, author)
- ✅ Open Graph tags (Facebook)
- ✅ Twitter Card tags
- ✅ Canonical URL
- ✅ Structured Data (JSON-LD):
  - LocalBusiness schema
  - Organization schema
- ✅ Sitemap.xml (`public/sitemap.xml`)
- ✅ Robots.txt (`public/robots.txt`)

### Analytics
- **Google Analytics:** G-QWY5HRLX12
  - Implemented in `index.html`
  - Tracks page views, sessions, traffic sources

### Sitemap Pages
- `/` (Home) - Priority: 1.0
- `/about` - Priority: 0.8
- `/faq` - Priority: 0.7
- `/privacy` - Priority: 0.3
- `/terms` - Priority: 0.3

---

## 🔗 External Integrations

### Payment Processing
- **Stripe Embedded Checkout:** 3 box tiers with on-site checkout
  - `/checkout/starter` — Starter Box ($35)
  - `/checkout/family` — Family Box ($65)
  - `/checkout/community` — Community Box ($95)
  - Server API route: `/api/checkout` creates Stripe Checkout Sessions

### External Links
- **Investors Page:** Publuu flipbook (footer link)
  - URL: https://publuu.com/flip-book/996063/2263639

---

## ⚙️ Configuration Files

### Build & Development
- **`package.json`** - Dependencies and scripts
- **`vite.config.ts`** - Vite configuration
- **`tsconfig.json`** - TypeScript configuration
- **`tsconfig.app.json`** - App-specific TypeScript config
- **`tsconfig.node.json`** - Node TypeScript config
- **`tailwind.config.ts`** - Tailwind CSS configuration
- **`postcss.config.js`** - PostCSS configuration
- **`eslint.config.js`** - ESLint configuration
- **`components.json`** - shadcn/ui configuration

### Deployment
- **`vercel.json`** - Vercel deployment configuration
  - Build command: `npm run build`
  - Output directory: `dist`
  - Client-side routing rewrites configured

### SEO Files
- **`public/sitemap.xml`** - XML sitemap
- **`public/robots.txt`** - Robots directives with sitemap reference

---

## 📞 Contact Information

### Business Address
73 W Monroe Ave #3002  
Chicago, IL 60603

### Contact Methods
- **Email:** info@unclemays.com
- **Phone:** (312) 972-2595

### Social Media
- **Twitter:** @UncleMays (referenced in meta tags)

---

## 🏆 Awards & Recognition

1. **World Business Chicago / TechRise**
   - Food Innovation Award

2. **Naturally Chicago / Seed Co.**
   - Top 5 Chicago Food Startups

---

## 📦 Build Scripts

```bash
npm run dev          # Start development server (port 8080)
npm run build        # Build for production
npm run build:dev    # Build in development mode
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

---

## 🌐 Deployment

### Platform
- **Vercel** (configured via `vercel.json`)
- **Domain:** uncle-mays.vercel.app

### Build Process
1. Install dependencies: `npm install`
2. Build: `npm run build`
3. Output: `dist/` directory
4. Client-side routing handled via Vercel rewrites

---

## 📝 Notes

- Website migrated from Next.js to Vite/React
- All pages are client-side rendered (SPA)
- Responsive design (mobile-first)
- Earth-toned color palette
- All box tiers use embedded Stripe checkout on-site (customers never leave unclemays.com)
- Investors link opens external Publuu flipbook in new tab

---

## 🔄 Recent Updates

1. ✅ Added Google Analytics tracking
2. ✅ Added comprehensive SEO (sitemap, structured data)
3. ✅ Updated awards section (combined organizations)
4. ✅ Added investors link to footer
5. ✅ Configured Vercel for Vite/React deployment

---

**End of Inventory**

