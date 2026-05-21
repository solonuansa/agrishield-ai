import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders title", () => {
    render(<EmptyState title="Belum ada data" />);
    expect(
      screen.getByRole("heading", { name: "Belum ada data" })
    ).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <EmptyState
        title="Kosong"
        description="Silakan tambahkan data terlebih dahulu"
      />
    );
    expect(
      screen.getByText("Silakan tambahkan data terlebih dahulu")
    ).toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    render(<EmptyState title="Kosong" />);
    const heading = screen.getByRole("heading", { name: "Kosong" });
    const container = heading.closest("div")?.parentElement;
    expect(
      container?.querySelector(".text-body")
    ).not.toBeInTheDocument();
  });

  it("does not render action button when no actionLabel", () => {
    render(<EmptyState title="Kosong" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders action button when actionLabel and onAction provided", () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        title="Kosong"
        actionLabel="Tambah Data"
        onAction={onAction}
      />
    );
    expect(
      screen.getByRole("button", { name: "Tambah Data" })
    ).toBeInTheDocument();
  });

  it("calls onAction when button clicked", () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        title="Kosong"
        actionLabel="Tambah"
        onAction={onAction}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Tambah" }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("does not render button when actionLabel provided but no onAction", () => {
    render(<EmptyState title="Kosong" actionLabel="Tambah" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
