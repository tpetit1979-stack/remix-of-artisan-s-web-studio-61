import { createServerFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Tenant = Tables<"tenants">;
export type SiteSettings = Tables<"site_settings">;
export type Service = Tables<"services">;
export type ServiceArea = Tables<"service_areas">;
export type PortfolioItem = Tables<"portfolio">;
export type Contact = Tables<"contacts">;

/**
 * Detect tenant slug from hostname.
 * In dev, fallback to first active tenant.
 */
export function getTenantSlugFromHostname(): { type: "domain"; value: string } | { type: "slug"; value: string } | null {
  if (typeof window === "undefined") return null;

  // Dev override: ?tenant=slug
  const params = new URLSearchParams(window.location.search);
  const tenantSlug = params.get("tenant");
  if (tenantSlug) return { type: "slug", value: tenantSlug };

  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname.includes("lovable.app") || hostname.includes("lovableproject.com") || hostname.includes("127.0.0.1")) {
    return null; // Will use fallback query
  }
  // Custom domain: lookup by domain
  return { type: "domain", value: hostname };
}

export async function fetchTenantByDomain(domain: string) {
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("domain", domain)
    .eq("is_active", true)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchTenantBySlug(slug: string) {
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchFirstActiveTenant() {
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchTenant(): Promise<Tenant> {
  const result = getTenantSlugFromHostname();
  if (result) {
    if (result.type === "slug") return fetchTenantBySlug(result.value);
    return fetchTenantByDomain(result.value);
  }
  return fetchFirstActiveTenant();
}

/**
 * Normalize a Host header / hostname for tenant lookup: lowercase, strip
 * the port, and drop a leading "www." so apex and www resolve the same
 * tenant regardless of which form is stored in tenants.domain.
 */
export function normalizeHostname(host: string): string {
  return host.trim().toLowerCase().split(":")[0].replace(/^www\./, "");
}

function isDevOrPreviewHost(host: string): boolean {
  return (
    !host ||
    host === "localhost" ||
    host.includes("lovable.app") ||
    host.includes("lovableproject.com") ||
    host.includes("127.0.0.1")
  );
}

export async function fetchTenantByHostname(host: string): Promise<Tenant | null> {
  const normalized = normalizeHostname(host);
  if (isDevOrPreviewHost(normalized)) return null;
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .or(`domain.eq.${normalized},domain.eq.www.${normalized}`)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Server-only: read the incoming request's URL so the root route's
 * beforeLoad can resolve the tenant during SSR instead of only after
 * client hydration. The framework strips the handler body (and this
 * server-only import) from the client bundle; on the client this becomes
 * a network call instead.
 */
export const getTenantResolutionInput = createServerFn({ method: "GET" }).handler(async () => {
  const url = getRequestUrl({ xForwardedHost: true });
  return {
    hostname: url.hostname,
    tenantSlugParam: url.searchParams.get("tenant"),
  };
});

/**
 * Resolve the tenant for an SSR request: explicit ?tenant= param first,
 * then custom domain, then the same "first active tenant" fallback used
 * client-side for dev/preview hosts. Never throws — callers get null on
 * any failure and fall back to the existing client-side resolution.
 */
export async function resolveTenantForSsr(input: {
  hostname: string;
  tenantSlugParam: string | null;
}): Promise<Tenant | null> {
  if (input.tenantSlugParam) {
    try {
      return await fetchTenantBySlug(input.tenantSlugParam);
    } catch {
      // Unknown slug — fall through to hostname/default resolution.
    }
  }
  try {
    const byHost = await fetchTenantByHostname(input.hostname);
    if (byHost) return byHost;
  } catch {
    // Domain lookup failed — fall through to the default tenant.
  }
  try {
    return await fetchFirstActiveTenant();
  } catch {
    return null;
  }
}

export async function fetchSiteSettings(tenantId: string): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("tenant_id", tenantId)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchServices(tenantId: string): Promise<Service[]> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchAllServices(tenantId: string): Promise<Service[]> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchServiceAreas(tenantId: string): Promise<ServiceArea[]> {
  const { data, error } = await supabase
    .from("service_areas")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("city", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchPortfolio(tenantId: string): Promise<PortfolioItem[]> {
  const { data, error } = await supabase
    .from("portfolio")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchContacts(tenantId: string): Promise<Contact[]> {
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
