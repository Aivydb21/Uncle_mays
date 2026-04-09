# Uncle Mays Produce

A modern, responsive e-commerce website for Uncle Mays Produce - a premium subscription produce box service celebrating Black farming heritage across America. Fresh produce delivered directly from Black farmers to your table.

## 🌟 Features

- **Premium Subscription Boxes**: Three subscription tiers (Starter, Family, Community)
- **Stripe Integration**: Seamless checkout process for all product boxes
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices
- **Modern UI/UX**: Beautiful, earth-toned design with smooth animations
- **SEO Optimized**: Complete meta tags, Open Graph, and Twitter Card support
- **Legal Compliance**: Comprehensive Privacy Policy and Terms of Service
- **Contact Information**: Easy access to email, phone, and physical address

## 🚀 Tech Stack

- **Framework**: React 18.3.1
- **Build Tool**: Vite 7.2.4
- **Language**: TypeScript 5.8.3
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Routing**: React Router DOM 6.30.1
- **Animations**: Framer Motion 12.23.24
- **Icons**: Lucide React 0.462.0
- **State Management**: TanStack Query 5.83.0
- **Forms**: React Hook Form 7.61.1

## 📋 Prerequisites

- Node.js 18+ (recommended: use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Aivydb21/uncle-mays-roots.git
   cd uncle-mays-roots
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:8080`
   - The site will automatically reload when you make changes

## 📁 Project Structure

```
um_website/
├── public/                 # Static assets
│   ├── uncle-mays-logo.png # Company logo
│   ├── favicon.ico         # Browser favicon
│   └── robots.txt          # SEO robots file
├── src/
│   ├── assets/             # Image assets
│   │   ├── heritage.jpg
│   │   ├── hero-produce.jpg
│   │   └── produce-box.jpg
│   ├── components/         # React components
│   │   ├── Hero.tsx        # Hero section
│   │   ├── Mission.tsx     # Mission statement
│   │   ├── HowItWorks.tsx  # How it works section
│   │   ├── Awards.tsx      # Awards section
│   │   ├── Pricing.tsx     # Pricing/Subscription boxes
│   │   ├── Footer.tsx      # Footer component
│   │   ├── Navigation.tsx  # Navigation header
│   │   ├── Layout.tsx      # Page layout wrapper
│   │   └── ui/            # shadcn/ui components
│   ├── pages/              # Page components
│   │   ├── Index.tsx       # Home page
│   │   ├── About.tsx       # About page
│   │   ├── FAQ.tsx         # FAQ page
│   │   ├── Privacy.tsx     # Privacy Policy
│   │   ├── Terms.tsx       # Terms of Service
│   │   └── NotFound.tsx    # 404 page
│   ├── App.tsx             # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── index.html             # HTML template
├── vite.config.ts        # Vite configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── package.json          # Dependencies and scripts
```

## 🎯 Available Scripts

- `npm run dev` - Start development server (runs on port 8080)
- `npm run build` - Build for production (outputs to `dist/` folder)
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Deployment Options

#### Option 1: Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts to deploy

#### Option 2: Netlify
1. Drag and drop the `dist` folder to [Netlify Drop](https://app.netlify.com/drop)
2. Or connect your GitHub repository for continuous deployment

#### Option 3: Lovable
1. Open [Lovable Project](https://lovable.dev/projects/3d1db82d-323e-4d69-9a38-404be734ce30)
2. Click Share → Publish
3. Configure your custom domain if needed

### Custom Domain Setup

1. **Vercel/Netlify**: Add your domain in project settings
2. **DNS Configuration**: Point your domain's A/CNAME records to the hosting provider
3. **SSL Certificate**: Automatically provided by most hosting platforms

## 🔧 Configuration

### Stripe Embedded Checkout

Checkout is handled on-site via embedded Stripe. To update pricing or add products:

1. **Price IDs** are mapped in `src/app/api/checkout/route.ts` (server-side)
2. **Product slugs** (starter, family, community) are defined in `src/app/checkout/[product]/page.tsx`
3. **Environment variables** required: `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env` and Vercel

### Contact Information

Update contact details in:
- `src/components/Footer.tsx` - Footer contact section
- `src/pages/Privacy.tsx` - Privacy Policy contact
- `src/pages/Terms.tsx` - Terms of Service contact

### Logo

Place your logo file at: `public/uncle-mays-logo.png`

Supported formats: PNG, JPG, SVG, WebP

## 📱 Pages

- **Home** (`/`) - Landing page with hero, mission, how it works, awards, and pricing
- **About** (`/about`) - Company story, values, and mission
- **FAQ** (`/faq`) - Frequently asked questions
- **Privacy Policy** (`/privacy`) - Privacy policy and data handling
- **Terms of Service** (`/terms`) - Terms and conditions

## 🎨 Design System

The website uses a custom earth-toned color palette defined in `src/index.css`:

- **Primary Colors**: Warm browns and earth tones
- **Typography**: Playfair Display (headings) and Work Sans (body)
- **Components**: shadcn/ui components with custom styling

## 📞 Contact

- **Email**: info@unclemays.com
- **Phone**: (312) 972-2595
- **Address**: 73 W Monroe Ave #3002, Chicago, IL 60603

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For questions or suggestions, please contact info@unclemays.com.

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [React Router Documentation](https://reactrouter.com/)

## 🐛 Troubleshooting

### Port Already in Use
If port 8080 is already in use, modify `vite.config.ts`:
```typescript
server: {
  port: 3000, // Change to available port
}
```

### Build Errors
1. Clear node_modules: `rm -rf node_modules && npm install`
2. Clear Vite cache: `rm -rf node_modules/.vite`
3. Rebuild: `npm run build`

### Logo Not Showing
1. Verify logo file exists at `public/uncle-mays-logo.png`
2. Check file permissions
3. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

---

**Built with ❤️ for Uncle Mays Produce**
