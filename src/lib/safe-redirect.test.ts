import { describe, expect, it } from "vitest";
import { safeRedirect } from "./safe-redirect";

describe("safeRedirect", () => {
  it("accepts a plain internal path", () => {
    expect(safeRedirect("/admin")).toBe("/admin");
    expect(safeRedirect("/super-admin/tenants")).toBe("/super-admin/tenants");
    expect(safeRedirect("/admin/settings?tab=rdv")).toBe("/admin/settings?tab=rdv");
  });

  it("rejects empty/missing values", () => {
    expect(safeRedirect(undefined)).toBeNull();
    expect(safeRedirect(null)).toBeNull();
    expect(safeRedirect("")).toBeNull();
    expect(safeRedirect("   ")).toBeNull();
  });

  it("rejects absolute URLs of any scheme", () => {
    expect(safeRedirect("https://evil.com")).toBeNull();
    expect(safeRedirect("http://evil.com/admin")).toBeNull();
    expect(safeRedirect("javascript:alert(1)")).toBeNull();
  });

  it("rejects protocol-relative and backslash-trick URLs", () => {
    expect(safeRedirect("//evil.com")).toBeNull();
    expect(safeRedirect("/\\evil.com")).toBeNull();
  });

  it("rejects paths without a leading slash", () => {
    expect(safeRedirect("admin")).toBeNull();
  });

  it("rejects the auth-only pages as post-login targets", () => {
    expect(safeRedirect("/login")).toBeNull();
    expect(safeRedirect("/login?redirect=/admin")).toBeNull();
    expect(safeRedirect("/login/anything")).toBeNull();
    expect(safeRedirect("/forgot-password")).toBeNull();
    expect(safeRedirect("/update-password")).toBeNull();
    expect(safeRedirect("/accept-invite")).toBeNull();
  });

  it("rejects an already-nested redirect", () => {
    expect(safeRedirect("/admin?redirect=/login")).toBeNull();
    expect(safeRedirect("/super-admin?redirect=%2Flogin")).toBeNull();
  });

  it("rejects anything referencing the Lovable preview auth-bridge", () => {
    expect(safeRedirect("/admin?next=https://lovable.dev/auth-bridge")).toBeNull();
    expect(safeRedirect("/AUTH-BRIDGE")).toBeNull();
  });

  it("rejects a target identical to the current route", () => {
    expect(safeRedirect("/super-admin/tenants", "/super-admin/tenants")).toBeNull();
    expect(safeRedirect("/super-admin/tenants", "/login")).toBe("/super-admin/tenants");
  });
});
