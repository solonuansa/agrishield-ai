import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

describe("HomePage", () => {
  it("renders without crashing", () => {
    render(<HomePage />);
    // HomePage menggunakan section components — cukup verifikasi render berhasil
    expect(document.body).toBeDefined();
  });
});
