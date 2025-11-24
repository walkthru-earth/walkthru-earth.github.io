# Technical Stack Documentation - Walkthru Website

**Last Updated:** November 15, 2025
**Project:** Walkthru - People-First Urban Intelligence Platform
**Framework:** Next.js 16 with React 19.2

---

## Executive Summary

This document outlines the validated, production-ready technical stack for the Walkthru website based on November 2025 research and best practices. Several critical corrections have been made to the original plan to ensure compatibility and optimal performance.

---

## Critical Updates & Corrections

### 🔴 BREAKING CHANGES IDENTIFIED

1. **Framer Motion Version Incompatibility**
   - ❌ **Original Plan:** `framer-motion: ^11.11.0`
   - ✅ **Corrected:** `framer-motion: ^12.0.0` (required for React 19)
   - **Reason:** Framer Motion v11 and earlier are incompatible with React 19. Version 12 is specifically built for React 19 support.

2. **Tailwind CSS 4.0 Configuration Changes**
   - ❌ **Original Plan:** Uses `@tailwind` directives
   - ✅ **Corrected:** Use `@import "tailwindcss"` (new v4 syntax)
   - **Reason:** Tailwind 4.0 (released January 22, 2025) has completely new CSS-first configuration requiring single import line instead of three directives.

3. **Next.js 16 Middleware Changes**
   - ⚠️ **Note:** Middleware is being replaced by `proxy.ts` in some use cases
   - **Impact:** Review any middleware usage and consider proxy.ts for network boundary operations

---

## Core Framework & Dependencies

### Validated Package Versions (November 2025)

```json
{
  "name": "walkthru-website",
  "version": "1.0.0",
  "private": true,
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  },
  "dependencies": {
    // Core Framework
    "next": "^16.0.0",              // Released: Oct 21, 2025
    "react": "^19.2.0",             // Latest stable: Oct 1, 2025
    "react-dom": "^19.2.0",

    // TypeScript
    "typescript": "^5.7.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/node": "^22.0.0",

    // UI Framework & Styling
    "tailwindcss": "^4.1.17",       // Latest: v4.1.17 (Oxide engine)
    "@tailwindcss/postcss": "^4.1.17",
    "postcss": "^8.4.47",
    "autoprefixer": "^10.4.20",

    // Theme Management
    "next-themes": "^0.4.6",        // Industry standard for Next.js dark mode

    // Component Utilities
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.4.0",

    // Animation Libraries
    "lenis": "^1.3.15",             // Lightweight smooth scroll (renamed package)
    "framer-motion": "^12.0.0",     // React 19 compatible

    // Icons
    "lucide-react": "^0.553.0",     // Primary icon library
  },
  "devDependencies": {
    // Development Tools
    "eslint": "^9.0.0",
    "eslint-config-next": "^16.0.0",
    "prettier": "^3.3.0",
    "prettier-plugin-tailwindcss": "^0.6.0",

    // Type Checking
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0"
  }
}
```

---

## Technology Rationale & Alternatives

### Next.js 16 Features Utilized

**Why Next.js 16?**
- **Turbopack (Stable):** 5-10x faster Fast Refresh, 2-5x faster builds
- **Cache Components:** Opt-in caching with PPR and `use cache` directive
- **Incremental Prefetching:** Only prefetches uncached portions
- **React 19.2 Support:** View Transitions, useEffectEvent()
- **Proxy.ts:** Clearer network boundary than middleware

**Performance Benchmarks:**
- Full builds: Up to 5x faster than v15
- Incremental builds: Measured in microseconds
- Filesystem caching in development

### Tailwind CSS 4.0 (Oxide Engine)

**Major Improvements:**
- **5x faster full builds**
- **100x faster incremental builds** (microseconds)
- **Zero configuration** - auto-discovers template files
- **CSS-first config** - customize in CSS, not JavaScript
- **Modern CSS features:** Cascade layers, @property, color-mix()
- **P3 color palette** - vibrant displays support
- **Container Queries** - first-class API

**Migration Impact:**
```css
/* ❌ OLD (Tailwind v3): */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ✅ NEW (Tailwind v4): */
@import "tailwindcss";
```

### Dark Mode: next-themes

**Why next-themes?**
- ✅ Industry standard for Next.js (2025)
- ✅ System preference integration (`prefers-color-scheme`)
- ✅ No flash of unstyled content (FOUC)
- ✅ Syncs between tabs automatically
- ✅ SSR-safe with proper hydration
- ✅ TypeScript support

**Configuration:**
```tsx
<ThemeProvider
  attribute="class"           // For Tailwind dark: selector
  defaultTheme="system"       // Respect OS preference
  enableSystem                // Enable system detection
  disableTransitionOnChange   // Prevent jarring transitions
>
```

### Smooth Scroll: Lenis vs Alternatives

