import { describe, it, expect } from "vitest";
import {
  getCropOptions,
  toCropLabel,
  confidenceColor,
  confidenceLabel,
  diseaseBadgeVariant,
} from "./map-utils";

describe("getCropOptions", () => {
  it("returns all, rice, corn options", () => {
    const t = (key: string) => key;
    const options = getCropOptions(t);
    expect(options).toHaveLength(3);
    expect(options[0].value).toBe("all");
    expect(options[1].value).toBe("rice");
    expect(options[2].value).toBe("corn");
  });
});

describe("toCropLabel", () => {
  it("returns rice label for rice", () => {
    const t = (key: string) => (key === "crop.rice" ? "Padi" : "Jagung");
    expect(toCropLabel("rice", t)).toBe("Padi");
  });

  it("returns corn label for corn", () => {
    const t = (key: string) => (key === "crop.rice" ? "Padi" : "Jagung");
    expect(toCropLabel("corn", t)).toBe("Jagung");
  });
});

describe("confidenceColor", () => {
  it("returns red for high confidence", () => {
    expect(confidenceColor(0.9)).toBe("#b91c1c");
  });

  it("returns yellow for medium confidence", () => {
    expect(confidenceColor(0.6)).toBe("#a16207");
  });

  it("returns green for low confidence", () => {
    expect(confidenceColor(0.3)).toBe("#15803d");
  });

  it("handles boundary values", () => {
    expect(confidenceColor(0.85)).toBe("#b91c1c");
    expect(confidenceColor(0.5)).toBe("#a16207");
    expect(confidenceColor(0.0)).toBe("#15803d");
  });
});

describe("confidenceLabel", () => {
  it("returns high key for >= 0.85", () => {
    expect(confidenceLabel(0.9)).toBe("map.confidenceHigh");
  });

  it("returns medium key for >= 0.5", () => {
    expect(confidenceLabel(0.6)).toBe("map.confidenceMedium");
  });

  it("returns low key for < 0.5", () => {
    expect(confidenceLabel(0.3)).toBe("map.confidenceLow");
  });
});

describe("diseaseBadgeVariant", () => {
  it("returns danger for blast-related", () => {
    expect(diseaseBadgeVariant("rice_leaf_blast")).toBe("danger");
  });

  it("returns warning for blight/rust", () => {
    expect(diseaseBadgeVariant("corn_northern_leaf_blight")).toBe("warning");
    expect(diseaseBadgeVariant("corn_common_rust")).toBe("warning");
  });

  it("returns info for tungro", () => {
    expect(diseaseBadgeVariant("rice_tungro")).toBe("info");
  });

  it("returns default for unknown", () => {
    expect(diseaseBadgeVariant("unknown_disease")).toBe("default");
  });
});
