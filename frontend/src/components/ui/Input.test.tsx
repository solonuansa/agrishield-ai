import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Input } from "./Input";

describe("Input", () => {
  it("renders label when provided", () => {
    render(<Input label="Nama Lengkap" />);
    expect(screen.getByLabelText("Nama Lengkap")).toBeInTheDocument();
  });

  it("renders error message with AlertCircle icon", () => {
    render(<Input label="Email" error="Email tidak valid" />);
    expect(screen.getByText("Email tidak valid")).toBeInTheDocument();
    // AlertCircle icon rendered inside the error paragraph
    const errorEl = screen.getByText("Email tidak valid").closest("p");
    expect(errorEl?.querySelector("svg")).toBeInTheDocument();
  });

  it("renders hint text", () => {
    render(<Input label="Password" hint="Minimal 8 karakter" />);
    expect(screen.getByText("Minimal 8 karakter")).toBeInTheDocument();
  });

  it("shows error instead of hint when both provided", () => {
    render(
      <Input
        label="Email"
        error="Wajib diisi"
        hint="Masukkan email aktif"
      />
    );
    expect(screen.getByText("Wajib diisi")).toBeInTheDocument();
    expect(screen.queryByText("Masukkan email aktif")).not.toBeInTheDocument();
  });

  it("calls onChange when typing", () => {
    const onChange = vi.fn();
    render(<Input label="Nama" onChange={onChange} />);
    const input = screen.getByLabelText("Nama");
    fireEvent.change(input, { target: { value: "Budi" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("applies error class when error prop set", () => {
    render(<Input label="Field" error="Harus diisi" />);
    const input = screen.getByLabelText("Field");
    expect(input.className).toContain("error");
  });

  it("uses id derived from label for htmlFor", () => {
    render(<Input label="Nama Lengkap" />);
    const input = screen.getByLabelText("Nama Lengkap");
    expect(input).toHaveAttribute("id", "nama-lengkap");
  });

  it("sets aria-invalid when error is present", () => {
    render(<Input label="Email" error="Format salah" />);
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
  });
});
