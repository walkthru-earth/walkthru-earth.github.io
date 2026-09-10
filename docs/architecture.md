# Architecture

## Application and hosting

The repository is a Next.js App Router application with React, TypeScript, Tailwind CSS v4, Radix-based UI components, Framer Motion, and Lenis. It builds static HTML and assets into `out/`; GitHub Pages serves them. Data exploration executes in the visitor's browser against public assets and remote data services.

`package.json` and `pnpm-lock.yaml` define the installed stack. [CONTRIBUTING.md](../CONTRIBUTING.md) defines the development workflow; [deployment](deployment.md) defines hosting constraints.

## Route map

| Route                          | Purpose                                                  | Main implementation                                 |
| ------------------------------ | -------------------------------------------------------- | --------------------------------------------------- |
| `/`                            | Organization homepage and globe preview                  | `app/page.tsx`, `components/globe/GlobePreview.tsx` |
| `/indices`                     | Interactive data globe                                   | `app/indices/`, `components/globe/`                 |
| `/hormones-cities`             | Street imagery, location, and brain activity exploration | `app/hormones-cities/`                              |
| `/opensensor`                  | Sensor project                                           | `app/opensensor/`                                   |
| `/software`                    | Software overview                                        | `app/software/`                                     |
| `/software/imagery-desktop`    | Imagery Desktop product page                             | Route-local components, hooks, and feature data     |
| `/software/objex`              | objex product page                                       | `app/software/objex/`                               |
| `/about`, `/links`, `/privacy` | Organization and policy pages                            | Corresponding directories under `app/`              |

The root layout wraps all routes in theme, consent, analytics, and scrolling behavior. Route layouts provide page metadata; `app/sitemap.ts` and `app/robots.ts` export discovery files. The Quicksand font is committed in `app/fonts/` and loaded through `next/font/local`.

## Module boundaries

- `components/shared/`: layout and presentation primitives such as container, section, logo, gradient text, and scrolling.
- `components/ui/`: reusable UI controls built on Radix and the shared theme.
- `components/navigation/`, `components/sections/`, `components/theme/`: navigation, shared sections, and theme controls.
- `components/globe/`: reusable globe explorer, dataset registry, request pipeline, and WebGL renderer. See [indices](indices.md) before changing data behavior.
- `lib/`: small shared utilities, including consent state and LRU cache behavior.
- `public/`: committed images, geographic outlines, and other static assets; keep large data outside JavaScript bundles.
- Route-local `components/`, `hooks/`, and `data/`: features with a single owning route.

## Visualization boundaries

The indices explorer uses standalone deck.gl GlobeView, H3HexagonLayer, satellite tiles, and local land/border outlines. Its Parquet worker handles network, decoding, filtering, and row assembly. The route imports the explorer dynamically with server rendering disabled.

Hormones & Cities has its own MapLibre map and Three.js brain view. Its Parquet loader first reads lightweight metadata columns, then image and activity columns from an in-memory file. This is a separate transport requirement: its host can apply HTTP compression, so a HEAD response's length may not represent the decompressed Parquet byte offsets. Keep that constraint distinct from Source Cooperative range requests.

## Shared behavior

Theme switching uses `next-themes` classes and CSS variables in `app/globals.css`. Use existing tokens and components rather than duplicating theme rules. WebGL palettes must remain legible in both themes.

Analytics configuration lives in `app/providers.tsx`; consent persistence and Google consent integration live in `lib/cookie-consent.ts` and the consent components. Check those files together when changing analytics. `NEXT_PUBLIC_*` configuration is compiled into public browser code.

Static export means no request-time middleware, server API, server-only secret, or image optimization endpoint. Do not document application response headers as enforced by `next.config.mjs`; the actual serving host owns them. React Strict Mode remains disabled in configuration as an existing WebGL development workaround; re-enabling it needs a browser lifecycle check against the installed deck.gl/luma.gl versions.

## Documentation layout

[AGENTS.md](../AGENTS.md) is the task reading map. Scoped guides add local invariants without copying the whole architecture. The current guides consolidate the former implementation plans, stack survey, edge-case catalog, and legacy DuckDB globe reference; git history preserves those historical documents.
