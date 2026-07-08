import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { safeDirectory } from "@/lib/safe-data";

export const dynamic = "force-dynamic";

/**
 * Sitemap: the home directory plus every public profile. Built from the live
 * directory, but degrades to just the home page if the DB is unavailable
 * (never throws during generation).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { profiles } = await safeDirectory();
  const now = new Date();

  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    ...profiles.map((p) => ({
      url: `${SITE_URL}/profile/${p.walletAddress}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
