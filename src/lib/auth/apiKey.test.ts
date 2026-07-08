import { describe, it, expect } from "vitest";
import { hashKey, extractApiKey } from "./apiKey";

describe("hashKey", () => {
  it("produces a stable 64-char sha256 hex", async () => {
    const h = await hashKey("zaomz_test");
    expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(await hashKey("zaomz_test")).toBe(h);
  });

  it("differs for different inputs", async () => {
    expect(await hashKey("a")).not.toBe(await hashKey("b"));
  });

  it("matches a known SHA-256 vector", async () => {
    // sha256("abc")
    expect(await hashKey("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });
});

describe("extractApiKey", () => {
  it("reads x-api-key", () => {
    const h = new Headers({ "x-api-key": "k1" });
    expect(extractApiKey(h)).toBe("k1");
  });
  it("reads a Bearer token", () => {
    const h = new Headers({ authorization: "Bearer k2" });
    expect(extractApiKey(h)).toBe("k2");
  });
  it("returns null when absent", () => {
    expect(extractApiKey(new Headers())).toBeNull();
  });
});
