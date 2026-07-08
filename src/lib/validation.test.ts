import { describe, it, expect } from "vitest";
import {
  walletSchema,
  profileCreateSchema,
  profileWritableSchema,
} from "./validation";

describe("walletSchema", () => {
  it("accepts a valid address and lowercases it", () => {
    const mixed = "0xAbC0000000000000000000000000000000000001";
    expect(walletSchema.parse(mixed)).toBe(mixed.toLowerCase());
  });

  it("rejects a non-address", () => {
    expect(walletSchema.safeParse("not-an-address").success).toBe(false);
    expect(walletSchema.safeParse("0x123").success).toBe(false);
  });
});

describe("profileCreateSchema", () => {
  const wallet = "0x0000000000000000000000000000000000000001";

  it("requires a wallet address", () => {
    expect(profileCreateSchema.safeParse({ bio: "hi" }).success).toBe(false);
  });

  it("accepts a minimal valid create payload", () => {
    const r = profileCreateSchema.safeParse({ walletAddress: wallet });
    expect(r.success).toBe(true);
  });

  it("validates social links shape and cap", () => {
    const many = Array.from({ length: 21 }, () => ({
      platform: "x",
      urlOrHandle: "@a",
    }));
    expect(
      profileCreateSchema.safeParse({ walletAddress: wallet, socialLinks: many })
        .success,
    ).toBe(false);
  });

  it("rejects a non-url avatar", () => {
    const r = profileCreateSchema.safeParse({
      walletAddress: wallet,
      avatarUrl: "javascript:alert(1)",
    });
    expect(r.success).toBe(false);
  });

  it("rejects a negative or zero FID", () => {
    expect(
      profileWritableSchema.safeParse({ farcasterFid: 0 }).success,
    ).toBe(false);
    expect(
      profileWritableSchema.safeParse({ farcasterFid: -3 }).success,
    ).toBe(false);
    expect(
      profileWritableSchema.safeParse({ farcasterFid: 42 }).success,
    ).toBe(true);
  });
});
