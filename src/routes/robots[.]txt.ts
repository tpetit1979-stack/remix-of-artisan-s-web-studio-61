import { createFileRoute } from "@tanstack/react-router";
import { resolveTenantForSsr } from "@/lib/tenant";
import { buildRobotsTxt } from "@/lib/seo";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const tenant = await resolveTenantForSsr({
          hostname: url.hostname,
          tenantSlugParam: url.searchParams.get("tenant"),
        });
        const baseUrl = tenant?.domain ? `https://${tenant.domain}` : url.origin;
        return new Response(buildRobotsTxt(baseUrl), {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
