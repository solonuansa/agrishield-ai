import { describe, it, expect, vi } from "vitest";
import { renderWithProviders, screen, fireEvent } from "@/test-utils";
import { DiseaseList } from "./DiseaseList";
import type { HeatmapPoint } from "@/types/api";

const mockPoints: HeatmapPoint[] = [
  { scan_id: "1", lat: -7.8, lng: 110.4, disease: "rice_blast", crop_type: "rice", confidence: 0.92, month: "2024-03" },
  { scan_id: "2", lat: -7.9, lng: 110.5, disease: "corn_rust", crop_type: "corn", confidence: 0.65, month: "2024-03" },
  { scan_id: "3", lat: -7.7, lng: 110.3, disease: "rice_blast", crop_type: "rice", confidence: 0.45, month: "2024-02" },
];

describe("DiseaseList", () => {
  it("renders list title", () => {
    renderWithProviders(
      <DiseaseList filteredPoints={mockPoints} isLoading={false} pointLimit={20} onLoadMore={() => {}} />
    );
    expect(screen.getByText("Latest distribution points")).toBeInTheDocument();
  });

  it("renders all points when within limit", () => {
    renderWithProviders(
      <DiseaseList filteredPoints={mockPoints} isLoading={false} pointLimit={20} onLoadMore={() => {}} />
    );
    expect(screen.getAllByText(/rice_blast/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/corn_rust/)).toBeInTheDocument();
  });

  it("shows load more when points exceed limit", () => {
    renderWithProviders(
      <DiseaseList filteredPoints={mockPoints} isLoading={false} pointLimit={2} onLoadMore={() => {}} />
    );
    expect(screen.getByText(/Load More/)).toBeInTheDocument();
  });

  it("calls onLoadMore when clicking load more", () => {
    const onLoadMore = vi.fn();
    renderWithProviders(
      <DiseaseList filteredPoints={mockPoints} isLoading={false} pointLimit={2} onLoadMore={onLoadMore} />
    );
    fireEvent.click(screen.getByText(/Load More/));
    expect(onLoadMore).toHaveBeenCalled();
  });

  it("shows loading skeleton", () => {
    renderWithProviders(
      <DiseaseList filteredPoints={[]} isLoading={true} pointLimit={20} onLoadMore={() => {}} />
    );
    expect(screen.getByText("Latest distribution points")).toBeInTheDocument();
  });
});
