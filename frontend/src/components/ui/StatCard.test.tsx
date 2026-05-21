import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatCard } from "./StatCard";
import { Leaf } from "lucide-react";

describe("StatCard", () => {
  it("renders label and value", () => {
    render(<StatCard label="Total Panen" value="120" />);
    expect(screen.getByText("Total Panen")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    render(<StatCard label="Sehat" value="85%" icon={<Leaf data-testid="icon" />} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders trend up indicator", () => {
    render(
      <StatCard label="Pendapatan" value="5.2M" trend="up" trendLabel="+12%" />
    );
    expect(screen.getByText("+12%")).toBeInTheDocument();
    const trendLabel = screen.getByText("+12%");
    expect(trendLabel.className).toContain("text-success-600");
  });

  it("renders trend down indicator", () => {
    render(
      <StatCard label="Hama" value="23" trend="down" trendLabel="-5%" />
    );
    expect(screen.getByText("-5%")).toBeInTheDocument();
    const trendLabel = screen.getByText("-5%");
    expect(trendLabel.className).toContain("text-error-600");
  });

  it("does not render trend when no trend prop", () => {
    render(<StatCard label="Suhu" value="28°C" />);
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it("merges additional className", () => {
    const { container } = render(
      <StatCard label="Test" value="0" className="extra-class" />
    );
    expect(container.firstChild).toHaveClass("extra-class");
  });
});
