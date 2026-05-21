import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Button } from "./Button";
import { Check } from "lucide-react";

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>Simpan</Button>);
    expect(screen.getByRole("button", { name: "Simpan" })).toBeInTheDocument();
  });

  it("renders with icon", () => {
    render(<Button icon={Check} aria-label="Simpan" />);
    expect(screen.getByRole("button", { name: "Simpan" })).toBeInTheDocument();
  });

  it("renders loading state with spinner and is disabled", () => {
    render(<Button loading>Menyimpan</Button>);
    const button = screen.getByRole("button", { name: "Menyimpan" });
    expect(button).toBeDisabled();
    expect(button.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Klik</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Klik</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("does not call onClick when loading", () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>Klik</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies base classes", () => {
    render(<Button>Test</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("inline-flex");
    expect(button.className).toContain("font-semibold");
  });

  it("merges additional className", () => {
    render(<Button className="extra-class">Test</Button>);
    expect(screen.getByRole("button").className).toContain("extra-class");
  });
});
