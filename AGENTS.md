# Repository working guide

This is the Next.js static website for **walkthru.earth**, including the browser-based `/indices` globe. Start here; read only the guide for the area you will change.

## Find the right files

| Task                                                | Read first                                                                                                                | Implementation entry points                                                 |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Setup, commands, dependency upgrades                | [CONTRIBUTING.md](CONTRIBUTING.md)                                                                                        | `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`                     |
| Website structure or shared UI                      | [docs/architecture.md](docs/architecture.md), [app/AGENTS.md](app/AGENTS.md)                                              | `app/layout.tsx`, `app/globals.css`, `components/shared/`, `components/ui/` |
| Design palettes, project identity and page covers   | [app/AGENTS.md](app/AGENTS.md), [palette and cover architecture](docs/architecture.md#strategic-palettes-and-page-covers) | `lib/brand.ts`, `lib/strategy.ts`, `components/shared/brand-ui.tsx`         |
| Indices loading, H3, rendering, datasets            | [components/globe/AGENTS.md](components/globe/AGENTS.md), [docs/indices.md](docs/indices.md)                              | `components/globe/`                                                         |
| Parquet producer or hosting changes                 | [docs/parquet-producer-guidance.md](docs/parquet-producer-guidance.md)                                                    | Globe worker and dataset URL builders                                       |
| CapyBrain map, images, brain                        | [app/AGENTS.md](app/AGENTS.md)                                                                                            | `app/capybrain/components/explorer/`                                        |
| Publishing, build failures, analytics configuration | [docs/deployment.md](docs/deployment.md)                                                                                  | `.github/workflows/deploy.yml`, `next.config.mjs`, `app/providers.tsx`      |

## Working conventions

- Use **pnpm** and the Node version declared in `package.json`; `pnpm-lock.yaml` is authoritative. Keep local commands, hooks, and CI consistent.
- Preserve static export. Browser APIs belong in client components or workers; server routes, runtime secrets, and server-only image optimization do not fit the current host.
- Reuse theme tokens from `app/globals.css`, local Quicksand from `app/fonts.ts`, shared layout components, and existing UI primitives. Keep light/dark themes and reduced-motion behavior coherent.
- Keep dataset definitions, request lifecycle, scan/filter logic, and WebGL presentation separate. Prefer a focused module over extending a large component.
- Read the installed dependency API/types (Next.js guides live in `node_modules/next/dist/docs/`) and current upstream documentation before changing library integration. A package upgrade alone does not validate rendering or data correctness.
- Treat external data as fallible. Preserve meaningful loading/error states, cancellation, and bounded caches. Do not claim faster loading without recorded measurements.
- Run checks appropriate to the change from [CONTRIBUTING.md](CONTRIBUTING.md); data pipeline changes require tests and a production build. Check interactive changes in a browser when available.
- Update the single relevant guide when behavior changes. Keep this file a reading map; put local invariants in scoped `AGENTS.md` and explanations in `docs/`.

## Documentation policy

The repository uses `AGENTS.md` for agent instructions. There was no repository-local `CLAUDE.md` at consolidation; sibling projects have separate instructions for different stacks. Do not copy their Vite, DuckDB, Tambo, or Slidev conventions here.

The current guides replace the old stack survey, implementation plans, edge-case catalog, and DuckDB globe lessons. Git history retains those documents. Current source and the lockfile take precedence over historical claims or version tables.
