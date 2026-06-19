import { describe, it, expect } from "vitest";
import { getStatusVariant, getStatusLabel, firstName } from "./dashboard-utils";
import type { ScanResponse } from "@/types/api";

function makeScan(overrides: Partial<ScanResponse> = {}): ScanResponse {
  return {
    id: "abc-123",
    crop_type: "rice",
    status: "pending",
    image_url: null,
    latitude: null,
    longitude: null,
    created_at: "2024-01-01",
    result: null,
    ...overrides,
  } as ScanResponse;
}

describe("getStatusVariant", () => {
  it("returns danger for failed scans", () => {
    const scan = makeScan({ status: "failed" });
    expect(getStatusVariant(scan)).toBe("danger");
  });

  it("returns warning for pending/processing", () => {
    expect(getStatusVariant(makeScan({ status: "pending" }))).toBe("warning");
    expect(getStatusVariant(makeScan({ status: "processing" }))).toBe("warning");
  });

  it("returns danger for completed with disease", () => {
    const scan = makeScan({
      status: "completed",
      result: { detected_disease: "rice_blast", confidence: 0.9, alternatives: null, recommendation: null, model_version: "v1", is_mock: true, processed_at: null },
    });
    expect(getStatusVariant(scan)).toBe("danger");
  });

  it("returns danger for completed with result (even healthy — result exists)", () => {
    const scan = makeScan({
      status: "completed",
      result: { detected_disease: "rice_healthy", confidence: 0.99, alternatives: null, recommendation: null, model_version: "v1", is_mock: true, processed_at: null },
    });
    expect(getStatusVariant(scan)).toBe("danger");
  });
});

describe("getStatusLabel", () => {
  const t = (key: string) => key;

  it("returns failed label for failed scans", () => {
    const scan = makeScan({ status: "failed" });
    expect(getStatusLabel(scan, t)).toBe("scan.statusFailed_label");
  });

  it("returns processing for pending/processing", () => {
    const scan = makeScan({ status: "pending" });
    expect(getStatusLabel(scan, t)).toBe("dashboard.processing");
  });

  it("returns disease name for completed with disease", () => {
    const scan = makeScan({
      status: "completed",
      result: { detected_disease: "rice_blast", confidence: 0.9, alternatives: null, recommendation: null, model_version: "v1", is_mock: true, processed_at: null },
    });
    expect(getStatusLabel(scan, t)).toBe("rice_blast");
  });

  it("returns disease name when result exists", () => {
    const scan = makeScan({
      status: "completed",
      result: { detected_disease: "rice_healthy", confidence: 0.99, alternatives: null, recommendation: null, model_version: "v1", is_mock: true, processed_at: null },
    });
    expect(getStatusLabel(scan, t)).toBe("rice_healthy");
  });
});

describe("firstName", () => {
  it("extracts first name from full name", () => {
    expect(firstName("John Doe")).toBe("John");
  });

  it("returns full name if no space", () => {
    expect(firstName("Single")).toBe("Single");
  });

  it("handles empty string", () => {
    expect(firstName("")).toBe("");
  });
});
