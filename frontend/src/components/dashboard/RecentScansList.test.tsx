import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RecentScansList from "./RecentScansList";

const t = (key: string) => {
  const map: Record<string, string> = {
    "dashboard.emptyHistory": "No Scans Yet",
    "dashboard.emptyHistoryDesc": "Description",
    "dashboard.processing": "Processing",
    "dashboard.loadError": "Error",
  };
  return map[key] || key;
};

const mockScans = [
  {
    id: "1", crop_type: "rice", status: "completed", image_url: null,
    latitude: null, longitude: null, created_at: "2024-01-01",
    result: { detected_disease: "rice_blast", confidence: 0.9, alternatives: null, recommendation: null, model_version: "v1", is_mock: true, processed_at: null },
  },
  {
    id: "2", crop_type: "corn", status: "pending", image_url: null,
    latitude: null, longitude: null, created_at: "2024-01-02",
    result: null,
  },
] as const;

describe("RecentScansList", () => {
  it("renders scan items", () => {
    render(<RecentScansList scans={mockScans as any} t={t} />);
    expect(screen.getAllByText("rice_blast").length).toBeGreaterThanOrEqual(1);
  });

  it("shows empty state when no scans", () => {
    render(<RecentScansList scans={[]} t={t} />);
    expect(screen.getByText("No Scans Yet")).toBeInTheDocument();
  });
});
