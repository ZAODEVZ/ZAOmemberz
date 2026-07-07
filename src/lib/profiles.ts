import "server-only";
import { db, profiles, socialLinks } from "@/db";
import { eq, desc } from "drizzle-orm";
import type { Profile, SocialLink } from "@/db";
import type { ProfileCreate, ProfileWritable } from "@/lib/validation";

/** A profile plus its social links — the shape the API and pages consume. */
export interface ProfileWithLinks extends Profile {
  socialLinks: SocialLink[];
}

/** Public JSON representation returned by the read API. */
export interface PublicProfile {
  walletAddress: string;
  discordId: string | null;
  farcasterFid: number | null;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  // Cached ENS — flagged as cached with the time it was last resolved so
  // consumers know not to treat it as live truth.
  ens: {
    name: string | null;
    cached: true;
    checkedAt: string | null;
  };
  socialLinks: { platform: string; urlOrHandle: string }[];
  createdAt: string;
  updatedAt: string;
}

export function toPublicProfile(p: ProfileWithLinks): PublicProfile {
  return {
    walletAddress: p.walletAddress,
    discordId: p.discordId,
    farcasterFid: p.farcasterFid,
    displayName: p.displayName,
    avatarUrl: p.avatarUrl,
    bio: p.bio,
    ens: {
      name: p.ensName,
      cached: true,
      checkedAt: p.ensCheckedAt ? p.ensCheckedAt.toISOString() : null,
    },
    socialLinks: p.socialLinks.map((l) => ({
      platform: l.platform,
      urlOrHandle: l.urlOrHandle,
    })),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

async function withLinks(p: Profile | undefined): Promise<ProfileWithLinks | null> {
  if (!p) return null;
  const links = await db
    .select()
    .from(socialLinks)
    .where(eq(socialLinks.profileId, p.id));
  return { ...p, socialLinks: links };
}

export async function getProfileByWallet(
  wallet: string,
): Promise<ProfileWithLinks | null> {
  const [p] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.walletAddress, wallet.toLowerCase()))
    .limit(1);
  return withLinks(p);
}

export async function getProfileByFid(
  fid: number,
): Promise<ProfileWithLinks | null> {
  const [p] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.farcasterFid, fid))
    .limit(1);
  return withLinks(p);
}

export async function getProfileByDiscord(
  discordId: string,
): Promise<ProfileWithLinks | null> {
  const [p] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.discordId, discordId))
    .limit(1);
  return withLinks(p);
}

/** The full public directory, newest first. */
export async function listDirectory(): Promise<ProfileWithLinks[]> {
  const rows = await db
    .select()
    .from(profiles)
    .orderBy(desc(profiles.createdAt));
  return Promise.all(rows.map(async (p) => (await withLinks(p))!));
}

export async function countProfiles(): Promise<number> {
  const rows = await db.select({ id: profiles.id }).from(profiles);
  return rows.length;
}

/** Create a profile (and its social links) atomically-ish. */
export async function createProfile(
  data: ProfileCreate,
): Promise<ProfileWithLinks> {
  const [created] = await db
    .insert(profiles)
    .values({
      walletAddress: data.walletAddress,
      displayName: data.displayName ?? null,
      avatarUrl: emptyToNull(data.avatarUrl),
      bio: data.bio ?? null,
      discordId: data.discordId ?? null,
      farcasterFid: data.farcasterFid ?? null,
    })
    .returning();

  if (data.socialLinks?.length) {
    await db.insert(socialLinks).values(
      data.socialLinks.map((l) => ({
        profileId: created.id,
        platform: l.platform,
        urlOrHandle: l.urlOrHandle,
      })),
    );
  }
  return (await withLinks(created))!;
}

/** Update an existing profile. Social links, if provided, fully replace. */
export async function updateProfile(
  id: number,
  data: ProfileWritable,
): Promise<ProfileWithLinks | null> {
  const patch: Partial<Profile> = { updatedAt: new Date() };
  if (data.displayName !== undefined) patch.displayName = data.displayName ?? null;
  if (data.avatarUrl !== undefined) patch.avatarUrl = emptyToNull(data.avatarUrl);
  if (data.bio !== undefined) patch.bio = data.bio ?? null;
  if (data.discordId !== undefined) patch.discordId = data.discordId ?? null;
  if (data.farcasterFid !== undefined)
    patch.farcasterFid = data.farcasterFid ?? null;

  const [updated] = await db
    .update(profiles)
    .set(patch)
    .where(eq(profiles.id, id))
    .returning();

  if (!updated) return null;

  if (data.socialLinks !== undefined) {
    await db.delete(socialLinks).where(eq(socialLinks.profileId, id));
    if (data.socialLinks.length) {
      await db.insert(socialLinks).values(
        data.socialLinks.map((l) => ({
          profileId: id,
          platform: l.platform,
          urlOrHandle: l.urlOrHandle,
        })),
      );
    }
  }
  return withLinks(updated);
}

/** Persist a freshly-resolved ENS name into the cache (best-effort). */
export async function cacheEns(
  id: number,
  name: string | null,
  checkedAt: Date,
): Promise<void> {
  await db
    .update(profiles)
    .set({ ensName: name, ensCheckedAt: checkedAt })
    .where(eq(profiles.id, id));
}

function emptyToNull(v: string | null | undefined): string | null {
  if (v === undefined || v === null) return null;
  const t = v.trim();
  return t === "" ? null : t;
}
