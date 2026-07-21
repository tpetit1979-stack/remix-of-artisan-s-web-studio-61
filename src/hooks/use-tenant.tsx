import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTenant, fetchSiteSettings, fetchTenantBySlug, type Tenant, type SiteSettings } from "@/lib/tenant";
import { supabase } from "@/integrations/supabase/client";
import { useImpersonation } from "@/stores/impersonation";

interface TenantContextType {
  tenant: Tenant | null;
  settings: SiteSettings | null;
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
  initialTenant?: Tenant | null;
  /** Settings resolved server-side alongside initialTenant. */
  initialSettings?: SiteSettings | null;
}) {
  const impersonatedId = useImpersonation((s) => s.tenantId);
  const stopImpersonation = useImpersonation((s) => s.stopImpersonation);

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
    staleTime: 1000 * 60 * 5,
    retry: 1,
    ...(canSeedFromSsr ? { initialData: initialTenant } : {}),
  });

  const canSeedSettingsFromSsr =
    canSeedFromSsr && !!initialSettings && initialSettings.tenant_id === initialTenant?.id;

  const settingsQuery = useQuery({
    queryKey: ["site-settings", tenantQuery.data?.id],
    queryFn: () => fetchSiteSettings(tenantQuery.data!.id),
    enabled: !!tenantQuery.data?.id,
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

export function useTenant() {
  return useContext(TenantContext);
}
