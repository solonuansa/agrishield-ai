import { describe, it, expect } from "vitest";
import { renderWithProviders, screen } from "@/test-utils";
import StatsSection from "./StatsSection";

describe("StatsSection", () => {
  it("renders stat labels", () => {
    renderWithProviders(<StatsSection />);
    expect(screen.getByText("Farmers Helped")).toBeInTheDocument();
    expect(screen.getByText("Diseases Detected")).toBeInTheDocument();
    expect(screen.getByText("Provinces Reached")).toBeInTheDocument();
    expect(screen.getByText("AI Accuracy")).toBeInTheDocument();
  });
});
