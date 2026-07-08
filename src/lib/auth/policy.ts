import type { Session } from "./session-types";
import type { ApiKeyIdentity } from "./apiKey";
import type { Profile } from "@/db";

/**
 * Pure write-authorization predicates. Kept free of `server-only`, `db`, and
 * request objects so they can be unit-tested in isolation. `authorize.ts`
 * builds the `Writer` (which requires server context) and delegates the actual
 * yes/no decisions here.
 */

export type Writer =
  | { kind: "session"; session: Session }
  | { kind: "apiKey"; api: ApiKeyIdentity };

/**
 * Can this writer create/edit the given profile?
 *
 * - API keys may write any profile (server-side/admin, e.g. seeding).
 * - A session may only write the profile it owns: same wallet address, or the
 *   same Farcaster FID it authenticated with.
 */
export function canWriteProfile(writer: Writer, profile: Profile): boolean {
  if (writer.kind === "apiKey") return true;
  const s = writer.session;
  if (profile.walletAddress.toLowerCase() === s.wallet.toLowerCase()) {
    return true;
  }
  if (s.fid != null && profile.farcasterFid === s.fid) return true;
  return false;
}

/**
 * For *creating* a profile, a session may only create a profile anchored to
 * its own wallet. API keys may create for any wallet.
 */
export function canCreateForWallet(
  writer: Writer,
  walletAddress: string,
): boolean {
  if (writer.kind === "apiKey") return true;
  return writer.session.wallet.toLowerCase() === walletAddress.toLowerCase();
}
