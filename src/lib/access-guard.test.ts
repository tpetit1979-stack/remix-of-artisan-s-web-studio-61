import { describe, expect, it } from "vitest";
import { resolveAdminAccess, resolveLoginRedirect, resolveSuperAdminAccess } from "./access-guard";

describe("resolveAdminAccess", () => {
  it("redirects to login when not authenticated", () => {
    expect(
      resolveAdminAccess({ isAuthenticated: false, role: null, tenantId: null, impersonatedId: null })
    ).toEqual({ kind: "redirect-login" });
  });

  it("grants access to a tenant_admin with a tenant", () => {
    expect(
      resolveAdminAccess({ isAuthenticated: true, role: "tenant_admin", tenantId: "t1", impersonatedId: null })
    ).toEqual({ kind: "ok" });
  });

  it("denies (no loop) a tenant_admin with no tenant_members row", () => {
    expect(
      resolveAdminAccess({ isAuthenticated: true, role: "tenant_admin", tenantId: null, impersonatedId: null })
    ).toEqual({ kind: "denied-no-tenant" });
  });

  it("bounces a super_admin with no active impersonation to /super-admin/tenants", () => {
    expect(
      resolveAdminAccess({ isAuthenticated: true, role: "super_admin", tenantId: null, impersonatedId: null })
    ).toEqual({ kind: "redirect-super-admin-tenants" });
  });

  it("grants access to a super_admin actively impersonating a tenant", () => {
    expect(
      resolveAdminAccess({ isAuthenticated: true, role: "super_admin", tenantId: null, impersonatedId: "t1" })
    ).toEqual({ kind: "ok" });
  });

  it("denies (no loop) an authenticated user with no role at all", () => {
    expect(
      resolveAdminAccess({ isAuthenticated: true, role: null, tenantId: null, impersonatedId: null })
    ).toEqual({ kind: "denied-role" });
  });
});

describe("resolveSuperAdminAccess", () => {
  it("redirects to login when not authenticated", () => {
    expect(resolveSuperAdminAccess({ isAuthenticated: false, role: null })).toEqual({ kind: "redirect-login" });
  });

  it("grants access to super_admin", () => {
    expect(resolveSuperAdminAccess({ isAuthenticated: true, role: "super_admin" })).toEqual({ kind: "ok" });
  });

  it("denies (never redirects to login) an authenticated tenant_admin", () => {
    expect(resolveSuperAdminAccess({ isAuthenticated: true, role: "tenant_admin" })).toEqual({
      kind: "denied-role",
    });
  });

  it("denies (never redirects to login) an authenticated user with no role", () => {
    expect(resolveSuperAdminAccess({ isAuthenticated: true, role: null })).toEqual({ kind: "denied-role" });
  });
});

describe("resolveLoginRedirect", () => {
  it("waits while not authenticated", () => {
    expect(
      resolveLoginRedirect({ isAuthenticated: false, role: null, tenantId: null, requestedRedirect: "/admin" })
    ).toEqual({ kind: "wait" });
  });

  it("sends super_admin to /super-admin by default", () => {
    expect(
      resolveLoginRedirect({ isAuthenticated: true, role: "super_admin", tenantId: null, requestedRedirect: "" })
    ).toEqual({ kind: "navigate", target: "/super-admin" });
  });

  it("follows a valid requested redirect for super_admin", () => {
    expect(
      resolveLoginRedirect({
        isAuthenticated: true,
        role: "super_admin",
        tenantId: null,
        requestedRedirect: "/super-admin/media-library",
      })
    ).toEqual({ kind: "navigate", target: "/super-admin/media-library" });
  });

  it("ignores a requested redirect outside the super_admin space", () => {
    expect(
      resolveLoginRedirect({
        isAuthenticated: true,
        role: "super_admin",
        tenantId: null,
        requestedRedirect: "/admin/settings",
      })
    ).toEqual({ kind: "navigate", target: "/super-admin" });
  });

  it("ignores a nested /login redirect for super_admin — this is the exact loop case", () => {
    expect(
      resolveLoginRedirect({
        isAuthenticated: true,
        role: "super_admin",
        tenantId: null,
        requestedRedirect: "/login?redirect=/super-admin/tenants",
      })
    ).toEqual({ kind: "navigate", target: "/super-admin" });
  });

  it("sends tenant_admin with a tenant to /admin by default", () => {
    expect(
      resolveLoginRedirect({ isAuthenticated: true, role: "tenant_admin", tenantId: "t1", requestedRedirect: "" })
    ).toEqual({ kind: "navigate", target: "/admin" });
  });

  it("follows a valid requested redirect for tenant_admin", () => {
    expect(
      resolveLoginRedirect({
        isAuthenticated: true,
        role: "tenant_admin",
        tenantId: "t1",
        requestedRedirect: "/admin/settings?tab=rdv",
      })
    ).toEqual({ kind: "navigate", target: "/admin/settings?tab=rdv" });
  });

  it("denies (no navigation) a tenant_admin with no tenant, regardless of requestedRedirect", () => {
    expect(
      resolveLoginRedirect({
        isAuthenticated: true,
        role: "tenant_admin",
        tenantId: null,
        requestedRedirect: "/admin",
      })
    ).toEqual({ kind: "denied-no-tenant" });
  });

  it("denies (no navigation) an authenticated user with no role", () => {
    expect(
      resolveLoginRedirect({ isAuthenticated: true, role: null, tenantId: null, requestedRedirect: "/admin" })
    ).toEqual({ kind: "denied-role" });
  });
});
