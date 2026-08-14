# terminal-2 — STANN OS LIVE

terminal-2 is the STANN OS LIVE surface for `https://terminal.stann.kr`.

- Surface role: LIVE
- SYS.ID: TM-02
- Related surfaces:
  - HUB: `https://stann.kr`
  - ARCHIVE: `https://lumo.stann.kr`
  - LIVE: `https://terminal.stann.kr`

## Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS
- TanStack Query
- Cloudflare OpenNext
- Cloudflare D1 + Drizzle schema
- Docker for local/container workflows

## Local development

Node.js 22 or newer is required.

```bash
npm ci
npm run dev
```

Default dev URL:

```text
http://localhost:3005
```

## Verification

Run these before treating the project as healthy:

```bash
npm audit --omit=dev
npm test
npm run lint
npm run typecheck
npm run build
npm run smoke:http
npm run build:worker
npm run test:d1
npx wrangler deploy --env production --dry-run
```

For Worker HTTP smoke, run `npm run cf:preview` and then run `SMOKE_BASE_URL=http://127.0.0.1:8787 SMOKE_API=1 npm run smoke:http` in another terminal.

`npm run build` intentionally runs `scripts/check-token-sync.mjs` first through the `prebuild` hook. This confirms the local STANN OS token copy at `app/stann-os.css` matches the expected canonical token hash.

`npm ci` applies and verifies the bundled `use-scramble` security patch. The same check runs after a regular `npm install`.

## Cloudflare / OpenNext

Build an environment-specific Cloudflare Worker bundle:

```bash
npm run build:worker:development
npm run build:worker:production
```

Run the development configuration in a local Cloudflare preview:

```bash
npm run cf:preview
```

Deployment targets are explicit:

```bash
npm run deploy:development
npm run deploy:production
```

Cloudflare Workers Builds is the only automatic deployment path. A `dev` push deploys the fixed `terminal-2-dev` Worker and a `main` push deploys the production `terminal-2` Worker. GitHub Actions performs validation only.

Important: production deployment requires separate approval. D1 migrations, secrets, bindings, and routes are not automatically changed by Worker code deployment and must be applied and verified as separate operations.

## D1

Configuration:

- `wrangler.toml`
- `drizzle.config.ts`
- `lib/db/schema.ts`
- `migrations/*.sql`

D1 binding name:

```text
DB
```

Remote databases are separated by environment:

- development: `terminal-db-dev`
- production: `terminal-db`

Local migration apply example:

```bash
npx wrangler d1 migrations apply terminal-db --local
```

Remote migration apply example:

```bash
npx wrangler d1 migrations apply terminal-db --remote
```

## Public write endpoints

These routes accept public writes and must be protected by validation, body guards, and abuse controls before high-traffic public use:

- `POST /api/gate/request`
- `POST /api/signal`
- `POST /api/transmit`

Current local contracts include exact JSON media-type and streaming byte guards, runtime DTO validation, a Cloudflare rate-limit binding interface, and a server-side Turnstile validator. Broad public launch still requires the real binding/secret, client token flow, and verified Signal unsubscribe/retention operations.

## Documentation

Public project documentation:

- [Documentation overview](docs/README.md)
- [Requirements](docs/REQUIREMENTS.md)
- [Technical specification](docs/TECH_SPEC.md)
- [Change log](docs/CHANGE_LOG.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
