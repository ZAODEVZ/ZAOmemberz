/**
 * ZAOmemberz client — a tiny, zero-dependency, framework-agnostic wrapper over
 * the public read API. Drop this file into any ZAO app (ZAOOS, the fractal bot
 * dashboard, …) to enrich its own pages with ZAO profile info, joined by
 * wallet_address / farcaster_fid / discord_id at the application layer.
 *
 * Reads are public — no auth needed. Works in the browser and in Node 18+
 * (uses the global `fetch`).
 *
 * Usage:
 *   import { createZaomemberzClient } from "./zaomemberz-client";
 *   const zm = createZaomemberzClient("https://memberz.thezao.com");
 *   const profile = await zm.getProfileByWallet("0xabc…");   // or null
 *   const all = await zm.getDirectory();
 */

export interface ZaomemberzProfile {
  walletAddress: string;
  discordId: string | null;
  farcasterFid: number | null;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  /** Cached ENS. `cached:true` + `checkedAt` tells you how fresh it is. Pass
   *  `{ liveEns: true }` to getProfileByWallet to force a fresh mainnet lookup. */
  ens: { name: string | null; cached: boolean; checkedAt: string | null };
  socialLinks: { platform: string; urlOrHandle: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface ZaomemberzClient {
  getProfileByWallet(
    wallet: string,
    opts?: { liveEns?: boolean },
  ): Promise<ZaomemberzProfile | null>;
  getProfileByFid(fid: number): Promise<ZaomemberzProfile | null>;
  getProfileByDiscord(discordId: string): Promise<ZaomemberzProfile | null>;
  getDirectory(): Promise<ZaomemberzProfile[]>;
}

export interface ClientOptions {
  /** Override fetch (e.g. to add caching/next: {revalidate}). Defaults global fetch. */
  fetch?: typeof fetch;
}

export function createZaomemberzClient(
  baseUrl: string,
  options: ClientOptions = {},
): ZaomemberzClient {
  const base = baseUrl.replace(/\/+$/, "");
  const doFetch = options.fetch ?? fetch;

  async function get<T>(path: string): Promise<T | null> {
    const res = await doFetch(`${base}${path}`, {
      headers: { accept: "application/json" },
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`ZAOmemberz ${path} → ${res.status} ${res.statusText}`);
    }
    return (await res.json()) as T;
  }

  return {
    async getProfileByWallet(wallet, opts) {
      const q = opts?.liveEns ? "?ens=live" : "";
      const body = await get<{ profile: ZaomemberzProfile }>(
        `/api/profiles/${wallet}${q}`,
      );
      return body?.profile ?? null;
    },
    async getProfileByFid(fid) {
      const body = await get<{ profile: ZaomemberzProfile }>(
        `/api/profiles/fid/${fid}`,
      );
      return body?.profile ?? null;
    },
    async getProfileByDiscord(discordId) {
      const body = await get<{ profile: ZaomemberzProfile }>(
        `/api/profiles/discord/${discordId}`,
      );
      return body?.profile ?? null;
    },
    async getDirectory() {
      const body = await get<{ profiles: ZaomemberzProfile[] }>(
        `/api/directory`,
      );
      return body?.profiles ?? [];
    },
  };
}
