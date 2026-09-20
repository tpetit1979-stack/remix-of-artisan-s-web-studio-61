/**
 * Acte 3 — "Ce que vos clients voient, ce que vous renseignez"
 * (plan-directeur-supordo-com.md §4, Acte 3).
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
 * par la politique de sandbox — vérifié, pas supposé). Les deux emplacements
 * réservent leur ratio et leur rayon final, sur le même principe que le
 * slot photo du Hero : jamais une interface fictive dessinée à la place.
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
        <div className="max-w-[760px]">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--supordo-green)] lg:text-sm">
            CE QUE VOS CLIENTS VOIENT
          </p>
          <h2
            id="supordo-act3-title"
            className="mt-4 text-[2rem] font-extrabold leading-[1.12] text-[var(--supordo-forest)] sm:text-[2.5rem] lg:text-[3rem]"
          >
            Ce que vous indiquez dans SUPORDO se retrouve sur votre site.
          </h2>
          <p className="mt-5 max-w-[650px] text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
            Par exemple, vous indiquez la prestation « {serviceName} » dans
            votre espace ; elle est ensuite présentée sur votre site public.
          </p>
        </div>

        {/* Mobile : résultat public d'abord, pleine largeur ; fiche ensuite,
            recadrée. Desktop : asymétrie 2/3 (site public) / 1/3 (espace),
            jamais côte à côte à égalité — le site public reste dominant. */}
        <div className="mt-10 flex flex-col gap-6 lg:mt-12 lg:flex-row lg:items-start lg:gap-8">
          {/* Site public réel — deux tiers du poids visuel */}
          <div className="order-1 lg:w-2/3">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-[10px] border border-[var(--supordo-mint-200)] bg-[var(--supordo-mint-100)] lg:aspect-[16/10]">
              <div className="flex h-full w-full flex-col justify-end p-5 md:p-6">
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--supordo-graphite)]/70">
                  Page publique du service — capture à fournir
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--supordo-forest)]">
                  {serviceName}
                </p>
              </div>
            </div>
          </div>

          {/* Fiche dans l'espace SUPORDO — un tiers, recadrée sur les champs utiles */}
          <div className="order-2 lg:w-1/3">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-[10px] border border-[var(--supordo-mint-200)] bg-[var(--supordo-warm)] lg:aspect-square">
              <div className="flex h-full w-full flex-col justify-end p-5 md:p-6">
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--supordo-graphite)]/70">
                  Fiche du service dans l'espace — capture à fournir
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--supordo-forest)]">
                  {serviceName}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--supordo-graphite)]">
                  {serviceDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
