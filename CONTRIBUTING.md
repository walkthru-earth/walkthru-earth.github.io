# Contributing

## Setup

Use Node 24 and the pnpm version in `package.json` (`packageManager`). Install dependencies with `pnpm install`; use `pnpm install --frozen-lockfile` when reproducing CI. Lefthook installs the pre-commit hook during installation.

```bash
pnpm dev                 # Development server at localhost:3000
pnpm check               # Combined lint, type checking, tests, formatting
pnpm lint                # Oxlint
pnpm type-check          # TypeScript, no output
pnpm test                # Vitest regression suite
pnpm build               # Production static export in out/
pnpm format:check        # Prettier
```

`pnpm lint:fix` and `pnpm format` apply fixes. For focused changes, run Prettier against just the touched files with `pnpm exec prettier --write <files>`. Pre-commit uses lint-staged for staged code and formatting; it does not replace the full validation suite.

## Validation

For dependency, configuration, or data pipeline changes, run lint, type checking, tests, and build. Unit tests cover data correctness and lifecycle behavior; a passing Node test does not prove WebGL rendering works.

For visual changes, verify relevant routes at desktop and mobile sizes, both themes, keyboard navigation, reduced motion, and loading/error states. For `/indices`, also follow the manual checks in [the indices guide](docs/indices.md). Record the actual checks and any blocked browser/network verification in the change description.

To inspect the production export locally:

```bash
pnpm build
pnpm start
```

Open `http://localhost:3000`; `pnpm start` uses `serve` for extensionless routes in the static export. It does not start a Next.js application server.

## Dependencies

```bash
pnpm outdated
pnpm upgrade --latest
pnpm install --frozen-lockfile
```

Read release notes and installed types for changed major versions. Check React hooks, icons, deck.gl/luma.gl rendering parameters, hyparquet scan APIs, TypeScript, and lint integration when those packages move. Use the individual deck.gl packages actually imported by source. Remove unused packages and alternate lockfiles; keep one pnpm workflow across development, pre-commit, and CI.

Oxlint provides TypeScript, React, Next.js, and accessibility checks. The upgrade replaced the ESLint stack after its installed parser failed with TypeScript 7; lint configuration lives in `.oxlintrc.json`.

The manifest and lockfile are the version record. Documentation describes responsibilities and constraints instead of copying a package-version table that drifts.

## Structure and contribution scope

Start with [AGENTS.md](AGENTS.md) for a task reading map and [architecture](docs/architecture.md) for module ownership. Put reusable behavior in shared modules; keep route-specific content next to its route. Update route metadata, navigation, and `app/sitemap.ts` when adding public pages.

Keep pull request descriptions concrete: what behavior changed, why it matters, and how it was validated. Performance results must include dataset/resolution, viewport, cold or warm cache, device/browser, and measurement method.

Publishing uses the existing [GitHub Pages workflow](docs/deployment.md).
