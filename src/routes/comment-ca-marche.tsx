import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { resolveTenantInputForRoute, isMarketingHost } from "@/lib/tenant";
import { getLeadIntakeStatus } from "@/lib/supordo-lead.functions";
import { SupordoHeader } from "@/components/marketing/SupordoHeader";
import { SupordoFooter } from "@/components/marketing/SupordoFooter";

/**
 * SUPORDO Sites "comment ça marche" page — marketing surface only
 * (supordo.com). Same route pattern as /tarifs: marketing-host guard,
 * `leadIntakeReady` from `getLeadIntakeStatus()`, no default data.
 *
 * Every capability named below is verified in the current code (services
 * is_active, portfolio is_published + content_kind='real_project' via
 * isAuthenticPublicPortfolioItem, service_areas insert, tenants.phone/email,
 * site_settings.hero_title, TeamManager/PartnersManager CRUD, contacts
 * insert + is_read) — not deduced from documentation. See the read-only
 * mission that mapped every artisan action screen by screen before this
 * page was written.
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
    const { configured } = await getLeadIntakeStatus();
    return { leadIntakeReady: configured };
  },
  head: () => {
    const title = "Comment ça marche — SUPORDO Sites";
    const description =
      "SUPORDO prépare votre site. Vous gardez vos informations à jour — prestations, zones d'intervention, réalisations, coordonnées — et votre site les reprend.";
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
  "Ajouter ou modifier une prestation",
  "Choisir les prestations visibles sur votre site",
  "Ajouter une commune où vous intervenez",
  "Publier un chantier parmi vos réalisations",
  "Modifier vos coordonnées",
  "Présenter votre équipe, lorsque cette section a été activée par SUPORDO",
  "Gérer vos partenaires",
] as const;

const CHAINES = [
  {
    action: "Vous ajoutez une prestation et la publiez",
    resultat: "elle apparaît sur votre site.",
  },
  {
    action: "Vous publiez un chantier",
    resultat: "il rejoint vos réalisations.",
  },
  {
    action: "Vous ajoutez une commune où vous intervenez",
    resultat: "elle est prise en compte sur votre site.",
  },
  {
    action: "Vous changez vos coordonnées",
    resultat: "elles sont mises à jour sur le site.",
  },
] as const;

function StepNumber({ n }: { n: string }) {
  return (
    <span
      aria-hidden="true"
      className="block text-[2rem] font-extrabold leading-none text-[var(--supordo-mint-200)] lg:text-[3rem]"
    >
      {n}
    </span>
  );
}

function CommentCaMarchePage() {
  const { leadIntakeReady } = Route.useLoaderData();

  return (
    <div className="supordo-brand flex min-h-screen flex-col bg-[var(--supordo-warm)] antialiased">
      <SupordoHeader leadIntakeReady={leadIntakeReady} />
      <main className="flex-1">
        {/* 01 — SUPORDO prépare votre site. Aussi l'intro de la page :
            respiration majeure réservée à ce seul moment d'ouverture. */}
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
                Vous ne construisez pas vos pages. Vous indiquez ce que vous
                voulez montrer — vos prestations, votre secteur, vos
                chantiers, vos coordonnées — et votre site reprend ces
                informations aux bons endroits.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-[auto_1fr] items-start gap-5 sm:gap-6 lg:mt-16 lg:grid-cols-[96px_1fr] lg:gap-10">
              <StepNumber n="01" />
              <div className="max-w-[600px]">
                <h2 className="text-xl font-extrabold leading-snug text-[var(--supordo-forest)] sm:text-2xl">
                  Ce que SUPORDO prépare au départ
                </h2>
                <p className="mt-3 text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
                  Vous transmettez les informations de départ de votre
                  entreprise. SUPORDO prépare la première version de votre
                  site et sa mise en ligne.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 02 — Vous gardez vos informations à jour. */}
        <section
          className="border-t border-[var(--supordo-mint-200)] bg-white py-16 md:py-20 lg:py-24"
          aria-labelledby="ccm-step2-title"
        >
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <div className="grid grid-cols-[auto_1fr] items-start gap-5 sm:gap-6 lg:grid-cols-[96px_1fr] lg:gap-10">
              <StepNumber n="02" />
              <div className="max-w-[600px]">
                <h2
                  id="ccm-step2-title"
                  className="text-[1.75rem] font-extrabold leading-[1.15] text-[var(--supordo-forest)] sm:text-[2rem]"
                >
                  Vous gardez vos informations à jour
                </h2>
                <p className="mt-3 text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
                  Quand quelque chose change dans votre entreprise, vous
                  mettez à jour l'information concernée, depuis votre espace
                  SUPORDO.
                </p>
                <ul className="mt-6 space-y-3.5">
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

        {/* 03 — Ce que vous changez se retrouve sur votre site. Fond
            Mint-100 pour distinguer visuellement la démonstration de la
            liste d'actions qui précède. Composition typographique pure :
            aucun asset réel propre à cette page n'existe aujourd'hui, donc
            aucune interface reconstituée — voir commentaire de tête. */}
        <section
          className="border-t border-[var(--supordo-mint-200)] bg-[var(--supordo-mint-100)] py-16 md:py-20 lg:py-24"
          aria-labelledby="ccm-step3-title"
        >
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <div className="grid grid-cols-[auto_1fr] items-start gap-5 sm:gap-6 lg:grid-cols-[96px_1fr] lg:gap-10">
              <StepNumber n="03" />
              <div className="max-w-[600px]">
                <h2
                  id="ccm-step3-title"
                  className="text-[1.75rem] font-extrabold leading-[1.15] text-[var(--supordo-forest)] sm:text-[2rem]"
                >
                  Ce que vous changez se retrouve sur votre site
                </h2>
                <dl className="mt-6 divide-y divide-[var(--supordo-mint-200)]">
                  {CHAINES.map((c) => (
                    <div key={c.action} className="py-4 first:pt-0">
                      <dt className="text-base font-semibold text-[var(--supordo-forest)] lg:text-lg">
                        {c.action}
                      </dt>
                      <dd className="mt-1 text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
                        → {c.resultat}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </section>

        {/* 04 — Votre site suit l'activité de votre entreprise. Formulation
            volontairement générale et durable (voir commentaire de tête) :
            aucune fonction future nommée, aucune limite actuelle présentée
            comme définitive. */}
        <section
          className="border-t border-[var(--supordo-mint-200)] bg-white py-16 md:py-20 lg:py-24"
          aria-labelledby="ccm-step4-title"
        >
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <div className="grid grid-cols-[auto_1fr] items-start gap-5 sm:gap-6 lg:grid-cols-[96px_1fr] lg:gap-10">
              <StepNumber n="04" />
              <div className="max-w-[600px]">
                <h2
                  id="ccm-step4-title"
                  className="text-[1.75rem] font-extrabold leading-[1.15] text-[var(--supordo-forest)] sm:text-[2rem]"
                >
                  Votre site suit l'activité de votre entreprise
                </h2>
                <p className="mt-3 text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
                  Votre entreprise évolue. Votre site peut évoluer avec elle,
                  sans que vous ayez à reconstruire ses pages.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 05 — Les demandes arrivent dans votre espace, puis fermeture +
            CTA, sur le même modèle de séparation que /tarifs. */}
        <section
          className="border-t border-[var(--supordo-mint-200)] bg-[var(--supordo-warm)] py-16 md:py-20 lg:py-24"
          aria-labelledby="ccm-step5-title"
        >
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <div className="grid grid-cols-[auto_1fr] items-start gap-5 sm:gap-6 lg:grid-cols-[96px_1fr] lg:gap-10">
              <StepNumber n="05" />
              <div className="max-w-[600px]">
                <h2
                  id="ccm-step5-title"
                  className="text-[1.75rem] font-extrabold leading-[1.15] text-[var(--supordo-forest)] sm:text-[2rem]"
                >
                  Les demandes arrivent dans votre espace
                </h2>
                <p className="mt-3 text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
                  Les demandes envoyées depuis votre site sont enregistrées
                  dans votre espace SUPORDO. Vous pouvez les consulter et les
                  marquer comme lues.
                </p>

                <p className="mt-10 border-t border-[var(--supordo-mint-200)] pt-8 text-lg font-semibold leading-snug text-[var(--supordo-forest)] lg:text-xl">
                  Vous gardez vos informations à jour. SUPORDO garde la
                  partie technique.
                </p>

                {leadIntakeReady && (
                  <div className="mt-8">
                    <Link
                      to="/demarrer"
                      className="inline-flex min-h-12 w-full items-center justify-center rounded-[6px] bg-[var(--supordo-green)] px-6 text-sm font-semibold text-white transition-colors hover:bg-[var(--supordo-green-hover)] active:bg-[var(--supordo-forest)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-forest)] sm:w-auto lg:min-h-[52px] lg:px-7 lg:text-base"
                    >
                      Demander mon site
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <SupordoFooter />
    </div>
  );
}
