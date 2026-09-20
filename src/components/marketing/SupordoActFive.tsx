/**
 * Acte 5 — "Qui fait quoi" (plan-directeur-supordo-com.md §4, Acte 5).
 *
 * Famille "Partage typographique" (plan §11) : densité faible, aucun visuel,
 * jamais présentée comme une liste de fonctions à cocher — deux colonnes de
 * phrases courtes et factuelles, pas une grille de features avec icônes.
 *
 * Chaque ligne provient exclusivement des capacités vérifiées dans le code
 * (missions "fermer les questions 9/10/11"), jamais d'un verbe large non
 * prouvé :
 * - "prépare / organise / met en ligne / maintenance technique / demandes
 *   consultables" — super-admin.onboarding.tsx, generate-tenant, domaine
 *   natif {slug}.supordo.com, admin.contacts.tsx.
 * - Côté artisan : services, zones, réalisations, partenaires, coordonnées
 *   ont un effet public réel et immédiat une fois publiés par le client.
 *   Équipe formulée prudemment : l'affichage général reste conditionné par
 *   `site_settings.team_presentation_mode`, verrouillé au super_admin.
 *
 * Volontairement absents : marques (aucun rendu public n'existe aujourd'hui),
 * certifications (décision produit non tranchée), toute mention de délai ou
 * de "publication automatique" globale.
 *
 * Aucune icône, aucune carte, aucun média — texte seul, sur le même
 * vocabulaire de tokens que le reste de la landing.
 */
const SUPORDO_ITEMS = [
  "Prépare la première version du site à partir des informations de l'entreprise, avec l'aide de l'IA.",
  "Organise la présentation du site.",
  "Met le site en ligne sur une adresse SUPORDO.",
  "Assure la maintenance technique du socle commun.",
  "Rend consultables les demandes reçues depuis le site.",
] as const;

const ARTISAN_ITEMS = [
  "Vos services.",
  "Vos zones d'intervention.",
  "Vos réalisations.",
  "Vos partenaires.",
  "Vos coordonnées.",
  "Votre équipe — son affichage général est activé avec votre agence.",
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
            SUPORDO s'occupe de la présentation. Vous renseignez votre entreprise.
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
