import { SupordoDemoProject } from "./SupordoSiteDemo";
import { SupordoBeforeAfter } from "./SupordoBeforeAfter";
import { DEMO_SITES } from "@/data/marketing/supordo-demo-site";

/**
 * Acte 4B — Un chantier.
 *
 * Deuxième preuve du même chapitre : après une prestation, un travail réalisé.
 * La photographie du chantier est la matière première et domine la
 * composition ; la fiche reste petite ; le rendu public appartient
 * visuellement au site de démonstration, pas à l'interface SUPORDO.
 *
 * Les champs (titre, commune, prestation, photo) sont ceux du modèle réel
 * `portfolio`. Le verbe reste prudent : le produit publie au cas par cas,
 * donc « pour le présenter parmi les réalisations », jamais « il devient
 * automatiquement ».
 *
 * Métier choisi : la couverture. Chaque acte illustré montre un métier
 * différent (plomberie en 4A, couverture ici, électricité à l'acte 5,
 * chauffage à la fermeture), et une toiture terminée se lit en une
 * demi-seconde, de loin, sur un téléphone.
 *
 * L'« après » est une photographie ; l'« avant » n'existe pas encore et
 * reste un emplacement dimensionné. Inventer la photographie manquante
 * reviendrait à montrer un chantier qui n'a pas eu lieu.
 *
 * Chantier, entreprise et commune sont fictifs.
 */
const site = DEMO_SITES.roofing;
const project = site.projects[0]!;

export function SupordoActRealisation() {
  return (
    <section
      className="border-t border-[var(--supordo-mint-200)] bg-[var(--supordo-warm)] py-16 md:py-20 lg:py-24"
      aria-labelledby="supordo-realisation-title"
    >
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="max-w-[640px]">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--supordo-green)] lg:text-sm">
            VOS CHANTIERS
          </p>
          <h2
            id="supordo-realisation-title"
            className="mt-4 text-[2rem] font-extrabold leading-[1.12] text-[var(--supordo-forest)] sm:text-[2.5rem] lg:text-[3rem]"
          >
            Montrez le travail que vous faites vraiment.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
            Ajoutez une photo et quelques informations sur un chantier pour le présenter parmi les
            réalisations de votre site.
          </p>
        </div>

        {/* Desktop : la photo occupe la moitié gauche, la fiche est petite,
            le rendu public est plus grand qu'elle. Mobile : photo, fiche,
            rendu — dans l'ordre de la transformation. */}
        <div className="mt-10 grid gap-6 lg:mt-14 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--supordo-graphite)]/70">
              Le chantier
            </p>
            <div className="mt-3">
              <SupordoBeforeAfter project={project} />
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--supordo-graphite)]/70">
              Dans SUPORDO
            </p>
            <div className="mt-3 rounded-[10px] border border-[var(--supordo-mint-200)] bg-white p-5">
              <dl className="space-y-3.5">
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--supordo-graphite)]/70">
                    Titre
                  </dt>
                  <dd className="mt-1 text-sm font-semibold leading-snug text-[var(--supordo-forest)]">
                    {project.title}
                  </dd>
                </div>
                <div className="border-t border-[var(--supordo-mint-200)] pt-3.5">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--supordo-graphite)]/70">
                    Commune
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-[var(--supordo-forest)]">
                    {project.city}
                  </dd>
                </div>
                <div className="border-t border-[var(--supordo-mint-200)] pt-3.5">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--supordo-graphite)]/70">
                    Prestation
                  </dt>
                  <dd className="mt-1 text-sm font-semibold leading-snug text-[var(--supordo-forest)]">
                    {project.service}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--supordo-graphite)]/70">
              Sur votre site
            </p>
            <div className="mt-3">
              <SupordoDemoProject project={project} site={site} size="lg" />
            </div>
          </div>
        </div>

        <p className="mt-6 text-sm text-[var(--supordo-graphite)]/70 lg:mt-8">
          Démonstration SUPORDO — chantier et entreprise fictifs. Vous choisissez les réalisations
          que vous montrez.
        </p>
      </div>
    </section>
  );
}
