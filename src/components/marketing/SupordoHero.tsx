import { Link } from "@tanstack/react-router";
import chauffagiste from "@/assets/marketing/trades/chauffagiste.webp.asset.json";

/**
 * SUPORDO Sites hero — marketing surface only (supordo.com).
 *
 * H1 actuellement implémenté : "Un vrai site pro pour votre entreprise."
 * Reste [À FIGER] dans le plan directeur (plan-directeur-supordo-com.md) —
 * c'est la cible retenue pour cette branche, pas une décision définitive.
 * Le sous-titre actuel est aligné avec la doctrine V1 (§20-§21) : aucune IA,
 * vocabulaire métier (prestations, secteur, chantiers), verbe "indiquer".
 *
 * Image de droite : visuel TEMPORAIRE. Aucune photographie éditoriale de
 * marque n'existe encore pour le Hero (matrice visuelle du plan) ; en
 * attendant, l'illustration "chauffagiste" — normalement réservée à la
 * section Métiers — est réutilisée ici pour remplacer le rectangle vide,
 * uniquement le temps qu'une vraie photographie éditoriale soit produite.
 * Remplacer par une vraie photo dès qu'elle existe ; ne pas la présenter
 * comme une réalisation client.
 *
 * One action only: "Demander mon site", and only when a request can really be
 * sent. "Voir un exemple" stays absent until a real example site exists — no
 * disabled button, no empty slot, no invented client.
 */
export function SupordoHero({ leadIntakeReady = false }: { leadIntakeReady?: boolean }) {
  return (
    <section className="bg-[var(--supordo-warm)]">
      <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-5 py-12 md:px-8 md:py-16 lg:grid-cols-2 lg:gap-20 lg:py-24 lg:min-h-[calc(100dvh-72px)]">
        {/* Text first in the DOM: also the mobile order */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--supordo-green)] lg:text-sm">
            SUPORDO SITES
          </p>
          <h1 className="mt-5 max-w-[17ch] text-[2.25rem] font-extrabold leading-[1.08] tracking-[-0.02em] text-[var(--supordo-forest)] sm:text-[2.75rem] lg:mt-6 lg:text-[3.5rem] lg:tracking-[-0.025em]">
            Un vrai site pro pour votre entreprise.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--supordo-graphite)] lg:mt-7 lg:text-lg">
            SUPORDO prépare votre site et s'occupe de la partie technique. Vous
            indiquez vos prestations, votre secteur et les chantiers que vous
            souhaitez montrer.
          </p>

          {leadIntakeReady && (
            <div className="mt-8 lg:mt-10">
              <Link
                to="/demarrer"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-[6px] bg-[var(--supordo-green)] px-6 text-sm font-semibold text-white transition-colors hover:bg-[var(--supordo-green-hover)] active:bg-[var(--supordo-forest)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-forest)] sm:w-auto lg:min-h-[52px] lg:px-7 lg:text-base"
              >
                Demander mon site
              </Link>
            </div>
          )}
        </div>

        {/* Visuel temporaire — voir commentaire de tête */}
        <div>
          <div className="aspect-[4/3] w-full overflow-hidden rounded-[10px] border border-[var(--supordo-mint-200)] bg-[var(--supordo-mint-100)] lg:max-h-[560px] lg:min-h-[420px]">
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
