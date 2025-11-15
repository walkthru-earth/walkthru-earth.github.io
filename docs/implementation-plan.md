# Implementation Plan - Walkthru Website

**Last Updated:** November 15, 2025
**Project:** Walkthru - People-First Urban Intelligence Platform
**Estimated Timeline:** 2-3 weeks for MVP

---

## Table of Contents

1. [Phase 0: Pre-Development Setup](#phase-0-pre-development-setup)
2. [Phase 1: Project Initialization](#phase-1-project-initialization)
3. [Phase 2: Core Infrastructure](#phase-2-core-infrastructure)
4. [Phase 3: Design System](#phase-3-design-system)
5. [Phase 4: Component Development](#phase-4-component-development)
6. [Phase 5: Content Sections](#phase-5-content-sections)
7. [Phase 6: Animations & Interactions](#phase-6-animations--interactions)
8. [Phase 7: SEO & Performance](#phase-7-seo--performance)
9. [Phase 8: Testing & QA](#phase-8-testing--qa)
10. [Phase 9: Deployment](#phase-9-deployment)
11. [Phase 10: Post-Launch](#phase-10-post-launch)

---

## Phase 0: Pre-Development Setup

**Duration:** 1 day
**Prerequisites:** Node.js 20+, npm 10+, Git

### Checklist

- [ ] Install Node.js 20+ and npm 10+
- [ ] Install Git and configure credentials
- [ ] Set up code editor (VS Code recommended)
- [ ] Install VS Code extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Error Lens
  - GitLens
- [ ] Create GitHub repository
- [ ] Set up Vercel account
- [ ] Prepare design assets and content

---

## Phase 1: Project Initialization

**Duration:** 1 day

### Step 1.1: Create Next.js 16 Project

```bash
# Create new Next.js project with Turbopack
npx create-next-app@latest walkthru-website \
  --typescript \
  --tailwind \
  --app \
  --turbopack \
  --import-alias "@/*" \
  --no-src-dir

cd walkthru-website
```

**Questions you'll be asked:**
- ✅ TypeScript: Yes
- ✅ ESLint: Yes
- ✅ Tailwind CSS: Yes
- ✅ `src/` directory: No
- ✅ App Router: Yes
- ✅ Import alias: @/*

### Step 1.2: Initialize Git Repository

```bash
git init
git add .
git commit -m "Initial commit: Next.js 16 with Turbopack"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 1.3: Update Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "clean": "rm -rf .next node_modules",
    "prepare": "husky install"
  }
}
```

### Step 1.4: Install Core Dependencies

```bash
# Install exact versions for compatibility
npm install \
  framer-motion@12.0.0 \
  @studio-freight/lenis@^1.1.15 \
  next-themes@^0.4.3 \
  class-variance-authority@^0.7.1 \
  clsx@^2.1.1 \
  tailwind-merge@^2.5.4 \
  lucide-react@^0.460.0

# Install dev dependencies
npm install -D \
  prettier@^3.3.0 \
  prettier-plugin-tailwindcss@^0.6.0 \
  @types/node@^22.0.0 \
  tailwindcss-animate@^1.0.7
```

### Step 1.5: Configure Prettier

Create `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

Create `.prettierignore`:

```
node_modules
.next
out
dist
build
coverage
*.lock
package-lock.json
```

### Step 1.6: Update ESLint Configuration

Create `eslint.config.mjs`:

```javascript
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';

const compat = new FlatCompat();

export default [
  js.configs.recommended,
  ...compat.extends('next/core-web-vitals'),
  {
    rules: {
      'react/no-unescaped-entities': 'off',
      '@next/next/no-img-element': 'warn',
      'react/jsx-curly-brace-presence': [
        'warn',
        { props: 'never', children: 'never' },
      ],
      'prefer-const': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
    },
  },
];
```

---

## Phase 2: Core Infrastructure

**Duration:** 2 days

### Step 2.1: Configure Tailwind CSS 4.0

Update `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        quicksand: ['var(--font-quicksand)', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-up': 'fade-up 0.5s ease-out',
        'slide-in': 'slide-in 0.5s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

Update `app/globals.css`:

```css
@import 'tailwindcss';

@layer base {
  :root {
    /* Light Mode - Walkthru Earth Tones */
    --background: 60 20% 99%; /* Warm white */
    --foreground: 0 0% 9%; /* Soft black */

    --card: 60 10% 98%;
    --card-foreground: 0 0% 9%;

    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 9%;

    --primary: 158 64% 52%; /* Earth green */
    --primary-foreground: 0 0% 100%;

    --secondary: 37 91% 55%; /* Warm amber */
    --secondary-foreground: 0 0% 9%;

    --muted: 60 5% 96%;
    --muted-foreground: 0 0% 45%;

    --accent: 158 64% 52%;
    --accent-foreground: 0 0% 100%;

    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;

    --border: 60 5% 90%;
    --input: 60 5% 90%;
    --ring: 158 64% 52%;

    --radius: 0.5rem;
  }

  .dark {
    /* Dark Mode - Night Earth Tones */
    --background: 0 0% 7%; /* Deep charcoal */
    --foreground: 60 10% 98%; /* Soft white */

    --card: 0 0% 10%;
    --card-foreground: 60 10% 98%;

    --popover: 0 0% 10%;
    --popover-foreground: 60 10% 98%;

    --primary: 158 64% 42%; /* Muted earth green */
    --primary-foreground: 0 0% 9%;

    --secondary: 37 70% 45%; /* Muted amber */
    --secondary-foreground: 60 10% 98%;

    --muted: 0 0% 15%;
    --muted-foreground: 60 5% 65%;

    --accent: 158 64% 42%;
    --accent-foreground: 60 10% 98%;

    --destructive: 0 62% 50%;
    --destructive-foreground: 60 10% 98%;

    --border: 0 0% 20%;
    --input: 0 0% 20%;
    --ring: 158 64% 42%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground font-quicksand;
  }

  html {
    scroll-behavior: smooth;
  }

  /* Smooth transitions for theme switching */
  html.no-transition,
  html.no-transition *,
  html.no-transition *::before,
  html.no-transition *::after {
    transition: none !important;
  }
}

/* Accessibility: Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Focus styles for keyboard navigation */
.focus-visible:focus {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

/* Dark mode image filters */
.dark img:not([data-no-filter]) {
  opacity: 0.9;
}
```

### Step 2.2: Set Up Fonts

Create `app/fonts.ts`:

```typescript
import { Quicksand } from 'next/font/google';

export const quicksand = Quicksand({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-quicksand',
  weight: ['300', '400', '500', '600', '700'],
  preload: true,
  fallback: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'sans-serif',
  ],
});
```

### Step 2.3: Create Theme Provider

Create `components/theme/theme-provider.tsx`:

```typescript
'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

Create `components/theme/theme-toggle.tsx`:

```typescript
'use client';

import * as React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### Step 2.4: Update Root Layout

Update `app/layout.tsx`:

```typescript
import type { Metadata, Viewport } from 'next';
import { quicksand } from './fonts';
import { ThemeProvider } from '@/components/theme/theme-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Walkthru - People-First Urban Intelligence',
  description:
    'Revealing hidden patterns in cities to build resilient, sustainable, and happier communities through data-driven insights.',
  keywords:
    'urban wellbeing, livability index, city data, sustainable communities, urban analytics',
  authors: [{ name: 'Walkthru' }],
  creator: 'Walkthru',
  metadataBase: new URL('https://walkthru.earth'),
  openGraph: {
    title: 'Walkthru - People-First Urban Intelligence',
    description: 'Transform cities through data-driven wellbeing solutions',
    url: 'https://walkthru.earth',
    siteName: 'Walkthru',
    locale: 'en_US',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAF9' },
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={quicksand.variable}>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Step 2.5: Set Up Utilities

Create `lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Phase 3: Design System

**Duration:** 2 days

### Step 3.1: Initialize shadcn/ui

```bash
npx shadcn@latest init --defaults --skip-font --style=new-york
```

This creates `components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### Step 3.2: Add shadcn/ui Components

```bash
# Add essential components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dropdown-menu
npx shadcn@latest add navigation-menu
npx shadcn@latest add scroll-area
npx shadcn@latest add tabs
npx shadcn@latest add badge
npx shadcn@latest add separator
npx shadcn@latest add dialog
npx shadcn@latest add tooltip
```

### Step 3.3: Create Layout Components

Create `components/shared/container.tsx`:

```typescript
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn('mx-auto max-w-7xl px-6 md:px-12 lg:px-24', className)}>
      {children}
    </div>
  );
}
```

Create `components/shared/section.tsx`:

```typescript
import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function Section({ children, className, id }: SectionProps) {
  return (
    <section id={id} className={cn('py-24 md:py-32', className)}>
      {children}
    </section>
  );
}
```

---

## Phase 4: Component Development

**Duration:** 3 days

### Step 4.1: Create Navigation

Create `components/navigation/navbar.tsx`:

```typescript
'use client';

import Link from 'next/link';
import { Container } from '@/components/shared/container';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-2xl font-semibold">
            Walkthru
          </Link>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="#patterns"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Patterns
              </Link>
              <Link
                href="#indices"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Indices
              </Link>
              <Link
                href="#vision"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Vision
              </Link>
            </div>

            <ThemeToggle />

            <Button asChild>
              <Link href="#contact">Get Started</Link>
            </Button>
          </div>
        </div>
      </Container>
    </nav>
  );
}
```

### Step 4.2: Create Smooth Scroll

Create `components/shared/smooth-scroll.tsx`:

```typescript
'use client';

import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';

export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
      autoResize: true,
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

Update `app/layout.tsx` to include SmoothScroll:

```typescript
import { SmoothScroll } from '@/components/shared/smooth-scroll';

// ... in the JSX:
<ThemeProvider {...}>
  <SmoothScroll />
  {children}
</ThemeProvider>
```

---

## Phase 5: Content Sections

**Duration:** 4 days

### Step 5.1: Create Hero Section

Create `components/sections/hero.tsx`:

```typescript
'use client';

import { motion } from 'framer-motion';
import { Container } from '@/components/shared/container';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-4xl"
        >
          <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] font-light tracking-tight leading-[1.1]">
            Cities Shape Us
            <br />
            <span className="text-primary font-medium">
              More Than We Realize
            </span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl font-normal">
            We detect invisible patterns in urban life, transforming data into
            insights for resilient, happier communities.
          </p>

          <div className="mt-10 flex gap-4">
            <Button size="lg" asChild>
              <Link href="#patterns">Discover Patterns</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#vision">Our Vision</Link>
            </Button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
```

### Step 5.2: Create Pattern Detection Section

Create `components/sections/pattern-detection.tsx`:

```typescript
'use client';

import { motion } from 'framer-motion';
import { Container } from '@/components/shared/container';
import { Section } from '@/components/shared/section';
import { Card } from '@/components/ui/card';
import { Activity, MapPin, Users, TrendingUp } from 'lucide-react';

const patterns = [
  {
    icon: Activity,
    title: 'Behavior Analytics',
    description:
      'Understanding how urban design influences daily routines, stress levels, and wellbeing.',
  },
  {
    icon: MapPin,
    title: 'Spatial Patterns',
    description:
      'Mapping relationships between infrastructure, services, and quality of life.',
  },
  {
    icon: Users,
    title: 'Community Dynamics',
    description:
      'Detecting social cohesion, accessibility, and equity across neighborhoods.',
  },
  {
    icon: TrendingUp,
    title: 'Resilience Indicators',
    description:
      'Tracking sustainability, adaptability, and long-term urban health metrics.',
  },
];

export function PatternDetection() {
  return (
    <Section id="patterns" className="bg-muted/50">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-light tracking-tight">
            Detecting the{' '}
            <span className="text-primary font-medium">Invisible</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Patterns that shape daily life, hidden in plain sight
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {patterns.map((pattern, index) => (
            <motion.div
              key={pattern.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                <pattern.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{pattern.title}</h3>
                <p className="text-muted-foreground">{pattern.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
```

### Step 5.3: Create Indices Section

Create `components/sections/indices.tsx`:

```typescript
'use client';

import { motion } from 'framer-motion';
import { Container } from '@/components/shared/container';
import { Section } from '@/components/shared/section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const indices = [
  {
    id: 'livability',
    name: 'Livability Index',
    description:
      'Comprehensive scoring based on access to essentials, environment, and infrastructure',
    metrics: [
      'Water Quality',
      'Power Reliability',
      'Air Quality',
      'Food Access',
      'Transportation',
      'Healthcare Proximity',
      'Education Access',
      'Green Spaces',
    ],
  },
  {
    id: 'wellbeing',
    name: 'Wellbeing Score',
    description:
      'Emotional and psychological health indicators across neighborhoods',
    metrics: [
      'Stress Levels',
      'Safety Perception',
      'Social Connection',
      'Work-Life Balance',
      'Happiness Index',
      'Community Support',
    ],
  },
  {
    id: 'resilience',
    name: 'Resilience Rating',
    description:
      'Capacity to adapt to changes and withstand environmental pressures',
    metrics: [
      'Climate Adaptability',
      'Economic Stability',
      'Infrastructure Robustness',
      'Resource Efficiency',
      'Emergency Preparedness',
    ],
  },
];

export function Indices() {
  return (
    <Section id="indices">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-light tracking-tight">
            Living <span className="text-primary font-medium">Indices</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Tracking what matters for thriving, sustainable communities
          </p>
        </motion.div>

        <Tabs defaultValue="livability" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {indices.map((index) => (
              <TabsTrigger key={index.id} value={index.id}>
                {index.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {indices.map((index) => (
            <TabsContent key={index.id} value={index.id}>
              <Card className="p-8">
                <h3 className="text-2xl font-semibold mb-2">{index.name}</h3>
                <p className="text-muted-foreground mb-6">
                  {index.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {index.metrics.map((metric) => (
                    <Badge key={metric} variant="secondary">
                      {metric}
                    </Badge>
                  ))}
                </div>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </Container>
    </Section>
  );
}
```

### Step 5.4: Update Homepage

Update `app/page.tsx`:

```typescript
import { Navbar } from '@/components/navigation/navbar';
import { Hero } from '@/components/sections/hero';
import { PatternDetection } from '@/components/sections/pattern-detection';
import { Indices } from '@/components/sections/indices';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <PatternDetection />
        <Indices />
      </main>
    </>
  );
}
```

---

## Phase 6: Animations & Interactions

**Duration:** 2 days

### Step 6.1: Create Animation Variants

Create `lib/animations/variants.ts`:

```typescript
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
};
```

### Step 6.2: Optimize for Reduced Motion

Already handled in `globals.css` via:

```css
@media (prefers-reduced-motion: reduce) {
  /* ... */
}
```

---

## Phase 7: SEO & Performance

**Duration:** 2 days

### Step 7.1: Create Metadata

Already done in `app/layout.tsx`, but enhance with:

```typescript
// app/metadata.ts
import type { Metadata } from 'next';

export const siteMetadata: Metadata = {
  metadataBase: new URL('https://walkthru.earth'),
  title: {
    default: 'Walkthru - People-First Urban Intelligence',
    template: '%s | Walkthru',
  },
  description:
    'Revealing hidden patterns in cities to build resilient, sustainable, and happier communities through data-driven insights.',
  keywords: [
    'urban wellbeing',
    'livability index',
    'city data',
    'sustainable communities',
    'urban analytics',
    'smart cities',
    'data-driven urbanism',
  ],
  authors: [{ name: 'Walkthru', url: 'https://walkthru.earth' }],
  creator: 'Walkthru',
  publisher: 'Walkthru',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://walkthru.earth',
    siteName: 'Walkthru',
    title: 'Walkthru - People-First Urban Intelligence',
    description:
      'Transform cities through data-driven wellbeing solutions',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Walkthru - Urban Intelligence Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Walkthru - People-First Urban Intelligence',
    description:
      'Transform cities through data-driven wellbeing solutions',
    creator: '@walkthru_earth',
    images: ['/twitter-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-light.svg', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark.svg', media: '(prefers-color-scheme: dark)' },
    ],
    apple: '/apple-icon.png',
  },
};
```

### Step 7.2: Configure Next.js

Update `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack is default in Next.js 16
  experimental: {
    logging: {
      level: 'verbose',
      fullUrl: true,
    },
    optimizedNavigation: true,
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Font optimization
  optimizeFonts: true,

  // Compression
  compress: true,

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

## Phase 8: Testing & QA

**Duration:** 2 days

### Step 8.1: Manual Testing Checklist

- [ ] Test all pages in light/dark mode
- [ ] Verify smooth scrolling works
- [ ] Test animations (reduce motion if needed)
- [ ] Verify responsive design on mobile/tablet/desktop
- [ ] Test keyboard navigation
- [ ] Verify theme toggle works
- [ ] Check all links work
- [ ] Test form submissions (if any)
- [ ] Verify SEO meta tags
- [ ] Test accessibility with screen reader

### Step 8.2: Performance Testing

```bash
# Build production version
npm run build

# Analyze bundle
npm run build -- --analyze

# Run Lighthouse audit
npx lighthouse https://your-site.vercel.app --view
```

**Target Metrics:**
- Performance: 95+
- Accessibility: 98+
- Best Practices: 95+
- SEO: 100

---

## Phase 9: Deployment

**Duration:** 1 day

### Step 9.1: Set Up Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=https://walkthru.earth
# Add other variables as needed
```

### Step 9.2: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

Or connect GitHub repo to Vercel dashboard for automatic deployments.

### Step 9.3: Configure Custom Domain

In Vercel dashboard:
1. Go to Project Settings > Domains
2. Add `walkthru.earth` and `www.walkthru.earth`
3. Update DNS records as instructed

---

## Phase 10: Post-Launch

**Duration:** Ongoing

### Step 10.1: Set Up Analytics

```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:

```typescript
import { Analytics } from '@vercel/analytics/react';

// In JSX:
<Analytics />
```

### Step 10.2: Monitor Performance

- Set up Vercel Analytics
- Configure Google Search Console
- Monitor Core Web Vitals

### Step 10.3: Continuous Improvement

- Collect user feedback
- Monitor error rates (Sentry)
- A/B test improvements
- Update content regularly

---

## Summary Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 0 | 1 day | Environment setup |
| Phase 1 | 1 day | Project initialized |
| Phase 2 | 2 days | Core infrastructure |
| Phase 3 | 2 days | Design system |
| Phase 4 | 3 days | Components |
| Phase 5 | 4 days | Content sections |
| Phase 6 | 2 days | Animations |
| Phase 7 | 2 days | SEO & Performance |
| Phase 8 | 2 days | Testing |
| Phase 9 | 1 day | Deployment |
| **Total** | **20 days** | **Production site** |

---

**Next:** See `edge-cases-and-considerations.md` for potential issues and solutions.
