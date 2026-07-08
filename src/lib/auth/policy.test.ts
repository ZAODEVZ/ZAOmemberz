import { describe, it, expect } from "vitest";
import { canWriteProfile, canCreateForWallet, type Writer } from "./policy";
import type { Profile } from "@/db";

const WALLET_A = "0x00000000000000000000000000000000000000aa";
const WALLET_B = "0x00000000000000000000000000000000000000bb";

function profile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 1,
    walletAddress: WALLET_A,
    discordId: null,
    farcasterFid: null,
    displayName: null,
    avatarUrl: null,
    bio: null,
    ensName: null,
    ensCheckedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

const apiWriter: Writer = { kind: "apiKey", api: { consumerName: "seed" } };
const sessionA: Writer = {
  kind: "session",
  session: { wallet: WALLET_A, method: "siwe" },
};
const sessionB: Writer = {
  kind: "session",
  session: { wallet: WALLET_B, method: "siwe" },
};

describe("canWriteProfile", () => {
  it("API keys may write any profile", () => {
    expect(canWriteProfile(apiWriter, profile())).toBe(true);
  });

  it("a session may write its own wallet's profile", () => {
    expect(canWriteProfile(sessionA, profile())).toBe(true);
  });

  it("a session may NOT write someone else's profile", () => {
    expect(canWriteProfile(sessionB, profile())).toBe(false);
  });

  it("wallet match is case-insensitive", () => {
    const upper: Writer = {
      kind: "session",
      session: { wallet: WALLET_A.toUpperCase(), method: "siwe" },
    };
    expect(canWriteProfile(upper, profile())).toBe(true);
  });

  it("a Farcaster session may write a profile sharing its FID even from another wallet", () => {
    const fidSession: Writer = {
      kind: "session",
      session: { wallet: WALLET_B, fid: 99, method: "siwf" },
    };
    expect(
      canWriteProfile(fidSession, profile({ farcasterFid: 99 })),
    ).toBe(true);
  });

  it("does not match on a null/undefined FID coincidence", () => {
    const noFid: Writer = {
      kind: "session",
      session: { wallet: WALLET_B, method: "siwe" },
    };
    expect(canWriteProfile(noFid, profile({ farcasterFid: null }))).toBe(false);
  });
});

describe("canCreateForWallet", () => {
  it("API keys may create for any wallet", () => {
    expect(canCreateForWallet(apiWriter, WALLET_B)).toBe(true);
  });

  it("a session may only create for its own wallet", () => {
    expect(canCreateForWallet(sessionA, WALLET_A)).toBe(true);
    expect(canCreateForWallet(sessionA, WALLET_B)).toBe(false);
  });
});
