# walkthru.earth

People-first urban intelligence: exploring patterns in cities and building tools that support wellbeing.

**[Visit walkthru.earth](https://walkthru.earth)**

- **[Earth's Living Indices](https://walkthru.earth/indices)**: interactive globe for terrain, population, buildings, weather, and combined urban indicators.
- **[CapyBrain](https://walkthru.earth/capybrain)**: linked street imagery, map, and brain visualization.
- **[OpenSensor](https://walkthru.earth/opensensor)**: environmental sensing project.
- **[Software](https://walkthru.earth/software)**: Imagery Desktop and objex.

## Development

Use Node 24 and the pnpm version declared in `package.json`.

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`. `pnpm build` creates a static export in `out/` for GitHub Pages.

## Documentation

- [Contributing](CONTRIBUTING.md): commands, validation, dependency updates.
- [Agent guide](AGENTS.md): task-based map for the next development session.
- [Architecture](docs/architecture.md): routes, modules, and shared conventions.
- [Indices](docs/indices.md): on-demand Parquet loading and globe rendering.
- [Parquet producers](docs/parquet-producer-guidance.md): file and HTTP requirements.
- [Deployment](docs/deployment.md): GitHub Pages and configuration.

## License and community

[Creative Commons Attribution 4.0 International](LICENSE). Find us on [GitHub](https://github.com/walkthru-earth) and [LinkedIn](https://www.linkedin.com/company/walkthru-earth/).
