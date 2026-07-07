import "server-only";
import type { NextRequest } from "next/server";
import { getSession, type Session } from "./session";
import { verifyApiKey, extractApiKey, type ApiKeyIdentity } from "./apiKey";
import type { Profile } from "@/db";

/**
 * The result of authorizing a write. Either an authenticated end-user session
 * or a valid API key (server-side/admin). `null` means unauthorized.
 */
export type Writer =
  | { kind: "session"; session: Session }
  | { kind: "apiKey"; api: ApiKeyIdentity };

/** Identify the caller for a write: end-user session first, else API key. */
export async function getWriter(req: NextRequest): Promise<Writer | null> {
  const session = await getSession();
  if (session) return { kind: "session", session };

  const api = await verifyApiKey(extractApiKey(req.headers));
  if (api) return { kind: "apiKey", api };

  return null;
}

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
 * its own wallet (and, if signed in with Farcaster, may attach its own FID).
 * API keys may create a profile for any wallet.
 */
export function canCreateForWallet(
  writer: Writer,
  walletAddress: string,
): boolean {
  if (writer.kind === "apiKey") return true;
  return (
    writer.session.wallet.toLowerCase() === walletAddress.toLowerCase()
  );
}
