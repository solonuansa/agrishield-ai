import { describe, it, expect, vi } from "vitest";
import { renderWithProviders, screen, fireEvent } from "@/test-utils";
import { MapFilters } from "./MapFilters";

describe("MapFilters", () => {
  const defaultProps = {
    cropFilter: "all" as const,
    onCropFilterChange: vi.fn(),
    diseaseFilter: "all",
    onDiseaseFilterChange: vi.fn(),
    minConfidence: 0,
    onMinConfidenceChange: vi.fn(),
    uniqueDiseases: ["rice_blast", "corn_rust"],
  };

  it("renders filter label", () => {
    renderWithProviders(<MapFilters {...defaultProps} />);
    expect(screen.getByText(/Filter/)).toBeInTheDocument();
  });

  it("renders crop select with options", () => {
    renderWithProviders(<MapFilters {...defaultProps} />);
    expect(screen.getByText("All Crops")).toBeInTheDocument();
  });

  it("calls onCropFilterChange when selecting", () => {
    renderWithProviders(<MapFilters {...defaultProps} />);
    const select = screen.getByDisplayValue("All Crops");
    fireEvent.change(select, { target: { value: "rice" } });
    expect(defaultProps.onCropFilterChange).toHaveBeenCalledWith("rice");
  });

  it("renders disease select when diseases available", () => {
    renderWithProviders(<MapFilters {...defaultProps} />);
    expect(screen.getByText("All Diseases")).toBeInTheDocument();
  });

  it("does not render disease select when empty", () => {
    renderWithProviders(<MapFilters {...defaultProps} uniqueDiseases={[]} />);
    expect(screen.queryByText("All Diseases")).not.toBeInTheDocument();
  });

  it("renders confidence slider", () => {
    renderWithProviders(<MapFilters {...defaultProps} />);
    expect(screen.getByText(/Min. confidence/)).toBeInTheDocument();
  });
});
