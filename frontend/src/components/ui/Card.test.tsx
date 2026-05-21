import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Card } from "./Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card><p>Konten kartu</p></Card>);
    expect(screen.getByText("Konten kartu")).toBeInTheDocument();
  });

  it("applies default variant classes", () => {
    render(<Card>Default</Card>);
    const card = screen.getByText("Default");
    expect(card.className).toContain("bg-white/70");
    expect(card.className).toContain("shadow-card");
  });

  it("applies interactive variant classes", () => {
    render(<Card variant="interactive">Interaktif</Card>);
    const card = screen.getByText("Interaktif");
    expect(card.className).toContain("cursor-pointer");
    expect(card.className).toContain("hover:shadow-card-hover");
  });

  it("applies flat variant classes", () => {
    render(<Card variant="flat">Datar</Card>);
    const card = screen.getByText("Datar");
    expect(card.className).toContain("bg-cream-200/60");
  });

  it("merges additional className", () => {
    render(<Card className="extra-class">Test</Card>);
    expect(screen.getByText("Test").className).toContain("extra-class");
  });
});
