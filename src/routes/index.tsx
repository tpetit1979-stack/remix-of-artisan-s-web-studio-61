import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "@/hooks/use-tenant";
import { fetchServices, fetchServiceAreas, fetchPortfolio } from "@/lib/tenant";
import { supabase } from "@/integrations/supabase/client";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { HeroSection } from "@/components/public/HeroSection";

import { WhyChooseUs } from "@/components/public/WhyChooseUs";
import { CTABanner } from "@/components/public/CTABanner";
import { CertificationBadges } from "@/components/public/CertificationBadges";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, MapPin } from "lucide-react";
import { ResolvedImage } from "@/components/public/ResolvedImage";

export const Route = createFileRoute("/")({
  component: HomePage,
});

/**
 * Build a LocalBusiness JSON-LD blob for the home page from tenant + settings.
 * Only fields with real data are included — never emit empty `address`,
 * `geo` or `openingHours` placeholders that crawlers would penalise.
 */
function buildLocalBusinessJsonLd(
  tenant: NonNullable<ReturnType<typeof useTenant>["tenant"]>,
  settings: ReturnType<typeof useTenant>["settings"],
) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: tenant.company_name,
    ...(settings?.logo_url && { logo: settings.logo_url, image: settings.logo_url }),
    ...(tenant.phone && { telephone: tenant.phone }),
    ...(tenant.email && { email: tenant.email }),
  };

  if (tenant.address || tenant.city) {
    data.address = {
      "@type": "PostalAddress",
      ...(tenant.address && { streetAddress: tenant.address }),
      ...(tenant.city && { addressLocality: tenant.city }),
      addressCountry: "FR",
    };
  }

  // `geo` and `openingHoursSpecification` intentionally omitted —
  // the schema does not yet store latitude/longitude or opening hours.

  return data;
}

function HomePage() {
  const { tenant, settings } = useTenant();

  const { data: services = [] } = useQuery({
    queryKey: ["services", tenant?.id],
    queryFn: () => fetchServices(tenant!.id),
    enabled: !!tenant?.id,
  });

  const { data: areas = [] } = useQuery({
    queryKey: ["service-areas", tenant?.id],
    queryFn: () => fetchServiceAreas(tenant!.id),
    enabled: !!tenant?.id,
  });

  const { data: portfolio = [] } = useQuery({
    queryKey: ["portfolio", tenant?.id],
    queryFn: () => fetchPortfolio(tenant!.id),
    enabled: !!tenant?.id,
  });

  if (!tenant) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const featuredServices = services.filter((s) => s.is_featured);
  const displayServices = featuredServices.length > 0 ? featuredServices : services;
  const uniqueCities = Array.from(new Set(areas.map((a) => a.city)));
  const publishedPortfolio = portfolio.filter((p) => p.is_published);

  const jsonLd = buildLocalBusinessJsonLd(tenant, settings);

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicHeader />

      <main className="flex-1">
        <HeroSection />
        

        {/* Services */}
        {displayServices.length > 0 && (
          <section className="py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                  Nos services
                </h2>
                <p className="mt-4 text-muted-foreground">
                  {tenant.company_name} vous propose des services professionnels adaptés à vos besoins.
                </p>
              </div>

              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {displayServices.map((s) => (
                  <Link key={s.id} to="/services/$serviceSlug" params={{ serviceSlug: s.slug }}>
                    <Card className="group h-full overflow-hidden border-border transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                      <div className="relative overflow-hidden">
                        <ResolvedImage
                          category="service"
                          targetId={s.id}
                          altFallback={s.name}
                          className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                          {s.name}
                        </h3>
                        {s.description && (
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                            {s.description}
                          </p>
                        )}
                        <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary">
                          En savoir plus <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              <div className="mt-10 text-center">
                <Link to="/contact">
                  <Button size="lg" className="h-12 px-8">
                    {settings?.cta_text ?? "Demander un devis"}
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        <WhyChooseUs />

        {/* Certifications RGE - only shown if tenant has certifications */}
        <RgeCertificationsSection />

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
                      <ResolvedImage
                        category="portfolio"
                        targetId={p.id}
                        altFallback={p.title}
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
                  <Link to="/realisations">
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
                      className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium transition-all hover:border-primary hover:text-primary hover:shadow-sm"
                    >
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                      {city}
                    </Link>
                  );
                })}
              </div>
              <div className="mt-10 text-center">
                <Link to="/contact">
                  <Button size="lg" className="h-12 px-8">
                    {settings?.cta_text ?? "Demander un devis"}
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        <CTABanner
          title={`Besoin d'un professionnel à ${tenant.city ?? "proximité"} ?`}
          subtitle="Appelez-nous maintenant ou remplissez le formulaire pour recevoir votre devis gratuit en moins de 24h."
        />
      </main>

      <PublicFooter />
    </div>
  );
}

function RgeCertificationsSection() {
  const { tenant } = useTenant();

  const { data: certifications = [] } = useQuery({
    queryKey: ["certifications", tenant?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("tenant_certifications")
        .select("id")
        .eq("tenant_id", tenant!.id)
        .eq("is_active", true)
        .limit(1);
      return data ?? [];
    },
    enabled: !!tenant?.id,
    staleTime: 1000 * 60 * 10,
  });

  if (certifications.length === 0) return null;

  return (
    <section className="border-t border-border bg-muted/30 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-3xl">
          <CertificationBadges variant="full" />
        </div>
      </div>
    </section>
  );
}
