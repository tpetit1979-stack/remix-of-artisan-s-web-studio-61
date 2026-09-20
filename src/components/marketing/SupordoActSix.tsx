import { Link } from "@tanstack/react-router";

/**
 * Acte 6 — "Combien ça coûte ?" (plan-directeur-supordo-com.md §4, Acte 6).
 *
 * Seuls le prix (49 € HT/mois + 99 € HT de mise en place initiale) et le
 * vocabulaire « mise en place initiale » sont des décisions humaines actées
 * (§19). Les autres conditions commerciales (engagement, domaine,
 * résiliation, support, périmètre exact des 99 €/49 €) sont désormais
 * tranchées mais volontairement absentes d'ici : leur détail vit sur
 * `/tarifs`, pas sur la home — cet acte garde son rôle, « voici le prix ».
 *
 * Composition asymétrique : explication à gauche, prix dominant à droite —
 * direction éditoriale de cette itération visuelle, distincte du « bloc
 * centré 640 px » précédemment décrit dans le plan ; à faire correspondre
 * au plan si cette direction est retenue.
 *
 * CTA identique à celui du Hero, même garde `leadIntakeReady` : aucun bouton
 * visible ne doit pouvoir mener vers /demarrer avant que la prise de contact
 * y soit réellement fonctionnelle.
 */
export function SupordoActSix({ leadIntakeReady = false }: { leadIntakeReady?: boolean }) {
  return (
    <section
      className="border-t border-[var(--supordo-mint-200)] bg-white py-24 md:py-28 lg:py-32"
      aria-labelledby="supordo-act6-title"
    >
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--supordo-green)] lg:text-sm">
              UNE OFFRE SIMPLE
            </p>
            <h2
              id="supordo-act6-title"
              className="mt-4 text-[2rem] font-extrabold leading-[1.12] text-[var(--supordo-forest)] sm:text-[2.5rem] lg:text-[3rem]"
            >
              Un site professionnel, avec un tarif clair.
            </h2>
            <p className="mt-5 max-w-[480px] text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
              SUPORDO prépare votre site et s'occupe de sa partie technique.
              Vous gardez la main sur les informations de votre entreprise.
            </p>
          </div>

          <div className="lg:border-l lg:border-[var(--supordo-mint-200)] lg:pl-16">
            <p className="flex items-baseline gap-2">
              <span className="text-[3.5rem] font-extrabold leading-none tracking-[-0.02em] text-[var(--supordo-forest)] sm:text-[4.5rem] lg:text-[5.5rem]">
                49 €
              </span>
              <span className="text-base font-medium text-[var(--supordo-graphite)] lg:text-lg">
                HT / mois
              </span>
            </p>
            <p className="mt-3 text-sm font-medium text-[var(--supordo-graphite)] lg:text-base">
              + 99 € HT de mise en place initiale
            </p>
            <Link
              to="/tarifs"
              className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-[var(--supordo-graphite)] underline-offset-4 transition-colors hover:text-[var(--supordo-green)] hover:underline active:text-[var(--supordo-green-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-green)]"
            >
              Voir le détail de l'offre →
            </Link>

            {leadIntakeReady && (
              <div className="mt-8">
                <Link
                  to="/demarrer"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-[6px] bg-[var(--supordo-green)] px-6 text-sm font-semibold text-white transition-colors hover:bg-[var(--supordo-green-hover)] active:bg-[var(--supordo-forest)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-forest)] sm:w-auto lg:min-h-[52px] lg:px-7 lg:text-base"
                >
                  Demander mon site
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
