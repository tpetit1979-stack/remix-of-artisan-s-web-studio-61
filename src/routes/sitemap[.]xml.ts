import { createFileRoute } from "@tanstack/react-router";
import { resolveTenantForSsr, fetchServices, fetchServiceAreas } from "@/lib/tenant";
import { buildSitemapXml } from "@/lib/seo";
import { supabase } from "@/integrations/supabase/client";

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
        const [services, areas, { data: portfolio }] = await Promise.all([
          fetchServices(tenant.id),
          fetchServiceAreas(tenant.id),
          supabase
            .from("portfolio")
            .select("id")
            .eq("tenant_id", tenant.id)
            .eq("is_published", true)
            .limit(1),
        ]);
        const baseUrl = tenant.domain ? `https://${tenant.domain}` : url.origin;
        const hasPortfolio = (portfolio ?? []).length > 0;
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
