# Routes and shared application shell

Read [the root guide](../AGENTS.md) first and [architecture](../docs/architecture.md) for the route map.

- `layout.tsx` owns metadata, organization JSON-LD, fonts, theme, scrolling, consent, and analytics. `providers.tsx` owns PostHog initialization and page views.
- `globals.css` owns Tailwind v4 and theme tokens. `fonts.ts` loads the committed Quicksand font. Reuse these instead of adding route-specific brand systems or remote font dependencies.
- Keep browser-only visualizations behind client boundaries and dynamic imports with `ssr: false`. This application exports static HTML; there is no request-time application server.
- A new public route needs title/description/canonical metadata and an entry in `sitemap.ts`; check navigation and `robots.ts` when relevant.
- `/indices` is a thin route wrapper. Dataset/loading/rendering work belongs under `components/globe/`; read [its guide](../components/globe/AGENTS.md).
- `/hormones-cities/components/hnc/` is a separate linked-view feature: `HNCExplorer.tsx` orchestrates, the map/brain/frame panels render, `parquet.ts` decodes, `config.ts` contains asset URLs, and `types.ts` defines the model.
- The Hormones & Cities loader intentionally fetches its hosted Parquet into memory because transparent HTTP compression can make remote byte offsets incorrect. Preserve binary image bytes (`utf8: false` for heavy columns) and object URL/WebGL disposal. Do not replace this with remote range loading without checking the actual host response.
- Keep animations and requestAnimationFrame loops cancellable on unmount and honor reduced motion. Preserve consent behavior when changing analytics; configuration names are in [deployment](../docs/deployment.md).

For visual changes, check both themes and mobile/desktop. Use [CONTRIBUTING.md](../CONTRIBUTING.md) for commands.

## Editorial design rules

Read [Strategic palettes and page covers](../docs/architecture.md#strategic-palettes-and-page-covers) before changing the website's visual identity, including shared components outside `app/`.

- Define colors in `lib/brand.ts`. Each strategic goal owns a semantic palette ID in `lib/strategy.ts`; never assign identity from array order. Projects inherit through `projectBrands` or use explicit light/dark `projectPaletteOverrides`.
- Use `BrandPage`, `BrandHero`, and the shared surface components. Use `main`/`ink` for a saturated accent and its text, `paper`/`surface`/`text` for editorial surfaces, and `text-palette-emphasis` for readable colored text. Do not use a pastel primary color as body text on a light surface.
- Give each cover a clear purpose, short heading, and useful next action. Use `EvidenceGraphic` for a conceptual explanation or `ProjectGallery` for real product imagery. Keep policy/link pages compact and data applications directly usable.
- Prefer short, finite SVG/CSS motion for interactive covers. Respect reduced motion; no automatic goal/gallery advancement, scroll-scrubbed text, decorative WebGL, or required video playback.
- Mount costly demos only after explicit visitor action and offer unloading. Mount only the selected gallery image; resolve the theme before requesting a theme-specific screenshot. Avoid speculative prefetch of the globe from editorial navigation.
- Keep `.brand-data-ui` around scientific interfaces so editorial palettes cannot change their data/control colors. Never recolor scientific scales as project decoration.
- New copy needs English, Arabic and Egyptian Arabic coverage. Check RTL arrows, keyboard goal/gallery controls, both themes, phone widths and reduced motion. Run palette contrast tests when editing palettes; record actual measurements before claiming performance gains.
