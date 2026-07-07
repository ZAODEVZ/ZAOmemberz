/**
 * Seed data for the two founding ZAOmemberz profiles.
 *
 * ⚠️  REAL DATA ONLY. Nothing here may be shipped until the user (Zaal) has
 * reviewed it. bettercallzaal.com and the Contra portfolio both block
 * automated fetching (HTTP 403), so the bios, titles, wallet addresses, and
 * links below are intentionally left as PENDING placeholders. `seed.ts`
 * refuses to run while any PENDING marker remains — this is the guardrail that
 * stops fabricated bios or made-up wallet addresses from ever reaching the DB.
 *
 * To seed: replace every "PENDING:" value with the real, user-confirmed value
 * (or delete a field to leave it empty), then run `npm run db:seed`.
 */

export const PENDING = "PENDING:" as const;

export interface SeedProfile {
  // The anchor. MUST be the member's real wallet address (lowercased 0x…).
  walletAddress: string;
  displayName: string;
  // Role/title is part of the bio narrative — keep it factual.
  bio: string;
  avatarUrl?: string | null;
  farcasterFid?: number | null;
  discordId?: string | null;
  links: { platform: string; urlOrHandle: string }[];
}

export const SEED_PROFILES: SeedProfile[] = [
  {
    // Zaal — Founder. Bio to be pulled from bettercallzaal.com once confirmed
    // by Zaal directly (site blocks automated fetch).
    walletAddress: `${PENDING} Zaal's real wallet address (0x…)`,
    displayName: "Zaal",
    bio: `${PENDING} Zaal's real bio, role (Founder), and background — confirmed by Zaal, not invented`,
    avatarUrl: null,
    farcasterFid: null, // PENDING: Zaal's real Farcaster FID if he wants it linked
    discordId: null,
    links: [
      // PENDING: confirm real links. Known public handle: bettercallzaal on X /
      // Farcaster / Instagram — leave commented until Zaal confirms.
      // { platform: "website", urlOrHandle: "https://bettercallzaal.com" },
      // { platform: "x", urlOrHandle: "https://x.com/bettercallzaal" },
    ],
  },
  {
    // Samantha Kinney — Co-Founder. Background to come from her Contra
    // portfolio once confirmed (site blocks automated fetch).
    walletAddress: `${PENDING} Samantha's real wallet address (0x…)`,
    displayName: "Samantha Kinney",
    bio: `${PENDING} Samantha's real bio, role (Co-Founder), skills and background — confirmed by her, not invented`,
    avatarUrl: null,
    farcasterFid: null,
    discordId: null,
    links: [
      // { platform: "portfolio", urlOrHandle: "https://contra.com/samantha_kinney_3jf0lhja/work" },
    ],
  },
];
