import { createFileRoute } from "@tanstack/react-router";
import {
  resolveTenantForSsr,
  fetchServices,
  fetchPublicServiceAreas,
  hasPublishedPortfolioItem,
} from "@/lib/tenant";
import { buildSitemapXml } from "@/lib/seo";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const tenant = await resolveTenantForSsr({
          hostname: url.hostname,
          tenantSlugParam: url.searchParams.get("tenant"),
        });
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
