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
 * Aucun appel à l'action ici : la page se ferme sur l'Acte 9, juste après.
 * Deux gros boutons à quelques centaines de pixels d'écart se neutralisent.
 */
const FAQ_ITEMS = [
  {
    question: "Est-ce que je dois construire mon site moi-même ?",
    answer:
      "Non. SUPORDO prépare les pages du site. L'entreprise renseigne et actualise les informations qu'elle souhaite montrer.",
  },
  {
    question: "Que puis-je modifier moi-même ?",
    answer:
      "Vous actualisez les informations prises en charge dans votre espace SUPORDO, notamment vos prestations, vos zones d'intervention et vos réalisations.",
  },
  {
    question: "Qui s'occupe de la partie technique ?",
    answer:
      "SUPORDO prend en charge le périmètre technique prévu dans l'offre, notamment l'hébergement et la maintenance technique.",
  },
  {
    question: "Mon site fonctionne-t-il sur téléphone ?",
    answer: "Oui. Votre site s'adapte au téléphone, à la tablette et à l'ordinateur.",
  },
  {
    question: "Quelle adresse aura mon site ?",
    answer:
      "Une adresse SUPORDO est comprise dans l'offre. Un nom de domaine personnalisé peut être proposé en option.",
  },
  {
    question: "Les demandes envoyées depuis mon site sont-elles accessibles ?",
    answer:
      "Les demandes envoyées depuis votre site restent consultables dans votre espace SUPORDO.",
  },
] as const;

export function SupordoActSeven() {
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
            Les questions que vous vous posez avant de commencer.
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
      </div>
    </section>
  );
}
