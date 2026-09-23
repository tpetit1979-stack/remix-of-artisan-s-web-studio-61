import { Link } from "@tanstack/react-router";
import { SupordoSiteDemo } from "./SupordoSiteDemo";
import { DEMO_SITES, DEMO_LABEL } from "@/data/marketing/supordo-demo-site";

/**
 * Acte 1 — Hero.
 *
 * H1 `[ACTÉ]`, conservé mot pour mot. Le sous-titre explique le partage des
 * rôles dès le premier écran, sans nommer aucun logiciel.
 *
 * Le premier écran montre désormais le RÉSULTAT. Il portait jusqu'ici une
 * photographie de paysagiste : la page promettait un site et prouvait un
 * artisan. La photographie de métier n'a pas disparu pour autant — elle est
 * à l'intérieur du produit, à la place qu'elle occupe réellement sur le site
 * d'un client. C'est la composition qui règle la tension entre « montrer le
 * métier » et « montrer le produit » : le métier est ce que le produit
 * contient.
 *
 * L'objet est l'aperçu du lot précédent, pas une seconde représentation
 * concurrente du même site. Un fragment téléphone posé sur son angle a été
 * essayé puis retiré : à 150 px de large, le titre du site chevauchait le
 * bouton d'appel et la photographie devenait illisible. Un signal qu'on ne
 * peut pas lire n'est pas un signal, c'est une décoration — et la page dit
 * déjà plus bas que le site fonctionne sur téléphone.
 *
 * Atelier du Feu plutôt qu'une autre démonstration : c'est l'identité la plus
 * éloignée des tokens SUPORDO (serif, orange, boutons arrondis), donc celle
 * qui prouve le mieux qu'un site SUPORDO n'est pas un gabarit repeint. Elle
 * n'ouvre ni `/exemples` ni la démonstration de la page, ce qui évite de
 * montrer trois fois la même entreprise avant le premier défilement.
 *
 * Les appels à l'action marketing ne dépendent pas de `leadIntakeReady` :
 * leur destination `/demarrer` existe et reste honnête même quand la
 * réception d'une demande n'est pas encore ouverte — la page le dit alors
 * elle-même. Seule la soumission du formulaire reste gardée.
 *
 * Le prix est rappelé sous les actions, en une ligne. Il répond à la
 * question qui vient juste après « qu'est-ce que j'achète ? », et évite un
 * aller-retour vers `/tarifs` pour l'apprendre. Ce n'est pas un bloc
 * tarifaire : aucune inclusion, aucune exclusion, aucune comparaison.
 */
const site = DEMO_SITES.heating;

export function SupordoHero({ showExampleLink = true }: { showExampleLink?: boolean }) {
  return (
    <section className="overflow-hidden bg-[var(--supordo-warm)]">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 py-12 md:px-8 md:py-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 lg:py-24">
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
              className="inline-flex min-h-12 w-full items-center justify-center rounded-[6px] bg-[var(--supordo-green)] px-6 text-sm font-semibold text-white transition-colors hover:bg-[var(--supordo-green-hover)] active:bg-[var(--supordo-forest)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-forest)] sm:w-auto sm:whitespace-nowrap lg:min-h-[52px] lg:px-7 lg:text-base"
            >
              Demander mon site
            </Link>
            {showExampleLink && (
              <Link
                to="/exemples"
                className="inline-flex min-h-12 items-center justify-center rounded-[6px] text-sm font-semibold text-[var(--supordo-forest)] underline-offset-4 transition-colors hover:text-[var(--supordo-green)] hover:underline active:text-[var(--supordo-green-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-green)] sm:whitespace-nowrap lg:text-base"
              >
                Voir des exemples
              </Link>
            )}
          </div>

          <p className="mt-6 text-sm font-medium text-[var(--supordo-graphite)] lg:mt-7 lg:text-base">
            49 € HT/mois + 199 € HT de mise en place.{" "}
            <Link
              to="/tarifs"
              className="underline underline-offset-4 transition-colors hover:text-[var(--supordo-green)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-green)]"
            >
              Le détail
            </Link>
          </p>
        </div>

        {/* Le produit. */}
        <div>
          <SupordoSiteDemo site={site} variant="preview" previewAspect="1 / 1" priority />

          <p className="mt-4 text-xs text-[var(--supordo-graphite)]/70">
            {DEMO_LABEL} — {site.companyName}, entreprise fictive.
          </p>
        </div>
      </div>
    </section>
  );
}
