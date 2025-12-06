# Uncle Mays Produce - Technical Overview

## 🏗️ Architecture Overview

This website is a **Single Page Application (SPA)** built with modern React and TypeScript. It uses a component-based architecture where the UI is broken down into reusable, modular pieces.

### High-Level Architecture

```
┌─────────────────────────────────────────┐
│         User's Browser                  │
│  ┌──────────────────────────────────┐  │
│  │   React Application (SPA)         │  │
│  │   - Client-side routing           │  │
│  │   - Component rendering           │  │
│  │   - State management              │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
              ↕ HTTP Requests
┌─────────────────────────────────────────┐
│         Vercel (Hosting)                │
│  ┌──────────────────────────────────┐  │
│  │   Static Files (dist/)           │  │
│  │   - HTML, CSS, JavaScript        │  │
│  │   - Images & Assets              │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Core Framework & Language
- **React 18.3.1** - UI library for building interactive user interfaces
- **TypeScript 5.8.3** - Typed superset of JavaScript for better code quality
- **Vite 7.2.4** - Modern build tool (faster than Webpack)

### Why These Choices?
- **React**: Industry standard, large ecosystem, excellent performance
- **TypeScript**: Catches errors at compile-time, improves maintainability
- **Vite**: Lightning-fast development server, optimized production builds

### Routing
- **React Router DOM 6.30.1** - Client-side routing (no page refreshes)
  - Routes: `/`, `/about`, `/faq`, `/privacy`, `/terms`
  - Handles navigation without full page reloads

### Styling
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **shadcn/ui** - Pre-built accessible components (built on Radix UI)
- **Framer Motion 12.23.24** - Animation library for smooth transitions

### State Management & Data
- **TanStack Query 5.83.0** - Server state management (currently minimal usage)
- **React Hook Form 7.61.1** - Form handling (ready for future forms)
- **Zod 3.25.76** - Schema validation

### Build & Development Tools
- **Vite** - Build tool and dev server
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - Automatic vendor prefixes

---

## 📁 Project Structure

```
Uncle_mays/
├── public/                 # Static assets served directly
│   ├── favicon.ico
│   ├── robots.txt         # SEO: tells search engines what to crawl
│   ├── sitemap.xml        # SEO: lists all pages for search engines
│   └── uncle-mays-logo.png
│
├── src/                    # Source code
│   ├── assets/            # Images imported in code
│   │   ├── heritage.jpg
│   │   ├── hero-produce.jpg
│   │   └── produce-box.jpg
│   │
│   ├── components/        # Reusable React components
│   │   ├── Awards.tsx     # Awards section
│   │   ├── Footer.tsx     # Site footer
│   │   ├── Hero.tsx       # Hero/banner section
│   │   ├── HowItWorks.tsx # How it works section
│   │   ├── Layout.tsx     # Page layout wrapper
│   │   ├── Mission.tsx    # Mission statement
│   │   ├── Navigation.tsx # Header navigation
│   │   ├── Pricing.tsx     # Subscription plans
│   │   └── ui/            # shadcn/ui components (buttons, cards, etc.)
│   │
│   ├── pages/             # Page components
│   │   ├── Index.tsx      # Home page
│   │   ├── About.tsx       # About page
│   │   ├── FAQ.tsx         # FAQ page
│   │   ├── Privacy.tsx     # Privacy policy
│   │   ├── Terms.tsx       # Terms of service
│   │   └── NotFound.tsx    # 404 page
│   │
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   ├── App.tsx            # Main app component (routes)
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles & design tokens
│
├── index.html             # HTML template
├── vite.config.ts         # Vite configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── vercel.json            # Vercel deployment configuration
└── package.json           # Dependencies & scripts
```

---

## 🔄 How It Works

### 1. **Application Entry Point** (`main.tsx`)
```typescript
// Creates React root and renders the App component
createRoot(document.getElementById("root")).render(<App />)
```

### 2. **Routing** (`App.tsx`)
```typescript
// Sets up client-side routing
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/about" element={<About />} />
    // ... more routes
  </Routes>
</BrowserRouter>
```

### 3. **Component Hierarchy**
```
App
└── Layout
    ├── Navigation (header)
    ├── Page Content (varies by route)
    └── Footer
```

### 4. **Styling System**
- **Design Tokens**: Colors defined in `index.css` as CSS variables
- **Tailwind Utilities**: Classes like `bg-primary`, `text-foreground`
- **Component Styles**: Scoped to components

### 5. **Build Process**
1. **Development**: `npm run dev` → Vite dev server (hot reload)
2. **Production**: `npm run build` → Optimized bundle in `dist/`
3. **Deployment**: Vercel automatically builds and deploys from GitHub

---

## 🎨 Design System

### Color Palette (HSL values)
- **Primary**: `140 45% 28%` (Earth Green)
- **Secondary**: `15 60% 55%` (Terracotta)
- **Accent**: `45 85% 58%` (Harvest Gold)
- **Background**: `42 40% 96%` (Warm Cream)

### Typography
- **Headings**: Playfair Display (serif)
- **Body**: Work Sans (sans-serif)

### Components
- Built with **shadcn/ui** (Radix UI primitives)
- Fully accessible (ARIA compliant)
- Customizable via Tailwind classes

---

## 🚀 Build & Deployment

### Development Workflow
```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:8080)
npm run build        # Create production build
npm run preview      # Preview production build locally
```

### Deployment Pipeline
1. **Code Push** → Changes pushed to GitHub
2. **Vercel Detection** → Vercel detects push to `main` branch
3. **Build** → Runs `npm run build` (configured in `vercel.json`)
4. **Deploy** → Serves static files from `dist/` directory
5. **Live** → Site available at `uncle-mays.vercel.app`

### Vercel Configuration (`vercel.json`)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
- **rewrites**: Ensures client-side routing works (all routes serve `index.html`)

---

## 🔌 External Integrations

### Payment Processing
- **Stripe Checkout Links**: Direct links to Stripe payment pages
  - Starter Box: `https://buy.stripe.com/...`
  - Family Box: `https://buy.stripe.com/...`
  - Community Box: `https://buy.stripe.com/...`

