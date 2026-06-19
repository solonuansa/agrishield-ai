import { describe, it, expect, beforeEach, vi } from "vitest";
import { readSession, writeSession, clearSession, getAccessToken } from "./auth";

const mockSession = {
  token: "test-token",
  refreshToken: "test-refresh",
  user: { id: "1", email: "test@test.com", full_name: "Test User", role: "farmer" },
};

beforeEach(() => {
  window.localStorage.clear();
});

describe("writeSession", () => {
  it("stores session to localStorage", () => {
    writeSession(mockSession);
    const raw = window.localStorage.getItem("agrishield.session");
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!).user.full_name).toBe("Test User");
  });

  it("stores token and role separately", () => {
    writeSession(mockSession);
    expect(window.localStorage.getItem("token")).toBe("test-token");
    expect(window.localStorage.getItem("role")).toBe("farmer");
  });
});

describe("readSession", () => {
  it("returns null when no session", () => {
    expect(readSession()).toBeNull();
  });

  it("returns parsed session from localStorage", () => {
    writeSession(mockSession);
    const session = readSession();
    expect(session).not.toBeNull();
    expect(session!.token).toBe("test-token");
    expect(session!.user.email).toBe("test@test.com");
  });

  it("removes corrupted data and returns null", () => {
    window.localStorage.setItem("agrishield.session", "not-json");
    expect(readSession()).toBeNull();
    expect(window.localStorage.getItem("agrishield.session")).toBeNull();
  });
});

describe("clearSession", () => {
  it("removes all session data", () => {
    writeSession(mockSession);
    clearSession();
    expect(readSession()).toBeNull();
    expect(window.localStorage.getItem("token")).toBeNull();
    expect(window.localStorage.getItem("role")).toBeNull();
  });
});

describe("getAccessToken", () => {
  it("returns null without session", () => {
    expect(getAccessToken()).toBeNull();
  });

  it("returns token from session", () => {
    writeSession(mockSession);
    expect(getAccessToken()).toBe("test-token");
  });
});
