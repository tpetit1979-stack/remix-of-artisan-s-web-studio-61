import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTenant, usePreviewTenantSearch } from "@/hooks/use-tenant";
import {
  fetchPublicSiteSettings,
  fetchServices,
  fetchPublicServiceAreas,
  fetchPortfolio,
  resolveTenantInputForRoute,
  resolveTenantForSsr,
} from "@/lib/tenant";
import { buildPageTitle, buildPageDescription, buildSiteJsonLd } from "@/lib/seo";
import { buildFaqItems, buildFaqJsonLd } from "@/lib/faq";
import { resolveCommercialPromises } from "@/lib/commercial-promises";
import { useCommercialPromises } from "@/hooks/use-commercial-promises";
import { useEditorialTexts } from "@/hooks/use-editorial-texts";
import { supabase } from "@/integrations/supabase/client";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { HeroSection } from "@/components/public/HeroSection";

import { WhyChooseUs } from "@/components/public/WhyChooseUs";
import { HowItWorks } from "@/components/public/HowItWorks";
import { FeaturedServices } from "@/components/public/FeaturedServices";
import { CTABanner } from "@/components/public/CTABanner";
import { CertificationBadges } from "@/components/public/CertificationBadges";
import { FaqSection } from "@/components/public/FaqSection";
import { SeoLongText } from "@/components/public/SeoLongText";
import { TeamSection } from "@/components/public/TeamSection";
import { PartnersSection } from "@/components/public/PartnersSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, MapPin } from "lucide-react";

export const Route = createFileRoute("/")({
  loader: async () => {
    const input = await resolveTenantInputForRoute();
    const tenant = await resolveTenantForSsr(input);
    if (!tenant) throw notFound();
    const [settings, services, areas, { data: certifications }] = await Promise.all([
      fetchPublicSiteSettings(tenant.id),
      fetchServices(tenant.id),
      fetchPublicServiceAreas(tenant.id),
      supabase
        .from("tenant_certifications")
        .select("certification_name, organisme")
        .eq("tenant_id", tenant.id)
        .eq("is_active", true),
    ]);
    return { tenant, settings, services, areas, certifications: certifications ?? [] };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { tenant, settings, services, areas, certifications } = loaderData;
    const title = buildPageTitle(settings, tenant);
    const description = buildPageDescription(settings, tenant);
    const baseUrl = tenant.domain ? `https://${tenant.domain}` : "";
    const promises = resolveCommercialPromises({
      quoteIsFree: settings?.quote_is_free ?? null,
      quoteResponseDelayHours: settings?.quote_response_delay_hours ?? null,
      emergencyServiceAvailable: settings?.emergency_service_available ?? null,
      ctaText: settings?.cta_text ?? null,
    });
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(buildSiteJsonLd(tenant, settings, services, areas, certifications, baseUrl)),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(buildFaqJsonLd(buildFaqItems(tenant, promises))),
        },
      ],
    };
  },
  component: HomePage,
});

function HomePage() {
  const { tenant, settings, isLoading, error } = useTenant();
  const previewTenant = usePreviewTenantSearch();
  const { responseTimeNote } = useCommercialPromises();
  const { buttonLabel } = useEditorialTexts();

  const { data: services = [] } = useQuery({
    queryKey: ["services", tenant?.id],
    queryFn: () => fetchServices(tenant!.id),
    enabled: !!tenant?.id,
  });

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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!tenant || error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
        <p className="text-lg font-medium text-foreground">Impossible de charger ce site</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Une erreur est survenue lors du chargement des informations. Veuillez réessayer dans quelques instants.
        </p>
        <a href="/" className="text-sm font-medium text-primary hover:underline">
          Retour à l'accueil
        </a>
      </div>
    );
  }

  const uniqueCities = Array.from(new Set(areas.map((a) => a.city)));
  const publishedPortfolio = portfolio.filter((p) => p.is_published);

  return (
    <div className="flex min-h-screen flex-col pb-20 md:pb-0">
      <PublicHeader />

      <main className="flex-1">
        <HeroSection />

        <FeaturedServices services={services} tenant={tenant} settings={settings} />

        <PartnersSection />

        <HowItWorks />

        <WhyChooseUs />

        <TeamSection />

        {/* Certifications RGE - only shown if tenant has certifications; the
            component (incl. its wrapping <section>) self-hides via its own
            query, see CertificationBadges */}
        <CertificationBadges />

        <CTABanner />

        {/* Portfolio */}
        {publishedPortfolio.length > 0 && (
          <section className="py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4">
              <div className="mx-auto max-w-2xl text-center">
                <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                  Nos travaux
                </span>
                <h2 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
                  Nos réalisations récentes
                </h2>
                <p className="mt-4 text-muted-foreground">
                  La preuve par l'exemple. Découvrez nos interventions.
                </p>
              </div>

              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {publishedPortfolio.slice(0, 6).map((p) => (
                  <Card key={p.id} className="group overflow-hidden border-border transition-all hover:shadow-lg hover:shadow-foreground/5">
                    <div className="relative overflow-hidden">
                      <img
                        src={p.image_url}
                        alt={p.title}
                        loading="lazy"
                        decoding="async"
                        className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-foreground">{p.title}</h3>
                      {p.description && (
                        <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                      )}
                      {p.city && (
                        <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          <MapPin className="h-3 w-3" />{p.city}
                        </span>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              {publishedPortfolio.length > 6 && (
                <div className="mt-8 text-center">
                  <Link to="/realisations" search={previewTenant}>
                    <Button variant="outline" size="lg">Voir toutes nos réalisations</Button>
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Zones */}
        {uniqueCities.length > 0 && (
          <section className="border-t border-border bg-muted/30 py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4">
              <div className="mx-auto max-w-2xl text-center">
                <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                  Notre couverture
                </span>
                <h2 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
                  Zones d'intervention
                </h2>
                <p className="mt-4 text-muted-foreground">
                  {tenant.company_name} se déplace dans toutes ces communes.
                </p>
              </div>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                {uniqueCities.map((city) => {
                  const area = areas.find((a) => a.city === city);
                  const service = area ? services.find((s) => s.id === area.service_id) : null;
                  if (!area || !service) return null;
                  return (
                    <Link
                      key={city}
                      to="/$slug"
                      params={{ slug: `${service.slug}-${area.city_slug}` }}
                      search={previewTenant}
                      className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-all hover:border-primary hover:text-primary hover:shadow-sm"
                    >
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                      {city}
                    </Link>
                  );
                })}
              </div>
              <div className="mt-10 text-center">
                <Link to="/contact" search={previewTenant}>
                  <Button size="lg" className="h-12 px-8">
                    {buttonLabel}
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        <FaqSection />

        <SeoLongText tenant={tenant} services={services} cities={uniqueCities} settings={settings} />

        <CTABanner
          title={`Besoin d'un professionnel à ${tenant.city ?? "proximité"} ?`}
          subtitle={`Appelez-nous maintenant ou remplissez le formulaire. ${responseTimeNote}`}
        />
      </main>

      <PublicFooter />
    </div>
  );
}
