import { db, apiKeys } from "@/db";
import { eq, and, isNull } from "drizzle-orm";

/**
 * API keys gate WRITES only. A consumer presents a raw key in the
 * `x-api-key` header (or `Authorization: Bearer <key>`); we hash it and look
 * for a matching, non-revoked row. Raw keys are never stored.
 */

/** SHA-256 hex of the input, using Web Crypto (works in Node + edge). */
export async function hashKey(raw: string): Promise<string> {
  const data = new TextEncoder().encode(raw);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export interface ApiKeyIdentity {
  consumerName: string;
}

/**
 * Validate an incoming API key. Returns the consumer identity if valid, else
 * null. A valid key matches a row by hash and has `revoked_at IS NULL`.
 */
export async function verifyApiKey(
  raw: string | null | undefined,
): Promise<ApiKeyIdentity | null> {
  if (!raw) return null;
  const keyHash = await hashKey(raw.trim());
  const rows = await db
    .select({ consumerName: apiKeys.consumerName })
    .from(apiKeys)
    .where(and(eq(apiKeys.keyHash, keyHash), isNull(apiKeys.revokedAt)))
    .limit(1);
  return rows[0] ?? null;
}

/** Extract a raw API key from request headers (x-api-key or Bearer token). */
export function extractApiKey(headers: Headers): string | null {
  const direct = headers.get("x-api-key");
  if (direct) return direct;
  const auth = headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  return null;
}
