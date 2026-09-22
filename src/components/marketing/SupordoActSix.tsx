import { Link } from "@tanstack/react-router";

/**
 * Acte 7 — L'offre.
 *
 * Seule rupture Forest de la page : le prix est le moment où la lecture doit
 * s'arrêter. Les deux autres pages marketing ont déjà leur rupture ; sans
 * celle-ci, la fin de la home s'aplatissait en alternance blanc / Warm.
 *
 * 49 € HT/mois + 199 € HT de mise en place initiale `[ACTÉ]`. Les conditions
 * encore ouvertes — engagement, résiliation, tarif de l'option domaine,
 * récupération des contenus — sont volontairement absentes plutôt que
 * formulées vaguement. « Sans engagement » n'est pas publié tant que les
 * règles correspondantes ne sont pas arrêtées.
 *
 * Aucune grille de forfaits : une offre est une offre.
 */
export function SupordoActSix() {
  return (
    <section
      className="border-t border-[var(--supordo-mint-200)] bg-[var(--supordo-forest)] py-20 md:py-24 lg:py-28"
      aria-labelledby="supordo-act6-title"
    >
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Mobile : le prix d'abord. Desktop : explication à gauche, prix à
              droite, le chiffre dominant la composition. */}
          <div className="order-2 lg:order-1">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--supordo-mint-200)] lg:text-sm">
              UNE OFFRE SIMPLE
            </p>
            <h2
              id="supordo-act6-title"
              className="mt-4 text-[2rem] font-extrabold leading-[1.12] text-white sm:text-[2.5rem] lg:text-[3rem]"
            >
              Un site professionnel, avec un tarif clair.
            </h2>
            <p className="mt-5 max-w-[480px] text-base leading-relaxed text-white/80 lg:text-lg">
              SUPORDO prépare votre site et s'occupe de sa partie technique. Vous gardez la main sur
              les informations de votre entreprise.
            </p>

            <dl className="mt-8 max-w-[480px] space-y-4 border-t border-white/15 pt-6">
              <div>
                <dt className="text-sm font-bold text-white">Mise en place</dt>
                <dd className="mt-1 text-sm leading-relaxed text-white/70">
                  Préparation de votre site et mise en ligne.
                </dd>
              </div>
              <div>
                <dt className="text-sm font-bold text-white">Abonnement</dt>
                <dd className="mt-1 text-sm leading-relaxed text-white/70">
                  Hébergement, maintenance technique et fonctionnement de votre site dans le
                  périmètre de l'offre.
                </dd>
              </div>
            </dl>
          </div>

          <div className="order-1 lg:order-2 lg:border-l lg:border-white/15 lg:pl-16">
            <p className="flex items-baseline gap-2">
              <span className="text-[3.5rem] font-extrabold leading-none tracking-[-0.02em] text-white sm:text-[4.5rem] lg:text-[5.5rem]">
                49 €
              </span>
              <span className="text-base font-medium text-white/70 lg:text-lg">HT / mois</span>
            </p>
            <p className="mt-3 text-sm font-medium text-white/80 lg:text-base">
              + 199 € HT de mise en place initiale
            </p>
            <p className="mt-5 max-w-[42ch] text-sm leading-relaxed text-white/70">
              Une adresse SUPORDO est comprise. Un nom de domaine personnalisé peut être proposé en
              option.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <Link
                to="/demarrer"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-[6px] bg-[var(--supordo-green)] px-6 text-sm font-semibold text-white transition-colors hover:bg-[var(--supordo-green-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-mint-200)] sm:w-auto lg:min-h-[52px] lg:px-7 lg:text-base"
              >
                Demander mon site
              </Link>
              <Link
                to="/tarifs"
                className="inline-flex min-h-12 items-center justify-center rounded-[6px] text-sm font-medium text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-mint-200)] lg:text-base"
              >
                Voir le détail des tarifs →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
