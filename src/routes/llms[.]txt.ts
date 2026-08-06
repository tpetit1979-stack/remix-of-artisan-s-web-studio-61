import { createFileRoute } from "@tanstack/react-router";
import {
  resolveTenantForSsr,
  fetchPublicSiteSettings,
  fetchServices,
  fetchPublicServiceAreas,
} from "@/lib/tenant";
import { buildLlmsTxt } from "@/lib/seo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const tenant = await resolveTenantForSsr({
          hostname: url.hostname,
          tenantSlugParam: url.searchParams.get("tenant"),
        });
        if (!tenant) {
          return new Response("", {
            status: 404,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        }
        const [settings, services, areas, { data: certifications }] = await Promise.all([
          fetchPublicSiteSettings(tenant.id),
          fetchServices(tenant.id),
          fetchPublicServiceAreas(tenant.id),
          supabase
            .from("tenant_certifications")
            .select("certification_name, organisme")
            .eq("tenant_id", tenant.id)
            .eq("is_active", true)
            // Skip expired certifications — only keep ones with no end date or a future one.
            .or(`date_fin.is.null,date_fin.gt.${new Date().toISOString()}`),
        ]);
        return new Response(buildLlmsTxt(tenant, settings, services, areas, certifications ?? []), {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
