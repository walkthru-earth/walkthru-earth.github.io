# Contributing

## Tech Stack

- **Framework:** Next.js 16 with Turbopack
- **Language:** TypeScript 5.7
- **Styling:** Tailwind CSS 4 (CSS-first config with @theme)
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Animations:** Framer Motion 12
- **Font:** Quicksand (Google Fonts)
- **Package Manager:** pnpm
- **Git Hooks:** Lefthook with lint-staged

## Development

```bash
pnpm install
pnpm dev
# Open http://localhost:3000
```

## Build

```bash
pnpm run type-check
pnpm run build        # Static export to ./out
```

## Code Quality

```bash
pnpm run lint
pnpm run lint:fix
pnpm run format
pnpm run format:check
```

Pre-commit hooks run ESLint and Prettier on staged files automatically via Lefthook (configured in `lefthook.yml`).

## Project Structure

```
app/
  layout.tsx            # Root layout with theme provider
  page.tsx              # Homepage
  globals.css           # Global styles + Tailwind theme
  indices/              # Interactive H3 globe explorer
  software/             # Software product pages
components/
  globe/                # Globe explorer (deck.gl, H3, hyparquet)
  ui/                   # shadcn/ui components
  sections/             # Homepage sections
  navigation/           # Navbar
  shared/               # Container, Section, etc.
public/                 # Static assets
docs/                   # Architecture docs
```

## Deployment

The site deploys to GitHub Pages automatically on push to `main`:

1. Enable GitHub Pages in repo settings (Source: GitHub Actions)
2. Push to `main` - the workflow installs deps, lints, builds, and deploys
3. Site serves at `https://walkthru.earth`

The site uses static export (`output: 'export'`).

## Key Conventions

- **Tailwind v4** CSS-first config in `app/globals.css` with `@theme inline`
- **Dark/light mode** via class-based switching (next-themes)
- **Security headers** configured in `next.config.ts`
- **Accessibility** - keyboard nav, reduced motion, ARIA labels, semantic HTML
