import { describe, expect, it } from "vitest";
import { isAuthenticPublicPortfolioItem, matchesServiceAndCity } from "./portfolio";

function item(overrides: Partial<{ is_published: boolean | null; content_kind: string }> = {}) {
  return { is_published: true, content_kind: "real_project", ...overrides };
}

describe("isAuthenticPublicPortfolioItem", () => {
  it("rejects a published illustration — a catalog photo is never proof of a real job", () => {
    expect(isAuthenticPublicPortfolioItem(item({ content_kind: "illustration", is_published: true }))).toBe(false);
  });

  it("accepts a published real_project", () => {
    expect(isAuthenticPublicPortfolioItem(item({ content_kind: "real_project", is_published: true }))).toBe(true);
  });

  it("rejects an unpublished real_project", () => {
    expect(isAuthenticPublicPortfolioItem(item({ content_kind: "real_project", is_published: false }))).toBe(false);
  });

  it("rejects an unpublished illustration", () => {
    expect(isAuthenticPublicPortfolioItem(item({ content_kind: "illustration", is_published: false }))).toBe(false);
  });

  it("treats a null is_published as not published", () => {
    expect(isAuthenticPublicPortfolioItem(item({ is_published: null }))).toBe(false);
  });
});

describe("matchesServiceAndCity", () => {
  const base = { service_id: "svc-1", city: "Sète" };

  it("matches when both service and city are the same", () => {
    expect(matchesServiceAndCity(base, "svc-1", "Sète")).toBe(true);
  });

  it("rejects same service, different city — no OR leakage", () => {
    expect(matchesServiceAndCity(base, "svc-1", "Lyon")).toBe(false);
  });

  it("rejects different service, same city — no OR leakage", () => {
    expect(matchesServiceAndCity(base, "svc-2", "Sète")).toBe(false);
  });

  it("rejects different service and different city", () => {
    expect(matchesServiceAndCity(base, "svc-2", "Lyon")).toBe(false);
  });
});
