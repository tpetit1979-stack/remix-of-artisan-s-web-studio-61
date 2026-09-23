import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { resolveMarketingRoute } from "@/lib/tenant";
import { buildMarketingHead } from "@/lib/seo";
import { SupordoHeader } from "@/components/marketing/SupordoHeader";
import { SupordoFooter } from "@/components/marketing/SupordoFooter";
import { SupordoSiteDemo } from "@/components/marketing/SupordoSiteDemo";
import { DEMO_SITE_BY_SLUG, DEMO_LABEL } from "@/data/marketing/supordo-demo-site";
import { TRADE_PAGES } from "@/data/marketing/supordo-trade-pages";

/**
 * `/exemples/<entreprise>` — une démonstration en grand.
 *
 * La page montre le site, puis explique brièvement ce qu'il faut y regarder.
 * Elle ne reproduit pas la page d'accueil marketing : quelqu'un qui arrive
 * ici veut voir le résultat, pas relire l'argumentaire. Trois liens en
 * sortent — les autres exemples, le métier correspondant, et l'action.
 *
 * Le slug est résolu contre `DEMO_SITE_BY_SLUG` ; tout autre segment lève
 * `notFound()` plutôt que de rendre une page vide.
 */
export const Route = createFileRoute("/exemples/$demoSlug")({
  loader: async ({ params }) => {
    const marketing = await resolveMarketingRoute();
    if (!marketing) throw notFound();
    const site = DEMO_SITE_BY_SLUG[params.demoSlug];
    if (!site) throw notFound();
    return { ...marketing, demoSlug: params.demoSlug };
  },
  head: ({ loaderData, params }) => {
    const site = DEMO_SITE_BY_SLUG[params.demoSlug];
    if (!site) return {};
    return buildMarketingHead({
      title: `${site.companyName} — exemple de site ${site.trade.toLowerCase()} | SUPORDO`,
      description: `Démonstration SUPORDO : ${site.headline}. Entreprise fictive, présentée pour montrer le résultat d'un site préparé avec SUPORDO.`,
      path: `/exemples/${params.demoSlug}`,
      canonicalOrigin: loaderData?.canonicalOrigin ?? null,
    });
  },
  component: ExempleDetailPage,
});

function ExempleDetailPage() {
  const { demoSlug } = Route.useLoaderData();
  const site = DEMO_SITE_BY_SLUG[demoSlug]!;
  const tradePage = TRADE_PAGES.find((page) => page.demo === site.id);

  return (
    <div className="supordo-brand flex min-h-screen flex-col bg-[var(--supordo-warm)] antialiased">
      <SupordoHeader />

      <main className="flex-1">
        <section className="border-b border-[var(--supordo-mint-200)] py-12 md:py-16">
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <Link
              to="/exemples"
              className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--supordo-graphite)] underline underline-offset-4 transition-colors hover:text-[var(--supordo-green)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-green)]"
            >
              Tous les exemples
            </Link>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-[var(--supordo-green)] lg:text-sm">
              {DEMO_LABEL} — entreprise fictive
            </p>
            <h1 className="mt-3 max-w-[20ch] text-[2rem] font-extrabold leading-[1.1] text-[var(--supordo-forest)] sm:text-[2.5rem] lg:text-[3rem]">
              {site.companyName}
            </h1>
            <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
              {site.trade} à {site.city}. {site.headline}.
            </p>
          </div>
        </section>

        <section className="bg-[var(--supordo-mint-100)] py-12 md:py-16 lg:py-20">
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <div className="hidden lg:block">
              <SupordoSiteDemo site={site} variant="desktop" />
            </div>
            <div className="mx-auto max-w-[420px] lg:hidden">
              <SupordoSiteDemo site={site} variant="mobile" />
            </div>
            <p className="mt-4 text-xs text-[var(--supordo-graphite)]/70">
              {DEMO_LABEL} — entreprise, coordonnées et communes fictives. Les images illustrent le
              métier ; elles ne représentent le chantier d'aucun client.
            </p>
          </div>
        </section>

        <section className="py-14 md:py-18 lg:py-20">
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <h2 className="text-[1.5rem] font-extrabold leading-[1.15] text-[var(--supordo-forest)] sm:text-[1.875rem]">
              Ce que ce site montre
            </h2>
            <dl className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--supordo-graphite)]/70">
                  Prestations
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-[var(--supordo-graphite)]">
                  {site.services.map((service) => service.name).join(" · ")}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--supordo-graphite)]/70">
                  Zone d'intervention
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-[var(--supordo-graphite)]">
                  {site.areas.join(" · ")}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--supordo-graphite)]/70">
                  Réalisations
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-[var(--supordo-graphite)]">
                  {site.projects.length > 0
                    ? site.projects.map((project) => project.title).join(" · ")
                    : "Aucune pour l'instant — un site neuf reste présentable, et la section apparaît le jour où la première photo arrive."}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="border-t border-[var(--supordo-mint-200)] bg-[var(--supordo-mint-100)] py-14 md:py-18 lg:py-20">
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <h2 className="max-w-[26ch] text-[1.5rem] font-extrabold leading-[1.15] text-[var(--supordo-forest)] sm:text-[1.875rem]">
              Votre site partira de votre métier et de vos informations.
            </h2>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/demarrer"
                className="inline-flex min-h-[52px] items-center justify-center rounded-[6px] bg-[var(--supordo-green)] px-7 text-base font-semibold text-white transition-colors hover:bg-[var(--supordo-green-hover)] active:bg-[var(--supordo-forest)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-forest)]"
              >
                Demander mon site
              </Link>
              {tradePage && (
                <Link
                  to="/metiers/$tradeSlug"
                  params={{ tradeSlug: tradePage.slug }}
                  className="inline-flex min-h-[52px] items-center justify-center rounded-[6px] px-4 text-base font-semibold text-[var(--supordo-forest)] underline underline-offset-4 transition-colors hover:text-[var(--supordo-green)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-green)]"
                >
                  SUPORDO pour un {tradePage.label.toLowerCase()}
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      <SupordoFooter />
    </div>
  );
}
