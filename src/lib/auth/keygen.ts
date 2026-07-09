/**
 * API key generator / admin tool.
 *
 * Usage:
 *   npm run keygen -- "consumer name"
 *
 * Generates a random raw key, prints it ONCE (store it now — it is never
 * recoverable), and inserts its SHA-256 hash into the api_keys table.
 */
import { config } from "dotenv";
config({ path: ".env" });

import { db, apiKeys } from "@/db";
import { hashKey } from "@/lib/auth/apiKey";

async function main() {
  const consumerName = process.argv[2];
  if (!consumerName) {
    console.error('Usage: npm run keygen -- "consumer name"');
    process.exit(1);
  }

  // 32 random bytes, hex, prefixed so it's recognizable in logs/config.
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const raw =
    "zaomz_" +
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  const keyHash = await hashKey(raw);
  await db.insert(apiKeys).values({ consumerName, keyHash });

  console.log("\n  API key created for:", consumerName);
  console.log("  ────────────────────────────────────────────");
  console.log("  " + raw);
  console.log("  ────────────────────────────────────────────");
  console.log(
    "  Store this now. Only its hash is saved; it cannot be shown again.\n",
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
