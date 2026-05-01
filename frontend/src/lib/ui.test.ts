import { describe, it, expect } from "vitest";
import { formatDateID, cx } from "./ui";

describe("formatDateID", () => {
  it("formats ISO date to Indonesian format", () => {
    expect(formatDateID("2024-03-15T00:00:00Z")).toBe("15 Mar 2024");
  });

  it("returns dash for null/undefined", () => {
    expect(formatDateID(null)).toBe("-");
    expect(formatDateID(undefined)).toBe("-");
  });

  it("returns dash for invalid date", () => {
    expect(formatDateID("not-a-date")).toBe("-");
  });
});

describe("cx", () => {
  it("joins truthy class names", () => {
    expect(cx("a", "b", null, undefined, false, "c")).toBe("a b c");
  });

  it("returns empty string for no args", () => {
    expect(cx()).toBe("");
  });
});
