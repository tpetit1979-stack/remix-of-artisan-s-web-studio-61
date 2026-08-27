import { afterEach, describe, expect, it, vi } from "vitest";
import { getPlatformOrigin } from "./platform-url";

describe("getPlatformOrigin", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("throws in production when VITE_PLATFORM_URL is missing — never falls back silently", () => {
    vi.stubEnv("PROD", true);
    vi.stubEnv("VITE_PLATFORM_URL", "");
    expect(() => getPlatformOrigin()).toThrow(/VITE_PLATFORM_URL/);
  });

  it("throws in production when VITE_PLATFORM_URL is only whitespace", () => {
    vi.stubEnv("PROD", true);
    vi.stubEnv("VITE_PLATFORM_URL", "   ");
    expect(() => getPlatformOrigin()).toThrow(/VITE_PLATFORM_URL/);
  });

  it("returns VITE_PLATFORM_URL in production when set", () => {
    vi.stubEnv("PROD", true);
    vi.stubEnv("VITE_PLATFORM_URL", "https://app.lignia.fr");
    expect(getPlatformOrigin()).toBe("https://app.lignia.fr");
  });
});
