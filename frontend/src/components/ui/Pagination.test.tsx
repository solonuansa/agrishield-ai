import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Pagination from "./Pagination";

describe("Pagination", () => {
  it("returns null if totalPages <= 1", () => {
    const { container } = render(<Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders page buttons", () => {
    render(<Pagination currentPage={1} totalPages={3} onPageChange={() => {}} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("highlights current page", () => {
    render(<Pagination currentPage={2} totalPages={3} onPageChange={() => {}} />);
    expect(screen.getByText("2")).toHaveAttribute("aria-current", "page");
  });

  it("calls onPageChange on click", () => {
    const onChange = vi.fn();
    render(<Pagination currentPage={1} totalPages={3} onPageChange={onChange} />);
    fireEvent.click(screen.getByText("2"));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("disables prev on first page", () => {
    render(<Pagination currentPage={1} totalPages={3} onPageChange={() => {}} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toBeDisabled();
  });

  it("disables next on last page", () => {
    render(<Pagination currentPage={3} totalPages={3} onPageChange={() => {}} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[buttons.length - 1]).toBeDisabled();
  });
});
