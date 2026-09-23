import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { resolveMarketingRoute } from "@/lib/tenant";
import { buildMarketingHead } from "@/lib/seo";
import { SupordoHeader } from "@/components/marketing/SupordoHeader";
import { SupordoFooter } from "@/components/marketing/SupordoFooter";
import { TRADE_PAGES } from "@/data/marketing/supordo-trade-pages";

/**
 * `/metiers` — SUPORDO part du métier, pas d'un gabarit.
 *
 * Quatre pages pilotes seulement. La taxonomie interne compte davantage de
 * métiers, mais une page publique n'est utile que si elle dit quelque chose
 * de vrai sur ce métier : ouvrir trente-quatre pages d'un coup produirait
 * trente-quatre variantes du même texte, ce qui est exactement ce que ce
 * produit ne fait pas.
 *
 * La page dit explicitement que la liste n'est pas la limite du produit, pour
 * qu'un menuisier ne conclue pas qu'il n'est pas concerné.
 */
export const Route = createFileRoute("/metiers/")({
  loader: async () => {
    const marketing = await resolveMarketingRoute();
    if (!marketing) throw notFound();
    return marketing;
  },
  head: ({ loaderData }) =>
    buildMarketingHead({
      title: "SUPORDO par métier : chauffagiste, plombier, couvreur, électricien",
      description:
        "Ce qu'un site SUPORDO présente selon votre métier : vos prestations, vos zones d'intervention, vos photos et vos coordonnées.",
      path: "/metiers",
      canonicalOrigin: loaderData?.canonicalOrigin ?? null,
    }),
  component: MetiersIndexPage,
});

function MetiersIndexPage() {
  return (
    <div className="supordo-brand flex min-h-screen flex-col bg-[var(--supordo-warm)] antialiased">
      <SupordoHeader />

      <main className="flex-1">
        <section className="border-b border-[var(--supordo-mint-200)] py-16 md:py-20 lg:py-24">
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <h1 className="max-w-[20ch] text-[2rem] font-extrabold leading-[1.1] text-[var(--supordo-forest)] sm:text-[2.5rem] lg:text-[3.25rem]">
              Votre site part de votre métier.
            </h1>
            <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
              Un couvreur et un électricien n'ont pas les mêmes prestations, pas les mêmes urgences
              et pas les mêmes questions à recevoir. Ces pages décrivent ce qu'un site doit
              présenter dans chaque cas.
            </p>
          </div>
        </section>

        <section className="bg-[var(--supordo-mint-100)] py-16 md:py-20 lg:py-24">
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <ul className="grid gap-8 sm:grid-cols-2">
              {TRADE_PAGES.map((page) => (
                <li key={page.slug}>
                  <Link
                    to="/metiers/$tradeSlug"
                    params={{ tradeSlug: page.slug }}
                    className="group flex h-full flex-col rounded-[10px] border border-[var(--supordo-mint-200)] bg-white p-6 transition-colors hover:border-[var(--supordo-green)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-green)] md:p-7"
                  >
                    <img
                      src={page.image}
                      alt={page.imageAlt}
                      loading="lazy"
                      decoding="async"
                      className="h-28 w-28 shrink-0 rounded-[8px] object-cover"
                    />
                    <h2 className="mt-5 text-xl font-extrabold leading-tight text-[var(--supordo-forest)] group-hover:text-[var(--supordo-green)]">
                      {page.label}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--supordo-graphite)]">
                      {page.intro}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mt-10 max-w-[60ch] text-sm leading-relaxed text-[var(--supordo-graphite)]/80">
              Ces quatre pages sont les premières écrites. SUPORDO ne se limite pas à ces métiers :
              si le vôtre n'y figure pas, la demande reste la même.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-20 lg:py-24">
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/demarrer"
                className="inline-flex min-h-[52px] items-center justify-center rounded-[6px] bg-[var(--supordo-green)] px-7 text-base font-semibold text-white transition-colors hover:bg-[var(--supordo-green-hover)] active:bg-[var(--supordo-forest)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-forest)]"
              >
                Demander mon site
              </Link>
              <Link
                to="/exemples"
                className="inline-flex min-h-[52px] items-center justify-center rounded-[6px] px-4 text-base font-semibold text-[var(--supordo-forest)] underline underline-offset-4 transition-colors hover:text-[var(--supordo-green)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-green)]"
              >
                Voir des exemples de sites
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SupordoFooter />
    </div>
  );
}
