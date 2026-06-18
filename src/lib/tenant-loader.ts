import { supabase } from "@/integrations/supabase/client";
import type { Tenant, SiteSettings, Service, ServiceArea, PortfolioItem } from "./tenant";

/**
 * Full page data loader for SEO pages — fetches everything needed in one go.
 */
export interface ServiceCityPageData {
  tenant: Tenant;
  settings: SiteSettings;
  service: Service;
  city: string;
  citySlug: string;
  area: ServiceArea;
  allAreas: ServiceArea[];
  relatedPortfolio: PortfolioItem[];
  allServices: Service[];
  sameServiceAreas: ServiceArea[];
}

export async function loadServiceCityPage(
  serviceSlug: string,
  citySlug: string,
): Promise<ServiceCityPageData | null> {
  // Fetch tenant (first active for now)
  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("is_active", true)
    .limit(1)
    .single();

  if (!tenant) return null;

  // Fetch settings
  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .eq("tenant_id", tenant.id)
    .single();

  // Fetch the service by slug
  const { data: service } = await supabase
    .from("services")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("slug", serviceSlug)
    .eq("is_active", true)
    .single();

  if (!service) return null;

  // Fetch the specific area
  const { data: area } = await supabase
    .from("service_areas")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("service_id", service.id)
    .eq("city_slug", citySlug)
    .single();

  if (!area) return null;

  // Fetch all areas for this tenant (for internal linking)
  const { data: allAreas } = await supabase
    .from("service_areas")
    .select("*")
    .eq("tenant_id", tenant.id)
    .order("city", { ascending: true });

  // Fetch areas for the same service (for city links)
  const sameServiceAreas = (allAreas ?? []).filter(
    (a) => a.service_id === service.id && a.city_slug !== citySlug,
  );

  // Fetch all active services (for service links)
  const { data: allServices } = await supabase
    .from("services")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // Fetch related portfolio items (same service or same city)
  const { data: portfolio } = await supabase
    .from("portfolio")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  const relatedPortfolio = (portfolio ?? []).filter(
    (p) => p.service_id === service.id || p.city === area.city,
  );

  return {
    tenant,
    settings: settings!,
    service,
    city: area.city,
    citySlug,
    area,
    allAreas: allAreas ?? [],
    relatedPortfolio,
    allServices: allServices ?? [],
    sameServiceAreas,
  };
}
