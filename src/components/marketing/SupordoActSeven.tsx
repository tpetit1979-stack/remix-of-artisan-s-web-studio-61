import { Link } from "@tanstack/react-router";

/**
 * Acte 7 — Réassurance, FAQ et action finale (plan-directeur-supordo-com.md
 * §4, Acte 7). Ferme la landing avant le pied de page.
 *
 * Cinq questions maximum, chacune adossée à un fait déjà fermé dans le plan
 * (§17 : libellé de l'action ; §18 : création initiale, publication,
 * demandes reçues ; §20-§21 : vocabulaire). Aucun témoignage, aucune
 * statistique, aucune promesse SEO, aucun logo — rien de ce que le plan
 * interdit tant que ce n'est pas prouvé. Les sujets encore ouverts
 * (engagement, domaine, résiliation, support) sont volontairement absents,
 * pas éludés par une réponse vague.
 *
 * Même CTA, même route, même garde `leadIntakeReady` que le Hero et
 * l'Acte 6 — jamais un bouton qui mènerait vers une prise de contact non
 * fonctionnelle.
 */
const FAQ_ITEMS = [
  {
    question: "Est-ce que je dois construire mon site moi-même ?",
    answer:
      "Non. SUPORDO prépare les pages du site. L'entreprise renseigne et actualise les informations qu'elle souhaite montrer.",
  },
  {
    question: "Est-ce que je peux modifier mes prestations et mes informations ?",
    answer:
      "Oui. Les informations de l'entreprise peuvent être actualisées depuis l'espace SUPORDO selon les fonctions disponibles.",
  },
  {
    question: "Que se passe-t-il côté technique ?",
    answer: "SUPORDO s'occupe de la partie technique du site.",
  },
  {
    question: "Les demandes envoyées depuis mon site sont-elles accessibles ?",
    answer:
      "Les demandes envoyées depuis votre site restent consultables dans votre espace SUPORDO.",
  },
  {
    question: "Mon site est-il vraiment en ligne, ou est-ce un exemple ?",
    answer:
      "Votre site est mis en ligne sur une adresse SUPORDO dès sa création — ce n'est pas une simple démonstration.",
  },
] as const;

export function SupordoActSeven({ leadIntakeReady = false }: { leadIntakeReady?: boolean }) {
  return (
    <section
      className="border-t border-[var(--supordo-mint-200)] bg-[var(--supordo-warm)] py-16 md:py-20 lg:py-24"
      aria-labelledby="supordo-act7-title"
    >
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="max-w-[760px]">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--supordo-green)] lg:text-sm">
            AVANT DE VOUS DÉCIDER
          </p>
          <h2
            id="supordo-act7-title"
            className="mt-4 text-[2rem] font-extrabold leading-[1.12] text-[var(--supordo-forest)] sm:text-[2.5rem] lg:text-[3rem]"
          >
            Les questions que vous vous posez sûrement.
          </h2>
        </div>

        <dl className="mt-10 max-w-[760px] divide-y divide-[var(--supordo-mint-200)] lg:mt-12">
          {FAQ_ITEMS.map((item) => (
            <div key={item.question} className="py-5 first:pt-0">
              <dt className="text-base font-bold text-[var(--supordo-forest)] lg:text-lg">
                {item.question}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-[var(--supordo-graphite)] lg:text-base">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>

        {leadIntakeReady && (
          <div className="mt-12 border-t border-[var(--supordo-mint-200)] pt-10 lg:mt-14 lg:pt-12">
            <Link
              to="/demarrer"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-[6px] bg-[var(--supordo-green)] px-6 text-sm font-semibold text-white transition-colors hover:bg-[var(--supordo-green-hover)] active:bg-[var(--supordo-forest)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-forest)] sm:w-auto lg:min-h-[52px] lg:px-7 lg:text-base"
            >
              Demander mon site
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
