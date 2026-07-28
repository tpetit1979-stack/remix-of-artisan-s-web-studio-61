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
/**
 * hostname/?tenant= read directly from window.location — never through
 * getTenantResolutionInput() client-side, see resolveTenantInputForRoute().
 */
function getClientTenantResolutionInput(): { hostname: string; tenantSlugParam: string | null } {
  return {
    hostname: window.location.hostname,
    tenantSlugParam: new URLSearchParams(window.location.search).get("tenant"),
  };
}

export async function fetchTenant(): Promise<Tenant> {
  if (typeof window === "undefined") throw new Error("fetchTenant is client-only");
  const tenant = await resolveTenantForSsr(getClientTenantResolutionInput());
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
 * Server-only: read the incoming request's URL so a route's loader can
 * resolve the tenant during real SSR. The framework strips the handler
 * body (and this server-only import) from the client bundle.
 *
 * Do not call this directly from a route loader/beforeLoad — use
 * resolveTenantInputForRoute() below instead. Calling this specific
 * function client-side (e.g. on a client-side route transition, which
 * re-runs every loader in the browser) turns it into a network call to
 * its own dedicated /_serverFn/<hash> RPC endpoint, whose URL carries
 * none of the calling page's search string — confirmed in production:
 * tenantSlugParam always reads back as undefined that way, silently
 * breaking every internal ?tenant= link on client-side navigation.
 *
 * Deliberately does NOT return a pathname either, for the same reason:
 * route-type checks must use the router's own `location.pathname` (see
 * __root.tsx), never anything derived from this function.
 */
export const getTenantResolutionInput = createServerFn({ method: "GET" }).handler(async () => {
  const url = getRequestUrl({ xForwardedHost: true });
  return {
    hostname: url.hostname,
    tenantSlugParam: url.searchParams.get("tenant"),
  };
});

/**
 * The {hostname, tenantSlugParam} input for resolveTenantForSsr, safe to
 * call from any public route's loader/beforeLoad on both the server (SSR)
 * and the client (SPA navigation) — see getTenantResolutionInput's own
 * docs for why calling that createServerFn directly is not safe there.
 *
 * Server: getTenantResolutionInput() runs in-process against the real
 * incoming page request — correct.
 * Client (typeof window !== "undefined", i.e. a loader re-running during
 * client-side navigation): reads window.location directly, no server
 * round trip at all — correct by construction, no RPC involved.
 */
export async function resolveTenantInputForRoute(): Promise<{
  hostname: string;
  tenantSlugParam: string | null;
}> {
  if (typeof window !== "undefined") {
    return getClientTenantResolutionInput();
  }
  return getTenantResolutionInput();
}

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
