import { describe, it, expect } from "vitest";
import { renderWithProviders, screen } from "@/test-utils";
import HowItWorksSection from "./HowItWorksSection";

describe("HowItWorksSection", () => {
  it("renders section header", () => {
    renderWithProviders(<HowItWorksSection />);
    expect(screen.getByText("How It Works")).toBeInTheDocument();
  });

  it("renders step titles", () => {
    renderWithProviders(<HowItWorksSection />);
    expect(screen.getByText("Take a Photo")).toBeInTheDocument();
    expect(screen.getByText("AI Analysis")).toBeInTheDocument();
    expect(screen.getByText("Follow Up")).toBeInTheDocument();
  });
});
