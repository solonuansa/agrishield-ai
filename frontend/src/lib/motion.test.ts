import { describe, it, expect } from "vitest";
import { fadeUp, staggerFadeUp, fadeIn, scaleIn, slideLeft, tapSink, countUp, drawPath, successPop, hoverLift } from "./motion";

describe("motion variants", () => {
  it("fadeUp has hidden and visible", () => {
    expect(fadeUp).toHaveProperty("hidden");
    expect(fadeUp).toHaveProperty("visible");
    expect(fadeUp.visible?.opacity).toBe(1);
  });

  it("staggerFadeUp has visible with staggerChildren", () => {
    expect(staggerFadeUp.visible?.transition?.staggerChildren).toBeGreaterThan(0);
  });

  it("fadeIn has hidden and visible", () => {
    expect(fadeIn.hidden?.opacity).toBe(0);
    expect(fadeIn.visible?.opacity).toBe(1);
  });

  it("scaleIn scales from 0.94 to 1", () => {
    expect(scaleIn.hidden?.scale).toBe(0.94);
    expect(scaleIn.visible?.scale).toBe(1);
  });

  it("slideLeft slides from 20 to 0", () => {
    expect(slideLeft.hidden?.x).toBe(20);
    expect(slideLeft.visible?.x).toBe(0);
  });

  it("successPop uses keyframe animation", () => {
    expect(Array.isArray(successPop.visible?.scale)).toBe(true);
  });

  it("hoverLift lifts -2px on hover", () => {
    expect(hoverLift.y).toBe(-2);
  });

  it("tapSink scales to 0.97", () => {
    expect(tapSink).toEqual({ scale: 0.97 });
  });

  it("countUp fades in", () => {
    expect(countUp.hidden?.opacity).toBe(0);
    expect(countUp.visible?.opacity).toBe(1);
  });

  it("drawPath has pathLength animation", () => {
    expect(drawPath.hidden?.pathLength).toBe(0);
    expect(drawPath.visible?.pathLength).toBe(1);
  });
});
