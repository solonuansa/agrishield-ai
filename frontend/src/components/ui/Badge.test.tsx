import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders children text", () => {
    render(<Badge>Aktif</Badge>);
    expect(screen.getByText("Aktif")).toBeInTheDocument();
  });

  it("applies default variant classes", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge.className).toContain("bg-forest-100");
    expect(badge.className).toContain("text-forest-800");
  });

  it("applies success variant classes", () => {
    render(<Badge variant="success">Berhasil</Badge>);
    const badge = screen.getByText("Berhasil");
    expect(badge.className).toContain("bg-success-100");
    expect(badge.className).toContain("text-success-800");
  });

  it("applies warning variant classes", () => {
    render(<Badge variant="warning">Perhatian</Badge>);
    const badge = screen.getByText("Perhatian");
    expect(badge.className).toContain("bg-warning-100");
    expect(badge.className).toContain("text-warning-800");
  });

  it("applies danger variant classes", () => {
    render(<Badge variant="danger">Gagal</Badge>);
    const badge = screen.getByText("Gagal");
    expect(badge.className).toContain("bg-error-100");
    expect(badge.className).toContain("text-error-800");
  });

  it("applies info variant classes", () => {
    render(<Badge variant="info">Info</Badge>);
    const badge = screen.getByText("Info");
    expect(badge.className).toContain("bg-info-100");
    expect(badge.className).toContain("text-info-800");
  });

  it("merges additional className", () => {
    render(<Badge className="extra-class">Test</Badge>);
    expect(screen.getByText("Test").className).toContain("extra-class");
  });
});
