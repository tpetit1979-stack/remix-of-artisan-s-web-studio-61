import { createFileRoute } from "@tanstack/react-router";
import {
  isMarketingHost,
  resolveTenantForSsr,
  fetchServices,
  fetchPublicServiceAreas,
  hasPublishedPortfolioItem,
} from "@/lib/tenant";
import { buildSitemapXml, buildSitemapXmlFromPaths } from "@/lib/seo";
import { MARKETING_SITEMAP_PATHS } from "@/data/marketing/supordo-nav";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const tenant = await resolveTenantForSsr({
          hostname: url.hostname,
          tenantSlugParam: url.searchParams.get("tenant"),
        });
        // Hôte SUPORDO : le sitemap est celui du site marketing. Sans cette
        // branche, l'absence de tenant produisait le sitemap « d'un tenant
        // vide » — donc /services et /contact, deux chemins qui n'existent
        // pas sur supordo.com. La liste vient de supordo-nav.ts, partagée
        // avec l'en-tête et le pied de page.
        if (!tenant && isMarketingHost(url.hostname)) {
          return new Response(buildSitemapXmlFromPaths(MARKETING_SITEMAP_PATHS, url.origin), {
            headers: {
              "Content-Type": "application/xml; charset=utf-8",
              "Cache-Control": "public, max-age=3600",
            },
          });
        }
        if (!tenant) {
          return new Response(buildSitemapXml([], [], false, url.origin), {
            headers: {
              "Content-Type": "application/xml; charset=utf-8",
              "Cache-Control": "public, max-age=3600",
            },
          });
        }
        const [services, areas, hasPortfolio] = await Promise.all([
          fetchServices(tenant.id),
          fetchPublicServiceAreas(tenant.id),
          hasPublishedPortfolioItem(tenant.id),
        ]);
        const baseUrl = tenant.domain ? `https://${tenant.domain}` : url.origin;
        return new Response(buildSitemapXml(services, areas, hasPortfolio, baseUrl), {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
