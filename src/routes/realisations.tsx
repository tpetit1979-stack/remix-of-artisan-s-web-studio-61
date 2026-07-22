import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "@/hooks/use-tenant";
import { fetchFirstActiveTenant, fetchSiteSettings, fetchPortfolio, fetchServices } from "@/lib/tenant";
import { buildPageTitle } from "@/lib/seo";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { CTABanner } from "@/components/public/CTABanner";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export const Route = createFileRoute("/realisations")({
  loader: async () => {
    const tenant = await fetchFirstActiveTenant();
    const settings = await fetchSiteSettings(tenant.id);
    return { tenant, settings };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { tenant, settings } = loaderData;
    const title = buildPageTitle(settings, tenant, "Nos réalisations");
    const description = `Découvrez les réalisations de ${tenant.company_name}${tenant.city ? ` à ${tenant.city} et dans les environs` : ""}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: RealisationsPage,
});

function RealisationsPage() {
  const { tenant } = useTenant();

  const { data: portfolio = [] } = useQuery({
    queryKey: ["portfolio", tenant?.id],
    queryFn: () => fetchPortfolio(tenant!.id),
    enabled: !!tenant?.id,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["services", tenant?.id],
    queryFn: () => fetchServices(tenant!.id),
    enabled: !!tenant?.id,
  });

  const published = portfolio.filter((p) => p.is_published);

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        <div className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Nos réalisations</h1>
            <p className="mt-2 text-muted-foreground">
              La preuve par l'exemple. Découvrez les projets réalisés par {tenant?.company_name}.
            </p>
            {published.length === 0 ? (
              <p className="mt-8 text-muted-foreground">Aucune réalisation pour le moment.</p>
            ) : (
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {published.map((p) => {
                  const service = services.find((s) => s.id === p.service_id);
                  return (
                    <Card key={p.id} className="overflow-hidden">
                      <img
                        src={p.image_url}
                        alt={p.title}
                        loading="lazy"
                        decoding="async"
                        className="aspect-video w-full object-cover"
                      />
                      <CardContent className="p-4">
                        <h2 className="font-semibold text-foreground">{p.title}</h2>
                        {p.description && (
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {p.city && (
                            <span className="text-xs text-muted-foreground">
                              <MapPin className="mr-1 inline h-3 w-3" />{p.city}
                            </span>
                          )}
                          {service && (
                            <Link
                              to="/services/$serviceSlug"
                              params={{ serviceSlug: service.slug }}
                              className="text-xs text-primary hover:underline"
                            >
                              {service.name}
                            </Link>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <CTABanner title="Un projet similaire ?" subtitle="Contactez-nous pour un devis gratuit et personnalisé." />
      </main>
      <PublicFooter />
    </div>
  );
}
