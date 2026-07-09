# Deploying ZAOmemberz

Target stack: **Neon Postgres** + **Vercel**. This is a standard Next.js App
Router app — Vercel auto-detects the framework, so there's no `vercel.json` to
maintain.

## 1. Provision the database (Neon)

1. Create a Neon project and a database (e.g. `zaomemberz`).
2. Copy the **pooled** connection string (host contains `-pooler`). That's your
   `DATABASE_URL`.

## 2. Configure environment variables

Set these in the Vercel project (Settings → Environment Variables) and, for the
DB migration workflow, as a GitHub Actions secret. See
[`.env.example`](./.env.example) for the full list.

| Variable | Where | Notes |
| -------- | ----- | ----- |
| `DATABASE_URL` | Vercel + GH secret | Neon pooled connection string. |
| `SESSION_SECRET` | Vercel | 32+ random bytes (`openssl rand -base64 48`). |
| `NEXT_PUBLIC_AUTH_DOMAIN` | Vercel | Production host, no protocol (e.g. `memberz.thezao.com`). Gates SIWE/SIWF phishing protection. |
| `NEXT_PUBLIC_AUTH_URL` | Vercel | Full production origin (`https://memberz.thezao.com`). |
| `NEXT_PUBLIC_SITE_URL` | Vercel | Canonical origin for sitemap/robots (defaults to `AUTH_URL`). |
| `NEXT_PUBLIC_OP_RPC_URL` | Vercel | Optimism RPC for Farcaster verification. A dedicated Alchemy/Infura endpoint is recommended. |
| `MAINNET_RPC_URL` | Vercel | Mainnet RPC for live ENS resolution. |

> `NEXT_PUBLIC_AUTH_DOMAIN` / `NEXT_PUBLIC_AUTH_URL` **must** match the
> production domain, or Sign-In-With-Farcaster/Ethereum verification will reject
> logins (this is the anti-phishing binding, working as intended).

## 3. Apply migrations

Migrations are committed under [`drizzle/`](./drizzle). Apply them to the target
database once (and on every schema change):

- **Automatically:** the [`migrate.yml`](./.github/workflows/migrate.yml) GitHub
  Action runs `npm run db:migrate` on pushes to `main` that change the schema,
  using the `DATABASE_URL` secret. It can also be run manually via
  *workflow_dispatch*.
- **Manually:** `DATABASE_URL=… npm run db:migrate`.

## 4. Mint API keys for consuming apps (optional)

For server-side/admin writes (e.g. seeding), create keys for each consumer:

```bash
DATABASE_URL=… npm run keygen -- "ZAOOS"
DATABASE_URL=… npm run keygen -- "fractal-bot-dashboard"
```

The raw key is printed once — store it in the consumer's secrets. Revoke with
`npm run revoke -- --consumer "ZAOOS"`.

## 5. Seed the founding profiles

**Only after the real, user-confirmed profile data is in `src/db/seed-data.ts`.**
The seed script refuses to run while `PENDING:` placeholders remain.

```bash
DATABASE_URL=… npm run db:seed
```

## 6. Go live checklist

- [ ] Migrations applied to production DB.
- [ ] All env vars set (auth domain/url match the real domain).
- [ ] Founding profiles reviewed and seeded (no fabricated bios/stats).
- [ ] `GET /api/health` returns `{ "status": "ok" }` against production.
- [ ] Spot-check `GET /api/directory` and a profile page render live ENS.

## Consuming apps

Other ZAO apps read this service via the public API — see the drop-in client in
[`sdk/`](./sdk). They never connect to this database directly.
