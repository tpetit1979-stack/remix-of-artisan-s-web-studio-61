import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "@tanstack/react-router";
import {
  fetchTenant,
  fetchSiteSettings,
  fetchPublicSiteSettings,
  fetchTenantBySlug,
  type Tenant,
  type SiteSettings,
  type PublicTenant,
  type PublicSiteSettings,
} from "@/lib/tenant";
import { supabase } from "@/integrations/supabase/client";
import { useImpersonation } from "@/stores/impersonation";
import { useAuth } from "@/hooks/use-auth";

/**
 * True for /admin/* and /super-admin/*. The public resolver (TenantProvider
 * below) must never run its query there — see useAdminTenant() for why.
 * Shared with __root.tsx so the two checks can't drift apart.
 */
export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin") || pathname.startsWith("/super-admin");
}

interface TenantContextType {
  tenant: PublicTenant | null;
  settings: PublicSiteSettings | null;
  isLoading: boolean;
  error: Error | null;
}

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  settings: null,
  isLoading: true,
  error: null,
});

export function TenantProvider({
  children,
  initialTenant = null,
  initialSettings = null,
}: {
  children: ReactNode;
  /** Tenant resolved server-side (root beforeLoad) for the SSR HTML. */
  initialTenant?: PublicTenant | null;
  /** Settings resolved server-side alongside initialTenant. */
  initialSettings?: PublicSiteSettings | null;
}) {
  const impersonatedId = useImpersonation((s) => s.tenantId);
  const stopImpersonation = useImpersonation((s) => s.stopImpersonation);
  const location = useLocation();
  // /admin and /super-admin have their own resolver (useAdminTenant). This
  // provider's query must never run there — not just "go unread": on a real
  // production domain that happens to match a *different* tenant's own
  // custom domain, hostname resolution would otherwise still succeed, and
  // TenantTheme/FloatingCTA (mounted for every route) would apply that
  // other tenant's colors/phone number on top of the admin UI.
  const disabledOnAdminRoute = isAdminRoute(location.pathname);

  // Only seed the "auto" (non-impersonated) query — never the impersonation
  // one, otherwise a super-admin reloading mid-impersonation would have
  // their query key seeded with the wrong (SSR-resolved public) tenant.
  const canSeedFromSsr = !impersonatedId && !!initialTenant;

  // If impersonating, fetch by id; otherwise resolve from hostname.
  // Use maybeSingle() to avoid 406 (PGRST116) when the impersonated tenant
  // was deleted; in that case we self-heal by clearing the persisted store.
  const tenantQuery = useQuery({
    queryKey: ["tenant", impersonatedId ?? "auto"],
    queryFn: async () => {
      if (impersonatedId) {
        const { data, error } = await supabase
          .from("tenants")
          .select("*")
          .eq("id", impersonatedId)
          .maybeSingle();
        if (error) throw error;
        if (!data) {
          // Stale impersonation pointing to a deleted tenant — clear and fall back.
          stopImpersonation();
          return fetchTenant();
        }
        return data;
      }
      return fetchTenant();
    },
    enabled: !disabledOnAdminRoute,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    ...(canSeedFromSsr ? { initialData: initialTenant } : {}),
  });

  const canSeedSettingsFromSsr =
    canSeedFromSsr && !!initialSettings && initialSettings.tenant_id === initialTenant?.id;

  const settingsQuery = useQuery({
    queryKey: ["site-settings", tenantQuery.data?.id],
    queryFn: () => fetchPublicSiteSettings(tenantQuery.data!.id),
    enabled: !disabledOnAdminRoute && !!tenantQuery.data?.id,
    staleTime: 1000 * 60 * 5,
    ...(canSeedSettingsFromSsr ? { initialData: initialSettings } : {}),
  });

  return (
    <TenantContext.Provider
      value={{
        tenant: tenantQuery.data ?? null,
        settings: settingsQuery.data ?? null,
        isLoading: tenantQuery.isLoading || settingsQuery.isLoading,
        error: (tenantQuery.error ?? settingsQuery.error) as Error | null,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

/**
 * Public-site tenant context (hostname / `?tenant=` resolution only).
 *
 * For the public website exclusively. Never use this in /admin, /super-admin,
 * or any non-public rendering context (PDF export, email, background jobs) —
 * those must resolve the tenant explicitly (see `useAdminTenant` below for
 * the admin case) rather than inherit whichever tenant the public resolver
 * happens to be showing. Conflating the two was a real, shipped bug in this
 * codebase (cross-tenant data exposure in /admin) before `useAdminTenant`
 * existed — don't reintroduce it by using this hook somewhere it doesn't
 * belong.
 */
export function useTenant() {
  return useContext(TenantContext);
}

/**
 * Reads the current `?tenant=` search param (used on dev/preview hosts,
 * see resolveTenantForSsr) so public-site links can carry it forward on
 * client-side navigation. Returns {} when absent — on a real production
 * domain this never adds anything to `search`, so behavior is unchanged.
 */
export function usePreviewTenantSearch(): { tenant?: string } {
  const search = useSearch({ strict: false }) as { tenant?: string };
  return search?.tenant ? { tenant: search.tenant } : {};
}

/**
 * The tenant an authenticated /admin/* session manages. Deliberately
 * independent from TenantProvider/useTenant above (hostname/?tenant=
 * driven — the public resolver): admin pages must never inherit whichever
 * tenant the current preview host happens to resolve to.
 *
 * Source of the tenant id, by authenticated identity only:
 *   - super_admin with active impersonation → the impersonated tenant
 *   - tenant_admin → their own tenant_members.tenant_id (from useAuth)
 *   - anything else (not authenticated yet, wrong role, no impersonation)
 *     → no id, no query — the route's own auth guard decides what to show
 *
 * No query fires while useAuth().isLoading is true, and the query key
 * carries the resolved id itself, so switching impersonation targets (or
 * signing in as a different tenant_admin) always starts a fresh query —
 * no previous tenant's cached data is ever shown while the new one loads.
 */
export function useAdminTenant() {
  const { role, tenantId, isLoading: authLoading } = useAuth();
  const impersonatedId = useImpersonation((s) => s.tenantId);

  const resolvedTenantId =
    role === "super_admin" ? impersonatedId : role === "tenant_admin" ? tenantId : null;

  const tenantQuery = useQuery({
    queryKey: ["admin-tenant", resolvedTenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("id", resolvedTenantId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !authLoading && !!resolvedTenantId,
  });

  const settingsQuery = useQuery({
    queryKey: ["admin-tenant-settings", resolvedTenantId],
    queryFn: () => fetchSiteSettings(resolvedTenantId!),
    enabled: !authLoading && !!resolvedTenantId,
  });

  return {
    tenant: (tenantQuery.data ?? null) as Tenant | null,
    settings: (settingsQuery.data ?? null) as SiteSettings | null,
    isLoading: authLoading || tenantQuery.isLoading || settingsQuery.isLoading,
    error: (tenantQuery.error ?? settingsQuery.error) as Error | null,
  };
}
