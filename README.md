# Zenvinus web

Website and dashboard of Zenvinus (Next.js 16, React 19, TypeScript 7). Needs Node.js 20.9+ and bun. It talks to the Go backend
(`zenvinus-backend`) through the `/backend-api/*` proxy defined in `next.config.js`.

## Run

```bash
bun install
# optional: .env.local with NEXT_PUBLIC_API_URL=http://localhost:8080 (default: https://api.zenvinus.ai.id)
bun run dev                  # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `bun run dev` | Development server |
| `bun run build` / `bun run start` | Production build / serve it |
| `bun run typecheck` | TypeScript check (`tsc --noEmit`, native TypeScript 7) |
| `bun run lint` | Oxlint |

## Docs

- [docs/frontend.md](docs/frontend.md): folder structure, TypeScript conventions, how to add a feature.
- [docs/ZENVINUS-workflows-v3.md](docs/ZENVINUS-workflows-v3.md): product workflows.
- [AGENTS.md](AGENTS.md): page conventions for contributors and coding agents.
