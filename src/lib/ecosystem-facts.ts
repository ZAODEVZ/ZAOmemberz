/**
 * Verified ZAO ecosystem facts.
 *
 * EVERY number displayed publicly must be REAL and verifiable. This module is
 * the single source of truth for ecosystem-wide stats so nothing gets
 * fabricated inline in a component. Do NOT add a number here unless it is
 * independently verifiable on-chain or from a primary source.
 *
 * Sources:
 *  - Respect holders: 156 unique (122 OG + 55 ZOR, 21 hold both). 122 + 55 −
 *    21 = 156. On Optimism.
 *  - Continuous run: unbroken weekly since 2024-07-30. The week count is
 *    computed LIVE from that anchor date so it is never stale.
 */

export const RESPECT_HOLDERS = {
  unique: 156,
  og: 122,
  zor: 55,
  both: 21,
} as const;

// The Wednesday the unbroken weekly cadence began.
export const RUN_START_ISO = "2024-07-30";
export const CHAIN = "Optimism" as const;

/** Whole weeks elapsed since the run started — computed live, never cached. */
export function weeksRunning(now: Date = new Date()): number {
  const start = new Date(RUN_START_ISO + "T00:00:00Z").getTime();
  const ms = now.getTime() - start;
  return Math.floor(ms / (1000 * 60 * 60 * 24 * 7));
}

/** Human label like "since Jul 30, 2024". */
export function runStartLabel(): string {
  return new Date(RUN_START_ISO + "T00:00:00Z").toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
