import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "@/hooks/use-tenant";
import { fetchFirstActiveTenant, fetchSiteSettings, fetchServices } from "@/lib/tenant";
import { buildPageTitle } from "@/lib/seo";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { CTABanner } from "@/components/public/CTABanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/services/")({
  loader: async () => {
    const tenant = await fetchFirstActiveTenant();
    const [settings, services] = await Promise.all([
      fetchSiteSettings(tenant.id),
      fetchServices(tenant.id),
    ]);
    return { tenant, settings, services };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { tenant, settings, services } = loaderData;
    const title = buildPageTitle(settings, tenant, "Nos services");
    const topServiceNames = services.slice(0, 3).map((s) => s.name).join(", ");
    const description = topServiceNames
      ? `${tenant.company_name} vous propose : ${topServiceNames}${services.length > 3 ? " et plus encore" : ""}.`
      : `Découvrez l'ensemble des services proposés par ${tenant.company_name}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ServicesPage,
});

function ServicesPage() {
  const { tenant, settings } = useTenant();

  const { data: services = [] } = useQuery({
    queryKey: ["services", tenant?.id],
    queryFn: () => fetchServices(tenant!.id),
    enabled: !!tenant?.id,
  });

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        <div className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Nos services</h1>
            <p className="mt-2 text-muted-foreground">
              {tenant?.company_name} vous propose une gamme complète de services professionnels.
            </p>
            {services.length === 0 ? (
              <div className="mt-10 rounded-lg border border-dashed border-border py-16 text-center">
                <p className="text-muted-foreground">Aucun service disponible pour le moment.</p>
                <Link to="/contact" className="mt-4 inline-block">
                  <Button size="lg">Contactez-nous</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {services.map((s) => (
                    <Link key={s.id} to="/services/$serviceSlug" params={{ serviceSlug: s.slug }}>
                      <Card className="group h-full transition-all hover:border-primary hover:shadow-md">
                        <CardContent className="flex h-full flex-col p-6">
                          <h2 className="text-lg font-semibold text-foreground group-hover:text-primary">
                            {s.name}
                          </h2>
                          {s.description && (
                            <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-3">{s.description}</p>
                          )}
                          <span className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                            En savoir plus <ArrowRight className="ml-1 h-3 w-3" />
                          </span>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
                <div className="mt-10 text-center">
                  <Link to="/contact">
                    <Button size="lg">{settings?.cta_text ?? "Demander un devis"}</Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        <CTABanner />
      </main>
      <PublicFooter />
    </div>
  );
}
