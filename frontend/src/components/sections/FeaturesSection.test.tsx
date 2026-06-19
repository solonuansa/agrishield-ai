import { describe, it, expect } from "vitest";
import { renderWithProviders, screen } from "@/test-utils";
import FeaturesSection from "./FeaturesSection";

describe("FeaturesSection", () => {
  it("renders section title", () => {
    renderWithProviders(<FeaturesSection />);
    expect(screen.getByText("Key Features")).toBeInTheDocument();
  });

  it("renders feature titles", () => {
    renderWithProviders(<FeaturesSection />);
    expect(screen.getAllByText("Quick Detection").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Action Guide").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Distribution Map").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Early Warning").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Trend Summary").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Community Space").length).toBeGreaterThanOrEqual(1);
  });

  it("renders CTA link", () => {
    renderWithProviders(<FeaturesSection />);
    expect(screen.getByText("Start with Scan")).toBeInTheDocument();
  });
});
