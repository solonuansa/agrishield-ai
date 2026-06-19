import { describe, it, expect } from "vitest";
import { renderWithProviders, screen } from "@/test-utils";
import CTASection from "./CTASection";

describe("CTASection", () => {
  it("renders section text", () => {
    renderWithProviders(<CTASection />);
    expect(screen.getByText("Join Now")).toBeInTheDocument();
  });

  it("renders register links", () => {
    renderWithProviders(<CTASection />);
    expect(screen.getByText("Sign Up Free")).toBeInTheDocument();
    expect(screen.getByText("Try Without Account")).toBeInTheDocument();
  });
});
