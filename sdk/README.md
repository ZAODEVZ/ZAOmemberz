# ZAOmemberz client SDK

A tiny, zero-dependency client for the ZAOmemberz **public read API**. Use it in
any ZAO app to enrich pages with profile info (display name / avatar / bio /
links) without touching this service's database — everything goes over HTTP,
joined by `wallet_address`, `farcaster_fid`, or `discord_id` at the application
layer.

> Reads are public — **no API key or auth needed**. (Writes are a separate,
> gated concern and are intentionally not part of this read client.)

## Install

Copy [`zaomemberz-client.ts`](./zaomemberz-client.ts) into your project — it has
no dependencies and runs in the browser and Node 18+.

## Quick start

```ts
import { createZaomemberzClient } from "./zaomemberz-client";

const zm = createZaomemberzClient("https://memberz.thezao.com");

// By wallet (the anchor). Returns null if there's no profile.
const profile = await zm.getProfileByWallet("0xabc…");

// Force a fresh mainnet ENS resolution instead of the cached copy:
const live = await zm.getProfileByWallet("0xabc…", { liveEns: true });

// By Farcaster FID or Discord user ID:
await zm.getProfileByFid(1234);
await zm.getProfileByDiscord("123456789012345678");

// The whole public directory:
const members = await zm.getDirectory();
```

## Next.js (App Router) example

```tsx
import { createZaomemberzClient } from "@/lib/zaomemberz-client";

const zm = createZaomemberzClient(process.env.NEXT_PUBLIC_ZAOMEMBERZ_URL!, {
  // Cache profile lookups for 5 minutes via Next's fetch cache.
  fetch: (url, init) =>
    fetch(url, { ...init, next: { revalidate: 300 } } as RequestInit),
});

export async function MemberBadge({ wallet }: { wallet: string }) {
  const p = await zm.getProfileByWallet(wallet);
  if (!p) return null;
  return (
    <span>
      {p.avatarUrl && <img src={p.avatarUrl} alt="" width={24} height={24} />}
      {p.displayName ?? p.ens.name ?? wallet}
    </span>
  );
}
```

## ENS freshness

`profile.ens` always tells you whether the name is a cached copy:

```ts
{ name: "zaal.eth", cached: true, checkedAt: "2026-07-08T00:00:00.000Z" }
```

For the canonical, never-stale value pass `{ liveEns: true }` (resolves fresh
from Ethereum mainnet) or link users to the profile page, which always resolves
live.

## Endpoints this wraps

| Method | Endpoint |
| ------ | -------- |
| `getProfileByWallet` | `GET /api/profiles/:wallet` (`?ens=live`) |
| `getProfileByFid` | `GET /api/profiles/fid/:fid` |
| `getProfileByDiscord` | `GET /api/profiles/discord/:discordId` |
| `getDirectory` | `GET /api/directory` |
