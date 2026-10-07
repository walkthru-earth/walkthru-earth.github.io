# Architecture

## Application and hosting

The repository is a Next.js App Router application with React, TypeScript, Tailwind CSS v4, Radix-based UI components, Framer Motion, and Lenis. It builds static HTML and assets into `out/`; GitHub Pages serves them. Data exploration executes in the visitor's browser against public assets and remote data services.

`package.json` and `pnpm-lock.yaml` define the installed stack. [CONTRIBUTING.md](../CONTRIBUTING.md) defines the development workflow; [deployment](deployment.md) defines hosting constraints.

## Route map

| Route                          | Purpose                                                  | Main implementation                                      |
| ------------------------------ | -------------------------------------------------------- | -------------------------------------------------------- |
| `/`                            | Organization homepage, goals and project previews        | `app/page.tsx`, `components/shared/evidence-graphic.tsx` |
| `/indices`                     | Interactive data globe                                   | `app/indices/`, `components/globe/`                      |
| `/hormones-cities`             | Street imagery, location, and brain activity exploration | `app/hormones-cities/`                                   |
| `/opensensor`                  | Sensor project                                           | `app/opensensor/`                                        |
| `/software`                    | Software overview                                        | `app/software/`                                          |
| `/software/imagery-desktop`    | Imagery Desktop product page                             | Route-local components, hooks, and feature data          |
| `/software/objex`              | objex product page                                       | `app/software/objex/`                                    |
| `/about`, `/links`, `/privacy` | Organization and policy pages                            | Corresponding directories under `app/`                   |

The root layout wraps all routes in theme, consent, analytics, and scrolling behavior. Route layouts provide page metadata; `app/sitemap.ts` and `app/robots.ts` export discovery files. The Quicksand font is committed in `app/fonts/` and loaded through `next/font/local`.

## Module boundaries

- `components/shared/`: layout and presentation primitives such as container, section, logo, text emphasis, and scrolling. `brand-ui.tsx` provides reusable page, hero, section, panel, icon, eyebrow, and heading components. `BrandPage` opts editorial routes into the bold type scale without enlarging scientific controls. Project identity is registered in `lib/brand.ts`: five strategic color families with project mappings and optional overrides. Registry-generated tokens and the surface rules in `app/globals.css` provide the shared theme; reuse project tones across cards, navigation, and routes instead of assigning new colors per section. `brand-data-ui` restores the original distinct selection colors inside scientific views. Prefer CSS reduced-motion variants for presentation so server and client markup remain identical.
- `components/strategy/`: shared homepage/About interactive strategic goals, Evidence → Translation → Action, policy references, and open-tool logos. Organization copy lives in `lib/strategy.ts`; both Arabic catalogs live in `lib/i18n/messages-strategy.ts`. The homepage shows compact goal summaries; About holds the full strategy and policy sources. Goal details use the existing Radix tabs with the locale direction, keyboard navigation, and no automatic advancement. Policy links describe alignment rather than institutional endorsements; technology logos identify tools used in the ecosystem.
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

Interface localization lives in `lib/i18n/`. The client-side provider persists the selected `en`, `ar-EG`, or `ar` locale, keeps the document `lang` and `dir` attributes synchronized, and falls back to English source copy when a catalog entry is absent. User-facing components own explicit `Localized` render boundaries (or call `t` for composed strings); do not translate React-owned text by mutating the DOM. Arabic uses the committed Cairo font and logical CSS properties so both Arabic variants share a complete RTL layout without a runtime translation or font service.

Section navigation mirrors its arrows and horizontal drawer swipes in RTL; the current/total counter stays an isolated LTR number pair. Do not mirror physical map controls, SQL, scientific color scales, or time-series axes with reading direction.

Analytics configuration lives in `app/providers.tsx`; consent persistence and Google consent integration live in `lib/cookie-consent.ts` and the consent components. Check those files together when changing analytics. `NEXT_PUBLIC_*` configuration is compiled into public browser code.

Static export means no request-time middleware, server API, server-only secret, or image optimization endpoint. Do not document application response headers as enforced by `next.config.mjs`; the actual serving host owns them. React Strict Mode remains disabled in configuration as an existing WebGL development workaround; re-enabling it needs a browser lifecycle check against the installed deck.gl/luma.gl versions.

