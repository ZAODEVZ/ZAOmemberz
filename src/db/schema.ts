import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

/**
 * profiles — the core identity record.
 *
 * `wallet_address` is THE anchor: every profile is anchored to exactly one
 * wallet, and other ZAO apps join to this service by wallet_address (or by
 * discord_id) at the application layer. It is stored lowercased and unique.
 *
 * `ens_name` is a *cached* convenience copy only. It is never treated as the
 * source of truth — public views always re-resolve ENS live from mainnet and
 * timestamp it. The cache exists so list views don't have to fan out N RPC
 * calls; it is refreshed opportunistically.
 */
export const profiles = pgTable(
  "profiles",
  {
    id: serial("id").primaryKey(),
    // Lowercased 0x-address. The anchor for the whole ecosystem.
    walletAddress: text("wallet_address").notNull(),
    // Discord snowflake, unique when present, nullable.
    discordId: text("discord_id"),
    // Farcaster FID, unique when present, nullable.
    farcasterFid: integer("farcaster_fid"),
    displayName: text("display_name"),
    avatarUrl: text("avatar_url"),
    bio: text("bio"),
    // Cached ENS name (see note above). Nullable; may be stale by design.
    ensName: text("ens_name"),
    ensCheckedAt: timestamp("ens_checked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("profiles_wallet_address_unique").on(t.walletAddress),
    // Partial unique indexes so multiple NULLs are allowed but real values
    // stay unique.
    uniqueIndex("profiles_discord_id_unique")
      .on(t.discordId)
      .where(sql`${t.discordId} is not null`),
    uniqueIndex("profiles_farcaster_fid_unique")
      .on(t.farcasterFid)
      .where(sql`${t.farcasterFid} is not null`),
  ],
);

/**
 * social_links — arbitrary extra links a member wants on their profile
 * (X, GitHub, personal site, Warpcast, Lens, etc.). One-to-many off profiles.
 */
export const socialLinks = pgTable(
  "social_links",
  {
    id: serial("id").primaryKey(),
    profileId: integer("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    // Free-form platform label, e.g. "x", "github", "website", "warpcast".
    platform: text("platform").notNull(),
    // Either a full URL or a handle — consumer apps decide how to render.
    urlOrHandle: text("url_or_handle").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("social_links_profile_id_idx").on(t.profileId)],
);

/**
 * api_keys — gates WRITES only (never reads; all reads are public).
 *
 * Used for server-side/admin writes such as seeding initial data. We store
 * only a SHA-256 hash of the key; the raw key is shown once at creation time
 * and never persisted. A key is valid iff a row matches the hash AND
 * `revoked_at` is null.
 */
export const apiKeys = pgTable(
  "api_keys",
  {
    id: serial("id").primaryKey(),
    consumerName: text("consumer_name").notNull(),
    keyHash: text("key_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("api_keys_key_hash_unique").on(t.keyHash)],
);

export const profilesRelations = relations(profiles, ({ many }) => ({
  socialLinks: many(socialLinks),
}));

export const socialLinksRelations = relations(socialLinks, ({ one }) => ({
  profile: one(profiles, {
    fields: [socialLinks.profileId],
    references: [profiles.id],
  }),
}));

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type SocialLink = typeof socialLinks.$inferSelect;
export type NewSocialLink = typeof socialLinks.$inferInsert;
export type ApiKey = typeof apiKeys.$inferSelect;
