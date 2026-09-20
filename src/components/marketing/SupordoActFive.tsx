/**
 * Acte 5 — "Qui fait quoi" (plan-directeur-supordo-com.md §4, Acte 5,
 * doctrine vocabulaire et ton §20-§21).
 *
 * Famille "Partage typographique" (plan §11) : densité faible, aucun visuel,
 * jamais présentée comme une liste de fonctions à cocher — deux colonnes de
 * phrases courtes et factuelles, pas une grille de features avec icônes.
 *
 * H2 : "Vous êtes sur le terrain. Nous nous occupons du site." — formulation
 * transversale (couvreur, plombier, ramoneur, technicien PAC, paysagiste,
 * dépanneur...), pas ancrée sur le seul mot "travaux".
 *
 * Côté SUPORDO : préparation de la première version du site, préparation des
 * pages (le client n'a aucune page à construire), mise en ligne, maintenance
 * technique — distincte des informations de l'entreprise, qui restent sous
 * la main du client. Aucune mention de l'IA dans cette copy publique
 * (doctrine §20) ; les demandes reçues, capacité réelle, ne sont plus une
 * ligne de cet acte (elles ne sont plus une promesse centrale de l'Acte 5).
 *
 * Côté artisan : prestations, secteur d'intervention, réalisations,
 * partenaires, coordonnées ont un effet public réel et immédiat une fois
 * publiés par le client. Équipe formulée prudemment : l'affichage général
 * reste conditionné par `site_settings.team_presentation_mode`, verrouillé
 * au super_admin — d'où "lorsque son affichage est activé sur le site".
 *
 * Volontairement absents : marques (aucun rendu public n'existe aujourd'hui),
 * certifications (décision produit non tranchée), toute mention de délai ou
 * de "publication automatique" globale.
 *
 * Aucune icône, aucune carte, aucun média — texte seul, sur le même
 * vocabulaire de tokens que le reste de la landing.
 */
const SUPORDO_ITEMS = [
  "Prépare la première version de votre site à partir des informations de votre entreprise.",
  "Prépare les pages de votre site — vous n'avez pas à les construire vous-même.",
  "Met votre site en ligne.",
  "Assure la maintenance technique du site — vous gardez la main sur les informations de votre entreprise.",
] as const;

const ARTISAN_ITEMS = [
  "Vos prestations.",
  "Votre secteur d'intervention.",
  "Vos réalisations.",
  "Vos partenaires.",
  "Vos coordonnées.",
  "Votre équipe, lorsque son affichage est activé sur le site.",
] as const;

export function SupordoActFive() {
  return (
    <section
      className="border-t border-[var(--supordo-mint-200)] bg-[var(--supordo-warm)] py-16 md:py-20 lg:py-24"
      aria-labelledby="supordo-act5-title"
    >
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="max-w-[760px]">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--supordo-green)] lg:text-sm">
            QUI FAIT QUOI
          </p>
          <h2
            id="supordo-act5-title"
            className="mt-4 text-[2rem] font-extrabold leading-[1.12] text-[var(--supordo-forest)] sm:text-[2.5rem] lg:text-[3rem]"
          >
            Vous êtes sur le terrain. Nous nous occupons du site.
          </h2>
        </div>

        <div className="mt-10 grid gap-10 lg:mt-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h3 className="text-lg font-bold text-[var(--supordo-forest)]">
              SUPORDO s'occupe de…
            </h3>
            <ul className="mt-5 space-y-4">
              {SUPORDO_ITEMS.map((item) => (
                <li
                  key={item}
                  className="border-t border-[var(--supordo-mint-200)] pt-4 text-base leading-relaxed text-[var(--supordo-graphite)] first:border-t-0 first:pt-0"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-[var(--supordo-forest)]">
              Vous gardez la main sur…
            </h3>
            <ul className="mt-5 space-y-4">
              {ARTISAN_ITEMS.map((item) => (
                <li
                  key={item}
                  className="border-t border-[var(--supordo-mint-200)] pt-4 text-base leading-relaxed text-[var(--supordo-graphite)] first:border-t-0 first:pt-0"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
