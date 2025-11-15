# Deployment Guide - Walkthru Website

**Last Updated:** November 15, 2025
**Project:** Walkthru - People-First Urban Intelligence Platform
**Deployment Platform:** GitHub Pages with GitHub Actions

---

## Table of Contents

1. [Overview](#overview)
2. [GitHub Pages Setup](#github-pages-setup)
3. [GitHub Actions Workflow](#github-actions-workflow)
4. [Custom Domain Configuration](#custom-domain-configuration)
5. [Build Configuration](#build-configuration)
6. [Deployment Process](#deployment-process)
7. [Troubleshooting](#troubleshooting)
8. [Alternative Platforms](#alternative-platforms)

---

## Overview

### Deployment Strategy

The Walkthru website uses **GitHub Pages** with **GitHub Actions** for automated deployment:

- **Static Export:** Next.js builds to static HTML (`output: 'export'`)
- **Build Trigger:** Automatic on push to `main` branch
- **Hosting:** GitHub Pages (free)
- **Custom Domain:** walkthru.earth
- **HTTPS:** Automatic with GitHub Pages
- **CDN:** GitHub's global CDN

### Architecture

```
Developer → Git Push → GitHub Actions → Build → Deploy → GitHub Pages CDN → walkthru.earth
```

---

## GitHub Pages Setup

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** > **Pages**
3. Under "Source", select **GitHub Actions**
4. Save changes

### Step 2: Create Required Files

**Create `.nojekyll` file:**

```bash
touch public/.nojekyll
```

This disables Jekyll processing, which can interfere with Next.js routing.

**Create `CNAME` file:**

```bash
echo "walkthru.earth" > public/CNAME
```

This tells GitHub Pages to serve your site from the custom domain.

### Step 3: Configure Repository Permissions

1. Go to **Settings** > **Actions** > **General**
2. Under "Workflow permissions", select:
   - ✅ Read and write permissions
   - ✅ Allow GitHub Actions to create and approve pull requests
3. Save changes

---

## GitHub Actions Workflow

### Workflow File

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build with Next.js
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Workflow Breakdown

**Trigger:**
```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:  # Allows manual trigger
```

**Build Job:**
1. **Checkout** - Clones repository
2. **Setup Node.js** - Installs Node.js 20 with npm caching
3. **Install dependencies** - Runs `npm ci` (clean install)
4. **Build** - Runs `npm run build` (outputs to `./out`)
5. **Upload artifact** - Packages `./out` directory for deployment

**Deploy Job:**
1. **Depends on:** Build job completion
2. **Uses:** `actions/deploy-pages@v4`
3. **Deploys to:** GitHub Pages

---

## Custom Domain Configuration

### DNS Setup (Namecheap)

#### Option 1: CNAME Record (Recommended)

```
Type: CNAME
Host: @
Value: <username>.github.io
TTL: Automatic
```

#### Option 2: A Records (Alternative)

```
Type: A
Host: @
Value: 185.199.108.153
TTL: Automatic

Type: A
Host: @
Value: 185.199.109.153
TTL: Automatic

Type: A
Host: @
Value: 185.199.110.153
TTL: Automatic

Type: A
Host: @
Value: 185.199.111.153
TTL: Automatic
```

#### WWW Subdomain (Optional)

```
Type: CNAME
Host: www
Value: <username>.github.io
TTL: Automatic
```

### Verify DNS Configuration

```bash
# Check DNS propagation
dig walkthru.earth

# Check CNAME record
dig walkthru.earth CNAME

# Check from different DNS servers
dig @8.8.8.8 walkthru.earth
dig @1.1.1.1 walkthru.earth
```

**DNS Propagation Time:** 5 minutes to 48 hours (typically ~30 minutes)

### Enable HTTPS

1. Go to **Settings** > **Pages**
2. Under "Custom domain", verify `walkthru.earth` is set
3. Check "Enforce HTTPS"
4. Wait for certificate provisioning (can take up to 24 hours)

---

## Build Configuration

### Next.js Configuration

**File:** `next.config.mjs`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for GitHub Pages
  output: 'export',

  // Turbopack configuration
  turbopack: {
    root: '.',
  },

  images: {
    unoptimized: true, // Required for static export
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Compression
  compress: true,

  // Security headers (not applied in static export, but good for Vercel)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

### Build Output

```
npm run build

# Creates:
# - .next/ (intermediate build files)
# - out/ (static export directory)
#   - index.html
#   - _next/ (optimized assets)
#   - sitemap.xml
#   - robots.txt
#   - assets/
```

---

## Deployment Process

### Automatic Deployment

**Every push to `main` triggers deployment:**

1. Commit changes:
   ```bash
   git add .
   git commit -m "Update feature X"
   git push origin main
   ```

2. GitHub Actions runs automatically:
   - Build job starts
   - Runs `npm ci`
   - Runs `npm run build`
   - Uploads `./out` to artifact storage

3. Deploy job runs:
   - Deploys artifact to GitHub Pages
   - Updates live site

4. Monitor progress:
   - Go to **Actions** tab in repository
   - Click on latest workflow run
   - View logs for each step

### Manual Deployment

Trigger deployment manually:

1. Go to **Actions** tab
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow"
4. Select `main` branch
5. Click "Run workflow" button

### Local Build Testing

Test the static export locally before deploying:

```bash
# Build
npm run build

# Serve the out directory
npx serve out

# Or use a simple HTTP server
cd out
python3 -m http.server 8000

# Visit http://localhost:8000
```

---

## Troubleshooting

### Build Failures

#### Issue: "npm ci" fails

**Symptoms:**
```
Error: Cannot find module 'package-lock.json'
```

**Solution:**
```bash
# Generate package-lock.json
npm install

# Commit it
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

#### Issue: TypeScript errors during build

**Symptoms:**
```
Type error: Property 'x' does not exist on type 'Y'
```

**Solution:**
```bash
# Run type check locally
npm run type-check

# Fix all type errors before pushing
```

#### Issue: Build exceeds memory limit

**Solution:**

Add to `package.json`:
```json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
}
```

### Deployment Failures

#### Issue: 404 on deployed site

**Cause:** Static export not configured correctly

**Solution:**

1. Verify `next.config.mjs` has `output: 'export'`
2. Verify `./out` directory is created after build
3. Verify workflow uploads `./out` directory

#### Issue: Assets not loading (404 on CSS/JS)

**Cause:** Incorrect base path

**Solution:**

For subdirectory hosting, add `basePath`:
```javascript
// next.config.mjs
export default {
  basePath: '/subdirectory',
  output: 'export',
};
```

For root domain (walkthru.earth), no `basePath` needed.

#### Issue: Custom domain not working

**Checklist:**
- [ ] `CNAME` file exists in `public/` directory
- [ ] `CNAME` file contains correct domain
- [ ] DNS records configured correctly
- [ ] DNS propagation complete (check with `dig`)
- [ ] GitHub Pages settings show custom domain
- [ ] HTTPS certificate provisioned

### Runtime Errors

#### Issue: Smooth scroll not working

**Cause:** Lenis initialization issue

**Solution:**

Verify `lenis` package is installed (not `@studio-freight/lenis`):
```bash
npm list lenis
```

Update import:
```typescript
import Lenis from 'lenis';  // ✅ Correct
// import Lenis from '@studio-freight/lenis';  // ❌ Old package
```

#### Issue: Dark mode flashing (FOUC)

**Cause:** Theme not set before hydration

**Solution:**

Already handled in `app/layout.tsx` with:
```typescript
<html lang="en" suppressHydrationWarning>
```

And in `ThemeProvider`:
```typescript
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
```

---

## Alternative Platforms

### Vercel

**Advantages:**
- Image optimization (no `unoptimized: true` needed)
- Edge functions support
- Automatic preview deployments
- Built-in analytics
- Zero configuration

**Setup:**

1. Remove `output: 'export'` from `next.config.mjs`
2. Remove `images.unoptimized: true`
3. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
4. Deploy:
   ```bash
   vercel --prod
   ```

### Netlify

**Advantages:**
- Split testing
- Form handling
- Serverless functions
- Deploy previews

**Setup:**

1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```
2. Keep `output: 'export'` in `next.config.mjs`
3. Create `netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = "out"
   ```
4. Deploy:
   ```bash
   netlify deploy --prod
   ```

### Cloudflare Pages

**Advantages:**
- Global CDN
- Fast edge network
- Free SSL
- Unlimited bandwidth

**Setup:**

1. Keep `output: 'export'` in `next.config.mjs`
2. Connect GitHub repository in Cloudflare dashboard
3. Set build command: `npm run build`
4. Set build output directory: `out`
5. Deploy automatically on push

---

## Performance Optimization

### Cache Strategy

GitHub Pages automatically caches static assets:

```
Cache-Control: max-age=600 (HTML files)
Cache-Control: max-age=31536000 (Static assets)
```

### Build Optimization

**Enable Turbopack:**
```json
{
  "scripts": {
    "build": "next build --turbopack"
  }
}
```

**Minimize Bundle Size:**
```bash
# Analyze bundle
npm run build

# Check .next/analyze/
```

---

## Monitoring

### Check Deployment Status

**GitHub Actions:**
- Go to **Actions** tab
- View workflow runs
- Check build logs

**GitHub Pages:**
- Go to **Settings** > **Pages**
- View deployment status
- See deployed URL

### Analytics

**Recommended Tools:**
- Vercel Analytics (if migrated to Vercel)
- Google Analytics 4
- Plausible Analytics (privacy-friendly)
- Umami (self-hosted)

**Add to `app/layout.tsx`:**
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## Security

### HTTPS

- ✅ Automatic with GitHub Pages
- ✅ Let's Encrypt certificate
- ✅ Auto-renewal
- ✅ Enforced via "Enforce HTTPS" setting

### Content Security Policy

Headers in `next.config.mjs` don't apply to static export.

For CSP, use:
- Netlify: `_headers` file
- Cloudflare Pages: Custom headers
- Vercel: Next.js config (supports headers)

### Dependency Security

```bash
# Audit dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Update outdated packages
npm outdated
npm update
```

---

## Summary

**Current Setup:**
- ✅ GitHub Pages hosting
- ✅ GitHub Actions CI/CD
- ✅ Custom domain: walkthru.earth
- ✅ Automatic HTTPS
- ✅ Static export configuration
- ✅ SEO automation (sitemap, robots.txt)
- ✅ Zero hosting cost

**Deploy Command:**
```bash
git push origin main
```

**Live Site:**
https://walkthru.earth

---

**End of Deployment Guide**
