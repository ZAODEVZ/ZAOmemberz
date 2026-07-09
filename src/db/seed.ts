/**
 * Seed the two founding profiles.
 *
 * Refuses to run while any PENDING marker remains in seed-data.ts, so
 * un-reviewed / fabricated data can never be inserted. Idempotent: skips a
 * profile whose wallet already exists.
 *
 * Usage: npm run db:seed
 */
import { config } from "dotenv";
config({ path: ".env" });

import { isAddress } from "viem";
import { db, profiles, socialLinks } from "@/db";
import { eq } from "drizzle-orm";
import { SEED_PROFILES, PENDING, type SeedProfile } from "./seed-data";

function assertReviewed(p: SeedProfile) {
  const blob = JSON.stringify(p);
  if (blob.includes(PENDING)) {
    throw new Error(
      `Refusing to seed "${p.displayName}": seed-data.ts still contains PENDING ` +
        `placeholders. Replace them with real, user-confirmed values first.`,
    );
  }
  if (!isAddress(p.walletAddress)) {
    throw new Error(
      `Refusing to seed "${p.displayName}": "${p.walletAddress}" is not a valid ` +
        `wallet address.`,
    );
  }
}

async function seedOne(p: SeedProfile) {
  assertReviewed(p);
  const wallet = p.walletAddress.toLowerCase();

  const existing = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.walletAddress, wallet))
    .limit(1);

  if (existing[0]) {
    console.log(`• ${p.displayName}: already seeded (${wallet}) — skipping`);
    return;
  }

  const [created] = await db
    .insert(profiles)
    .values({
      walletAddress: wallet,
      displayName: p.displayName,
      bio: p.bio,
      avatarUrl: p.avatarUrl ?? null,
      farcasterFid: p.farcasterFid ?? null,
      discordId: p.discordId ?? null,
    })
    .returning();

  if (p.links.length) {
    await db.insert(socialLinks).values(
      p.links.map((l) => ({
        profileId: created.id,
        platform: l.platform,
        urlOrHandle: l.urlOrHandle,
      })),
    );
  }
  console.log(`✓ ${p.displayName}: seeded (${wallet})`);
}

async function main() {
  console.log("Seeding ZAOmemberz founding profiles…\n");
  for (const p of SEED_PROFILES) {
    await seedOne(p);
  }
  console.log("\nDone.");
  process.exit(0);
}

main().catch((err) => {
  console.error("\nSeed aborted:", err instanceof Error ? err.message : err);
  process.exit(1);
});
