import { describe, it, expect } from "vitest";
import { shortAddress, initials, hueFrom } from "./format";

describe("shortAddress", () => {
  it("truncates a full address", () => {
    expect(shortAddress("0x1234567890abcdef1234567890abcdef12345678")).toBe(
      "0x1234…5678",
    );
  });
  it("leaves short strings untouched", () => {
    expect(shortAddress("0x12")).toBe("0x12");
  });
});

describe("initials", () => {
  it("uses first letters of a two-word name", () => {
    expect(initials("Samantha Kinney", "0xabcd")).toBe("SK");
  });
  it("falls back to address bytes when no name", () => {
    expect(initials(null, "0xAB12")).toBe("AB");
  });
});

describe("hueFrom", () => {
  it("is deterministic and within 0..359", () => {
    const h = hueFrom("0xabc");
    expect(h).toBe(hueFrom("0xabc"));
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThan(360);
  });
});
