import { AUTH_URL } from "./env";

/**
 * Canonical site origin, used for absolute URLs in sitemap/robots/OG metadata.
 * Falls back to the auth URL (same deployment origin).
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || AUTH_URL || "http://localhost:3000";
