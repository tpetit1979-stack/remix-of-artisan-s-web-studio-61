import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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
import { isAuthenticPublicPortfolioItem } from "@/lib/portfolio";
import { buildFaqItems, buildFaqJsonLd } from "@/lib/faq";
import { resolveCommercialPromises } from "@/lib/commercial-promises";
import { useCommercialPromises } from "@/hooks/use-commercial-promises";
import { useEditorialTexts } from "@/hooks/use-editorial-texts";
import { supabase } from "@/integrations/supabase/client";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { HeroSection } from "@/components/public/HeroSection";
import { SupordoLanding } from "@/components/marketing/SupordoLanding";

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
import { PortfolioCard } from "@/components/public/PortfolioCard";
import { PortfolioViewer, type PortfolioViewerItem } from "@/components/public/PortfolioViewer";
import { ArrowRight, MapPin } from "lucide-react";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    // Platform host at "/" (supordo.com) = SUPORDO brand landing, resolved in
    // __root's beforeLoad. No tenant is resolved and no tenant data is
    // fetched here — a tenant hostname takes the branch below, unchanged.
    if (context.isPlatformLanding) {
      // La landing de marque n'interroge plus la capacité de réception : ses
      // appels à l'action mènent à /demarrer, qui dit lui-même si une demande
      // peut être reçue aujourd'hui. Aucune donnée de tenant n'est chargée.
      return { platformLanding: true as const };
    }
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
    return {
      platformLanding: false as const,
      tenant,
      settings,
      services,
      areas,
      certifications: certifications ?? [],
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    if (loaderData.platformLanding) {
      const title = "Site internet professionnel pour artisans | SUPORDO";
      const description =
        "SUPORDO prépare des sites internet professionnels pour les artisans et entreprises de terrain. Présentez vos prestations, vos zones d'intervention et vos réalisations.";
      return {
        meta: [
          { title },
          { name: "description", content: description },
          { property: "og:title", content: title },
          { property: "og:description", content: description },
        ],
      };
    }
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
          children: JSON.stringify(
            buildSiteJsonLd(tenant, settings, services, areas, certifications, baseUrl),
          ),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(buildFaqJsonLd(buildFaqItems(tenant, promises))),
        },
      ],
    };
  },
  component: HomeRoute,
});

/**
 * "/" serves two different products depending on the hostname:
 * - the platform host (supordo.com) → the SUPORDO brand landing;
 * - any tenant hostname → that artisan's public site, unchanged.
 * The switch lives here (not inside TenantHomePage) so the artisan site's
 * component and all its tenant hooks are untouched.
 */
function HomeRoute() {
  const data = Route.useLoaderData();
  if (data?.platformLanding) return <SupordoLanding />;
  return <TenantHomePage />;
}

function TenantHomePage() {
  const { tenant, settings, isLoading, error } = useTenant();
  const previewTenant = usePreviewTenantSearch();
  const { responseTimeNote } = useCommercialPromises();
  const { buttonLabel } = useEditorialTexts();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
          Une erreur est survenue lors du chargement des informations. Veuillez réessayer dans
          quelques instants.
        </p>
        <a href="/" className="text-sm font-medium text-primary hover:underline">
          Retour à l'accueil
        </a>
      </div>
    );
  }

  const uniqueCities = Array.from(new Set(areas.map((a) => a.city)));
  const publishedPortfolio = portfolio.filter(isAuthenticPublicPortfolioItem);
  const portfolioViewerItems: PortfolioViewerItem[] = publishedPortfolio.map((p) => {
    const service = services.find((s) => s.id === p.service_id);
    return {
      id: p.id,
      title: p.title,
      description: p.description,
      city: p.city,
      imageUrl: p.image_url,
      service: service ? { name: service.name, slug: service.slug } : null,
    };
  });

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
                {portfolioViewerItems.slice(0, 6).map((item, i) => (
                  <PortfolioCard
                    key={item.id}
                    title={item.title}
                    imageUrl={item.imageUrl}
                    city={item.city}
                    serviceName={item.service?.name}
                    onOpen={() => setOpenIndex(i)}
                  />
                ))}
              </div>
              {publishedPortfolio.length > 6 && (
                <div className="mt-8 text-center">
                  <Link to="/realisations" search={previewTenant}>
                    <Button variant="outline" size="lg">
                      Voir toutes nos réalisations
                    </Button>
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

        <SeoLongText
          tenant={tenant}
          services={services}
          cities={uniqueCities}
          settings={settings}
        />

        <CTABanner
          title={`Besoin d'un professionnel à ${tenant.city ?? "proximité"} ?`}
          subtitle={`Appelez-nous maintenant ou remplissez le formulaire. ${responseTimeNote}`}
        />
      </main>

      <PublicFooter />
      <PortfolioViewer
        items={portfolioViewerItems.slice(0, 6)}
        index={openIndex}
        onIndexChange={setOpenIndex}
      />
    </div>
  );
}
