# Contributing

## Setup

Use Node 24 and the pnpm version in `package.json` (`packageManager`). Install dependencies with `pnpm install`; use `pnpm install --frozen-lockfile` when reproducing CI. Lefthook installs the pre-commit hook during installation.

If your global pnpm is older, `npx --yes pnpm@12.3.4 install` runs the current pin without changing the global installation; the same prefix can run `check`, `build`, or `dev`. Match that version to `packageManager` after future upgrades. This repository temporarily disables pnpm's automatic version switching to keep GitHub dependency scanning functional (see Dependencies below).

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

Run `pnpm audit` after upgrades; CI runs it before source checks. Do this even when GitHub shows no open Dependabot alerts. The September 10, 2026 review found only 14 entries in GitHub's SBOM (nine pnpm manager packages, four actions, and the repository), while the installed graph had 526 dependencies. GitHub marked 38 historical alerts fixed while `pnpm audit` still found three advisories. This matches the [known pnpm 12 multi-document lockfile parsing issue](https://github.com/dependabot/dependabot-core/issues/15904): GitHub misses application dependencies in the second YAML document. The `pmOnFail: ignore` workaround keeps one application lockfile document. It disables automatic local package-manager switching, so install the pinned `packageManager` version yourself; CI's `pnpm/setup` still installs it. Remove the workaround when upstream supports the full lockfile stream. After pushing lockfile changes, verify that GitHub's graph includes application packages before relying on its alert count. Inspect the affected dependency path and upstream advisory before changing a transitive dependency.

The scoped overrides in `pnpm-workspace.yaml` address loaders.gl 4.4.5 dependencies: `fflate` uses the patched 0.7.5 release for [GHSA-px8p-9vwx-vf98](https://github.com/advisories/GHSA-px8p-9vwx-vf98), and the unused `texture-compressor` CLI is removed. That CLI pulls in `image-size`, which has two unpatched denial-of-service advisories ([ICNS](https://github.com/advisories/GHSA-w3rx-r6r6-pgpr), [JXL/HEIF](https://github.com/advisories/GHSA-5p2g-fcmc-qvqq)). Only the [Node-only compressed texture writer](https://loaders.gl/docs/modules/textures/api-reference/compressed-texture-writer) uses the CLI; this website decodes textures in the browser and never invokes that writer. If adding offline texture encoding, choose a maintained encoder and review this exclusion. Recheck and remove these version-scoped overrides when upgrading loaders.gl.

## Structure and contribution scope

Start with [AGENTS.md](AGENTS.md) for a task reading map and [architecture](docs/architecture.md) for module ownership. Put reusable behavior in shared modules; keep route-specific content next to its route. Update route metadata, navigation, and `app/sitemap.ts` when adding public pages.

Keep pull request descriptions concrete: what behavior changed, why it matters, and how it was validated. Performance results must include dataset/resolution, viewport, cold or warm cache, device/browser, and measurement method.

Publishing uses the existing [GitHub Pages workflow](docs/deployment.md).
