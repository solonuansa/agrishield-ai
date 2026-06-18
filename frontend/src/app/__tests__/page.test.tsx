import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";
import HomePage from "../page";

describe("HomePage", () => {
  it("renders without crashing", () => {
    render(
      <I18nextProvider i18n={i18n}>
        <HomePage />
      </I18nextProvider>
    );
    expect(document.body).toBeDefined();
  });
});
