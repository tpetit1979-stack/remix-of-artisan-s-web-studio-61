/**
 * Trade recognition section for the SUPORDO Sites marketing landing only.
 *
 * The illustration files do not exist in the repository yet. Each card keeps
 * the final image footprint and names its expected asset explicitly rather
 * than substituting tenant media or a decorative stand-in. Once supplied,
 * images belong in `src/assets/marketing/trades/` using the filenames below.
 */
const TRADES = [
  { name: "Chauffagiste", asset: "chauffagiste.webp" },
  { name: "Plombier", asset: "plombier.webp" },
  { name: "Électricien", asset: "electricien.webp" },
  { name: "Ramoneur · Professionnel de la cheminée", asset: "ramoneur-cheminee.webp" },
  { name: "Climaticien", asset: "climaticien.webp" },
  { name: "Couvreur", asset: "couvreur.webp" },
  { name: "Menuisier", asset: "menuisier.webp" },
  { name: "Maçon", asset: "macon.webp" },
  { name: "Paysagiste", asset: "paysagiste.webp" },
  { name: "Peintre", asset: "peintre.webp" },
] as const;

export function SupordoTrades() {
  return (
    <section
      className="overflow-hidden border-t border-[var(--supordo-mint-200)] bg-white py-16 md:py-20 lg:py-24"
      aria-labelledby="supordo-trades-title"
    >
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="max-w-[760px]">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--supordo-green)] lg:text-sm">
            PENSÉ POUR VOTRE MÉTIER
          </p>
          <h2
            id="supordo-trades-title"
            className="mt-4 text-[2rem] font-extrabold leading-[1.12] text-[var(--supordo-forest)] sm:text-[2.5rem] lg:text-[3rem]"
          >
            Un site professionnel adapté à votre activité.
          </h2>
          <p className="mt-5 max-w-[650px] text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
            Votre métier, vos services, vos réalisations.
            <br />
            SUPORDO vous donne une base professionnelle que vous pouvez faire vivre simplement.
          </p>
        </div>

        <div className="mt-10 md:mt-12">
          <p className="mb-4 text-sm font-medium text-[var(--supordo-graphite)] md:hidden">
            Faites défiler les métiers
          </p>
          <ul
            className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-5 [scrollbar-color:var(--supordo-green)_var(--supordo-mint-100)] [scrollbar-width:thin] md:-mx-8 md:gap-5 md:px-8 lg:mx-0 lg:px-0"
            aria-label="Métiers accompagnés par SUPORDO Sites"
          >
            {TRADES.map((trade) => (
              <li
                key={trade.asset}
                className="w-[82vw] max-w-[340px] shrink-0 snap-start md:w-[330px] lg:w-[350px]"
              >
                <article className="overflow-hidden rounded-[6px] border border-[var(--supordo-mint-200)] bg-[var(--supordo-warm)]">
                  <div className="flex aspect-[4/5] items-center justify-center bg-[var(--supordo-mint-100)] px-8 text-center">
                    <div>
                      <p className="text-sm font-semibold text-[var(--supordo-forest)]">
                        Illustration SUPORDO à ajouter
                      </p>
                      <p className="mt-2 break-all text-xs text-[var(--supordo-graphite)]/70">
                        {trade.asset}
                      </p>
                    </div>
                  </div>
                  <div className="flex min-h-20 items-center border-t border-[var(--supordo-mint-200)] px-5 py-4">
                    <h3 className="text-lg font-bold leading-snug text-[var(--supordo-forest)]">
                      {trade.name}
                    </h3>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}