import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("does not render content when closed", () => {
    render(<Modal open={false} onClose={() => {}}>Content</Modal>);
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });

  it("renders content when open", () => {
    render(<Modal open={true} onClose={() => {}}>Content</Modal>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders title when provided", () => {
    render(<Modal open={true} onClose={() => {}} title="My Title">Content</Modal>);
    expect(screen.getByText("My Title")).toBeInTheDocument();
  });

  it("calls onClose when clicking backdrop", () => {
    const onClose = vi.fn();
    const { container } = render(<Modal open={true} onClose={onClose}>Content</Modal>);
    const backdrop = container.querySelector('[class*="inset-0 bg-ink/30"]');
    if (backdrop) fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("has role=dialog and aria-modal=true", () => {
    render(<Modal open={true} onClose={() => {}}>Content</Modal>);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("renders close button when title is provided", () => {
    render(<Modal open={true} onClose={() => {}} title="Title">Content</Modal>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
