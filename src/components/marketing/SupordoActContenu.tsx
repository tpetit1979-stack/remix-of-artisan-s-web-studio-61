import { Link } from "@tanstack/react-router";

/**
 * Acte 5 — Ce que vos clients trouvent sur votre site.
 *
 * Répond à la question qui suit les deux preuves : « globalement, qu'est-ce
 * qu'il y a sur mon site ? » Deux territoires éditoriaux — l'entreprise, le
 * travail — et non une grille de cartes à icônes : le plan directeur écarte
 * la liste de fonctions à cocher, et c'est exactement ce qu'une grille de six
 * cartes produirait.
 *
 * Chaque entrée correspond à un objet réel du produit `[PROUVÉ PRODUIT]` :
 * services, service_areas, portfolio, team_members, tenant_partners,
 * coordonnées du tenant. Rien n'est listé qui n'existe pas.
 *
 * Équipe et partenaires sont formulés prudemment : l'affichage de l'équipe
 * reste conditionné par un réglage verrouillé côté plateforme.
 */
const ENTREPRISE = [
  { titre: "Votre métier", texte: "Ce que fait votre entreprise." },
  { titre: "Vos prestations", texte: "Les travaux et interventions que vous proposez." },
  { titre: "Vos zones d'intervention", texte: "Les communes où vous vous déplacez." },
  { titre: "Vos coordonnées", texte: "De quoi vous joindre directement." },
] as const;

const TRAVAIL = [
  { titre: "Vos réalisations", texte: "Les chantiers que vous choisissez de montrer." },
  {
    titre: "Vos photos",
    texte: "Des images de votre travail, sur vos prestations comme sur vos chantiers.",
  },
  {
    titre: "Votre équipe",
    texte: "Les personnes de l'entreprise, lorsque leur affichage est activé.",
  },
  { titre: "Vos partenaires", texte: "Les marques et partenaires que vous souhaitez indiquer." },
] as const;

function Colonne({
  titre,
  entrees,
}: {
  titre: string;
  entrees: readonly { readonly titre: string; readonly texte: string }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-[var(--supordo-green)]">
        {titre}
      </h3>
      <dl className="mt-6 space-y-5">
        {entrees.map((entree) => (
          <div
            key={entree.titre}
            className="border-t border-[var(--supordo-mint-200)] pt-5 first:border-t-0 first:pt-0"
          >
            <dt className="text-base font-bold text-[var(--supordo-forest)] lg:text-lg">
              {entree.titre}
            </dt>
            <dd className="mt-1.5 text-sm leading-relaxed text-[var(--supordo-graphite)] lg:text-base">
              {entree.texte}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function SupordoActContenu() {
  return (
    <section
      className="border-t border-[var(--supordo-mint-200)] bg-white py-16 md:py-20 lg:py-24"
      aria-labelledby="supordo-contenu-title"
    >
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="max-w-[640px]">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--supordo-green)] lg:text-sm">
            VOTRE SITE
          </p>
          <h2
            id="supordo-contenu-title"
            className="mt-4 text-[2rem] font-extrabold leading-[1.12] text-[var(--supordo-forest)] sm:text-[2.5rem] lg:text-[3rem]"
          >
            Ce que vos clients trouvent sur votre site.
          </h2>
        </div>

        <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-2 lg:gap-16">
          <Colonne titre="VOTRE ENTREPRISE" entrees={ENTREPRISE} />
          <Colonne titre="VOTRE TRAVAIL" entrees={TRAVAIL} />
        </div>

        <div className="mt-10 border-t border-[var(--supordo-mint-200)] pt-8 lg:mt-14">
          <p className="text-base font-semibold leading-snug text-[var(--supordo-forest)] lg:text-lg">
            Votre site s'adapte au téléphone, à la tablette et à l'ordinateur.
          </p>
          <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-[var(--supordo-graphite)] lg:text-base">
            Les demandes envoyées depuis votre site restent consultables dans votre espace SUPORDO.
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
