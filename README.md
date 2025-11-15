# Walkthru Website - MVP

**People-First Urban Intelligence Platform**

Live Development Server: http://localhost:3000

## Overview

Walkthru is a minimal, Apple-inspired website revealing hidden patterns in urban life through elegant scroll-driven storytelling.

## Tech Stack

- **Framework:** Next.js 16.0.3 with Turbopack
- **Language:** TypeScript 5.7
- **Styling:** Tailwind CSS 4.1.17 (CSS-first configuration with @theme)
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Animations:** Framer Motion 12
- **Smooth Scroll:** Lenis 1.3.15
- **Theme:** next-themes 0.4.6
- **Icons:** Lucide React 0.553.0
- **Font:** Quicksand (Google Fonts)

## Features Implemented

✅ **Dark/Light Mode** - System preference detection with manual toggle
✅ **Smooth Scrolling** - Lenis-powered 60fps scroll experience
✅ **Responsive Design** - Mobile-first approach
✅ **Apple-Inspired UI** - Minimal, clean interface with gradient effects
✅ **Interactive Components** - Tabs, Cards, Badges with animations
✅ **Framer Motion Animations** - Scroll-triggered and hover effects
✅ **Gradient Text** - Beautiful gradient effects on headings
✅ **Animated Orbs** - Floating gradient background elements
✅ **Security Headers** - HSTS, CSP, XSS protection
✅ **Accessibility** - Keyboard navigation, reduced motion support, ARIA labels
✅ **Type-Safe** - Full TypeScript coverage
✅ **SEO Optimized** - Meta tags, Open Graph, Twitter cards
✅ **Auto-Generated Sitemap** - XML sitemap regenerated on every build
✅ **Robots.txt** - LLM-friendly robots configuration (GPTBot, ClaudeBot, etc.)
✅ **Structured Data** - JSON-LD schema.org markup for enhanced discoverability
✅ **GitHub Pages Deployment** - Automated CI/CD with custom domain support

## Getting Started

### Development

```bash
# Install dependencies (if needed)
npm install

# Start development server
npm run dev
# or
npx next dev --turbopack

# Open http://localhost:3000
```

### Build for Production

```bash
# Type check
npm run type-check

# Build (creates static export in ./out)
npm run build

# Start production server (for local testing only)
npm start
```

### Deploy to GitHub Pages

The site is configured for automatic deployment to GitHub Pages:

1. **Repository Name** - For direct access at `walkthru-earth.github.io/`:
   - Name your repository: `walkthru-earth.github.io`
   - This is GitHub's special naming for organization/user pages
   - Other names will serve at: `walkthru-earth.github.io/<repo-name>/`

2. **Enable GitHub Pages** in your repository settings:
   - Go to Settings → Pages
   - Source: GitHub Actions

3. **Push to main branch** - The workflow will automatically:
   - Install dependencies
   - Build the static site
   - Deploy to GitHub Pages

4. **Manual deployment** (optional):
   ```bash
   # Trigger deployment manually from Actions tab
   # or push to main branch
   git push origin main
   ```

Your site will be available at: `https://walkthru-earth.github.io/`

**Note:** The site uses static export (`output: 'export'`) which is required for GitHub Pages deployment.

### Code Quality

```bash
# Lint
npm run lint

# Format with Prettier
npm run format

# Check formatting
npm run format:check
```

## Project Structure

```
/
├── app/
│   ├── layout.tsx              # Root layout with theme provider
│   ├── page.tsx                # Homepage
│   ├── fonts.ts                # Quicksand font configuration
│   └── globals.css             # Global styles + Tailwind
├── components/
│   ├── ui/                     # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── dropdown-menu.tsx
│   ├── sections/               # Page sections
│   │   ├── hero.tsx
│   │   ├── pattern-detection.tsx
│   │   └── footer.tsx
│   ├── navigation/
│   │   └── navbar.tsx
│   ├── theme/
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   └── shared/
│       ├── container.tsx
│       ├── section.tsx
│       └── smooth-scroll.tsx
├── lib/
│   └── utils.ts                # Utility functions
├── public/                     # Static assets
└── docs/                       # Documentation
```

## Current Sections

1. **Hero** - Animated landing with gradient effects and stats
2. **Pattern Detection** - 4 key pattern categories with icons
3. **Indices** - Interactive tabs for Livability, Wellbeing, and Resilience metrics
4. **Vision** - Mission statement with 4 vision cards
5. **CTA** - Call-to-action with social links
6. **Footer** - Navigation and social media links

## Next Steps

### Immediate

- [x] Add Indices section (Livability, Wellbeing, Resilience) ✅
- [x] Add Vision section ✅
- [x] Add CTA section ✅
- [x] Enhance hero with gradient effects ✅
- [ ] Add real data to pattern cards
- [ ] Add contact form
- [ ] Implement mobile hamburger menu
- [ ] Add loading states

### Enhancement

- [ ] Add parallax effects to images
- [ ] Integrate analytics (Vercel Analytics)
- [ ] Add blog/news section with MDX
- [ ] Create about page
- [ ] Add case studies with data visualizations
- [ ] Implement search functionality
- [ ] Add newsletter signup
- [ ] Create data dashboard section

### Production

- [x] GitHub Pages deployment workflow ✅
- [x] Auto-generated sitemap.xml ✅
- [x] LLM-friendly robots.txt ✅
- [x] JSON-LD structured data ✅
- [ ] Deploy to Vercel (alternative to GitHub Pages)
- [ ] Set up custom domain (walkthru.earth)
- [ ] Configure environment variables
- [ ] Set up monitoring (Sentry)
- [ ] Performance optimization (bundle analysis)
- [ ] Generate dynamic OG images
- [ ] Set up Google Analytics / Plausible

## Key Configuration

### Tailwind CSS v4

Using the new CSS-first configuration with `@theme inline` directive:
- Dark mode enabled with class-based switching
- Light theme: Warm whites (hsl(60 20% 99%)), earth green (hsl(158 64% 52%)), amber (hsl(37 91% 55%))
- Dark theme: Deep charcoal (hsl(0 0% 7%)), muted earth tones
- Configuration in `app/globals.css` using `@import "tailwindcss"` and `@theme inline`
- PostCSS configured with `@tailwindcss/postcss` plugin
- Up to 5x faster builds with the new v4 engine
- Automatic content detection (no manual file paths needed)

### Next.js

- Turbopack enabled for faster builds
- Security headers configured
- Image optimization enabled
- Font optimization with Quicksand

### Accessibility

- Keyboard navigation support
- Focus indicators
- Reduced motion support
- ARIA labels
- Semantic HTML

## Browser Support

- Chrome/Edge 100+
- Firefox 100+
- Safari 15+
- Modern mobile browsers

## Documentation

Detailed documentation available in `/docs`:

- `technical-stack.md` - Complete tech stack validation
- `architecture.md` - System architecture with Mermaid diagrams
- `implementation-plan.md` - Step-by-step implementation guide
- `edge-cases-and-considerations.md` - Edge cases and solutions

## License

ISC

## Contact

- GitHub: https://github.com/walkthru-earth
- LinkedIn: https://www.linkedin.com/company/walkthru-earth/
