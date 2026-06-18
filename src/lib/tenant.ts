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
