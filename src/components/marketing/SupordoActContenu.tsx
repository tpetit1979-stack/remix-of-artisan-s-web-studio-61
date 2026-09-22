import { Link } from "@tanstack/react-router";
import { SupordoSiteDemo } from "./SupordoSiteDemo";

/**
 * Acte 5 — Ce qu'un client doit comprendre avant de vous contacter.
 *
 * Le titre parle du besoin du client final, pas de la structure du produit :
 * quatre questions qu'un particulier se pose avant d'appeler une entreprise.
 * La preuve est le même site de démonstration que les actes précédents —
 * fabriquer une troisième esthétique aurait dispersé la lecture.
 *
 * Les quatre idées correspondent à des objets réels : services,
 * service_areas, portfolio et coordonnées du tenant. Les demandes reçues sont
 * mentionnées parce que le produit les conserve réellement dans l'espace.
 */
const IDEES = [
  { label: "CE QUE VOUS FAITES", titre: "Vos prestations" },
  { label: "OÙ VOUS INTERVENEZ", titre: "Vos zones d'intervention et vos communes" },
  { label: "CE QUE VOUS AVEZ RÉALISÉ", titre: "Vos chantiers et vos photos" },
  { label: "COMMENT VOUS JOINDRE", titre: "Vos coordonnées et vos demandes" },
] as const;

export function SupordoActContenu() {
  return (
    <section
      className="border-t border-[var(--supordo-mint-200)] bg-white py-16 md:py-20 lg:py-24"
      aria-labelledby="supordo-contenu-title"
    >
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="max-w-[720px]">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--supordo-green)] lg:text-sm">
            VOTRE SITE
          </p>
          <h2
            id="supordo-contenu-title"
            className="mt-4 text-[2rem] font-extrabold leading-[1.12] text-[var(--supordo-forest)] sm:text-[2.5rem] lg:text-[3rem]"
          >
            Tout ce qu'un client doit comprendre avant de vous contacter.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
            Votre site présente votre entreprise, ce que vous faites, où vous intervenez et le
            travail que vous avez déjà réalisé.
          </p>
        </div>

        {/* Mobile : les quatre idées, puis le site. Desktop : texte à gauche,
            site à droite — c'est lui qui rend les quatre idées concrètes. */}
        <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-16">
          <dl className="space-y-8">
            {IDEES.map((idee) => (
              <div key={idee.label}>
                <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--supordo-green)]">
                  {idee.label}
                </dt>
                <dd className="mt-2 text-xl font-extrabold leading-snug text-[var(--supordo-forest)] lg:text-2xl">
                  {idee.titre}
                </dd>
              </div>
            ))}
          </dl>

          <div>
            <div className="lg:hidden">
              <SupordoSiteDemo variant="mobile" />
            </div>
            <div className="hidden lg:block">
              <SupordoSiteDemo variant="desktop" />
            </div>
            <p className="mt-4 text-sm text-[var(--supordo-graphite)]/70">
              Démonstration SUPORDO — entreprise fictive.
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-[var(--supordo-mint-200)] pt-8 lg:mt-16">
          <p className="max-w-[60ch] text-base font-semibold leading-snug text-[var(--supordo-forest)] lg:text-lg">
            Téléphone, tablette ou ordinateur : votre site s'adapte à l'écran utilisé par votre
            client.
          </p>
          <Link
            to="/tarifs"
            className="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-[var(--supordo-graphite)] underline-offset-4 transition-colors hover:text-[var(--supordo-green)] hover:underline active:text-[var(--supordo-green-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-green)] lg:text-base"
          >
            Voir le détail de l'offre →
          </Link>
        </div>
      </div>
    </section>
  );
}
