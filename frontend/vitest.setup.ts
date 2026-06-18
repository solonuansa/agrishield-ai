import { vi } from "vitest";
import "@testing-library/jest-dom";

// Init i18n for tests
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/lib/i18n/locales/en.json";
import id from "@/lib/i18n/locales/id.json";

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, id: { translation: id } },
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});
