# Deployment

## Existing production target

The site is statically exported to `out/` and published to GitHub Pages at [walkthru.earth](https://walkthru.earth). The authoritative configuration is `next.config.mjs`, `.github/workflows/deploy.yml`, and `public/CNAME`.

The workflow checks pull requests and runs on pushes to `main` and manual `workflow_dispatch`. Deployment is restricted to the latter two triggers. It installs the pnpm lockfile under Node 24, audits dependencies, runs repository checks, builds Next.js, uploads `out/`, and deploys through the `github-pages` environment. GitHub repository settings must select GitHub Actions as the Pages source and allow the workflow's Pages and OIDC permissions.

Changing the working tree or running a local build does not publish anything. Publishing occurs when the workflow is triggered.

## Build and preview

```bash
pnpm install --frozen-lockfile
pnpm audit
pnpm lint
pnpm type-check
pnpm test
pnpm build
pnpm start
```

`pnpm start` serves `out/` at `http://localhost:3000`, including extensionless routes. The production workflow and [contributing guide](../CONTRIBUTING.md) are the source for current commands.

`output: 'export'` and `images.unoptimized: true` are intentional. Next.js generates HTML and client assets; there is no running Next.js server after deployment. Runtime-only server features and `next start` do not serve this architecture. See the [Next.js static export guide](https://nextjs.org/docs/app/guides/static-exports).

## Legacy CapyBrain links

The old `/hormones-cities` address is supported by two static documents:
`public/hormones-cities.html` and `public/hormones-cities/index.html`. The export
copies both into `out/`. The file covers `.html` bookmarks; the directory index
covers the trailing-slash URL and extensionless requests that the host resolves
or normalizes to that directory. Keep both documents identical.

Both load `public/legacy-capybrain-redirect.js`, which replaces the current
history entry with `/capybrain` while preserving the query string and fragment.
They include a canonical link to CapyBrain, `noindex`, and English/Arabic manual
links for visitors with scripts disabled. Without JavaScript, the manual links
open the canonical page without carrying query or fragment state.

These are browser redirects, not configurable HTTP 301/308 responses. GitHub
Pages serves the static export; Next.js `redirects()` and request-time route
handlers cannot implement this migration. Only `/capybrain` belongs in the
sitemap. Check `/hormones-cities`, `/hormones-cities/`, and
`/hormones-cities.html` with `?source=legacy#experiment` after building and after
deployment. Local preview routing is not proof of GitHub Pages normalization.

## Analytics configuration

| Variable                   | Use                                                              |
| -------------------------- | ---------------------------------------------------------------- |
| `NEXT_PUBLIC_POSTHOG_KEY`  | Public PostHog project key injected at build time                |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host; application fallback is `https://eu.i.posthog.com` |

For local configuration use `.env.local`, which is ignored by git. The workflow reads the corresponding GitHub repository secrets at build time. Public-prefixed values are visible to visitors; they are not a place for private service credentials. Google Analytics configuration is in `app/layout.tsx`; consent behavior is in `lib/cookie-consent.ts` and the consent components.

## Operational checks

- Confirm `out/index.html`, route HTML, `_next/` assets, `sitemap.xml`, `robots.txt`, and `CNAME` exist after build.
- Test direct navigation to `/indices` and other routes, not just navigation from the homepage.
- A loaded HTML page does not prove external datasets work. Check worker requests, source CORS/range support, and satellite tiles separately.
- If dependency installation fails, reproduce with the declared Node/pnpm versions and the frozen lockfile; do not generate an npm or Bun lockfile.
- If a visualization fails only in production, inspect emitted worker assets and the browser console, then reproduce using the exported site.
- DNS, HTTPS, cache policy, and response headers belong to the serving host. Next.js `headers()` does not enforce them in a static export.

The [Parquet producer guide](parquet-producer-guidance.md) describes the HTTP behavior required for partial remote reads.
