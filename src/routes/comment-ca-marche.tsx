import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { resolveTenantInputForRoute, isMarketingHost } from "@/lib/tenant";
import { SupordoHeader } from "@/components/marketing/SupordoHeader";
import { SupordoFooter } from "@/components/marketing/SupordoFooter";

/**
 * SUPORDO Sites "comment ça marche" page — marketing surface only
 * (supordo.com). Same route pattern as /tarifs: marketing-host guard,
 * Les appels à l'action marketing y sont visibles en permanence.
 *
 * Every capability named below is verified in the current code (services
 * is_active, portfolio is_published + content_kind='real_project' via
 * isAuthenticPublicPortfolioItem, service_areas insert, tenants.phone/email,
 * site_settings.hero_title, TeamManager/PartnersManager CRUD, contacts
 * insert + is_read) — not deduced from documentation. See the read-only
 * mission that mapped every artisan action screen by screen before this
 * page was written.
 *
 * Craft pass: numbering (01/02) now marks only the two real, parallel
 * artisan-facing moments (keep information up to date / see it reflected
 * publicly) — not the opening (part of the hero) nor the closing (requests
 * + CTA), which aren't artisan actions. The visual centerpiece is the
 * admin→public demonstration in step 02, reusing the one real paired proof
 * in the repo (see DEMO_SERVICE_NAME below). No icons, no cards, no fake
 * screenshot anywhere on this page.
 *
 * Deliberately durable wording (plan doctrine: don't turn a temporary
 * product limit into a permanent rule): "les informations utiles de votre
 * activité" and "votre site suit l'activité de votre entreprise" name no
 * specific object, so the copy stays true once horaires/congés/actualités/
 * marques/distributeurs ship — nothing here says or implies these don't or
 * won't exist. Conversely, nothing on this page promises them today: they
 * are simply absent from the list of current examples, never denied.
 *
 * Excluded on purpose because not (yet) provable: horaires (no editing UI
 * found anywhere in admin.*.tsx), marques (no public renderer exists —
 * confirmed: no BrandsSection.tsx in src/components/public/), team section
 * visibility (locked to team_presentation_mode, super-admin only), any
 * reply/delete/export on a request, any delay or personalized domain.
 */
