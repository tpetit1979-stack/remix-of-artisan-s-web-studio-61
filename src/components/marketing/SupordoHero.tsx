/**
 * SUPORDO Sites hero — marketing surface only (supordo.com).
 *
 * Copy is fixed by the brand and must not be rephrased here.
 *
 * The right-hand column is a photography slot, not decoration: SUPORDO owns
 * no definitive trade photograph yet, and an artisan tenant's own photo is
 * their asset, never SUPORDO marketing material. The slot keeps the final
 * image's footprint (same column, same aspect ratio, same radius) so dropping
 * the real photograph in later needs no change to this composition.
 *
 * Both CTAs are rendered as buttons without a destination: neither a SUPORDO
 * Sites product page nor an example-site page exists as a route yet, and no
 * route may be invented here.
 */
export function SupordoHero() {
  return (
    <section className="bg-[var(--supordo-warm)]">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 py-14 md:px-8 md:py-20 lg:grid-cols-2 lg:gap-16 lg:py-28">
        {/* Text first in the DOM: also the mobile order */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--supordo-green)]">
            SUPORDO SITES
          </p>
          <h1 className="mt-5 text-[2rem] font-extrabold leading-[1.1] tracking-[-0.02em] text-[var(--supordo-forest)] sm:text-[2.5rem] lg:text-[3.25rem]">
            Un vrai site pro. Un espace simple pour le faire vivre.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
            Ajoutez vos services, vos zones et vos réalisations. Publiez vos photos
            de chantier sans avoir à gérer votre site.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-[6px] bg-[var(--supordo-green)] px-6 text-sm font-semibold text-white transition-colors hover:bg-[var(--supordo-green-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-forest)] sm:w-auto"
            >
              Découvrir SUPORDO Sites
            </button>
            <button
              type="button"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-[6px] border border-[var(--supordo-mint-200)] bg-white px-6 text-sm font-semibold text-[var(--supordo-forest)] transition-colors hover:border-[var(--supordo-green)] hover:text-[var(--supordo-green)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-green)] sm:w-auto"
            >
              Voir un exemple
            </button>
          </div>
        </div>

        {/* Photography slot — asset still to be supplied */}
        <div className="lg:pl-4">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-[10px] border border-[var(--supordo-mint-200)] bg-[var(--supordo-mint-100)]">
            <div className="flex h-full w-full items-end p-5 md:p-6">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--supordo-graphite)]/70">
                Photographie métier SUPORDO — à fournir
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
