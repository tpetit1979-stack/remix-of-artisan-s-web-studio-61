import type { AppRole } from "@/hooks/use-auth";
import { safeRedirect } from "@/lib/safe-redirect";

export type AdminAccessResult =
  | { kind: "redirect-login" }
  | { kind: "redirect-super-admin-tenants" }
  | { kind: "denied-no-tenant" }
  | { kind: "denied-role" }
  | { kind: "ok" };

/** Decision for the /admin/* guard. Pure so it's testable without rendering. */
export function resolveAdminAccess(params: {
  isAuthenticated: boolean;
  role: AppRole | null;
  tenantId: string | null;
  impersonatedId: string | null;
}): AdminAccessResult {
  const { isAuthenticated, role, tenantId, impersonatedId } = params;
  if (!isAuthenticated) return { kind: "redirect-login" };
  if (role === "super_admin") {
    return impersonatedId ? { kind: "ok" } : { kind: "redirect-super-admin-tenants" };
  }
  if (role === "tenant_admin") {
    return tenantId ? { kind: "ok" } : { kind: "denied-no-tenant" };
  }
  return { kind: "denied-role" };
}

export type SuperAdminAccessResult = { kind: "redirect-login" } | { kind: "denied-role" } | { kind: "ok" };

/** Decision for the /super-admin/* guard. */
export function resolveSuperAdminAccess(params: {
  isAuthenticated: boolean;
  role: AppRole | null;
}): SuperAdminAccessResult {
  if (!params.isAuthenticated) return { kind: "redirect-login" };
  return params.role === "super_admin" ? { kind: "ok" } : { kind: "denied-role" };
}

export type LoginRedirectResult =
  | { kind: "wait" }
  | { kind: "denied-no-tenant" }
  | { kind: "denied-role" }
  | { kind: "navigate"; target: string };

/**
 * Decision for /login once a session is known. Never trusts `requestedRedirect`
 * blindly: it's only followed when it survives safeRedirect() AND falls under
 * the space the resolved role is actually allowed into. A role with no valid
 * destination never triggers a navigation — it's a denial, not a bounce.
 */
export function resolveLoginRedirect(params: {
  isAuthenticated: boolean;
  role: AppRole | null;
  tenantId: string | null;
  requestedRedirect: string | undefined;
}): LoginRedirectResult {
  const { isAuthenticated, role, tenantId, requestedRedirect } = params;
  if (!isAuthenticated) return { kind: "wait" };

  if (role === "super_admin") {
    const requested = safeRedirect(requestedRedirect);
    const target = requested && requested.startsWith("/super-admin") ? requested : "/super-admin";
    return { kind: "navigate", target };
  }

  if (role === "tenant_admin") {
    if (!tenantId) return { kind: "denied-no-tenant" };
    const requested = safeRedirect(requestedRedirect);
    const target = requested && requested.startsWith("/admin") ? requested : "/admin";
    return { kind: "navigate", target };
  }

  return { kind: "denied-role" };
}
