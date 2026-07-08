/**
 * Session shape, split out from `session.ts` so it can be imported by pure
 * modules (e.g. policy.ts, client components) without pulling in the
 * `server-only` cookie/JWT machinery.
 */
export interface Session {
  wallet: string; // lowercased 0x-address — the anchor
  fid?: number; // present iff signed in with Farcaster
  method: "siwe" | "siwf";
}
