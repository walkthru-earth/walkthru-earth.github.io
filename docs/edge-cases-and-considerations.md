# Edge Cases & Considerations - Walkthru Website

**Last Updated:** November 15, 2025
**Project:** Walkthru - People-First Urban Intelligence Platform

---

## Table of Contents

1. [Critical Compatibility Issues](#critical-compatibility-issues)
2. [Dark Mode Edge Cases](#dark-mode-edge-cases)
3. [Animation & Performance](#animation--performance)
4. [Accessibility Considerations](#accessibility-considerations)
5. [SEO & Meta Tags](#seo--meta-tags)
6. [Mobile & Touch Interactions](#mobile--touch-interactions)
7. [Browser Compatibility](#browser-compatibility)
8. [Build & Deployment Issues](#build--deployment-issues)
9. [Third-Party Integrations](#third-party-integrations)
10. [Security Concerns](#security-concerns)
11. [Content Management](#content-management)
12. [Internationalization (Future)](#internationalization-future)

---

## Critical Compatibility Issues

### 1.1 Framer Motion & React 19 Incompatibility

**Issue:** Framer Motion v11 and earlier are incompatible with React 19.

**Symptoms:**
```bash
Error: Invalid hook call. Hooks can only be called inside of the body of a function component.
```

**Solution:**
```bash
# ⚠️ MUST USE VERSION 12+
npm install framer-motion@12.0.0

# Verify installation
npm list framer-motion
```

**Verification:**
```typescript
// Check in any component
import { motion } from 'framer-motion';

// This should work without errors
<motion.div animate={{ opacity: 1 }} />
```

### 1.2 Tailwind CSS 4.0 Configuration Breaking Changes

**Issue:** Tailwind v4 uses new CSS-first configuration.

**Old Approach (v3):**
```css
/* ❌ DEPRECATED in v4 */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**New Approach (v4):**
```css
/* ✅ REQUIRED in v4 */
@import "tailwindcss";
```

**Configuration Changes:**
- No more `tailwind.config.js` (optional now)
- CSS variables for theming (recommended)
- Auto-discovery of template files

**Migration Steps:**
1. Update `globals.css` to use `@import`
2. Move custom utilities to CSS files
3. Use `@theme` directive for custom values

### 1.3 Next.js 16 Middleware vs Proxy.ts

**Issue:** Middleware is being phased out for certain use cases.

**When to Use Each:**

| Use Case | Tool | Reason |
|----------|------|--------|
| Authentication | Middleware | Session checks before render |
| API Routing | proxy.ts | Clearer network boundary |
| Headers | Both | Depends on context |
| Redirects | Middleware | Established pattern |

**Example proxy.ts:**
```typescript
// proxy.ts (new in Next.js 16)
export default function proxy() {
  return {
    '/api/:path*': {
      target: 'https://api.example.com',
      changeOrigin: true,
    },
  };
}
```

---

## Dark Mode Edge Cases

### 2.1 Flash of Unstyled Content (FOUC)

**Issue:** Brief white flash when page loads in dark mode.

**Cause:** Theme loads after HTML is rendered.

**Solution:** Inject theme script before render.

Create `components/theme/theme-script.tsx`:
```typescript
export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          try {
            const theme = localStorage.getItem('theme') || 'system';
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            const appliedTheme = theme === 'system' ? systemTheme : theme;
            document.documentElement.classList.toggle('dark', appliedTheme === 'dark');
          } catch (e) {}
        `,
      }}
    />
  );
}
```

Add to `app/layout.tsx` inside `<head>`:
```typescript
<head>
  <ThemeScript />
</head>
```

### 2.2 Server/Client Theme Mismatch

**Issue:** Hydration mismatch when server renders light but client expects dark.

**Symptoms:**
```
Warning: Prop `className` did not match. Server: "" Client: "dark"
```

**Solution:** Use `suppressHydrationWarning` on `<html>`:
```typescript
<html lang="en" suppressHydrationWarning>
```

### 2.3 Images in Dark Mode

**Issue:** Bright images look harsh in dark mode.

**Solutions:**

**Option 1: CSS Filter**
```css
.dark img:not([data-no-filter]) {
  opacity: 0.9;
  filter: brightness(0.9);
}
```

**Option 2: Swap Images**
```typescript
import { useTheme } from 'next-themes';

function Logo() {
  const { theme } = useTheme();
  return (
    <img
      src={theme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'}
      alt="Logo"
    />
  );
}
```

**Option 3: Use Next.js Image with Multiple Sources**
```typescript
import Image from 'next/image';

<picture>
  <source srcSet="/dark-image.png" media="(prefers-color-scheme: dark)" />
  <Image src="/light-image.png" alt="..." />
</picture>
```

### 2.4 Theme Colors in Charts/Graphs

**Issue:** Chart libraries often have hardcoded colors.

**Solution:** Use CSS variables for chart colors:
```typescript
const chartColors = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  // ...
};
```

---

## Animation & Performance

### 3.1 Scroll Jank on Mobile

**Issue:** Smooth scroll feels janky on low-end devices.

**Cause:** Too many animation calculations per frame.

**Solutions:**

**Option 1: Disable on Low-End Devices**
```typescript
'use client';

import { useEffect, useState } from 'react';
import Lenis from '@studio-freight/lenis';

export function SmoothScroll() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    // Detect low-end device
    const isLowEnd =
      navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;

    if (isLowEnd) {
      setEnabled(false);
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      // ...config
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return null;
}
```

**Option 2: Reduce Animation Complexity**
```typescript
// Use will-change for better performance
<motion.div style={{ willChange: 'transform, opacity' }} />

// Prefer transform over top/left
// ✅ GOOD
<motion.div animate={{ x: 100 }} />

// ❌ BAD
<motion.div animate={{ left: 100 }} />
```

### 3.2 Reduced Motion Preference

**Issue:** Users with `prefers-reduced-motion` still see animations.

**Solution:** Already handled in `globals.css`, but also:

```typescript
'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

export function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
    >
      Content
    </motion.div>
  );
}
```

### 3.3 Infinite Animation Loops

**Issue:** Background animations run forever, consuming resources.

**Solution:** Pause when not visible:

```typescript
'use client';

import { useEffect, useRef } from 'react';

export function BackgroundAnimation() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Resume animation
        } else {
          // Pause animation
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return <div ref={ref}>...</div>;
}
```

### 3.4 Layout Shift from Animations

**Issue:** CLS (Cumulative Layout Shift) increases from animated elements.

**Solution:** Reserve space with `min-height`:

```typescript
<motion.div
  className="min-h-[400px]" // Reserve space
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
>
  {content}
</motion.div>
```

---

## Accessibility Considerations

### 4.1 Keyboard Navigation

**Issue:** Smooth scroll breaks anchor link keyboard navigation.

**Solution:** Lenis handles this, but verify:

```typescript
// Test keyboard navigation
// 1. Press Tab to focus links
// 2. Press Enter on anchor link
// 3. Verify smooth scroll works
```

**Fix if broken:**
```typescript
const lenis = new Lenis({
  // ...config
  syncTouch: true, // Allow touch scroll
  syncTouchLerp: 0.1,
});

// Handle hash links manually
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      lenis.scrollTo(target);
    }
  });
});
```

### 4.2 Screen Reader Announcements

**Issue:** Theme toggle doesn't announce current theme.

**Solution:** Add `aria-live` region:

```typescript
'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (theme) {
      setAnnouncement(`Theme changed to ${theme}`);
    }
  }, [theme]);

  return (
    <>
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>
      {/* Toggle button */}
    </>
  );
}
```

### 4.3 Focus Management in Modals

**Issue:** Focus escapes modal/dialog.

**Solution:** Use Radix UI's `Dialog` (already in shadcn):

```typescript
import { Dialog } from '@/components/ui/dialog';

// Automatically handles focus trap
<Dialog>
  <DialogContent>
    {/* Focus trapped here */}
  </DialogContent>
</Dialog>
```

### 4.4 Color Contrast in Dark Mode

**Issue:** Text doesn't meet WCAG AA contrast ratio.

**Test:**
```bash
# Use axe DevTools or Lighthouse
npm install -D @axe-core/cli

npx axe https://localhost:3000 --tags wcag2aa
```

**Fix:** Adjust CSS variables in `globals.css`:

```css
.dark {
  --foreground: 60 10% 98%; /* Increase lightness if needed */
  --muted-foreground: 60 5% 70%; /* Ensure 4.5:1 contrast */
}
```

---

## SEO & Meta Tags

### 5.1 Dynamic OG Images per Page

**Issue:** Same OG image for all pages.

**Solution:** Use Next.js Image Generation API:

```typescript
// app/api/og/route.tsx
import { ImageResponse } from 'next/og';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {title}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

Then use in metadata:
```typescript
export const metadata = {
  openGraph: {
    images: [`/api/og?title=${encodeURIComponent('Page Title')}`],
  },
};
```

### 5.2 Canonical URLs for Dark/Light Variants

**Issue:** Search engines index light and dark versions separately.

**Solution:** Use canonical tag (already in Next.js by default):
```typescript
export const metadata = {
  metadataBase: new URL('https://walkthru.earth'),
  alternates: {
    canonical: '/',
  },
};
```

### 5.3 Structured Data for Rich Snippets

**Add JSON-LD:**
```typescript
// app/layout.tsx or components/structured-data.tsx
export function StructuredData() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Walkthru',
    url: 'https://walkthru.earth',
    logo: 'https://walkthru.earth/logo.png',
    description:
      'People-first urban intelligence platform revealing hidden patterns in cities',
    sameAs: [
      'https://www.linkedin.com/company/walkthru-earth/',
      'https://github.com/walkthru-earth',
      'https://bsky.app/profile/walkthru-earth',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

### 5.4 Sitemap Generation

**Create `app/sitemap.ts`:**
```typescript
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://walkthru.earth',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://walkthru.earth/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Add more pages
  ];
}
```

---

## Mobile & Touch Interactions

### 6.1 Smooth Scroll on iOS Safari

**Issue:** Lenis smooth scroll feels off on iOS.

**Solution:** Adjust touch multiplier:

```typescript
const lenis = new Lenis({
  // ...config
  touchMultiplier: 2, // Increase for iOS
  syncTouch: true,
  syncTouchLerp: 0.1,
});
```

### 6.2 Hover Effects on Touch Devices

**Issue:** `:hover` states get stuck on mobile.

**Solution:** Use media query:

```css
/* Only apply hover on devices that support it */
@media (hover: hover) and (pointer: fine) {
  .card:hover {
    transform: scale(1.05);
  }
}
```

Or use JavaScript:
```typescript
'use client';

import { useState, useEffect } from 'react';

export function useIsTouch() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch('ontouchstart' in window);
  }, []);

  return isTouch;
}
```

### 6.3 Safe Area Insets (iPhone Notch)

**Issue:** Content hidden behind notch/home indicator.

**Solution:** Use CSS `env()`:

```css
body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

Update viewport meta:
```typescript
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover', // ← Add this
};
```

### 6.4 Touch Target Size

**Issue:** Buttons too small for fingers (WCAG 2.5.5).

**Minimum:** 44x44 pixels

**Solution:**
```typescript
<Button className="min-h-[44px] min-w-[44px]">
  Click me
</Button>
```

Or globally in Tailwind:
```typescript
// tailwind.config.ts
theme: {
  extend: {
    minHeight: {
      touch: '44px',
    },
    minWidth: {
      touch: '44px',
    },
  },
},
```

---

## Browser Compatibility

### 7.1 Browser Support Matrix

| Browser | Version | Support | Notes |
|---------|---------|---------|-------|
| Chrome | 100+ | ✅ Full | Primary target |
| Firefox | 100+ | ✅ Full | Good support |
| Safari | 15+ | ⚠️ Partial | Test smooth scroll |
| Edge | 100+ | ✅ Full | Chromium-based |
| Opera | Latest | ✅ Full | Chromium-based |
| IE 11 | N/A | ❌ None | Not supported |

### 7.2 CSS Feature Detection

**Use `@supports`:**
```css
/* Modern backdrop blur */
@supports (backdrop-filter: blur(10px)) {
  .navbar {
    backdrop-filter: blur(10px);
  }
}

/* Fallback */
@supports not (backdrop-filter: blur(10px)) {
  .navbar {
    background: rgba(255, 255, 255, 0.95);
  }
}
```

### 7.3 Safari-Specific Issues

**Issue 1: `clamp()` in font-size**
- **Status:** Supported in Safari 13.1+
- **Fallback:** Use media queries

**Issue 2: Smooth scroll**
- **Status:** Limited support
- **Fix:** Lenis handles this

**Issue 3: Date inputs**
- **Use:** Native date picker differs
- **Fix:** Use Radix UI DatePicker

---

## Build & Deployment Issues

### 8.1 Static Export Limitations

**Issue:** Using `output: 'export'` disables certain Next.js features.

**Not Available in Static Export:**
- ❌ API Routes (`app/api/*`)
- ❌ Server Actions
- ❌ Incremental Static Regeneration (ISR)
- ❌ Image Optimization API
- ❌ Rewrites/Redirects (use client-side navigation)
- ❌ Middleware (for auth, etc.)
- ❌ `headers()` and `cookies()` functions
- ❌ Dynamic routes with `generateStaticParams`

**Available in Static Export:**
- ✅ Static Site Generation (SSG)
- ✅ Client-side routing
- ✅ Client components
- ✅ Server components (rendered at build time)
- ✅ Metadata API
- ✅ `sitemap.ts` and `robots.ts`
- ✅ Font optimization
- ✅ CSS/JS optimization

**Workarounds:**

**1. Image Optimization:**
```typescript
// next.config.mjs
export default {
  images: {
    unoptimized: true, // Required for static export
  },
};
```

**2. API Routes:**
Use external services or serverless functions:
```typescript
// Instead of app/api/contact/route.ts
// Use: https://formspree.io or similar service
```

**3. Dynamic Content:**
Use client-side data fetching:
```typescript
'use client';

export function DynamicContent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('https://api.example.com/data')
      .then(res => res.json())
      .then(setData);
  }, []);

  return <div>{data?.title}</div>;
}
```

### 8.2 Type Errors in Production Build

**Issue:** Dev works, but build fails with type errors.

**Cause:** Loose type checking in dev mode.

**Solution:** Run type check before build:
```bash
npm run type-check
npm run build
```

**Common Fixes:**
```typescript
// ❌ BAD: Implicit any
const handleClick = (e) => { ... }

// ✅ GOOD: Explicit types
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => { ... }
```

### 8.2 Environment Variables Not Available

**Issue:** `process.env.NEXT_PUBLIC_*` is undefined in client.

**Cause:** Variable not prefixed with `NEXT_PUBLIC_`.

**Fix:**
```bash
# ❌ BAD: Won't work in client components
SITE_URL=https://walkthru.earth

# ✅ GOOD: Accessible in client
NEXT_PUBLIC_SITE_URL=https://walkthru.earth
```

### 8.3 Large Bundle Size

**Issue:** Initial load > 200kb.

**Diagnosis:**
```bash
npm run build
# Check .next/analyze/client.html
```

**Solutions:**

**Option 1: Dynamic Imports**
```typescript
// ❌ BAD: Loads heavy library upfront
import HeavyChart from 'heavy-chart-library';

// ✅ GOOD: Loads on demand
const HeavyChart = dynamic(() => import('heavy-chart-library'), {
  ssr: false,
});
```

**Option 2: Tree Shaking**
```typescript
// ❌ BAD: Imports entire library
import _ from 'lodash';

// ✅ GOOD: Imports only what's needed
import debounce from 'lodash/debounce';
```

### 8.4 Vercel Build Timeout

**Issue:** Build exceeds 15 minute limit.

**Causes:**
- Too many pages to generate
- Heavy dependencies

**Solutions:**
1. **Optimize dependencies:**
   ```bash
   npm prune
   rm -rf node_modules/.cache
   ```

2. **Incremental Static Regeneration:**
   ```typescript
   export const revalidate = 3600; // 1 hour
   ```

3. **Upgrade Vercel plan** (if needed)

---

## Third-Party Integrations

### 9.1 Google Analytics with CSP

**Issue:** Content Security Policy blocks GA scripts.

**Solution:** Add to CSP headers:
```typescript
// next.config.mjs
headers: [
  {
    key: 'Content-Security-Policy',
    value: `
      script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
      connect-src 'self' https://www.google-analytics.com;
    `.replace(/\s{2,}/g, ' ').trim()
  }
]
```

### 9.2 Social Media Embeds

**Issue:** Twitter/YouTube embeds slow down page.

**Solution:** Use facade/lazy loading:

```typescript
'use client';

import { useState } from 'react';

export function YouTubeEmbed({ videoId }: { videoId: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="aspect-video">
      {!loaded ? (
        <button
          onClick={() => setLoaded(true)}
          className="w-full h-full bg-gray-200"
        >
          <img
            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
            alt="Video thumbnail"
          />
        </button>
      ) : (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      )}
    </div>
  );
}
```

---

## Security Concerns

### 10.1 XSS Prevention

**Issue:** User-generated content could inject scripts.

**Solution:** Always sanitize:
```typescript
import DOMPurify from 'isomorphic-dompurify';

function SafeHTML({ html }: { html: string }) {
  const clean = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
```

### 10.2 CSRF Protection

**For future forms/API:**
```typescript
// app/api/submit/route.ts
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const headersList = headers();
  const origin = headersList.get('origin');

  if (origin !== process.env.NEXT_PUBLIC_SITE_URL) {
    return new Response('Forbidden', { status: 403 });
  }

  // Process request
}
```

### 10.3 Rate Limiting

**For API routes:**
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new Response('Too Many Requests', { status: 429 });
  }

  // Process request
}
```

---

## Content Management

### 11.1 Future CMS Integration

**Recommended:** Contentful, Sanity, or Strapi

**Approach:**
```typescript
// lib/cms.ts
export async function getContent(slug: string) {
  const res = await fetch(`${CMS_API}/entries?slug=${slug}`, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  return res.json();
}
```

### 11.2 Markdown Content

**For blog/docs:**
```bash
npm install next-mdx-remote gray-matter
```

```typescript
// app/blog/[slug]/page.tsx
import { MDXRemote } from 'next-mdx-remote/rsc';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export default async function BlogPost({
  params,
}: {
  params: { slug: string };
}) {
  const { content, data } = matter(
    fs.readFileSync(path.join('content', `${params.slug}.md`), 'utf8')
  );

  return (
    <article>
      <h1>{data.title}</h1>
      <MDXRemote source={content} />
    </article>
  );
}
```

---

## Internationalization (Future)

### 12.1 Next.js i18n Setup

**When needed:**
```typescript
// next.config.mjs
module.exports = {
  i18n: {
    locales: ['en', 'ar', 'es', 'fr'],
    defaultLocale: 'en',
  },
};
```

### 12.2 RTL Support for Arabic

```css
/* globals.css */
[dir='rtl'] {
  direction: rtl;
}

/* Flip margin/padding */
.ms-4 {
  margin-inline-start: 1rem;
}
```

```typescript
// components/rtl-provider.tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function RTLProvider() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith('/ar')) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [pathname]);

  return null;
}
```

---

## Testing Checklist

### Pre-Launch Checklist

**Functionality:**
- [ ] All links work (internal & external)
- [ ] Forms submit correctly
- [ ] Theme toggle works in all browsers
- [ ] Smooth scroll works on mobile/desktop
- [ ] Navigation works with keyboard
- [ ] All animations respect `prefers-reduced-motion`

**Performance:**
- [ ] Lighthouse score 95+ on all metrics
- [ ] Core Web Vitals pass
- [ ] Bundle size < 200kb initial
- [ ] Images optimized (AVIF/WebP)
- [ ] Fonts preloaded

**Accessibility:**
- [ ] WCAG AA compliance (4.5:1 contrast)
- [ ] Keyboard navigation works
- [ ] Screen reader tested
- [ ] Focus indicators visible
- [ ] Touch targets 44x44px minimum

**SEO:**
- [ ] Meta tags present
- [ ] OG images generated
- [ ] Sitemap accessible
- [ ] robots.txt configured
- [ ] Structured data validated

**Cross-Browser:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS 15+)
- [ ] Chrome Mobile (Android)

**Security:**
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] No console errors
- [ ] Dependencies audited (`npm audit`)
- [ ] No exposed secrets

---

## Common Error Messages & Solutions

### Error: "Hydration failed"

**Cause:** Server/client HTML mismatch

**Fix:**
```typescript
// Use useEffect for client-only content
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) return null;
```

### Error: "Module not found: Can't resolve '@/components/...'"

**Cause:** Path alias not configured

**Fix:** Check `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Error: "localStorage is not defined"

**Cause:** Accessing localStorage during SSR

**Fix:**
```typescript
if (typeof window !== 'undefined') {
  const value = localStorage.getItem('key');
}
```

---

## Performance Monitoring

### Key Metrics to Track

```typescript
// app/analytics.tsx
'use client';

import { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';

export function Analytics() {
  useReportWebVitals((metric) => {
    console.log(metric);

    // Send to analytics
    if (metric.label === 'web-vital') {
      // Track: LCP, FID, CLS, FCP, TTFB
      window.gtag?.('event', metric.name, {
        value: Math.round(
          metric.name === 'CLS' ? metric.value * 1000 : metric.value
        ),
        event_label: metric.id,
        non_interaction: true,
      });
    }
  });

  return null;
}
```

---

## Summary

This document covers:
- ✅ Critical compatibility issues (Framer Motion, Tailwind 4)
- ✅ Dark mode edge cases (FOUC, hydration)
- ✅ Animation performance (reduced motion, mobile)
- ✅ Accessibility (keyboard nav, screen readers)
- ✅ SEO considerations (OG images, structured data)
- ✅ Mobile interactions (touch, safe areas)
- ✅ Browser compatibility (Safari quirks)
- ✅ Build/deployment issues (env vars, bundle size)
- ✅ Security concerns (XSS, CSRF, rate limiting)
- ✅ Future considerations (CMS, i18n)

**Next Steps:**
1. Review all edge cases before implementation
2. Set up error tracking (Sentry)
3. Create testing plan
4. Document known issues in project README

---

**End of Documentation**
