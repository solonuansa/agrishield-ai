import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("renders with label", () => {
    render(<Textarea label="Description" />);
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(<Textarea label="Desc" error="Required" />);
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  it("sets aria-invalid when error", () => {
    render(<Textarea label="Desc" error="Error" />);
    expect(screen.getByLabelText("Desc")).toHaveAttribute("aria-invalid", "true");
  });

  it("shows hint when no error", () => {
    render(<Textarea label="Desc" hint="Write here" />);
    expect(screen.getByText("Write here")).toBeInTheDocument();
  });

  it("calls onChange", () => {
    let value = "";
    render(<Textarea label="Desc" onChange={(e) => { value = e.target.value; }} />);
    fireEvent.change(screen.getByLabelText("Desc"), { target: { value: "hello" } });
    expect(value).toBe("hello");
  });

  it("renders with placeholder", () => {
    render(<Textarea label="Desc" placeholder="Type..." />);
    expect(screen.getByPlaceholderText("Type...")).toBeInTheDocument();
  });
});
