import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Select } from "./Select";

const options = [
  { value: "a", label: "Option A" },
  { value: "b", label: "Option B" },
];

describe("Select", () => {
  it("renders with label and options", () => {
    render(<Select label="Test" options={options} />);
    expect(screen.getByLabelText("Test")).toBeInTheDocument();
    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.getByText("Option B")).toBeInTheDocument();
  });

  it("shows placeholder when provided", () => {
    render(<Select label="Test" options={options} placeholder="Pick one" />);
    expect(screen.getByText("Pick one")).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(<Select label="Test" options={options} error="Required" />);
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  it("sets aria-invalid when error", () => {
    render(<Select label="Test" options={options} error="Error" />);
    expect(screen.getByLabelText("Test")).toHaveAttribute("aria-invalid", "true");
  });

  it("shows hint when no error", () => {
    render(<Select label="Test" options={options} hint="Choose wisely" />);
    expect(screen.getByText("Choose wisely")).toBeInTheDocument();
  });

  it("calls onChange when selecting", () => {
    let value = "";
    render(<Select label="Test" options={options} onChange={(e) => { value = e.target.value; }} />);
    fireEvent.change(screen.getByLabelText("Test"), { target: { value: "b" } });
    expect(value).toBe("b");
  });
});