**Lenis (lenis) - RECOMMENDED**
- ✅ Lightweight: 2.13kb
- ✅ Built on scrollTo, not transforms
- ✅ Keeps native APIs intact
- ✅ No interference with other libraries
- ✅ Smooth motion without breaking platform
- ⚠️ **Package renamed:** Now `lenis` (was `@studio-freight/lenis`)

**Alternatives Considered:**

| Library | Size | Pros | Cons | Use Case |
|---------|------|------|------|----------|
| **Lenis** | 2.13kb | Minimal, native-like, compatible | Basic features only | Simple smooth scroll |
| **GSAP ScrollSmoother** | ~15kb | Advanced animations, powerful | Complex, potential conflicts | Heavy animation sites |
| **Locomotive Scroll** | ~12kb | Feature-rich, popular | Heavier, more opinionated | Complex scroll effects |

**Decision:** Lenis chosen for Walkthru's minimalist, Apple-inspired design.

### Animation: Framer Motion 12

**Critical React 19 Compatibility:**
- ⚠️ **Framer Motion v11 and below:** Incompatible with React 19
- ✅ **Framer Motion v12:** Built specifically for React 19

**Features:**
- Hybrid engine: JavaScript + native browser APIs
- 120fps GPU-accelerated animations
- Motion values avoid React re-renders
- Tree-shakable, minimal footprint
- TypeScript support

**Performance Best Practice:**
```tsx
// ✅ GOOD: Use motion values (no re-renders)
const x = useMotionValue(0);
<motion.div style={{ x }} />

// ❌ AVOID: Using state triggers re-renders
const [x, setX] = useState(0);
<motion.div style={{ x }} />
```

---

## Font Strategy: Quicksand

### Google Fonts Optimization in Next.js

**Why Quicksand?**
- Modern, friendly, approachable aesthetic
- Variable font available (weights 300-700)
- Excellent readability for body text
- Aligns with "people-first" brand values

**Next.js Font Optimization:**
```typescript
// app/fonts.ts
import { Quicksand } from 'next/font/google';

export const quicksand = Quicksand({
  subsets: ['latin'],
  display: 'swap',              // FOUT prevention
  variable: '--font-quicksand',
  weight: ['300', '400', '500', '600', '700'],
  preload: true,                // Critical for LCP
  fallback: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'sans-serif'
  ]
});
```

**Benefits:**
- ✅ Self-hosted (no Google requests)
- ✅ Zero layout shift (CLS = 0)
- ✅ Static asset serving from same domain
- ✅ Built at compile time
- ✅ Subset optimization (reduced file size)

---

## shadcn/ui Component Library

### CLI 3.0 Features (Latest)

**New Capabilities:**
- Multi-registry support
- Private component libraries
- Natural language search
- Preview components before installing
- Rewritten registry resolution (faster, smarter)
- Dependency tree handling

**Installation:**
```bash
npx shadcn@latest init \
  --defaults \
  --skip-font \
  --style=new-york
```

**Recommended Components for Walkthru:**
```bash
npx shadcn@latest add \
  button \
  card \
  dropdown-menu \
  navigation-menu \
  scroll-area \
  tabs \
  badge \
  separator \
  dialog \
  tooltip
```

**Benefits:**
- ✅ Copy-paste components (not npm dependency)
- ✅ Full customization control
- ✅ Accessibility built-in (Radix UI primitives)
- ✅ Tailwind v4 compatible
- ✅ Dark mode support out of the box

---

## Development Tools

### Code Quality

```json
{
  "scripts": {
    "dev": "next dev --turbopack",       // Turbopack default in v16
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

### ESLint Configuration

```javascript
// eslint.config.mjs
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";

const compat = new FlatCompat();

export default [
  js.configs.recommended,
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "warn",
    },
  },
];
```

### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

---

## Performance Targets

### Lighthouse Scores (Target: 95+)

| Metric | Target | Strategy |
|--------|--------|----------|
| **Performance** | 95+ | Turbopack, Image optimization, Code splitting |
| **Accessibility** | 98+ | Semantic HTML, ARIA labels, Keyboard nav |
| **Best Practices** | 95+ | HTTPS, Security headers, Modern APIs |
| **SEO** | 100 | Meta tags, Structured data, Sitemap |

### Core Web Vitals

| Metric | Target | Implementation |
|--------|--------|----------------|
| **LCP** | <2.5s | Font preload, Image optimization, ISR |
| **FID** | <100ms | Code splitting, Defer non-critical JS |
| **CLS** | <0.1 | Font display:swap, Aspect ratios |
| **INP** | <200ms | Debounce, requestIdleCallback |

---

## Browser Support

### Target Browsers (2025)

```json
// browserslist
{
  "production": [
    ">0.5%",
    "last 2 versions",
    "not dead",
    "not op_mini all"
  ],
  "development": [
    "last 1 chrome version",
    "last 1 firefox version",
    "last 1 safari version"
  ]
}
```

### Progressive Enhancement

- **Baseline:** Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- **Enhanced:** P3 colors, View Transitions, Container Queries
- **Graceful Degradation:** `@supports` queries for cutting-edge CSS

---

## Security Considerations

### Dependencies Audit

```bash
# Regular security audits
npm audit
npm audit fix