### Analytics
- **Google Analytics**: Tracking ID `G-QWY5HRLX12`
  - Implemented in `index.html`
  - Tracks page views, user behavior

### SEO
- **Meta Tags**: Open Graph, Twitter Cards
- **Structured Data**: JSON-LD (LocalBusiness schema)
- **Sitemap**: XML sitemap for search engines
- **Robots.txt**: Search engine directives

---

## 📦 Key Dependencies Explained

### React & Core
- **react/react-dom**: UI rendering library
- **react-router-dom**: Client-side routing

### UI Components
- **@radix-ui/***: Accessible, unstyled component primitives
- **shadcn/ui**: Pre-styled components built on Radix UI
- **lucide-react**: Icon library

### Styling
- **tailwindcss**: Utility-first CSS
- **framer-motion**: Animation library
- **class-variance-authority**: Component variant management

### Development
- **typescript**: Type safety
- **vite**: Build tool
- **eslint**: Code quality

---

## 🎯 Component Architecture

### Page Components
Each page (`Index.tsx`, `About.tsx`, etc.) uses the `Layout` component which provides:
- Navigation header
- Footer
- Consistent page structure

### Reusable Components
- **Hero**: Landing banner with CTA
- **Mission**: Mission statement section
- **HowItWorks**: Process explanation
- **Awards**: Recognition display
- **Pricing**: Subscription plans with Stripe links

### UI Components (`src/components/ui/`)
Pre-built, accessible components:
- Buttons, Cards, Inputs, Dialogs, etc.
- All follow design system
- Fully customizable

---

## 🔐 Security & Best Practices

### Security
- **No sensitive data in code**: Stripe keys handled by Stripe
- **HTTPS**: Enforced by Vercel
- **Content Security**: External links use `rel="noopener noreferrer"`

### Performance
- **Code Splitting**: Vite automatically splits code
- **Image Optimization**: Images processed during build
- **Lazy Loading**: Components load on demand
- **Minification**: Production builds are minified

### Accessibility
- **Semantic HTML**: Proper HTML elements
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard support
- **Color Contrast**: WCAG compliant colors

---

## 🧪 Development Tips

### Adding a New Page
1. Create component in `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`:
   ```typescript
   <Route path="/new-page" element={<NewPage />} />
   ```
3. Add to navigation if needed
4. Update sitemap.xml

### Adding a New Component
1. Create file in `src/components/`
2. Import and use in pages
3. Follow existing component patterns

### Styling Guidelines
- Use Tailwind utility classes
- Follow design system colors (`bg-primary`, `text-foreground`)
- Use CSS variables for custom values
- Keep components scoped

---

## 📊 Performance Metrics

### Build Output
- **HTML**: ~4.69 KB (gzipped: 1.34 KB)
- **CSS**: ~64 KB (gzipped: 11.19 KB)
- **JavaScript**: ~475 KB (gzipped: 151.27 KB)
- **Images**: Optimized during build

### Optimization Features
- Tree shaking (unused code removed)
- Code splitting (load only what's needed)
- Image optimization
- CSS minification
- JavaScript minification

---

## 🔄 Migration Notes

This project was **migrated from Next.js to Vite/React**:
- **Previous**: Server-side rendering (Next.js)
- **Current**: Client-side rendering (SPA)
- **Reason**: Simpler architecture, faster development, easier deployment

### Key Differences
- **Next.js**: Pages in `pages/` directory, automatic routing
- **Vite/React**: Manual routing with React Router, pages in `src/pages/`

---

## 🛠️ Troubleshooting

### Build Fails
- Check Node.js version (18+)
- Run `npm install` to ensure dependencies are installed
- Check for TypeScript errors: `npm run lint`

### Images Not Loading
- Ensure images are in `src/assets/` and imported
- Or use `public/` folder for static images

### Routing Issues
- Verify `vercel.json` has rewrites configured
- Check React Router setup in `App.tsx`

---

## 📚 Resources

- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev
- **Tailwind CSS**: https://tailwindcss.com
- **shadcn/ui**: https://ui.shadcn.com
- **React Router**: https://reactrouter.com

---

## 💡 For Developers Joining the Project

### Getting Started
1. Clone repository
2. Run `npm install`
3. Run `npm run dev`
4. Open `http://localhost:8080`

### Code Style
- TypeScript for all components
- Functional components with hooks
- Tailwind for styling
- Follow existing component patterns

### Key Files to Understand
- `src/App.tsx` - Routing configuration
- `src/index.css` - Design system
- `src/components/Layout.tsx` - Page structure
- `vite.config.ts` - Build configuration

---

**Last Updated**: January 2025  
**Maintained By**: Uncle Mays Produce Team

