import { supabase } from "@/integrations/supabase/client";
import type { PortfolioItem } from "./tenant";
import {
  publicView,
  PUBLIC_SITE_SETTINGS_COLUMNS,
  PUBLIC_SERVICE_COLUMNS,
  PUBLIC_SERVICE_AREA_COLUMNS,
  type PublicTenant,
  type PublicSiteSettings,
  type PublicService,
  type PublicServiceArea,
} from "./tenant";

/**
 * Full page data loader for SEO pages — fetches everything needed in one go.
 */
export interface ServiceCityPageData {
  tenant: PublicTenant;
  settings: PublicSiteSettings;
  service: PublicService;
  city: string;
  citySlug: string;
  area: PublicServiceArea;
  allAreas: PublicServiceArea[];
  relatedPortfolio: PortfolioItem[];
  allServices: PublicService[];
  sameServiceAreas: PublicServiceArea[];
}

export async function loadServiceCityPage(
  tenant: PublicTenant,
  serviceSlug: string,
  citySlug: string,
): Promise<ServiceCityPageData | null> {
  // Fetch settings
  const settingsResult = await publicView("public_site_settings")
    .select(PUBLIC_SITE_SETTINGS_COLUMNS)
    .eq("tenant_id", tenant.id)
    .single();
  const settings = settingsResult.data as PublicSiteSettings | null;

  // Fetch the service by slug
  const serviceResult = await publicView("public_services")
    .select(PUBLIC_SERVICE_COLUMNS)
    .eq("tenant_id", tenant.id)
    .eq("slug", serviceSlug)
    .single();
  const service = serviceResult.data as PublicService | null;

  if (!service) return null;

  // Fetch the specific area
  const areaResult = await publicView("public_service_areas")
    .select(PUBLIC_SERVICE_AREA_COLUMNS)
    .eq("tenant_id", tenant.id)
    .eq("service_id", service.id)
    .eq("city_slug", citySlug)
    .single();
  const area = areaResult.data as PublicServiceArea | null;

  if (!area) return null;

  // Fetch all areas for this tenant (for internal linking)
  const allAreasResult = await publicView("public_service_areas")
    .select(PUBLIC_SERVICE_AREA_COLUMNS)
    .eq("tenant_id", tenant.id)
    .order("city", { ascending: true });
  const allAreas = (allAreasResult.data ?? []) as PublicServiceArea[];

  // Fetch areas for the same service (for city links)
  const sameServiceAreas = allAreas.filter(
    (a) => a.service_id === service.id && a.city_slug !== citySlug,
  );

  // Fetch all active services (for service links) — public_services already
  // filters is_active=true, no extra .eq() needed.
  const allServicesResult = await publicView("public_services")
    .select(PUBLIC_SERVICE_COLUMNS)
    .eq("tenant_id", tenant.id)
    .order("sort_order", { ascending: true });
  const allServices = (allServicesResult.data ?? []) as PublicService[];

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