## Documentation layout

[AGENTS.md](../AGENTS.md) is the task reading map. Scoped guides add local invariants without copying the whole architecture. The current guides consolidate the former implementation plans, stack survey, edge-case catalog, and legacy DuckDB globe reference; git history preserves those historical documents.

## Strategic palettes and page covers

`lib/brand.ts` is the color source of truth. Five families map to the goals in
`lib/strategy.ts`: saffron/open ecosystem, blue/measurable places, coral/lived
experience, mint/spatial intelligence, and lilac/real decisions. Each goal owns
its palette, label and motif; its position does not determine its identity.
Selecting a goal unfolds its five-swatch family alongside its content. Radix
owns keyboard navigation and the active panel; motion never advances selection.

Each palette defines light/dark `main`, `ink`, `paper`, `surface`, `accent`,
`deep`, `text`, `muted` and `border` roles. `ink` is text on saturated colors;
`text` is body text on theme-dependent surfaces. `projectBrands` assigns projects
to families. Change that reference to reuse another scheme, or add per-theme
values to `projectPaletteOverrides` for an independent project identity.
`brandPaletteCss()` emits the selectors into the root layout during static
rendering, so navigation icons, cards and page surfaces use the same values
without a hydration flash or a new stylesheet per project. `paletteVariables()`
also exposes the roles for programmatic inline styling. Full semantic tokens
are scoped to `brand-project-*`; `brand-tone-*` supplies a local identity.
Palette tests verify readable text pairs, references, and overrides.

The homepage introduces people, places and evidence through a small inline SVG
in `EvidenceGraphic`; it no longer mounts the globe preview or requests its data.
The actual globe remains at `/indices`, with its scientific color scales.
Homepage, navigation, footer and goal links to the globe disable speculative prefetch. The frameless diagram blends into the cover and explains the page through visitor-selected stages: Evidence → Translation → Action on the homepage. Native buttons (both scene markers and labeled steps) update the illustration and a localized live description; selection never advances automatically. The scene is explicitly labeled as a concept, not live measurements. CSS reveals, route drawing and finite sensor pulses respond to stage changes; subtle mouse movement uses CSS variables without a frame loop. Reduced-motion visitors retain all controls and get immediate, static state changes. There are no external assets or video runtime.

Covers use `BrandHero` and theme-aware paper/text colors. OpenSensor owns
`app/opensensor/components/sensor-flow.tsx`: an interactive architecture diagram
with Offline, Phone / hub, and Internet scenarios. Local Parquet storage stays
visible in every mode; local transfer and analysis can run without an internet
route. The Internet scenario shows a direct edge-to-object-storage route; a phone or hub is an optional relay. These are
illustrated scenarios, not network probes or simulated live readings. User-confirmed
capabilities include Bluetooth relays, isolated local hubs, Iceberg and STAC;
copy distinguishes Parquet files, Iceberg tables and STAC discovery, and public
anonymous reads from data anonymization. The page explains fewer always-on
services without promising limitless buffering or zero servers. Native controls,
localized live descriptions and finite CSS path reveals preserve keyboard, RTL,
touch and reduced-motion use.

About leads with purpose; Software, Links and Privacy use compact
editorial introductions. Hormones & Cities and Imagery Desktop use
`ProjectGallery`: explicit screenshot buttons, one mounted image at a time,
no autoplay and no scroll scrubbing. Portrait previews share a fixed 9:19 phone frame with a transparent bottom fade
and no nested scrollbar. A full-screenshot link opens the original image separately.
Keep image metadata aligned with source dimensions, even when the preview is cropped. The Hormones & Cities experiment starts only when requested; its hero action both opens and scrolls to the experiment, and an unload control releases it. Objex demos mount an iframe only after
“Load interactive demo”; closing the disclosure, unloading, or selecting another
demo releases it. The indices route stays an application without an extra cover.

HyperFrames is appropriate for a future exported film or campaign asset. These
covers use native SVG/CSS because the colors must respond directly to the shared
palette and the content must remain usable without media playback. No page-speed
improvement is asserted without a comparable production measurement.
