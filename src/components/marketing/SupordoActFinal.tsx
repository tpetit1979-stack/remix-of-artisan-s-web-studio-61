import { Link } from "@tanstack/react-router";

/**
 * Acte 9 — Fermeture de la page.
 *
 * La home ne se termine pas sur la dernière ligne de la FAQ : une page
 * commerciale doit se fermer sur une action. Un seul appel à l'action, le
 * même libellé que partout ailleurs.
 *
 * La copy ne promet aucun délai, aucune maquette, aucun rappel sous X heures :
 * le processus de reprise de contact n'est pas formalisé, elle reste donc sur
 * ce qui est vrai — le visiteur commence par présenter son entreprise.
 */
export function SupordoActFinal() {
  return (
    <section
      className="border-t border-[var(--supordo-mint-200)] bg-[var(--supordo-warm)] py-20 md:py-24 lg:py-28"
      aria-labelledby="supordo-final-title"
    >
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="max-w-[640px]">
          <h2
            id="supordo-final-title"
            className="text-[2rem] font-extrabold leading-[1.12] text-[var(--supordo-forest)] sm:text-[2.5rem] lg:text-[3rem]"
          >
            Parlons de votre entreprise.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
            Présentez-nous votre métier, vos prestations et votre secteur d'intervention pour
            commencer votre demande.
          </p>
          <Link
            to="/demarrer"
            className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-[6px] bg-[var(--supordo-green)] px-6 text-sm font-semibold text-white transition-colors hover:bg-[var(--supordo-green-hover)] active:bg-[var(--supordo-forest)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-forest)] sm:w-auto lg:mt-10 lg:min-h-[52px] lg:px-7 lg:text-base"
          >
            Demander mon site
          </Link>
        </div>
      </div>
    </section>
  );
}
