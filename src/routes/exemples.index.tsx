import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { resolveMarketingRoute } from "@/lib/tenant";
import { buildMarketingHead } from "@/lib/seo";
import { SupordoHeader } from "@/components/marketing/SupordoHeader";
import { SupordoFooter } from "@/components/marketing/SupordoFooter";
import { SupordoSiteDemo } from "@/components/marketing/SupordoSiteDemo";
import { DEMO_TRADES, DEMO_SITES, DEMO_LABEL } from "@/data/marketing/supordo-demo-site";

/**
 * `/exemples` — la page qui répond à une seule question : à quoi ressemble
 * un site fait avec SUPORDO ?
 *
 * Quatre démonstrations côte à côte, dans leur rendu téléphone. Le format
 * n'est pas décoratif : c'est celui où la plupart des visiteurs verront ces
 * sites, et c'est celui où quatre univers différents se comparent d'un coup
 * d'œil. Une capture par entreprise, pas une galerie de fonctionnalités.
 *
 * Ce que la page ne contient pas : aucun témoignage, aucun chiffre de
 * résultat, aucun nom de client. Les quatre entreprises sont fictives et le
 * disent, sur chaque carte et dans l'introduction.
 */
export const Route = createFileRoute("/exemples/")({
  loader: async () => {
    const marketing = await resolveMarketingRoute();
    if (!marketing) throw notFound();
    return marketing;
  },
  head: ({ loaderData }) =>
    buildMarketingHead({
      title: "Exemples de sites internet pour artisans | SUPORDO",
      description:
        "Quatre démonstrations de sites préparés avec SUPORDO : couverture, électricité, plomberie et chauffage. Entreprises fictives, présentées comme telles.",
      path: "/exemples",
      canonicalOrigin: loaderData?.canonicalOrigin ?? null,
    }),
  component: ExemplesIndexPage,
});

function ExemplesIndexPage() {
  return (
    <div className="supordo-brand flex min-h-screen flex-col bg-[var(--supordo-warm)] antialiased">
      <SupordoHeader />

      <main className="flex-1">
        <section className="border-b border-[var(--supordo-mint-200)] py-16 md:py-20 lg:py-24">
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--supordo-green)] lg:text-sm">
              {DEMO_LABEL}
            </p>
            <h1 className="mt-4 max-w-[18ch] text-[2rem] font-extrabold leading-[1.1] text-[var(--supordo-forest)] sm:text-[2.5rem] lg:text-[3.25rem]">
              À quoi ressemble un site fait avec SUPORDO.
            </h1>
            <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
              Quatre entreprises, quatre métiers, quatre univers visuels. Ce qui change : le nom,
              les photos, les prestations, les communes, la couleur et la typographie. Ce qui reste
              : la structure, la lisibilité et le comportement sur téléphone.
            </p>
            <p className="mt-4 max-w-[60ch] text-sm leading-relaxed text-[var(--supordo-graphite)]/80">
              Ces quatre entreprises sont fictives. Elles servent à montrer le produit, pas à
              prétendre des résultats : aucun témoignage, aucun chiffre, aucun nom de client réel ne
              figure sur cette page.
            </p>
          </div>
        </section>

        <section className="bg-[var(--supordo-mint-100)] py-16 md:py-20 lg:py-24">
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {DEMO_TRADES.map((id) => {
                const site = DEMO_SITES[id];
                return (
                  <article key={id} className="flex flex-col">
                    <SupordoSiteDemo site={site} variant="mobile" />
                    <h2 className="mt-5 text-lg font-extrabold leading-tight text-[var(--supordo-forest)]">
                      {site.companyName}
                    </h2>
                    <p className="mt-1 text-sm font-medium text-[var(--supordo-green)]">
                      {site.trade} · {site.city}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--supordo-graphite)]">
                      {site.headline}
                    </p>
                    <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--supordo-graphite)]/60">
                      {DEMO_LABEL} — entreprise fictive
                    </p>
                    <Link
                      to="/exemples/$demoSlug"
                      params={{ demoSlug: site.slug }}
                      className="mt-4 inline-flex min-h-11 items-center self-start rounded-[6px] px-0 text-sm font-semibold text-[var(--supordo-forest)] underline underline-offset-4 transition-colors hover:text-[var(--supordo-green)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-green)]"
                    >
                      Voir {site.companyName}
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 lg:py-24">
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <h2 className="max-w-[24ch] text-[1.75rem] font-extrabold leading-[1.15] text-[var(--supordo-forest)] sm:text-[2.25rem]">
              Votre site partira de votre métier, pas d'un gabarit.
            </h2>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/demarrer"
                className="inline-flex min-h-[52px] items-center justify-center rounded-[6px] bg-[var(--supordo-green)] px-7 text-base font-semibold text-white transition-colors hover:bg-[var(--supordo-green-hover)] active:bg-[var(--supordo-forest)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-forest)]"
              >
                Demander mon site
              </Link>
              <Link
                to="/metiers"
                className="inline-flex min-h-[52px] items-center justify-center rounded-[6px] px-4 text-base font-semibold text-[var(--supordo-forest)] underline underline-offset-4 transition-colors hover:text-[var(--supordo-green)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-green)]"
              >
                Voir par métier
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SupordoFooter />
    </div>
  );
}
