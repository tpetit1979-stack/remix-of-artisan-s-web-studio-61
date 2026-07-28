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
 * The URL to open to view a tenant's public site — single source of truth
 * so every "view site" link/button builds the same address. A real domain
 * is used as-is; otherwise falls back to the dev/preview `?tenant=`
 * convention. Never a bare "/" — resolveTenantForSsr fails closed on that
 * now, so a link without the tenant would just 404.
 */
export function buildPublicSiteUrl(tenant: Pick<Tenant, "domain" | "slug">): string {
  if (tenant.domain) {
    const domain = tenant.domain.trim();
    return /^https?:\/\//i.test(domain) ? domain : `https://${domain}`;
  }
  return `/?tenant=${encodeURIComponent(tenant.slug)}`;
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

/**
 * Client-side counterpart to resolveTenantForSsr, used by TenantProvider's
 * "auto" (non-impersonated) query. Reuses the same fail-closed resolution —
 * never a separate implementation — so the public site behaves identically
 * whether resolved server-side or re-resolved after hydration.
 */
export async function fetchTenant(): Promise<Tenant> {
  if (typeof window === "undefined") throw new Error("fetchTenant is client-only");
  const tenant = await resolveTenantForSsr({
    hostname: window.location.hostname,
    tenantSlugParam: new URLSearchParams(window.location.search).get("tenant"),
  });
  if (!tenant) throw new Error("No tenant resolved for this host");
  return tenant;
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
 *
 * Deliberately does NOT return a pathname: a createServerFn is invoked
 * over its own dedicated /_serverFn/<hash> RPC request whenever this is
 * called client-side (e.g. on a client-side route transition), and
 * getRequestUrl() inside the handler then reflects that RPC endpoint's
 * own URL — never the page actually being navigated to. Route-type checks
 * must use the router's own `location.pathname` (see __root.tsx), not
 * anything derived from this function.
 */
export const getTenantResolutionInput = createServerFn({ method: "GET" }).handler(async () => {
  const url = getRequestUrl({ xForwardedHost: true });
  return {
    hostname: url.hostname,
    tenantSlugParam: url.searchParams.get("tenant"),
  };
});

/**
 * Resolve the tenant for an SSR request. Single source of truth for every
 * public route and server handler — never duplicate this logic elsewhere.
 *
 * Fail-closed, no exceptions:
 * - Explicit ?tenant= is authoritative: matches or fails closed (null),
 *   never falls back to hostname.
 * - Otherwise resolves strictly by hostname.
 * - No dev/preview host ever falls back to a default/first tenant — an
 *   unmatched host (real domain OR bare preview URL without ?tenant=)
 *   always resolves to null. Callers must treat null as "no tenant" and
 *   fail closed (throw notFound()), never render with a guessed tenant.
 *
 * Never throws — callers get null on any failure.
 */
export async function resolveTenantForSsr(input: {
  hostname: string;
  tenantSlugParam: string | null;
}): Promise<Tenant | null> {
  if (input.tenantSlugParam) {
    try {
      return await fetchTenantBySlug(input.tenantSlugParam);
    } catch {
      // Explicit ?tenant= is authoritative: fail closed, never fall back
      // to hostname.
      return null;
    }
  }
  try {
    return await fetchTenantByHostname(input.hostname);
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