# Update dependencies
npm outdated
npm update
```

### Content Security Policy

```typescript
// next.config.mjs
export default {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
    ];
  },
};
```

---

## Deployment Platform

### Primary: GitHub Pages (Static Export)

**Current Implementation:**
- ✅ Static export (`output: 'export'` in next.config.mjs)
- ✅ Automated deployment via GitHub Actions
- ✅ Custom domain: walkthru.earth
- ✅ Free hosting with GitHub Pages
- ✅ Automatic deployments on push to main
- ✅ `.nojekyll` file to disable Jekyll processing

**Deployment Workflow:**
- Workflow file: `.github/workflows/deploy.yml`
- Uses `actions/deploy-pages@v4`
- Builds to `./out` directory
- Auto-deploys on every push to main branch

**Custom Domain Setup:**
- CNAME file: `public/CNAME` containing `walkthru.earth`
- DNS configuration via Namecheap
- GitHub Pages serves from custom domain

### Alternative Platforms

**Vercel (Alternative):**
- ✅ Zero-config deployment
- ✅ Turbopack optimization
- ✅ Edge Functions support (not available in static export)
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Preview deployments

**Other Options:** Cloudflare Pages, Netlify (both support static export)

---

## SEO & Metadata Automation

### Auto-Generated Sitemap

**Implementation:** `app/sitemap.ts`

```typescript
import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://walkthru.earth',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    // Additional pages...
  ];
}
```

**Benefits:**
- ✅ Automatically generated at build time
- ✅ Includes all main sections and anchors
- ✅ Proper priority and change frequency metadata
- ✅ Served at `/sitemap.xml`

### LLM-Friendly Robots.txt

**Implementation:** `app/robots.ts`

```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/_next/'] },
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Claude-Web', allow: '/' },
    ],
    sitemap: 'https://walkthru.earth/sitemap.xml',
  };
}
```

**Supported Crawlers:**
- OpenAI (GPTBot, ChatGPT-User)
- Google (Google-Extended for AI training)
- Anthropic (ClaudeBot, Claude-Web, anthropic-ai)

### Structured Data (JSON-LD)

**Implementation:** In `app/layout.tsx`

```typescript
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Walkthru',
  url: 'https://walkthru.earth',
  logo: 'https://walkthru.earth/icon.svg',
  description: 'People-first urban intelligence platform...',
  sameAs: [
    'https://github.com/walkthru-earth',
    'https://www.linkedin.com/company/walkthru-earth/',
    'https://source.coop/walkthru-earth',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'General Inquiries',
    url: 'https://walkthru.earth/#contact',
  },
  knowsAbout: [
    'Urban Planning',
    'Data Analytics',
    'Livability Index',
    // ...more topics
  ],
};
```

**Benefits:**
- ✅ Rich snippets in search results
- ✅ Knowledge graph integration
- ✅ Enhanced social sharing
- ✅ AI model context

---

## Branding & Assets

### Logo System

**Primary Logo:** `/public/icon.svg`
- Topographic triangle design
- SVG format for scalability
- Used in metadata and social sharing

**Favicon:** `/app/icon.png`
- PNG format for browser compatibility
- Auto-generated by Next.js

### Source Cooperative Integration

**Logo:** `/public/source-coop-logo.png`

**Integration Points:**
- "Explore Your Data" button with Source.coop branding
- Links to https://source.coop/walkthru-earth
- Positioned in hero/CTA sections

### Contact Information

**Email:** hi@walkthru.earth
- Displayed in footer
- Used for general inquiries
- Linked in structured data

---

## Summary & Recommendations

### ✅ Validated Stack

1. **Next.js 16.0.3** - Latest stable, production-ready
2. **React 19.2.0** - Latest with View Transitions
3. **Tailwind CSS 4.1.17** - Oxide engine performance
4. **Framer Motion 12.0.0** - React 19 compatible ⚠️
5. **next-themes 0.4.6** - Industry standard dark mode
6. **Lenis 1.3.15** - Lightweight smooth scroll (package renamed from @studio-freight/lenis)
7. **lucide-react 0.553.0** - Icon library
8. **tailwind-merge 3.4.0** - Utility class merging

### 🔴 Critical Actions Required

1. **Update Framer Motion** from v11 to v12
2. **Update Tailwind config** to v4 syntax (`@import`)
3. **Review middleware** for proxy.ts migration
4. **Test React 19.2** compatibility across all libraries

### 📊 Estimated Bundle Size

- **Initial Load:** ~85-95kb (gzipped)
- **Route Segments:** 15-25kb per page
- **Shared Chunks:** ~40kb (React, Next.js runtime)

---

**Next Steps:** See `implementation-plan.md` for detailed setup instructions.
