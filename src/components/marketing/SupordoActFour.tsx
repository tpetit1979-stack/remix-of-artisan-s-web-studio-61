/**
 * Acte 4 — "Votre travail, visible" (plan-directeur-supordo-com.md §4, Acte 4).
 *
 * Rôle narratif : contrairement à l'Acte 3 (une information de service saisie
 * dans SUPORDO retrouvée sur le site), l'Acte 4 part du geste réel — un
 * travail terminé, photographié — et montre sa transformation en preuve
 * publique. Sens de lecture inversé : réel → produit → résultat, jamais
 * produit → résultat comme à l'Acte 3. Aucune donnée fictive : ce composant
 * n'a ni valeur par défaut ni chaîne EASYDEP — chaque preuve est une prop
 * requise, fournie seulement quand une réalisation réelle et autorisée par
 * écrit existe (plan §15, question 5).
 *
 * Gate mobile (plan §15, question 8) : l'ergonomie mobile de PortfolioManager
 * n'est pas vérifiée. `adminCaptureSrc` doit donc toujours être une capture
 * desktop recadrée, jamais une mise en scène d'écran de téléphone — y compris
 * lorsqu'elle s'affiche dans la mise en page mobile de cette section.
 *
 * Composant volontairement non monté dans SupordoLanding tant que les preuves
 * réelles et leur autorisation ne sont pas disponibles.
 */
interface SupordoActFourProps {
  /** Vraie photo du travail terminé (jamais une illustration catalogue). */
  workImageSrc: string;
  workImageAlt: string;
  /** Nom de la réalisation, tel qu'enregistré dans SUPORDO. */
  workTitle: string;
  /** Ville du chantier, si pertinente à afficher. */
  city?: string;
  /** Nom du service lié, si pertinent à afficher. */
  serviceName?: string;
  /** Capture desktop recadrée de la fiche réalisation dans SUPORDO. */
  adminCaptureSrc: string;
  adminCaptureAlt: string;
  /** Capture du rendu public réel (page /realisations ou carte). */
  publicCaptureSrc: string;
  publicCaptureAlt: string;
}

export function SupordoActFour({
  workImageSrc,
  workImageAlt,
  workTitle,
  city,
  serviceName,
  adminCaptureSrc,
  adminCaptureAlt,
  publicCaptureSrc,
  publicCaptureAlt,
}: SupordoActFourProps) {
  return (
    <section
      className="border-t border-[var(--supordo-mint-200)] bg-white py-16 md:py-20 lg:py-24"
      aria-labelledby="supordo-act4-title"
    >
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="max-w-[760px]">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--supordo-green)] lg:text-sm">
            VOTRE TRAVAIL, VISIBLE
          </p>
          <h2
            id="supordo-act4-title"
            className="mt-4 text-[2rem] font-extrabold leading-[1.12] text-[var(--supordo-forest)] sm:text-[2.5rem] lg:text-[3rem]"
          >
            Montrez le travail que vous faites vraiment.
          </h2>
          <p className="mt-5 max-w-[650px] text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
            Une réalisation, une photo, quelques informations : votre travail est présenté sur votre
            site.
          </p>
        </div>

        {/* Un seul jeu d'éléments dans l'ordre de lecture mobile (photo →
            SUPORDO → site) ; seule la disposition change par point de
            rupture, via grid-cols/col-span standard — jamais un doublon
            d'images, jamais une classe grid-template-areas arbitraire. */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:mt-12 lg:grid-cols-[1.5fr_0.7fr_1fr] lg:gap-8">
          <figure className="md:col-span-2 lg:col-span-1">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-[10px] border border-[var(--supordo-mint-200)]">
              <img
                src={workImageSrc}
                alt={workImageAlt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
            <figcaption className="mt-3">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--supordo-graphite)]/70">
                Le travail réalisé.
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--supordo-forest)]">
                {workTitle}
                {city ? ` · ${city}` : ""}
              </p>
            </figcaption>
          </figure>

          <figure>
            <div className="aspect-[4/3] w-full overflow-hidden rounded-[10px] border border-[var(--supordo-mint-200)] bg-[var(--supordo-warm)]">
              <img
                src={adminCaptureSrc}
                alt={adminCaptureAlt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-contain"
              />
            </div>
            <figcaption className="mt-3">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--supordo-graphite)]/70">
                La réalisation dans SUPORDO.
              </p>
              {serviceName && (
                <p className="mt-1 text-sm font-semibold text-[var(--supordo-forest)]">
                  {serviceName}
                </p>
              )}
            </figcaption>
          </figure>

          <figure>
            <div className="aspect-[4/3] w-full overflow-hidden rounded-[10px] border border-[var(--supordo-mint-200)] bg-[var(--supordo-mint-100)]">
              <img
                src={publicCaptureSrc}
                alt={publicCaptureAlt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-contain"
              />
            </div>
            <figcaption className="mt-3">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--supordo-graphite)]/70">
                La réalisation sur votre site.
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--supordo-forest)]">{workTitle}</p>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
