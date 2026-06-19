import { describe, it, expect } from "vitest";
import { renderWithProviders, screen } from "@/test-utils";
import HeroSection from "./HeroSection";

describe("HeroSection", () => {
  it("renders the kicker text", () => {
    renderWithProviders(<HeroSection />);
    expect(screen.getByText("Smart Companion for Plant Health")).toBeInTheDocument();
  });

  it("renders CTA buttons", () => {
    renderWithProviders(<HeroSection />);
    expect(screen.getByText("Try Free Scan")).toBeInTheDocument();
    expect(screen.getByText("Learn More")).toBeInTheDocument();
  });

  it("renders highlights", () => {
    renderWithProviders(<HeroSection />);
    expect(screen.getByText(/Easy to use/)).toBeInTheDocument();
    expect(screen.getByText(/Simple language/)).toBeInTheDocument();
    expect(screen.getByText(/Supports decisions/)).toBeInTheDocument();
  });
});
