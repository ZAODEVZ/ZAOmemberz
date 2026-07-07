# ZAOmemberz

The ZAO ecosystem's shared **identity / profile service**. One profile per
member, anchored to a wallet, that every ZAO app can read through a public HTTP
API. Own your identity once — show up everywhere.

- **Stack:** Next.js (App Router) + TypeScript · Neon Postgres + Drizzle ORM ·
  deployed on Vercel.
- **Auth:** Sign-In-With-Farcaster (primary) with a Sign-In-With-Ethereum
  wallet fallback for end users; API keys for server-side/admin writes.
- **Reads are public. Writes are gated.** No other app touches this database
  directly — everything goes through the HTTP API.

---

## Architecture

```
Consuming apps (ZAOOS, fractal bot dashboard, …)
        │  read-only HTTP, joined by wallet_address / discord_id
        ▼
┌─────────────────────────────────────────────┐
│  ZAOmemberz  (this service)                  │
│  Next.js API  ──►  Neon Postgres (Drizzle)   │
└─────────────────────────────────────────────┘
```

This service **never** talks to another app's database, and no other app talks
to this one's. `bettercallzaal/fractalbotjuly2026` (Respect/fractal history) and
ZAOOS each call this service's **public read API** to enrich their own pages
with profile info (bio / avatar / display name), joined only at the application
layer by `wallet_address` or `discord_id` — never a cross-database foreign key.

## Data model (`src/db/schema.ts`)

| Table          | Purpose |
| -------------- | ------- |
| `profiles`     | Core identity. `wallet_address` is the unique anchor. `discord_id` and `farcaster_fid` are unique-when-present. `ens_name` is a **cache only** (see below). |
| `social_links` | One-to-many extra links (X, GitHub, site, Warpcast…). |
| `api_keys`     | Gates **writes only**. Stores a SHA-256 hash of each key; raw keys are shown once and never persisted. |

**ENS is never served stale.** The `ens_name` column is a convenience cache so
list views don't fan out N RPC calls. Every individual profile view resolves ENS
**live from Ethereum mainnet** and timestamps it; the API returns the cached
value flagged `cached: true` with `checkedAt`, or a live value via
`?ens=live`.

## API

### Public reads (no auth)

| Method & path | Returns |
| ------------- | ------- |
| `GET /api/directory` | Full member directory. |
| `GET /api/profiles/:wallet` | Profile by wallet. `?ens=live` forces fresh ENS. |
| `GET /api/profiles/fid/:fid` | Profile by Farcaster FID. |
| `GET /api/profiles/discord/:discordId` | Profile by Discord user ID. |

### Gated writes (owner session **or** API key)

| Method & path | Notes |
| ------------- | ----- |
| `POST /api/profiles` | Create. A session may only create for its own wallet; an API key may create for any wallet. |
| `PATCH /api/profiles/:wallet` | Update. Owner (matching wallet or FID) or API key only. |

API-key callers send `x-api-key: <key>` (or `Authorization: Bearer <key>`).

### Auth endpoints

`GET /api/auth/nonce` · `POST /api/auth/farcaster` · `POST /api/auth/siwe` ·
`GET /api/auth/me` · `POST /api/auth/logout`.

## Pages

- `/` — public, dark, event-ready member directory. **Every stat shown is real
  and verifiable** (see `src/lib/ecosystem-facts.ts`); the weekly-run count is
  computed live from `2024-07-30`.
- `/profile/[wallet-or-fid]` — public profile view with **live** ENS resolution.
- `/me` (alias `/profile/edit`) — the owner's self-service editor, gated by the
  Farcaster / wallet login above.

## Local development

```bash
npm install
cp .env.example .env          # fill in DATABASE_URL, SESSION_SECRET, …
npm run db:generate           # generate SQL migration (already committed)
npm run db:migrate            # apply to your Neon database
npm run keygen -- "ZAOOS"     # (optional) mint an API key for a consumer
npm run dev
```

Environment variables are documented in [`.env.example`](./.env.example).

## Seeding the founding profiles

The two founding profiles (Zaal, Founder; Samantha Kinney, Co-Founder) live in
`src/db/seed-data.ts`. **They ship with `PENDING:` placeholders on purpose** —
both source sites block automated fetching, so the real bios, wallet addresses,
and links must be filled in with **user-confirmed** values. `npm run db:seed`
**refuses to run** while any `PENDING:` marker remains, so no fabricated bio or
made-up address can ever reach the database.

```bash
# 1. Replace every PENDING: value in src/db/seed-data.ts with real, confirmed data
# 2. npm run db:seed
```

## Deploy (Vercel)

Set the same environment variables in the Vercel project, point `DATABASE_URL`
at your Neon pooled connection string, and set `NEXT_PUBLIC_AUTH_DOMAIN` /
`NEXT_PUBLIC_AUTH_URL` to the production domain (they gate SIWE/SIWF phishing
protection). Run `npm run db:migrate` against production once.

> **Before announcing it's live:** confirm the real profile info for Zaal and
> Sam has been reviewed. Do not ship fabricated bios or stats.
