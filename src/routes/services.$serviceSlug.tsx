import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTenant, usePreviewTenantSearch } from "@/hooks/use-tenant";
import { useCommercialPromises } from "@/hooks/use-commercial-promises";
import { useEditorialTexts } from "@/hooks/use-editorial-texts";
import {
  fetchPublicSiteSettings,
  fetchPublicServiceAreas,
  fetchPortfolio,
  fetchServices,
  resolveTenantInputForRoute,
  resolveTenantForSsr,
} from "@/lib/tenant";
import { buildPageTitle } from "@/lib/seo";
import { resolveCommercialPromises } from "@/lib/commercial-promises";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { CTABanner } from "@/components/public/CTABanner";
import { ServiceMedia } from "@/components/public/ServiceMedia";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, MapPin, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/services/$serviceSlug")({
  loader: async ({ params }) => {
    const input = await resolveTenantInputForRoute();
    const tenant = await resolveTenantForSsr(input);
    if (!tenant) throw notFound();
    const [settings, services] = await Promise.all([
      fetchPublicSiteSettings(tenant.id),
      fetchServices(tenant.id),
    ]);
    const service = services.find((s) => s.slug === params.serviceSlug);
    if (!service) throw notFound();
    return { tenant, settings, service };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { tenant, settings, service } = loaderData;
    const title = buildPageTitle(settings, tenant, service.name);
    const { seoCtaSuffix } = resolveCommercialPromises({
      quoteIsFree: settings?.quote_is_free ?? null,
      quoteResponseDelayHours: settings?.quote_response_delay_hours ?? null,
      emergencyServiceAvailable: settings?.emergency_service_available ?? null,
      ctaText: settings?.cta_text ?? null,
    });
    const description =
      service.description ||
      `${service.name} par ${tenant.company_name}. Intervention rapide.${seoCtaSuffix ? ` ${seoCtaSuffix}` : ""}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ServiceDetailPage,
});

function ServiceDetailPage() {
  const { serviceSlug } = Route.useParams();
  const { tenant } = useTenant();
  const previewTenant = usePreviewTenantSearch();
  const { responseTimeNote } = useCommercialPromises();
  const { buttonLabel } = useEditorialTexts();

  const { data: services = [] } = useQuery({
    queryKey: ["services", tenant?.id],
    queryFn: () => fetchServices(tenant!.id),
    enabled: !!tenant?.id,
  });

  const service = services.find((s) => s.slug === serviceSlug);

  const { data: areas = [] } = useQuery({
    queryKey: ["service-areas", tenant?.id],
    queryFn: () => fetchPublicServiceAreas(tenant!.id),
    enabled: !!tenant?.id,
  });

  const { data: portfolio = [] } = useQuery({
    queryKey: ["portfolio", tenant?.id],
    queryFn: () => fetchPortfolio(tenant!.id),
    enabled: !!tenant?.id,
  });

  if (!tenant || !service) {
    return (
      <div className="flex min-h-screen flex-col">
        <PublicHeader />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
        <PublicFooter />
      </div>
    );
  }

  const serviceAreas = areas.filter((a) => a.service_id === service.id);
  const relatedPortfolio = portfolio.filter((p) => p.service_id === service.id && p.is_published);
  const otherServices = services.filter((s) => s.id !== service.id);

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary/5 py-14 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-2 lg:items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                {service.name}
              </h1>
              {service.description && (
                <p className="mt-6 max-w-3xl text-lg text-muted-foreground">{service.description}</p>
              )}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/contact" search={{ service: service.id, ...previewTenant }}>
                  <Button size="lg">{buttonLabel}</Button>
                </Link>
                {tenant.phone && (
                <a href={`tel:${tenant.phone.replace(/\s/g, "")}`}>
                  <Button variant="outline" size="lg">
                    <Phone className="mr-2 h-4 w-4" />{tenant.phone}
                  </Button>
                </a>
              )}
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl shadow-elegant">
              <ServiceMedia service={service} />
            </div>
          </div>
        </section>

        {/* Zones */}
        {serviceAreas.length > 0 && (
          <section className="py-12 lg:py-16">
            <div className="mx-auto max-w-7xl px-4">
              <h2 className="text-2xl font-semibold text-foreground">
                {service.name} — nos zones d'intervention
              </h2>
              <div className="mt-6 flex flex-wrap gap-2">
                {serviceAreas.map((a) => (
                  <Link
                    key={a.id}
                    to="/$slug"
                    params={{ slug: `${service.slug}-${a.city_slug}` }}
                    search={previewTenant}
                    className="rounded-full border border-border bg-background px-4 py-2 text-sm transition-colors hover:border-primary hover:text-primary"
                  >
                    <MapPin className="mr-1 inline h-3 w-3" />
                    {a.city}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Portfolio */}
        {relatedPortfolio.length > 0 && (
          <section className="bg-muted/30 py-12 lg:py-16">
            <div className="mx-auto max-w-7xl px-4">
              <h2 className="text-2xl font-semibold text-foreground">Nos réalisations</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPortfolio.slice(0, 6).map((p) => (
                  <Card key={p.id} className="overflow-hidden">
                    <img
                      src={p.image_url}
                      alt={p.title}
                      loading="lazy"
                      decoding="async"
                      className="aspect-video w-full object-cover"
                    />
                    <CardContent className="p-4">
                      <h3 className="font-medium text-foreground">{p.title}</h3>
                      {p.city && <span className="text-xs text-muted-foreground"><MapPin className="mr-1 inline h-3 w-3" />{p.city}</span>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Other services */}
        {otherServices.length > 0 && (
          <section className="py-12 lg:py-16">
            <div className="mx-auto max-w-7xl px-4">
              <h2 className="text-2xl font-semibold text-foreground">Nos autres services</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {otherServices.map((s) => (
                  <Link key={s.id} to="/services/$serviceSlug" params={{ serviceSlug: s.slug }} search={previewTenant}>
                    <Card className="group h-full overflow-hidden transition-colors hover:border-primary">
                      <ServiceMedia service={s} />
                      <CardContent className="p-4">
                        <h3 className="font-medium text-foreground group-hover:text-primary">{s.name}</h3>
                        <span className="mt-2 inline-flex items-center text-sm text-primary">
                          Découvrir <ArrowRight className="ml-1 h-3 w-3" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <CTABanner
          title={`Besoin de ${service.name.toLowerCase()} ?`}
          subtitle={`Contactez ${tenant.company_name} pour un devis personnalisé. ${responseTimeNote}`}
          serviceId={service.id}
        />
      </main>
      <PublicFooter />
    </div>
  );
}
