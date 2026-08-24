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
 * Lot 1 sécurité (public data views) — shapes of the public_* views used by
 * every public-facing fetcher below. Hand-written, not `Tables<"public_*">`,
 * because the views aren't in the generated Supabase types yet (Lot 2
 * regenerates them). Deliberately explicit rather than `any`: this is what
 * keeps the `as any` cast in publicView() below from leaking into any
 * component or route — every function that reads a public_* view returns
 * one of these named types, never the raw query result.
 */
export type PublicTenant = Pick<
  Tenant,
  | "id" | "company_name" | "slug" | "domain" | "siret" | "phone" | "email"
  | "address" | "city" | "seo_boost_text" | "tagline" | "years_experience"
  | "trade_template_id" | "google_place_id" | "google_rating" | "google_review_count"
>;

export type PublicSiteSettings = Pick<
  SiteSettings,
  | "tenant_id" | "logo_url" | "favicon_url" | "primary_color" | "hero_title"
  | "hero_subtitle" | "cta_text" | "social_links" | "seo_meta_title"
  | "seo_meta_description" | "hero_image_url" | "border_radius" | "gradient_style"
  | "header_style" | "font_family" | "booking_enabled" | "booking_provider"
  | "booking_url" | "booking_button_label" | "opening_hours" | "quote_is_free"
  | "quote_response_delay_hours" | "emergency_service_available" | "whatsapp_number"
  | "whatsapp_enabled" | "whatsapp_message_template" | "team_presentation_mode"
>;

export type PublicService = Pick<
  Service,
  | "id" | "tenant_id" | "name" | "slug" | "description" | "is_featured" | "sort_order"
  | "trade_service_template_id" | "seo_title_template" | "seo_description_template"
>;

export type PublicServiceArea = Pick<
  ServiceArea,
  "id" | "service_id" | "tenant_id" | "city" | "city_slug" | "is_primary"
>;

/**
 * Lot 1 sécurité (dette temporaire, à supprimer intégralement au Lot 2) —
 * the public_* views don't exist in the generated Database type yet, so the
 * typed Supabase client rejects `.from("public_tenants")` etc. at compile
 * time. This is the ONLY `any` in this lot, confined to this one helper and
 * this one file — never reused as a precedent to leave the cast in place
 * once types.ts is regenerated. Every caller still gets a fully-typed
 * result because each function below declares an explicit return type.
 */
export function publicView(
  name: "public_tenants" | "public_site_settings" | "public_services" | "public_service_areas",
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).from(name);
}

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

export const PUBLIC_TENANT_COLUMNS =
  "id,company_name,slug,domain,siret,phone,email,address,city,seo_boost_text,tagline,years_experience,trade_template_id,google_place_id,google_rating,google_review_count";

export async function fetchTenantByDomain(domain: string): Promise<PublicTenant> {
  const { data, error } = await publicView("public_tenants")
    .select(PUBLIC_TENANT_COLUMNS)
    .eq("domain", domain)
    .single();
  if (error) throw error;
  return data as PublicTenant;
}

export async function fetchTenantBySlug(slug: string): Promise<PublicTenant> {
  const { data, error } = await publicView("public_tenants")
    .select(PUBLIC_TENANT_COLUMNS)
    .eq("slug", slug)
    .single();
  if (error) throw error;
  return data as PublicTenant;
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

export async function fetchTenant(): Promise<PublicTenant> {
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

export async function fetchTenantByHostname(host: string): Promise<PublicTenant | null> {
  const normalized = normalizeHostname(host);
  if (isDevOrPreviewHost(normalized)) return null;
  const { data, error } = await publicView("public_tenants")
    .select(PUBLIC_TENANT_COLUMNS)
    .or(`domain.eq.${normalized},domain.eq.www.${normalized}`)
    .maybeSingle();
  if (error) throw error;
  return data as PublicTenant | null;
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
}): Promise<PublicTenant | null> {
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

// fetchSiteSettings reads the base table directly and stays that way: it's
// shared with useAdminTenant() and TeamManager (Admin/Super Admin), which
// need the full row (e.g. ai_analysis) — not just what the public site
// renders. Public callers must use fetchPublicSiteSettings below instead.
export async function fetchSiteSettings(tenantId: string): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("tenant_id", tenantId)
    .single();
  if (error) throw error;
  return data;
}

export const PUBLIC_SITE_SETTINGS_COLUMNS =
  "tenant_id,logo_url,favicon_url,primary_color,hero_title,hero_subtitle,cta_text,social_links,seo_meta_title,seo_meta_description,hero_image_url,border_radius,gradient_style,header_style,font_family,booking_enabled,booking_provider,booking_url,booking_button_label,opening_hours,quote_is_free,quote_response_delay_hours,emergency_service_available,whatsapp_number,whatsapp_enabled,whatsapp_message_template,team_presentation_mode";

export async function fetchPublicSiteSettings(tenantId: string): Promise<PublicSiteSettings> {
  const { data, error } = await publicView("public_site_settings")
    .select(PUBLIC_SITE_SETTINGS_COLUMNS)
    .eq("tenant_id", tenantId)
    .single();
  if (error) throw error;
  return data as PublicSiteSettings;
}

export const PUBLIC_SERVICE_COLUMNS =
  "id,tenant_id,name,slug,description,is_featured,sort_order,trade_service_template_id,seo_title_template,seo_description_template";

export async function fetchServices(tenantId: string): Promise<PublicService[]> {
  const { data, error } = await publicView("public_services")
    .select(PUBLIC_SERVICE_COLUMNS)
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PublicService[];
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

// fetchServiceAreas reads the base table directly and stays that way: it's
// shared with the Admin dashboard and admin.service-areas.tsx, which need
// every area regardless of whether the linked service is active. Public
// callers must use fetchPublicServiceAreas below instead.
export async function fetchServiceAreas(tenantId: string): Promise<ServiceArea[]> {
  const { data, error } = await supabase
    .from("service_areas")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("city", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export const PUBLIC_SERVICE_AREA_COLUMNS = "id,service_id,tenant_id,city,city_slug,is_primary";

export async function fetchPublicServiceAreas(tenantId: string): Promise<PublicServiceArea[]> {
  const { data, error } = await publicView("public_service_areas")
    .select(PUBLIC_SERVICE_AREA_COLUMNS)
    .eq("tenant_id", tenantId)
    .order("city", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PublicServiceArea[];
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

/**
 * Cheap existence check (PD-001): does this tenant have at least one
 * authentic, published portfolio item? Used to gate discoverability of the
 * whole "Réalisations" feature (route, sitemap) — deliberately a minimal
 * `id`-only query, not a reuse of `fetchPortfolio()`, since callers here
 * only need a boolean, not the full rows.
 */
export async function hasPublishedPortfolioItem(tenantId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("portfolio")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("is_published", true)
    .eq("content_kind", "real_project")
    .limit(1);
  if (error) throw error;
  return (data?.length ?? 0) > 0;
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
