import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardStatsGrid from "./DashboardStatsGrid";

const t = (key: string) => {
  const map: Record<string, string> = {
    "dashboard.totalScans": "Total Scans",
    "dashboard.diseaseDetected": "Diseases",
    "dashboard.healthyPlants": "Healthy",
    "dashboard.completedScans": "Completed",
    "dashboard.fromPreviousMonth": "from prev",
  };
  return map[key] || key;
};

const mockStats = {
  total_scans: 100,
  completed_scans: 80,
  disease_detected: 30,
  healthy_detected: 50,
  by_crop: [],
  top_diseases: [],
  timeline: [],
};

describe("DashboardStatsGrid", () => {
  it("renders stat values", () => {
    render(<DashboardStatsGrid stats={mockStats} isLoading={false} t={t} />);
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("80")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
  });
});
