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
npm run lint
npm test
npm run typecheck
npm run build
npm run build:worker
```

`npm run build` intentionally runs `scripts/check-token-sync.mjs` first through the `prebuild` hook. This confirms the local STANN OS token copy at `app/stann-os.css` matches the expected canonical token hash.

`npm ci` applies and verifies the bundled `use-scramble` security patch. The same check runs after a regular `npm install`.

## Cloudflare / OpenNext

Build a Cloudflare Worker bundle:

```bash
npm run build:worker
```

Run local Cloudflare preview:

```bash
npm run cf:preview
```

Deploy:

```bash
npm run deploy
```

Important: D1 migrations are not automatically applied by `npm run deploy`. Apply and verify migrations as a separate deployment step before or alongside Worker deployment.

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

Current baseline guards include JSON content-type and payload-size checks. Rate limiting / Turnstile / stronger abuse controls should still be added before broad public launch.

## Documentation

Public project documentation:

- [Documentation overview](docs/README.md)
- [Requirements](docs/REQUIREMENTS.md)
- [Technical specification](docs/TECH_SPEC.md)
- [Change log](docs/CHANGE_LOG.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
