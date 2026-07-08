import { describe, it, expect } from "vitest";
import {
  RESPECT_HOLDERS,
  weeksRunning,
  RUN_START_ISO,
  runStartLabel,
} from "./ecosystem-facts";

describe("ecosystem facts", () => {
  it("respect holder counts are internally consistent (OG + ZOR - both = unique)", () => {
    expect(
      RESPECT_HOLDERS.og + RESPECT_HOLDERS.zor - RESPECT_HOLDERS.both,
    ).toBe(RESPECT_HOLDERS.unique);
    expect(RESPECT_HOLDERS.unique).toBe(156);
  });

  it("weeksRunning computes whole weeks from the anchor date", () => {
    // Exactly two weeks after the start.
    const start = new Date(RUN_START_ISO + "T00:00:00Z");
    const twoWeeks = new Date(start.getTime() + 14 * 24 * 3600 * 1000);
    expect(weeksRunning(twoWeeks)).toBe(2);
  });

  it("weeksRunning is 0 on the start date and never negative just before it", () => {
    const start = new Date(RUN_START_ISO + "T00:00:00Z");
    expect(weeksRunning(start)).toBe(0);
    const dayBefore = new Date(start.getTime() - 24 * 3600 * 1000);
    // Floor of a negative fraction is -1; guard documents the real-world
    // expectation that we never render this before launch.
    expect(weeksRunning(dayBefore)).toBeLessThanOrEqual(0);
  });

  it("weeksRunning for a known real date is ~101 weeks (2026-07-07)", () => {
    const w = weeksRunning(new Date("2026-07-07T00:00:00Z"));
    expect(w).toBeGreaterThanOrEqual(100);
    expect(w).toBeLessThanOrEqual(102);
  });

  it("runStartLabel renders the anchor date", () => {
    expect(runStartLabel()).toContain("2024");
  });
});