export const Route = createFileRoute("/comment-ca-marche")({
  loader: async () => {
    const input = await resolveTenantInputForRoute().catch(() => null);
    if (!input || !isMarketingHost(input.hostname)) throw notFound();
    return null;
  },
  head: () => {
    const title = "Comment fonctionne SUPORDO Sites ?";
    const description =
      "Découvrez comment SUPORDO prépare votre site, ce que vous fournissez et les informations que vous pouvez actualiser pour votre entreprise.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: CommentCaMarchePage,
});

const INFORMATIONS_A_JOUR = [
  "Vos prestations, et lesquelles sont visibles sur votre site",
  "Les communes où vous intervenez",
  "Vos chantiers, avec leurs photos",
  "Vos coordonnées",
  "Votre équipe, si elle a été activée par SUPORDO, et vos partenaires",
] as const;

/**
 * Même couple réel que l'Acte 3 de la home (service "Installation poêle à
 * bois", tenant EASYDEP, vérifié en base — voir SupordoActThree.tsx) : le
 * seul contenu apparié réellement prouvé dans le repo. Reproduit ici plutôt
 * qu'importé, car l'ordre de lecture est inversé exprès (espace SUPORDO
 * d'abord, site public ensuite, pour incarner "je change ici → ça apparaît
 * là") — ajouter cette variante à SupordoActThree via une nouvelle prop
 * aurait couplé deux récits différents pour un gain nul.
 */
const DEMO_SERVICE_NAME = "Installation poêle à bois";
const DEMO_SERVICE_DESCRIPTION = "Installation de poêles à bois avec contrôle du conduit.";

function StepNumber({ n }: { n: string }) {
  return (
    <span
      aria-hidden="true"
      className="block text-[2rem] font-extrabold leading-none text-[var(--supordo-forest)]/15 lg:text-[3rem]"
    >
      {n}
    </span>
  );
}

function CommentCaMarchePage() {
  return (
    <div className="supordo-brand flex min-h-screen flex-col bg-[var(--supordo-warm)] antialiased">
      <SupordoHeader />
      <main className="flex-1">
        {/* Ouverture — porte le H1 et la promesse d'ensemble, y compris ce
            qui se passe au départ (transmission → préparation → mise en
            ligne), en un seul paragraphe. Pas de numéro, pas de second
            titre : la version précédente répétait le H1 juste en dessous
            ("Ce que SUPORDO prépare au départ") — supprimé pour que la
            numérotation ne commence qu'aux deux vrais moments d'action de
            l'artisan (voir plus bas), pas à un rappel du hero. */}
        <section
          className="bg-[var(--supordo-warm)] py-24 md:py-28 lg:py-32"
          aria-labelledby="ccm-title"
        >
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <div className="max-w-[760px]">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--supordo-green)] lg:text-sm">
                COMMENT ÇA MARCHE
              </p>
              <h1
                id="ccm-title"
                className="mt-4 text-[2rem] font-extrabold leading-[1.12] tracking-[-0.02em] text-[var(--supordo-forest)] sm:text-[2.5rem] lg:text-[3rem]"
              >
                SUPORDO prépare votre site. Vous le gardez à jour.
              </h1>
              <p className="mt-5 max-w-[650px] text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
                Vous transmettez les informations de départ de votre entreprise — vos prestations,
                votre secteur, vos coordonnées. SUPORDO prépare la première version de votre site et
                sa mise en ligne. Ensuite, c'est vous qui la gardez à jour.
              </p>
            </div>
          </div>
        </section>

        {/* 01 — Vous gardez vos informations à jour. Liste resserrée à 5
            regroupements plutôt qu'une énumération exhaustive de la
            capacité produit. */}
        <section
          className="border-t border-[var(--supordo-mint-200)] bg-white py-16 md:py-20 lg:py-24"
          aria-labelledby="ccm-step1-title"
        >
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <div className="grid grid-cols-[auto_1fr] items-start gap-5 sm:gap-6 lg:grid-cols-[96px_1fr] lg:gap-10">
              <StepNumber n="01" />
              <div>
                <div className="max-w-[600px]">
                  <h2
                    id="ccm-step1-title"
                    className="text-[1.75rem] font-extrabold leading-[1.15] text-[var(--supordo-forest)] sm:text-[2rem]"
                  >
                    Vous gardez vos informations à jour
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
                    Quand quelque chose change dans votre entreprise, vous mettez à jour
                    l'information concernée, depuis votre espace SUPORDO.
                  </p>
                </div>
                {/* Deux colonnes à partir de lg : utilise l'espace que la
                    colonne 1fr laisse à droite du texte plutôt que d'ajouter
                    un élément décoratif pour le combler. */}
                <ul className="mt-6 grid gap-x-10 gap-y-3.5 lg:max-w-[900px] lg:grid-cols-2">
                  {INFORMATIONS_A_JOUR.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-base leading-relaxed text-[var(--supordo-graphite)]"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[0.65em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--supordo-green)]"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 02 — Ce que vous changez se retrouve sur votre site : le moment
            visuel central de la page. Reprend le seul couple réel et
            appairé du repo (voir DEMO_SERVICE_NAME plus haut), dans l'ordre
            cause → effet ("je change ici → ça apparaît là") — inverse de
            l'Acte 3 de la home, qui ouvre sur le résultat. Même grammaire
            visuelle que l'Acte 3 (bordure 1px Mint, rayon 10px, aucune UI
            reconstituée, aucun cadre de navigateur) pour rester cohérent
            avec le reste du site, sans importer le composant lui-même. */}
        <section
          className="border-t border-[var(--supordo-mint-200)] bg-[var(--supordo-mint-100)] py-16 md:py-20 lg:py-24"
          aria-labelledby="ccm-step2-title"
        >
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <div className="grid grid-cols-[auto_1fr] items-start gap-5 sm:gap-6 lg:grid-cols-[96px_1fr] lg:gap-10">
              <StepNumber n="02" />
              <div>
                <div className="max-w-[600px]">
                  <h2
                    id="ccm-step2-title"
                    className="text-[1.75rem] font-extrabold leading-[1.15] text-[var(--supordo-forest)] sm:text-[2rem]"
                  >
                    Ce que vous changez se retrouve sur votre site
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
                    Vous changez une information dans votre espace SUPORDO. Elle apparaît au même
                    endroit sur votre site.
                  </p>
                </div>

                <div className="mt-8 flex flex-col items-stretch gap-3 lg:mt-10 lg:flex-row lg:items-center lg:gap-6">
                  <div className="w-full lg:w-1/3">
                    <div className="flex h-full min-h-[220px] w-full flex-col justify-center overflow-hidden rounded-[10px] border border-[var(--supordo-mint-200)] bg-[var(--supordo-warm)] p-6 md:p-8 lg:min-h-[280px]">
                      <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--supordo-graphite)]/70">
                        Dans votre espace SUPORDO
                      </p>
                      <dl className="mt-4 space-y-3">
                        <div>
                          <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--supordo-graphite)]/70">
                            Prestation
                          </dt>
                          <dd className="mt-1 text-sm font-semibold text-[var(--supordo-forest)]">
                            {DEMO_SERVICE_NAME}
                          </dd>
                        </div>
                        <div className="border-t border-[var(--supordo-mint-200)] pt-3">
                          <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--supordo-graphite)]/70">
                            Description
                          </dt>
                          <dd className="mt-1 text-sm leading-relaxed text-[var(--supordo-graphite)]">
                            {DEMO_SERVICE_DESCRIPTION}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <span
                    aria-hidden="true"
                    className="self-center text-2xl font-extrabold text-[var(--supordo-green)]"
                  >
                    <span className="lg:hidden">↓</span>
                    <span className="hidden lg:inline">→</span>
                  </span>

                  <div className="w-full lg:w-2/3">
                    <div className="flex h-full min-h-[220px] w-full flex-col justify-center overflow-hidden rounded-[10px] border border-[var(--supordo-mint-200)] bg-white p-6 md:p-10 lg:min-h-[280px] lg:p-12">
                      <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--supordo-graphite)]/70">
                        Sur votre site public
                      </p>
                      <h3 className="mt-3 text-xl font-extrabold leading-snug text-[var(--supordo-forest)] sm:text-2xl lg:text-[1.75rem]">
                        {DEMO_SERVICE_NAME}
                      </h3>
                      <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-[var(--supordo-graphite)] lg:text-base">
                        {DEMO_SERVICE_DESCRIPTION}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="mt-6 max-w-[600px] text-sm leading-relaxed text-[var(--supordo-graphite)]/80 lg:text-base">
                  Il en va de même pour vos communes d'intervention, vos chantiers publiés et vos
                  coordonnées.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Respiration — bascule sur Forest exprès : rupture de rythme
            réelle après le moment le plus dense de la page, pas une étape
            numérotée de plus. Une seule phrase, volontairement générale et
            durable (voir commentaire de tête du fichier) : aucune fonction
            future nommée, aucune limite actuelle présentée comme
            définitive. */}
        <section
          className="border-t border-[var(--supordo-mint-200)] bg-[var(--supordo-forest)] py-16 md:py-20 lg:py-24"
          aria-labelledby="ccm-evolve-title"
        >
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <h2
              id="ccm-evolve-title"
              className="max-w-[820px] text-[1.5rem] font-extrabold leading-[1.25] text-white sm:text-[1.875rem] lg:text-[2.25rem]"
            >
              Votre entreprise évolue. Votre site évolue avec elle — sans reconstruire ses pages.
            </h2>
          </div>
        </section>

        {/* Fermeture — demandes reçues, puis la phrase de clôture et le
            CTA, séparés par le même motif border-t que /tarifs. Pas de
            numéro : ce n'est plus une action de l'artisan, c'est la
            conclusion de la page. */}
        <section
          className="border-t border-[var(--supordo-mint-200)] bg-[var(--supordo-warm)] py-16 md:py-20 lg:py-24"
          aria-labelledby="ccm-final-title"
        >
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <div className="max-w-[600px]">
              <h2
                id="ccm-final-title"
                className="text-[1.75rem] font-extrabold leading-[1.15] text-[var(--supordo-forest)] sm:text-[2rem]"
              >
                Les demandes arrivent dans votre espace
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
                Les demandes envoyées depuis votre site sont enregistrées dans votre espace SUPORDO.
                Vous pouvez les consulter et les marquer comme lues.
              </p>

              <p className="mt-10 border-t border-[var(--supordo-mint-200)] pt-8 text-lg font-semibold leading-snug text-[var(--supordo-forest)] lg:text-xl">
                Vous gardez vos informations à jour. SUPORDO garde la partie technique.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
                <Link
                  to="/demarrer"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-[6px] bg-[var(--supordo-green)] px-6 text-sm font-semibold text-white transition-colors hover:bg-[var(--supordo-green-hover)] active:bg-[var(--supordo-forest)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-forest)] sm:w-auto lg:min-h-[52px] lg:px-7 lg:text-base"
                >
                  Demander mon site
                </Link>
                <Link
                  to="/tarifs"
                  className="inline-flex min-h-12 items-center justify-center rounded-[6px] text-sm font-medium text-[var(--supordo-graphite)] underline-offset-4 transition-colors hover:text-[var(--supordo-green)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-green)] lg:text-base"
                >
                  Voir les tarifs →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SupordoFooter />
    </div>
  );
}
