/**
 * Revoke API keys.
 *
 * Usage:
 *   npm run revoke -- --consumer "ZAOOS"      # revoke all keys for a consumer
 *   npm run revoke -- --key zaomz_abc123…      # revoke one specific raw key
 *   npm run revoke -- --list                   # list active keys
 *
 * Revocation is a soft delete: it stamps revoked_at, after which verifyApiKey
 * rejects the key.
 */
import { config } from "dotenv";
config({ path: ".env" });

import { db, apiKeys } from "@/db";
import { and, eq, isNull } from "drizzle-orm";
import { hashKey } from "@/lib/auth/apiKey";

async function list() {
  const rows = await db
    .select({
      consumerName: apiKeys.consumerName,
      createdAt: apiKeys.createdAt,
      revokedAt: apiKeys.revokedAt,
    })
    .from(apiKeys);
  if (!rows.length) {
    console.log("No API keys.");
    return;
  }
  for (const r of rows) {
    const state = r.revokedAt ? `revoked ${r.revokedAt.toISOString()}` : "active";
    console.log(`• ${r.consumerName} — ${state} (created ${r.createdAt.toISOString()})`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const flag = args[0];
  const value = args[1];

  if (flag === "--list") {
    await list();
    process.exit(0);
  }

  if (flag === "--consumer" && value) {
    const res = await db
      .update(apiKeys)
      .set({ revokedAt: new Date() })
      .where(and(eq(apiKeys.consumerName, value), isNull(apiKeys.revokedAt)))
      .returning({ id: apiKeys.id });
    console.log(`Revoked ${res.length} active key(s) for "${value}".`);
    process.exit(0);
  }

  if (flag === "--key" && value) {
    const keyHash = await hashKey(value.trim());
    const res = await db
      .update(apiKeys)
      .set({ revokedAt: new Date() })
      .where(and(eq(apiKeys.keyHash, keyHash), isNull(apiKeys.revokedAt)))
      .returning({ id: apiKeys.id, consumerName: apiKeys.consumerName });
    if (res.length) console.log(`Revoked key for "${res[0].consumerName}".`);
    else console.log("No matching active key found.");
    process.exit(0);
  }

  console.error(
    'Usage:\n  npm run revoke -- --consumer "Name"\n  npm run revoke -- --key <raw-key>\n  npm run revoke -- --list',
  );
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
