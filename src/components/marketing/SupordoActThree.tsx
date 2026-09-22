import { SupordoDemoService } from "./SupordoSiteDemo";
import { SUPORDO_DEMO_SITE } from "@/data/marketing/supordo-demo-site";

/**
 * Acte 4A — Une prestation.
 *
 * Le mécanisme, rendu visible : une information structurée d'un côté, une
 * vraie section de site public de l'autre. Le site public est nettement plus
 * grand — c'est le résultat qu'on achète, pas l'interface.
 *
 * « prend place sur votre site » plutôt que « se retrouve » : le produit ne
 * garantit pas une synchronisation instantanée, et le verbe ne doit pas la
 * suggérer.
 *
 * L'entreprise, la prestation et la commune sont fictives — mêmes données que
 * la démonstration de l'Acte 3, pour que le visiteur comprenne qu'il regarde
 * le même site.
 */
const service = SUPORDO_DEMO_SITE.services[0]!;

export function SupordoActThree() {
  return (
    <section
      className="border-t border-[var(--supordo-mint-200)] bg-white py-16 md:py-20 lg:py-24"
      aria-labelledby="supordo-act3-title"
    >
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="max-w-[640px]">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--supordo-green)] lg:text-sm">
            VOS PRESTATIONS
          </p>
          <h2
            id="supordo-act3-title"
            className="mt-4 text-[2rem] font-extrabold leading-[1.12] text-[var(--supordo-forest)] sm:text-[2.5rem] lg:text-[3rem]"
          >
            Ce que vous ajoutez dans SUPORDO prend place sur votre site.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
            Ajoutez les informations utiles sur une prestation. SUPORDO les présente là où vos
            clients doivent les trouver.
          </p>
        </div>

        {/* Mobile : la fiche, puis le résultat public. Desktop : un tiers /
            deux tiers, le site public dominant. Aucune flèche illustrée —
            c'est l'écart et la taille qui disent le sens de lecture. */}
        <div className="mt-10 grid gap-6 lg:mt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.9fr)] lg:items-center lg:gap-12">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--supordo-graphite)]/70">
              Dans votre espace SUPORDO
            </p>
            <div className="mt-3 rounded-[10px] border border-[var(--supordo-mint-200)] bg-[var(--supordo-warm)] p-5 md:p-6">
              <dl className="space-y-4">
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--supordo-graphite)]/70">
                    Prestation
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-[var(--supordo-forest)]">
                    {service.name}
                  </dd>
                </div>
                <div className="border-t border-[var(--supordo-mint-200)] pt-4">
                  <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--supordo-graphite)]/70">
                    Description
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-[var(--supordo-graphite)]">
                    {service.description}
                  </dd>
                </div>
                <div className="border-t border-[var(--supordo-mint-200)] pt-4">
                  <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--supordo-graphite)]/70">
                    Zone d'intervention
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-[var(--supordo-forest)]">
                    {SUPORDO_DEMO_SITE.city}
                  </dd>
                </div>
                <div className="border-t border-[var(--supordo-mint-200)] pt-4">
                  <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--supordo-graphite)]/70">
                    Photo
                  </dt>
                  <dd className="mt-1 text-sm text-[var(--supordo-graphite)]">1 photo ajoutée</dd>
                </div>
              </dl>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--supordo-graphite)]/70">
              Sur votre site
            </p>
            <div className="mt-3">
              <SupordoDemoService service={service} size="lg" />
            </div>
          </div>
        </div>

        <p className="mt-6 text-sm text-[var(--supordo-graphite)]/70 lg:mt-8">
          Démonstration SUPORDO — entreprise et prestation fictives.
        </p>
      </div>
    </section>
  );
}
