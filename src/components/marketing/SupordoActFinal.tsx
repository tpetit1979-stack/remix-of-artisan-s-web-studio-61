import { Link } from "@tanstack/react-router";
import { SupordoDemoProject } from "./SupordoSiteDemo";
import { SUPORDO_DEMO_SITE } from "@/data/marketing/supordo-demo-site";

/**
 * Acte 9 — Fermeture de la page.
 *
 * Fond Mint plutôt que Forest : la rupture Forest vient d'être dépensée sur
 * le prix, et deux fonds sombres consécutifs auraient annulé l'effet du
 * premier.
 *
 * Le rappel tarifaire évite au visiteur de remonter la page pour vérifier
 * combien il paie avant de cliquer. La copy ne promet ni délai, ni maquette,
 * ni rappel — le processus de reprise de contact n'est pas formalisé.
 *
 * Un seul appel à l'action.
 */
const project = SUPORDO_DEMO_SITE.projects[1] ?? SUPORDO_DEMO_SITE.projects[0]!;

export function SupordoActFinal() {
  return (
    <section
      className="border-t border-[var(--supordo-mint-200)] bg-[var(--supordo-mint-100)] py-20 md:py-24 lg:py-28"
      aria-labelledby="supordo-final-title"
    >
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:items-center lg:gap-16">
          <div>
            <h2
              id="supordo-final-title"
              className="text-[2rem] font-extrabold leading-[1.1] text-[var(--supordo-forest)] sm:text-[2.5rem] lg:text-[3.25rem]"
            >
              Parlons de votre entreprise.
            </h2>
            <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
              Votre métier, vos prestations, votre secteur : quelques informations suffisent pour
              commencer.
            </p>
            <Link
              to="/demarrer"
              className="mt-8 inline-flex min-h-[52px] w-full items-center justify-center rounded-[6px] bg-[var(--supordo-green)] px-7 text-base font-semibold text-white transition-colors hover:bg-[var(--supordo-green-hover)] active:bg-[var(--supordo-forest)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-forest)] sm:w-auto lg:mt-10 lg:min-h-[56px] lg:px-8 lg:text-lg"
            >
              Demander mon site
            </Link>
            <p className="mt-4 text-sm font-medium text-[var(--supordo-graphite)] lg:text-base">
              49 € HT/mois + 199 € HT de mise en place
            </p>
          </div>

          {/* Un seul fragment du site de démonstration : il rappelle
              visuellement ce qu'on vient de décrire, sans réexpliquer. */}
          <div className="hidden lg:block">
            <SupordoDemoProject project={project} />
            <p className="mt-3 text-xs text-[var(--supordo-graphite)]/70">
              Démonstration SUPORDO — entreprise fictive.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
