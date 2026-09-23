import { Link } from "@tanstack/react-router";
import { ARTISAN_KEEPS_SHORT, SUPORDO_KEEPS_SHORT } from "@/data/marketing/supordo-promise";

/**
 * Acte 6 — Qui fait quoi.
 *
 * Deux territoires typographiques, pas deux listes à puces perdues dans du
 * blanc : ce qui appartient à l'entreprise, ce qui appartient à SUPORDO. Les
 * notions ont déjà été expliquées par les actes précédents — ici, des mots
 * suffisent.
 *
 * La phrase signature ferme le chapitre : elle porte la différenciation
 * (ni agence, ni constructeur de site) et prend toute la largeur de lecture.
 *
 * Périmètre SUPORDO limité à ce qui est confirmé par l'offre : structure,
 * présentation, mise en ligne, hébergement, maintenance technique. Jamais
 * « maintient votre site » seul, qui laisserait entendre que SUPORDO
 * actualise les contenus du client.
 *
 * Les deux listes viennent de `supordo-promise.ts`, partagé avec `/tarifs` :
 * deux registres, un seul endroit, donc aucune divergence possible entre ce
 * que la page d'accueil promet et ce que la page tarifaire détaille.
 *
 * La phrase de clôture pleine largeur a été retirée : elle annonçait « une
 * seule offre » juste avant la section qui donne le prix, et fermait un
 * chapitre au milieu de la page. Le lien vers `/comment-ca-marche` la
 * remplace — c'est là que le mécanisme se démontre depuis le lot précédent.
 */

function Territoire({
  eyebrow,
  titre,
  items,
  accent,
}: {
  eyebrow: string;
  titre: string;
  items: readonly string[];
  accent: string;
}) {
  return (
    <div>
      <p className={`text-xs font-bold uppercase tracking-[0.14em] ${accent}`}>{eyebrow}</p>
      <p className="mt-3 text-2xl font-extrabold leading-tight text-[var(--supordo-forest)] lg:text-[2rem]">
        {titre}
      </p>
      <ul className="mt-6 space-y-2.5">
        {items.map((item) => (
          <li
            key={item}
            className="text-lg font-semibold leading-snug text-[var(--supordo-graphite)] lg:text-xl"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SupordoActFive() {
  return (
    <section
      className="border-t border-[var(--supordo-mint-200)] bg-[var(--supordo-warm)] py-16 md:py-20 lg:py-24"
      aria-labelledby="supordo-act5-title"
    >
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="max-w-[640px]">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--supordo-green)] lg:text-sm">
            CHACUN SON MÉTIER
          </p>
          <h2
            id="supordo-act5-title"
            className="mt-4 text-[2rem] font-extrabold leading-[1.12] text-[var(--supordo-forest)] sm:text-[2.5rem] lg:text-[3rem]"
          >
            Vous êtes sur le terrain. Nous nous occupons du site.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
            Vous nous donnez les informations de votre entreprise. SUPORDO s'occupe de leur donner
            une place claire sur votre site et de sa partie technique.
          </p>
        </div>

        <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-2 lg:gap-16">
          <Territoire
            eyebrow="VOUS"
            titre="Votre entreprise."
            items={ARTISAN_KEEPS_SHORT}
            accent="text-[var(--supordo-forest)]/60"
          />
          <div className="lg:border-l lg:border-[var(--supordo-mint-200)] lg:pl-16">
            <Territoire
              eyebrow="SUPORDO"
              titre="Votre site."
              items={SUPORDO_KEEPS_SHORT}
              accent="text-[var(--supordo-green)]"
            />
          </div>
        </div>

        <Link
          to="/comment-ca-marche"
          className="mt-12 inline-flex min-h-11 items-center border-t border-[var(--supordo-mint-200)] pt-8 text-base font-semibold text-[var(--supordo-forest)] underline underline-offset-4 transition-colors hover:text-[var(--supordo-green)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-green)] lg:mt-14 lg:text-lg"
        >
          Voir comment une information devient une page →
        </Link>
      </div>
    </section>
  );
}
