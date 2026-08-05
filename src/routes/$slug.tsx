import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { loadServiceCityPage, type ServiceCityPageData } from "@/lib/tenant-loader";
import { generateSeoTitle, generateSeoDescription, generateH1, generateIntroText, generateJsonLd, generateServiceJsonLd } from "@/lib/seo";
import type { Service, ServiceArea, PortfolioItem } from "@/lib/tenant";
import { resolveTenantInputForRoute, resolveTenantForSsr } from "@/lib/tenant";
import { usePreviewTenantSearch } from "@/hooks/use-tenant";
import { useCommercialPromises } from "@/hooks/use-commercial-promises";
import { useEditorialTexts } from "@/hooks/use-editorial-texts";
import { supabase } from "@/integrations/supabase/client";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { CTABanner } from "@/components/public/CTABanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, MapPin, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/$slug")({
  loader: async ({ params }) => {
    const slug = params.slug;

    const input = await resolveTenantInputForRoute();
    const tenant = await resolveTenantForSsr(input);
    if (!tenant) throw notFound();

    const { data: areas } = await supabase
      .from("service_areas")
      .select("*, services!inner(slug, is_active)")
      .eq("tenant_id", tenant.id);

    const match = (areas ?? []).find((a: any) => {
      const serviceSlug = a.services?.slug;
      const combined = `${serviceSlug}-${a.city_slug}`;
      return combined === slug && a.services?.is_active;
    });

    if (!match) throw notFound();

    const serviceSlug = (match as any).services.slug;
    const data = await loadServiceCityPage(tenant, serviceSlug, match.city_slug);
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { service, city, citySlug, tenant, settings, allAreas } = loaderData;
    const title = generateSeoTitle(service, city, tenant);
    const description = generateSeoDescription(service, city, tenant, settings);
    const pageUrl = tenant.domain ? `https://${tenant.domain}/${service.slug}-${citySlug}` : "";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            generateJsonLd(service, city, tenant, settings, pageUrl),
          ),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(generateServiceJsonLd(service, tenant, allAreas)),
        },
      ],
    };
  },
  component: ServiceCityPage,
  notFoundComponent: () => {
    const previewTenant = usePreviewTenantSearch();
    return (
      <div className="flex min-h-screen flex-col">
        <PublicHeader />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground">Page non trouvée</h1>
            <p className="mt-2 text-muted-foreground">Ce service ou cette ville n'existe pas.</p>
            <Link to="/" search={previewTenant} className="mt-4 inline-block text-primary hover:underline">Retour à l'accueil</Link>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  },
});

function ServiceCityPage() {
  const data = Route.useLoaderData() as ServiceCityPageData;
  const {
    tenant,
    settings,
    service,
    city,
    relatedPortfolio,
    allServices,
    sameServiceAreas,
    allAreas,
  } = data;

  const h1 = generateH1(service, city, tenant);
  const introText = generateIntroText(service, city, tenant);

  const previewTenant = usePreviewTenantSearch();
  const { responseTimeNote } = useCommercialPromises();
  const { buttonLabel } = useEditorialTexts();
  const otherServices = allServices.filter((s: Service) => s.id !== service.id);

  const crossLinks = allAreas
    .filter((a: ServiceArea) => a.city === city && a.service_id !== service.id)
    .map((a: ServiceArea) => {
      const s = allServices.find((sv: Service) => sv.id === a.service_id);
      return s ? { service: s, area: a } : null;
    })
    .filter(Boolean) as Array<{ service: Service; area: ServiceArea }>;

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      <main className="flex-1">
        <section className="bg-primary/5 py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {h1}
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                {introText}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/contact" search={{ service: service.id, ...previewTenant }}>
                  <Button size="lg">{buttonLabel}</Button>
                </Link>
                {tenant.phone && (
                  <a href={`tel:${tenant.phone}`}>
                    <Button variant="outline" size="lg">
                      <Phone className="mr-2 h-4 w-4" />
                      {tenant.phone}
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {service.description && (
          <section className="py-12 lg:py-16">
            <div className="mx-auto max-w-7xl px-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Notre expertise en {service.name.toLowerCase()}
              </h2>
              <div className="mt-4 max-w-3xl text-muted-foreground leading-relaxed">
                <p>{service.description}</p>
              </div>
            </div>
          </section>
        )}

        <section className="bg-muted/30 py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="text-2xl font-semibold text-foreground">
              <MapPin className="mr-2 inline h-6 w-6" />
              Zone d'intervention — {service.name}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {tenant.company_name} intervient à {city} et dans les communes voisines pour vos besoins en {service.name.toLowerCase()}.
            </p>
            {sameServiceAreas.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {sameServiceAreas.map((a: ServiceArea) => (
                  <Link
                    key={a.id}
                    to="/$slug"
                    params={{ slug: `${service.slug}-${a.city_slug}` }}
                    search={previewTenant}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                  >
                    {a.city}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {relatedPortfolio.length > 0 && (
          <section className="py-12 lg:py-16">
            <div className="mx-auto max-w-7xl px-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Nos réalisations{city ? ` à ${city}` : ""}
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPortfolio.slice(0, 6).map((p: PortfolioItem) => (
                  <Card key={p.id} className="overflow-hidden">
                    <img
                      src={p.image_url}
                      alt={p.title}
                      className="aspect-video w-full object-cover"
                      loading="lazy"
                    />
                    <CardContent className="p-4">
                      <h3 className="font-medium text-foreground">{p.title}</h3>
                      {p.description && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                      )}
                      {p.city && (
                        <span className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />{p.city}
                        </span>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link to="/realisations" search={previewTenant}>
                  <Button variant="outline">
                    Voir toutes nos réalisations <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {crossLinks.length > 0 && (
          <section className="bg-muted/30 py-12 lg:py-16">
            <div className="mx-auto max-w-7xl px-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Nos autres services à {city}
              </h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {crossLinks.map(({ service: s, area: a }) => (
                  <Link
                    key={a.id}
                    to="/$slug"
                    params={{ slug: `${s.slug}-${a.city_slug}` }}
                    search={previewTenant}
                    className="group rounded-lg border border-border bg-background p-4 transition-colors hover:border-primary"
                  >
                    <h3 className="font-medium text-foreground group-hover:text-primary">
                      {s.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {s.name} à {city} par {tenant.company_name}
                    </p>
                    <span className="mt-2 inline-flex items-center text-sm text-primary">
                      En savoir plus <ArrowRight className="ml-1 h-3 w-3" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {otherServices.length > 0 && crossLinks.length === 0 && (
          <section className="bg-muted/30 py-12 lg:py-16">
            <div className="mx-auto max-w-7xl px-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Découvrez nos autres services
              </h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {otherServices.map((s: Service) => (
                  <Link
                    key={s.id}
                    to="/services/$serviceSlug"
                    params={{ serviceSlug: s.slug }}
                    search={previewTenant}
                    className="group rounded-lg border border-border bg-background p-4 transition-colors hover:border-primary"
                  >
                    <h3 className="font-medium text-foreground group-hover:text-primary">
                      {s.name}
                    </h3>
                    {s.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{s.description}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <CTABanner
          title={`Besoin d'un devis pour ${service.name.toLowerCase()} à ${city} ?`}
          subtitle={`Contactez ${tenant.company_name} dès maintenant. ${responseTimeNote}`}
          serviceId={service.id}
        />
      </main>

      <PublicFooter />
    </div>
  );
}
