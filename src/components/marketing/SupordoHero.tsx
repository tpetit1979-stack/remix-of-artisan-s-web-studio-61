import { Link } from "@tanstack/react-router";
import chauffagiste from "@/assets/marketing/trades/chauffagiste.webp.asset.json";

/**
 * Acte 1 — Hero.
 *
 * H1 `[ACTÉ]`, conservé mot pour mot. Le sous-titre explique le partage des
 * rôles dès le premier écran, sans nommer aucun logiciel.
 *
 * Les appels à l'action marketing ne dépendent plus de `leadIntakeReady` :
 * leur destination `/demarrer` existe et reste honnête même quand la
 * réception d'une demande n'est pas encore ouverte — la page le dit alors
 * elle-même. Seule la soumission du formulaire reste gardée.
 *
 * `showExampleLink` suit la présence réelle de la démonstration : pas de lien
 * vers une ancre qui ne serait pas montée.
 *
 * Image : visuel TEMPORAIRE. Aucune photographie éditoriale de marque
 * n'existe encore ; l'illustration « chauffagiste » de la section Métiers est
 * réutilisée en attendant. Elle ne représente aucun client et n'est jamais
 * présentée comme une réalisation.
 */
export function SupordoHero({ showExampleLink = false }: { showExampleLink?: boolean }) {
  return (
    <section className="bg-[var(--supordo-warm)]">
      <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-5 py-12 md:px-8 md:py-16 lg:grid-cols-2 lg:gap-20 lg:py-24">
        {/* Texte d'abord dans le DOM : c'est aussi l'ordre mobile. */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--supordo-green)] lg:text-sm">
            SUPORDO SITES
          </p>
          <h1 className="mt-5 max-w-[17ch] text-[2.25rem] font-extrabold leading-[1.08] tracking-[-0.02em] text-[var(--supordo-forest)] sm:text-[2.75rem] lg:mt-6 lg:text-[3.5rem] lg:tracking-[-0.025em]">
            Un vrai site pro pour votre entreprise.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--supordo-graphite)] lg:mt-7 lg:text-lg">
            SUPORDO prépare votre site et s'occupe de sa partie technique. Vous ajoutez vos
            prestations, votre secteur d'intervention et les chantiers que vous souhaitez montrer.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5 lg:mt-10">
            <Link
              to="/demarrer"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-[6px] bg-[var(--supordo-green)] px-6 text-sm font-semibold text-white transition-colors hover:bg-[var(--supordo-green-hover)] active:bg-[var(--supordo-forest)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-forest)] sm:w-auto lg:min-h-[52px] lg:px-7 lg:text-base"
            >
              Demander mon site
            </Link>
            {showExampleLink && (
              <a
                href="#demonstration"
                className="inline-flex min-h-12 items-center justify-center rounded-[6px] text-sm font-semibold text-[var(--supordo-forest)] underline-offset-4 transition-colors hover:text-[var(--supordo-green)] hover:underline active:text-[var(--supordo-green-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-green)] lg:text-base"
              >
                Voir un exemple
              </a>
            )}
          </div>
        </div>

        {/* Visuel temporaire — voir commentaire de tête. */}
        <div>
          <div className="aspect-[4/3] w-full overflow-hidden rounded-[10px] border border-[var(--supordo-mint-200)] bg-[var(--supordo-mint-100)] lg:max-h-[520px] lg:min-h-[400px]">
            <img
              src={chauffagiste.url}
              alt="Chauffagiste installant une pompe à chaleur"
              loading="eager"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
