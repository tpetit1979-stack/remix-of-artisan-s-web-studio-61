import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SupordoSiteDemo } from "./SupordoSiteDemo";
import {
  DEMO_LABEL,
  DEMO_SITES,
  DEMO_TRADES,
  type DemoTrade,
} from "@/data/marketing/supordo-demo-site";

/**
 * Acte 3 — La démonstration du site fini.
 *
 * Premier grand moment produit de la page : après s'être reconnu dans son
 * métier, le visiteur voit un site entier, pas une explication de plus.
 *
 * Le sélecteur de métier fait le travail d'un paragraphe entier. En trois
 * clics, il montre que la couleur, la typographie, les photos, l'entreprise,
 * les prestations et les réalisations changent — pendant que la structure,
 * elle, reste la même. C'est la preuve de « adapté à votre métier », sans
 * l'écrire une fois de plus.
 *
 * `Tabs` Radix déjà présent dans le projet : navigation clavier, `aria-*` et
 * focus visibles sans dépendance nouvelle. Aucun défilement automatique — le
 * visiteur choisit. Un seul `TabsContent` piloté par les données : le jour où
 * de vrais sites clients remplacent les fixtures, rien à réécrire ici.
 *
 * Les entreprises montrées sont fictives et étiquetées comme telles ; jamais
 * présentées comme des clients, des témoignages ou des résultats.
 */
export function SupordoActDemo() {
  const [trade, setTrade] = useState<DemoTrade>(DEMO_TRADES[0]!);
  const site = DEMO_SITES[trade];

  return (
    <section
      id="demonstration"
      className="scroll-mt-20 border-t border-[var(--supordo-mint-200)] bg-[var(--supordo-mint-100)] py-16 md:py-20 lg:py-24"
      aria-labelledby="supordo-demo-title"
    >
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="max-w-[640px]">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--supordo-green)] lg:text-sm">
            {DEMO_LABEL}
          </p>
          <h2
            id="supordo-demo-title"
            className="mt-4 text-[2rem] font-extrabold leading-[1.12] text-[var(--supordo-forest)] sm:text-[2.5rem] lg:text-[3rem]"
          >
            Voilà à quoi peut ressembler votre site.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
            Prestations, réalisations, zones d'intervention, photos et contact : voici des exemples
            de sites préparés avec SUPORDO. Choisissez un métier.
          </p>
        </div>

        <Tabs
          value={trade}
          onValueChange={(value) => setTrade(value as DemoTrade)}
          className="mt-8 lg:mt-10"
        >
          {/* Mobile : défilement horizontal maîtrisé plutôt que des libellés
              rognés — quatre métiers ne tiennent pas à 390 px. */}
          <TabsList className="h-auto w-full justify-start gap-2 overflow-x-auto rounded-[8px] bg-white/70 p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {DEMO_TRADES.map((id) => (
              <TabsTrigger
                key={id}
                value={id}
                className="shrink-0 rounded-[6px] px-4 py-2.5 text-sm font-semibold text-[var(--supordo-graphite)] transition-colors data-[state=active]:bg-[var(--supordo-forest)] data-[state=active]:text-white data-[state=active]:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-green)]"
              >
                {DEMO_SITES[id].tradeLabel}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent
            value={trade}
            className="mt-8 focus-visible:outline-none lg:mt-10"
            tabIndex={-1}
          >
            {/* L'aperçu cadré, pas le site entier. La home montrait ici les
                quatre sites dans leur intégralité, vue large et vue
                téléphone superposées : 2 235 px, la plus longue section de
                la page, et exactement ce que /exemples fait désormais mieux.
                Le sélecteur reste — c'est lui qui prouve que quatre métiers
                donnent quatre sites — mais la preuve approfondie part à la
                page qui existe pour ça.

                Largeur bornée à 880 px plutôt qu'étalée sur les 1 200 : au
                delà, les fiches de prestation deviennent si hautes que le
                cadrage les coupe en deux, et une photographie tranchée en
                son milieu se lit comme un défaut, pas comme un cadrage. La
                colonne libérée porte l'identité de l'entreprise et les deux
                sorties vers /exemples. */}
            <div className="grid gap-8 lg:grid-cols-[minmax(0,880px)_minmax(0,1fr)] lg:gap-12">
              <SupordoSiteDemo site={site} variant="preview" previewAspect="5 / 6" />

              <div className="lg:pt-4">
                <p className="text-lg font-extrabold leading-tight text-[var(--supordo-forest)]">
                  {site.companyName}
                </p>
                <p className="mt-1.5 text-sm font-medium text-[var(--supordo-green)]">
                  {site.trade} · {site.city}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--supordo-graphite)]">
                  {site.headline}
                </p>
                <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--supordo-graphite)]/55">
                  {DEMO_LABEL} — entreprise fictive
                </p>

                <div className="mt-6 flex flex-col gap-3">
                  <Link
                    to="/exemples/$demoSlug"
                    params={{ demoSlug: site.slug }}
                    className="inline-flex min-h-11 items-center self-start text-base font-semibold text-[var(--supordo-forest)] underline underline-offset-4 transition-colors hover:text-[var(--supordo-green)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-green)]"
                  >
                    Voir {site.companyName} en grand
                  </Link>
                  <Link
                    to="/exemples"
                    className="inline-flex min-h-11 items-center self-start text-base font-medium text-[var(--supordo-graphite)] underline underline-offset-4 transition-colors hover:text-[var(--supordo-green)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-green)]"
                  >
                    Comparer les quatre exemples
                  </Link>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
