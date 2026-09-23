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
 * Quatre aperçus, deux par rangée. La page montrait auparavant les quatre
 * sites entiers en quatre colonnes de 300 px : à cette échelle, quatre
 * univers réellement différents se ressemblaient tous, et la page prouvait
 * l'inverse de ce qu'elle affirme. Un fragment lisible convainc davantage
 * qu'un site complet illisible.
 *
 * Ce que la page ne contient pas : aucun témoignage, aucun chiffre de
 * résultat, aucun nom de client. Les quatre entreprises sont fictives et le
 * disent, en introduction et sous chaque aperçu.
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
            {/* Une phrase, au-dessus de la ligne de flottaison : quelqu'un qui
                arrive ici depuis une recherche doit savoir que ce ne sont pas
                des clients avant de faire défiler. Réduite d'un paragraphe à
                une ligne, pas déplacée dans les cartes. */}
            <p className="mt-5 max-w-[60ch] text-sm font-medium leading-relaxed text-[var(--supordo-graphite)]/80">
              Ces quatre entreprises sont fictives : elles montrent le produit, jamais un client, un
              témoignage ou un résultat.
            </p>
          </div>
        </section>

        <section className="bg-[var(--supordo-mint-100)] py-14 md:py-18 lg:py-24">
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            {/* Deux colonnes, jamais quatre : à 1440 px chaque aperçu occupe
                près de 600 px, largeur à laquelle le texte du site se lit et
                où une identité se distingue d'une autre. Le décalage vertical
                d'une colonne sur deux évite l'effet catalogue — quatre cadres
                alignés au cordeau donnent l'impression de quatre variantes du
                même gabarit, ce qui est exactement l'inverse de la
                démonstration. */}
            <ul className="grid gap-x-8 gap-y-14 lg:grid-cols-2 lg:gap-y-20">
              {DEMO_TRADES.map((id, index) => {
                const site = DEMO_SITES[id];
                return (
                  <li key={id} className={index % 2 === 1 ? "lg:mt-16" : undefined}>
                    <Link
                      to="/exemples/$demoSlug"
                      params={{ demoSlug: site.slug }}
                      className="group block rounded-[10px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--supordo-green)]"
                    >
                      <div className="transition-transform duration-200 group-hover:-translate-y-1">
                        <SupordoSiteDemo site={site} variant="preview" />
                      </div>

                      <div className="mt-6 flex items-start justify-between gap-6">
                        <div>
                          <h2 className="text-xl font-extrabold leading-tight text-[var(--supordo-forest)] lg:text-2xl">
                            {site.companyName}
                          </h2>
                          <p className="mt-1.5 text-[15px] font-medium text-[var(--supordo-green)]">
                            {site.trade} · {site.city}
                          </p>
                          <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-[var(--supordo-graphite)]">
                            {site.headline}
                          </p>
                        </div>
                        <span
                          aria-hidden="true"
                          className="mt-1 shrink-0 text-2xl text-[var(--supordo-forest)]/30 transition-colors group-hover:text-[var(--supordo-green)]"
                        >
                          →
                        </span>
                      </div>
                      <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--supordo-graphite)]/55">
                        {DEMO_LABEL} — entreprise fictive
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
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
                search={{ src: "examples" }}
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
