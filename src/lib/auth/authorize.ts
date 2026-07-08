import "server-only";
import type { NextRequest } from "next/server";
import { getSession } from "./session";
import { verifyApiKey, extractApiKey } from "./apiKey";
import { type Writer, canWriteProfile, canCreateForWallet } from "./policy";

export type { Writer };
export { canWriteProfile, canCreateForWallet };

/** Identify the caller for a write: end-user session first, else API key. */
export async function getWriter(req: NextRequest): Promise<Writer | null> {
  const session = await getSession();
  if (session) return { kind: "session", session };

  const api = await verifyApiKey(extractApiKey(req.headers));
  if (api) return { kind: "apiKey", api };

  return null;
}
