import { describe, it, expect, vi } from "vitest";
import { renderWithProviders, screen } from "@/test-utils";
import { ScanResultCard } from "./ScanResultCard";
import type { ScanResponse } from "@/types/api";

const t = (key: string) => {
  const map: Record<string, string> = {
    "scan.diseaseLabel": "Disease Detected",
    "scan.confidenceLabel": "Confidence",
    "scan.recommendationLabel": "Recommendation",
    "scan.recommendationEmpty": "No recommendation",
    "scan.simulationNote": "Simulation result based on model (v1)",
    "scan.resultNotReady": "Result not ready",
    "scan.statusCompleted": "Status: Completed",
  };
  return map[key] || key;
};

function makeCompletedScan(overrides: Partial<ScanResponse> = {}): ScanResponse {
  return {
    id: "abc-123",
    crop_type: "rice",
    status: "completed",
    image_url: null,
    latitude: null,
    longitude: null,
    created_at: "2024-01-01",
    result: {
      detected_disease: "rice_blast",
      confidence: 0.92,
      alternatives: null,
      recommendation: "Apply fungicide",
      model_version: "v1",
      is_mock: false,
      processed_at: "2024-01-01T00:00:00Z",
    },
    ...overrides,
  } as ScanResponse;
}

describe("ScanResultCard", () => {
  it("renders disease name", () => {
    renderWithProviders(
      <ScanResultCard
        scanData={makeCompletedScan()}
        statusLabelMap={{ completed: "Completed", processing: "", failed: "", pending: "" }}
        onRefresh={() => {}}
        isRefreshing={false}
        t={t}
      />
    );
    expect(screen.getByText("rice_blast")).toBeInTheDocument();
  });

  it("renders recommendation when available", () => {
    renderWithProviders(
      <ScanResultCard
        scanData={makeCompletedScan()}
        statusLabelMap={{ completed: "Completed", processing: "", failed: "", pending: "" }}
        onRefresh={() => {}}
        isRefreshing={false}
        t={t}
      />
    );
    expect(screen.getByText("Apply fungicide")).toBeInTheDocument();
  });

  it("shows simulation note when is_mock", () => {
    const scan = makeCompletedScan({ result: { detected_disease: "rice_blast", confidence: 0.9, alternatives: null, recommendation: null, model_version: "v1", is_mock: true, processed_at: null } });
    renderWithProviders(
      <ScanResultCard
        scanData={scan}
        statusLabelMap={{ completed: "", processing: "", failed: "", pending: "" }}
        onRefresh={() => {}}
        isRefreshing={false}
        t={t}
      />
    );
    expect(screen.getByText(/simulation result/i)).toBeInTheDocument();
  });

  it("shows processing status", () => {
    const scan = { ...makeCompletedScan(), status: "processing" as const, result: null };
    renderWithProviders(
      <ScanResultCard
        scanData={scan}
        statusLabelMap={{ completed: "", processing: "Processing...", failed: "", pending: "" }}
        onRefresh={() => {}}
        isRefreshing={false}
        t={t}
      />
    );
    expect(screen.getByText("Processing...")).toBeInTheDocument();
  });
});
