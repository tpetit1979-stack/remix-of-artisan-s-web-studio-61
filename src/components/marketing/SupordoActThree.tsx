/**
 * Acte 3 — "Ce que vous indiquez dans SUPORDO se retrouve sur votre site."
 * (plan-directeur-supordo-com.md §4, Acte 3, doctrine vocabulaire §20-§21).
 *
 * Preuve appariée : un même service, réellement enregistré dans SUPORDO,
 * réellement présenté sur le site public du client. Vérifié en base
 * (projet bygdvkpjreuilqghtnka) avant d'écrire ce composant : tenant
 * EASYDEP (slug bfie-easydep), service "Installation poêle à bois"
 * (id 05e5e4af-5180-440b-961b-094f4dad5077) — même nom, même description,
 * même photo (tenant_media, category="service") des deux côtés. Le nom du
 * service ci-dessous est donc réel, pas inventé.
 *
 * Ni capture de l'espace ni capture de la page publique n'ont pu être
 * produites depuis cet environnement (réseau sortant vers Supabase bloqué
 * par la politique de sandbox — vérifié, pas supposé). En attendant ces
 * vraies captures, les deux blocs montrent le même contenu réel deux fois,
 * dans deux traitements typographiques distincts (extrait de page publique
 * vs fiche structurée) — jamais une interface reconstituée qui imiterait
 * le vrai produit ou un faux navigateur.
 *
 * Le nom du client (EASYDEP) n'est délibérément pas affiché : la question
 * du consentement à afficher un client réel reste ouverte (plan-directeur
 * §15, question 5). Seul le contenu du service — déjà public par nature —
 * est montré. `serviceName`/`serviceDescription` sont des props pour que
 * remplacer la source de la preuve n'exige aucune reprise de la mise en page.
 */
interface SupordoActThreeProps {
  serviceName?: string;
  serviceDescription?: string;
}

export function SupordoActThree({
  serviceName = "Installation poêle à bois",
  serviceDescription = "Installation de poêles à bois avec contrôle du conduit.",
}: SupordoActThreeProps) {
  return (
    <section
      className="border-t border-[var(--supordo-mint-200)] bg-white py-16 md:py-20 lg:py-24"
      aria-labelledby="supordo-act3-title"
    >
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="max-w-[600px]">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--supordo-green)] lg:text-sm">
            VOS PRESTATIONS
          </p>
          <h2
            id="supordo-act3-title"
            className="mt-4 text-[2rem] font-extrabold leading-[1.12] text-[var(--supordo-forest)] sm:text-[2.5rem] lg:text-[3rem]"
          >
            Ce que vous ajoutez dans SUPORDO se retrouve sur votre site.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
            Vous ajoutez une prestation et les informations utiles qui l'accompagnent. SUPORDO les
            présente dans la structure prévue pour votre site.
          </p>
        </div>

        {/* Mobile : résultat public d'abord, pleine largeur ; fiche ensuite,
            recadrée. Desktop : asymétrie 2/3 (site public) / 1/3 (espace),
            jamais côte à côte à égalité — le site public reste dominant. */}
        <div className="mt-10 flex flex-col gap-6 lg:mt-14 lg:flex-row lg:items-start lg:gap-10">
          {/* Extrait du site public — deux tiers du poids visuel, typographie
              de page réelle : jamais un cadre de navigateur, jamais une UI. */}
          <div className="order-1 lg:w-2/3">
            <div className="flex h-full min-h-[280px] w-full flex-col justify-center overflow-hidden rounded-[10px] border border-[var(--supordo-mint-200)] bg-white p-8 md:p-10 lg:min-h-[360px] lg:p-12">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--supordo-graphite)]/70">
                Extrait de votre site public
              </p>
              <h3 className="mt-3 text-xl font-extrabold leading-snug text-[var(--supordo-forest)] sm:text-2xl lg:text-[1.75rem]">
                {serviceName}
              </h3>
              <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-[var(--supordo-graphite)] lg:text-base">
                {serviceDescription}
              </p>
            </div>
          </div>

          {/* Fiche dans l'espace SUPORDO — un tiers, présentée comme une
              information structurée (label / valeur), jamais un widget
              d'interface reconstitué. */}
          <div className="order-2 lg:w-1/3">
            <div className="flex h-full min-h-[280px] w-full flex-col justify-center overflow-hidden rounded-[10px] border border-[var(--supordo-mint-200)] bg-[var(--supordo-warm)] p-6 md:p-8 lg:min-h-[360px]">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--supordo-graphite)]/70">
                Dans votre espace SUPORDO
              </p>
              <dl className="mt-4 space-y-3">
                <div className="border-t border-[var(--supordo-mint-200)] pt-3 first:border-t-0 first:pt-0">
                  <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--supordo-graphite)]/70">
                    Prestation
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-[var(--supordo-forest)]">
                    {serviceName}
                  </dd>
                </div>
                <div className="border-t border-[var(--supordo-mint-200)] pt-3">
                  <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--supordo-graphite)]/70">
                    Description
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-[var(--supordo-graphite)]">
                    {serviceDescription}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
