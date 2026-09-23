import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { resolveMarketingRoute } from "@/lib/tenant";
import { buildMarketingHead } from "@/lib/seo";
import { SupordoHeader } from "@/components/marketing/SupordoHeader";
import { SupordoFooter } from "@/components/marketing/SupordoFooter";
import { SupordoSiteDemo } from "@/components/marketing/SupordoSiteDemo";
import { TRADE_PAGE_BY_SLUG } from "@/data/marketing/supordo-trade-pages";
import { DEMO_SITES, DEMO_LABEL } from "@/data/marketing/supordo-demo-site";

/**
 * `/metiers/<métier>` — une seule implémentation pour les quatre pages
 * pilotes, pilotée par `supordo-trade-pages.ts`.
 *
 * La page suit l'ordre d'une conversation : ce que cherche le client du
 * client, ce que le site doit présenter, ce qui compte particulièrement dans
 * ce métier, puis la démonstration correspondante et l'action. Pas de liste
 * de fonctionnalités, pas de bloc de mots-clés : une page de remplissage
 * n'aide ni le lecteur ni personne.
 *
 * Aucune donnée chiffrée n'y figure. Rien de ce que SUPORDO pourrait
 * avancer sur le trafic ou la conversion n'est mesuré aujourd'hui.
 */
export const Route = createFileRoute("/metiers/$tradeSlug")({
  loader: async ({ params }) => {
    const marketing = await resolveMarketingRoute();
    if (!marketing) throw notFound();
    const page = TRADE_PAGE_BY_SLUG[params.tradeSlug];
    if (!page) throw notFound();
    return { ...marketing, tradeSlug: params.tradeSlug };
  },
  head: ({ loaderData, params }) => {
    const page = TRADE_PAGE_BY_SLUG[params.tradeSlug];
    if (!page) return {};
    return buildMarketingHead({
      title: page.metaTitle,
      description: page.metaDescription,
      path: `/metiers/${params.tradeSlug}`,
      canonicalOrigin: loaderData?.canonicalOrigin ?? null,
    });
  },
  component: MetierDetailPage,
});

