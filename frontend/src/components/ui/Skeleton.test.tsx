import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Skeleton, SkeletonLines } from "./Skeleton";

describe("Skeleton", () => {
  it("renders text variant by default", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("animate-shimmer");
    expect(el.className).toContain("rounded-sm");
    expect(el.style.width).toBe("100%");
    expect(el.style.height).toBe("1em");
  });

  it("renders heading variant", () => {
    const { container } = render(<Skeleton variant="heading" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("animate-shimmer");
    expect(el.style.height).toBe("1.5em");
  });

  it("renders card variant with children", () => {
    render(<Skeleton variant="card" data-testid="card-skeleton" />);
    const card = screen.getByTestId("card-skeleton");
    expect(card.className).toContain("rounded-lg");
    expect(card.className).toContain("p-4");
    // Card variant renders inner skeleton elements
    expect(card.children.length).toBeGreaterThan(0);
  });

  it("renders circle variant with dimensions", () => {
    const { container } = render(<Skeleton variant="circle" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("rounded-full");
    expect(el.style.width).toBe("2.5rem");
    expect(el.style.height).toBe("2.5rem");
  });

  it("renders chart variant", () => {
    const { container } = render(<Skeleton variant="chart" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("animate-shimmer");
    expect(el.className).toContain("rounded-lg");
    expect(el.style.height).toBe("220px");
  });

  it("accepts custom width and height", () => {
    const { container } = render(<Skeleton width="200px" height="3rem" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe("200px");
    expect(el.style.height).toBe("3rem");
  });
});

describe("SkeletonLines", () => {
  it("renders default 3 lines", () => {
    const { container } = render(<SkeletonLines />);
    const lines = container.querySelectorAll(".animate-shimmer");
    expect(lines).toHaveLength(3);
  });

  it("renders correct count when specified", () => {
    const { container } = render(<SkeletonLines count={5} />);
    const lines = container.querySelectorAll(".animate-shimmer");
    expect(lines).toHaveLength(5);
  });

  it("renders 0 lines when count is 0", () => {
    const { container } = render(<SkeletonLines count={0} />);
    const lines = container.querySelectorAll(".animate-shimmer");
    expect(lines).toHaveLength(0);
  });
});
