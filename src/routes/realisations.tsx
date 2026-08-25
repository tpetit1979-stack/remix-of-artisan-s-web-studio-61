import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTenant } from "@/hooks/use-tenant";
import { useCommercialPromises } from "@/hooks/use-commercial-promises";
import {
  resolveTenantInputForRoute,
  resolveTenantForSsr,
  fetchPublicSiteSettings,
  fetchPortfolio,
  fetchServices,
  hasPublishedPortfolioItem,
} from "@/lib/tenant";
import { buildPageTitle } from "@/lib/seo";
import { isAuthenticPublicPortfolioItem } from "@/lib/portfolio";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { CTABanner } from "@/components/public/CTABanner";
import { PortfolioCard } from "@/components/public/PortfolioCard";
import { PortfolioViewer, type PortfolioViewerItem } from "@/components/public/PortfolioViewer";

export const Route = createFileRoute("/realisations")({
  loader: async () => {
    const input = await resolveTenantInputForRoute();
    const tenant = await resolveTenantForSsr(input);
    if (!tenant) throw notFound();
    // PD-001: a portfolio with no authentic published item must not be
    // publicly reachable — same "hide, never show emptiness" rule already
    // applied to its entry points (header, footer, sitemap).
    if (!(await hasPublishedPortfolioItem(tenant.id))) throw notFound();
    const settings = await fetchPublicSiteSettings(tenant.id);
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
  const { responseTimeNote } = useCommercialPromises();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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

  const published = portfolio.filter(isAuthenticPublicPortfolioItem);
  const viewerItems: PortfolioViewerItem[] = published.map((p) => {
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
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        <div className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Nos réalisations</h1>
            <p className="mt-2 text-muted-foreground">
              La preuve par l'exemple. Découvrez les projets réalisés par {tenant?.company_name}.
            </p>
            {/* The loader already guarantees at least one published item exists
                (PD-001 / US-01) — no empty state to handle here. */}
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {viewerItems.map((item, i) => (
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
          </div>
        </div>

        <CTABanner title="Un projet similaire ?" subtitle={`Contactez-nous pour un devis personnalisé. ${responseTimeNote}`} />
      </main>
      <PublicFooter />
      <PortfolioViewer items={viewerItems} index={openIndex} onIndexChange={setOpenIndex} />
    </div>
  );
}
