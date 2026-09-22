import couvreur from "@/assets/marketing/trades/couvreur.webp.asset.json";

/**
 * Acte 4B — Une réalisation.
 *
 * Deuxième preuve du même chapitre que l'Acte 4A : après une prestation,
 * un chantier. La lecture est une transformation en trois temps — le travail
 * réalisé, la réalisation ajoutée, le rendu public — et non trois cartes
 * numérotées d'onboarding.
 *
 * Les champs cités (photo, titre, commune, prestation) sont ceux du modèle
 * réel `portfolio` `[PROUVÉ PRODUIT]`. Rien n'est promis sur la publication
 * automatique : le produit publie au cas par cas, la copy dit « que vous
 * choisissez de montrer ».
 *
 * L'image est une illustration de marque SUPORDO, jamais présentée comme le
 * chantier d'un client. Aucune capture d'interface n'est reconstituée.
 */
const EXEMPLE = {
  titre: "Réfection de toiture",
  commune: "Aubagne",
  prestation: "Couverture",
} as const;

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
            Un chantier terminé, quelques photos et les informations utiles : vos futurs clients
            découvrent votre travail avant de vous contacter.
          </p>
        </div>

        {/* Desktop : trois temps en ligne, la photo porte le poids visuel.
            Mobile : empilés, la photo d'abord — c'est elle qui fait comprendre
            de quoi on parle avant toute explication. */}
        <div className="mt-10 grid gap-5 lg:mt-14 lg:grid-cols-[1.4fr_1fr_1fr] lg:items-stretch lg:gap-6">
          <figure className="overflow-hidden rounded-[10px] border border-[var(--supordo-mint-200)] bg-[var(--supordo-mint-100)]">
            <div className="aspect-[4/3] w-full lg:aspect-auto lg:h-full lg:min-h-[320px]">
              <img
                src={couvreur.url}
                alt="Couvreur travaillant sur une toiture"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          </figure>

          <div className="flex flex-col justify-center rounded-[10px] border border-[var(--supordo-mint-200)] bg-white p-6 md:p-8">
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--supordo-graphite)]/70">
              La réalisation que vous ajoutez
            </p>
            <dl className="mt-4 space-y-3">
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--supordo-graphite)]/70">
                  Titre
                </dt>
                <dd className="mt-1 text-sm font-semibold text-[var(--supordo-forest)]">
                  {EXEMPLE.titre}
                </dd>
              </div>
              <div className="border-t border-[var(--supordo-mint-200)] pt-3">
                <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--supordo-graphite)]/70">
                  Commune
                </dt>
                <dd className="mt-1 text-sm font-semibold text-[var(--supordo-forest)]">
                  {EXEMPLE.commune}
                </dd>
              </div>
              <div className="border-t border-[var(--supordo-mint-200)] pt-3">
                <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--supordo-graphite)]/70">
                  Prestation
                </dt>
                <dd className="mt-1 text-sm font-semibold text-[var(--supordo-forest)]">
                  {EXEMPLE.prestation}
                </dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-col justify-center rounded-[10px] border border-[var(--supordo-mint-200)] bg-white p-6 md:p-8">
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--supordo-graphite)]/70">
              Sur votre site
            </p>
            <h3 className="mt-3 text-lg font-extrabold leading-snug text-[var(--supordo-forest)] lg:text-xl">
              {EXEMPLE.titre}
            </h3>
            <p className="mt-2 text-sm text-[var(--supordo-graphite)]">
              {EXEMPLE.commune} · {EXEMPLE.prestation}
            </p>
            <p className="mt-4 border-t border-[var(--supordo-mint-200)] pt-4 text-sm leading-relaxed text-[var(--supordo-graphite)]">
              Vos clients voient le chantier, la commune et la prestation concernée.
            </p>
          </div>
        </div>

        <p className="mt-6 max-w-[640px] text-sm leading-relaxed text-[var(--supordo-graphite)] lg:mt-8">
          Vous choisissez les réalisations que vous montrez.
        </p>
      </div>
    </section>
  );
}