function MetierDetailPage() {
  const { tradeSlug } = Route.useLoaderData();
  const page = TRADE_PAGE_BY_SLUG[tradeSlug]!;
  const demo = DEMO_SITES[page.demo];

  return (
    <div className="supordo-brand flex min-h-screen flex-col bg-[var(--supordo-warm)] antialiased">
      <SupordoHeader />

      <main className="flex-1">
        <section className="border-b border-[var(--supordo-mint-200)] py-12 md:py-16 lg:py-20">
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <Link
              to="/metiers"
              className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--supordo-graphite)] underline underline-offset-4 transition-colors hover:text-[var(--supordo-green)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-green)]"
            >
              Tous les métiers
            </Link>
            <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:items-center lg:gap-16">
              <div>
                <h1 className="max-w-[18ch] text-[2rem] font-extrabold leading-[1.1] text-[var(--supordo-forest)] sm:text-[2.5rem] lg:text-[3rem]">
                  {page.headline}
                </h1>
                <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
                  {page.intro}
                </p>
                <Link
                  to="/demarrer"
                  className="mt-8 inline-flex min-h-[52px] w-full items-center justify-center rounded-[6px] bg-[var(--supordo-green)] px-7 text-base font-semibold text-white transition-colors hover:bg-[var(--supordo-green-hover)] active:bg-[var(--supordo-forest)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-forest)] sm:w-auto"
                >
                  Demander mon site
                </Link>
              </div>
              <img
                src={page.image}
                alt={page.imageAlt}
                loading="eager"
                decoding="async"
                className="hidden w-full rounded-[10px] object-cover lg:block"
              />
            </div>
          </div>
        </section>

        <section className="bg-[var(--supordo-mint-100)] py-14 md:py-18 lg:py-20">
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <h2 className="max-w-[26ch] text-[1.5rem] font-extrabold leading-[1.15] text-[var(--supordo-forest)] sm:text-[1.875rem]">
              Ce que cherche la personne qui vous trouve
            </h2>
            <ul className="mt-7 grid gap-x-10 gap-y-4 sm:grid-cols-2">
              {page.visitorQuestions.map((question) => (
                <li
                  key={question}
                  className="border-t border-[var(--supordo-mint-200)] pt-4 text-base leading-relaxed text-[var(--supordo-graphite)]"
                >
                  {question}
                </li>
              ))}
            </ul>
            <p className="mt-7 max-w-[60ch] text-sm leading-relaxed text-[var(--supordo-graphite)]/80">
              Votre site répond à ces questions dès le premier écran, sans qu'on ait à faire
              défiler.
            </p>
          </div>
        </section>

        <section className="py-14 md:py-18 lg:py-20">
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <h2 className="max-w-[26ch] text-[1.5rem] font-extrabold leading-[1.15] text-[var(--supordo-forest)] sm:text-[1.875rem]">
              Les prestations que votre site présente
            </h2>
            <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-[var(--supordo-graphite)]">
              Une prestation, une fiche : son nom, sa description, sa photo. Ce sont vos prestations
              réelles qui sont mises en place, celles-ci ne sont qu'un point de départ fréquent dans
              votre métier.
            </p>
            <dl className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2">
              {page.typicalServices.map((service) => (
                <div key={service.name} className="border-t border-[var(--supordo-mint-200)] pt-4">
                  <dt className="text-base font-semibold text-[var(--supordo-forest)]">
                    {service.name}
                  </dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-[var(--supordo-graphite)]">
                    {service.detail}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="bg-[var(--supordo-warm)] py-14 md:py-18 lg:py-20">
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <h2 className="max-w-[26ch] text-[1.5rem] font-extrabold leading-[1.15] text-[var(--supordo-forest)] sm:text-[1.875rem]">
              Ce qui compte particulièrement dans votre métier
            </h2>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              {page.whatMatters.map((item) => (
                <div key={item.title} className="border-t border-[var(--supordo-mint-200)] pt-5">
                  <h3 className="text-base font-bold leading-snug text-[var(--supordo-forest)]">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[var(--supordo-graphite)]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--supordo-mint-200)] bg-[var(--supordo-mint-100)] py-14 md:py-18 lg:py-20">
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--supordo-green)] lg:text-sm">
                  {DEMO_LABEL}
                </p>
                <h2 className="mt-4 max-w-[24ch] text-[1.5rem] font-extrabold leading-[1.15] text-[var(--supordo-forest)] sm:text-[1.875rem]">
                  Un site de {page.label.toLowerCase()}, en entier.
                </h2>
                <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-[var(--supordo-graphite)]">
                  {demo.companyName} est une entreprise fictive. Elle sert à montrer le résultat :
                  la structure, les prestations, la zone d'intervention et les coordonnées, dans son
                  propre univers visuel.
                </p>
                <Link
                  to="/exemples/$demoSlug"
                  params={{ demoSlug: demo.slug }}
                  className="mt-6 inline-flex min-h-[52px] items-center justify-center rounded-[6px] px-0 text-base font-semibold text-[var(--supordo-forest)] underline underline-offset-4 transition-colors hover:text-[var(--supordo-green)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-green)]"
                >
                  Voir {demo.companyName} en grand
                </Link>
              </div>
              {/* La vue téléphone reste à une largeur de téléphone : étirée à 600 px
                  elle ne ressemble plus à ce qu'elle représente. */}
              <div className="mx-auto w-full max-w-[420px]">
                <SupordoSiteDemo site={demo} variant="mobile" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 md:py-18 lg:py-20">
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <h2 className="max-w-[26ch] text-[1.5rem] font-extrabold leading-[1.15] text-[var(--supordo-forest)] sm:text-[1.875rem]">
              Vous n'avez pas de site à gérer : vous avez une entreprise à faire tourner.
            </h2>
            <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-[var(--supordo-graphite)]">
              Vous donnez vos informations, SUPORDO prépare et met en ligne le site, et vous gardez
              la main sur vos prestations, vos photos et vos coordonnées.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/demarrer"
                className="inline-flex min-h-[52px] items-center justify-center rounded-[6px] bg-[var(--supordo-green)] px-7 text-base font-semibold text-white transition-colors hover:bg-[var(--supordo-green-hover)] active:bg-[var(--supordo-forest)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-forest)]"
              >
                Demander mon site
              </Link>
              <Link
                to="/comment-ca-marche"
                className="inline-flex min-h-[52px] items-center justify-center rounded-[6px] px-4 text-base font-semibold text-[var(--supordo-forest)] underline underline-offset-4 transition-colors hover:text-[var(--supordo-green)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-green)]"
              >
                Comment ça marche
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SupordoFooter />
    </div>
  );
}
