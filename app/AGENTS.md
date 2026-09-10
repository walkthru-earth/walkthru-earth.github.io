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
