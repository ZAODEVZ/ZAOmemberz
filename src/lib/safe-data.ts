import "server-only";
import { listDirectory, toPublicProfile, type PublicProfile } from "./profiles";

/**
 * Fetch the directory but never let a missing/unreachable database crash a
 * public page. If the DB isn't configured (e.g. a preview build without
 * DATABASE_URL) we return an empty list plus an `ok: false` flag so the page
 * can render its verified ecosystem stats and an honest empty state instead of
 * a 500. This keeps us from ever showing fabricated placeholder members.
 */
export async function safeDirectory(): Promise<{
  ok: boolean;
  profiles: PublicProfile[];
}> {
  try {
    const rows = await listDirectory();
    return { ok: true, profiles: rows.map(toPublicProfile) };
  } catch {
    return { ok: false, profiles: [] };
  }
}
