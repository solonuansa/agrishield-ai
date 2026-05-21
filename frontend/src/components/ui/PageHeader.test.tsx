import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("renders title", () => {
    render(<PageHeader title="Dashboard" />);
    expect(
      screen.getByRole("heading", { name: "Dashboard", level: 1 })
    ).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <PageHeader
        title="Dashboard"
        description="Ringkasan data lahan dan panen"
      />
    );
    expect(
      screen.getByText("Ringkasan data lahan dan panen")
    ).toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    render(<PageHeader title="Dashboard" />);
    expect(
      screen.queryByText((_, el) =>
        el?.classList.contains("text-body-lg") ?? false
      )
    ).not.toBeInTheDocument();
  });

  it("renders action element when provided", () => {
    render(
      <PageHeader
        title="Dashboard"
        action={<button>Tambah</button>}
      />
    );
    expect(
      screen.getByRole("button", { name: "Tambah" })
    ).toBeInTheDocument();
  });

  it("does not render action when not provided", () => {
    render(<PageHeader title="Dashboard" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
