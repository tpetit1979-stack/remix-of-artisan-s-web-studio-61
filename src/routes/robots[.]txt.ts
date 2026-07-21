import { createFileRoute } from "@tanstack/react-router";
import { fetchFirstActiveTenant } from "@/lib/tenant";
import { buildRobotsTxt } from "@/lib/seo";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const tenant = await fetchFirstActiveTenant();
        const baseUrl = tenant.domain ? `https://${tenant.domain}` : new URL(request.url).origin;
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
