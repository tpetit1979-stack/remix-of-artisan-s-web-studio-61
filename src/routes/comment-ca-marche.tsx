import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { resolveMarketingRoute } from "@/lib/tenant";
import { buildMarketingHead } from "@/lib/seo";
import { SupordoHeader } from "@/components/marketing/SupordoHeader";
import {
  SupordoAdminPanel,
  SupordoAdminField,
  SupordoAdminAction,
} from "@/components/marketing/SupordoAdminPanel";
import { SupordoDemoService } from "@/components/marketing/SupordoSiteDemo";
import { DEMO_SITES, DEMO_LABEL } from "@/data/marketing/supordo-demo-site";
import { RESPONSIBILITY_SENTENCE } from "@/data/marketing/supordo-promise";
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
    const marketing = await resolveMarketingRoute();
    if (!marketing) throw notFound();
    return marketing;
  },
  head: ({ loaderData }) =>
    buildMarketingHead({
      title: "Comment fonctionne SUPORDO Sites ?",
      description:
        "Découvrez comment SUPORDO prépare votre site, ce que vous fournissez et les informations que vous pouvez actualiser pour votre entreprise.",
      path: "/comment-ca-marche",
      canonicalOrigin: loaderData?.canonicalOrigin ?? null,
    }),
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
 * Une seule entreprise de démonstration pour toute la page : le visiteur
 * suit le même artisan de la première étape à la demande reçue. Changer
 * d'entreprise à chaque section transformerait une démonstration en
 * catalogue.
 *
 * Toitures Durand parce que sa prestation « Zinguerie » porte une
 * photographie : la correspondance espace → site inclut alors l'image, qui
 * est la partie la plus parlante du mécanisme.
 *
 * Le couple affiché n'est plus reproduit en constantes locales : la fiche de
 * droite est le composant public réel des sites de démonstration. Ce que la
 * page montre à droite est donc littéralement ce que le site affiche — la
 * correspondance est tenue par le code, pas par une recopie.
 */
const demoSite = DEMO_SITES.roofing;
const demoService = demoSite.services[0]!;

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
                {/* La liste dit ce qu'on tient à jour ; le cadre montre à
                    quoi cela ressemble. Les deux côte à côte plutôt que la
                    liste seule sur deux colonnes : « les informations de
                    votre entreprise » reste abstrait tant qu'on n'a pas vu
                    des communes et une prestation écrites quelque part. */}
                <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-2 lg:items-start lg:gap-12">
                  <ul className="grid gap-y-3.5">
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

                  <div>
                    <SupordoAdminPanel
                      label="Votre espace SUPORDO"
                      ariaLabel={`Les informations de ${demoSite.companyName} dans son espace SUPORDO : prestations, communes, chantiers et coordonnées.`}
                    >
                      <div className="space-y-3.5">
                        <SupordoAdminField label="Prestations">
                          {demoSite.services.map((service) => service.name).join(" · ")}
                        </SupordoAdminField>
                        <SupordoAdminField label="Communes d'intervention">
                          {demoSite.areas.join(" · ")}
                        </SupordoAdminField>
                        <SupordoAdminField label="Chantiers publiés">
                          {demoSite.projects.length > 0
                            ? demoSite.projects.map((project) => project.title).join(" · ")
                            : "Aucun pour l'instant"}
                        </SupordoAdminField>
                        <SupordoAdminField label="Coordonnées">
                          {demoSite.phone} · {demoSite.email}
                        </SupordoAdminField>
                      </div>
                    </SupordoAdminPanel>
                    <p className="mt-3 text-xs text-[var(--supordo-graphite)]/70">
                      {DEMO_LABEL} — {demoSite.companyName}, entreprise fictive.
                    </p>
                  </div>
                </div>
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
              </div>
            </div>

            {/* Le moment central de la page. À gauche, les trois champs
                que l'artisan renseigne ; à droite, la fiche telle qu'elle
                paraît sur son site — et c'est le composant public réel,
                pas une reconstitution. Le nom, la description et la photo
                se répondent d'une colonne à l'autre : c'est la
                correspondance qui fait la preuve, et elle se lit sans
                qu'on ait écrit un paragraphe pour l'expliquer.
                La photo est répétée à gauche en vignette, parce que
                l'image est précisément ce que l'artisan ajoute — la
                montrer seulement à droite laisserait croire que SUPORDO
                la fournit. */}
            <div className="mt-8 grid items-center gap-4 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.3fr)] lg:gap-10">
              <SupordoAdminPanel
                label="Dans votre espace SUPORDO"
                ariaLabel={`La prestation « ${demoService.name} » en cours de saisie dans l'espace SUPORDO.`}
              >
                <div className="space-y-3.5">
                  <SupordoAdminField label="Prestation">
                    <span className="font-semibold">{demoService.name}</span>
                  </SupordoAdminField>
                  <SupordoAdminField label="Description">
                    <span className="text-[var(--supordo-graphite)]">
                      {demoService.description}
                    </span>
                  </SupordoAdminField>
                  <SupordoAdminField label="Photo">
                    <span className="mt-1 block h-16 w-24 overflow-hidden rounded-[6px]">
                      <img
                        src={demoService.image}
                        alt=""
                        width={1600}
                        height={1086}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </span>
                  </SupordoAdminField>
                </div>
              </SupordoAdminPanel>

              <span
                aria-hidden="true"
                className="justify-self-center text-2xl font-extrabold text-[var(--supordo-green)]"
              >
                <span className="lg:hidden">↓</span>
                <span className="hidden lg:inline">→</span>
              </span>

              <div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--supordo-graphite)]/70">
                  Sur votre site public
                </p>
                <SupordoDemoService service={demoService} site={demoSite} size="lg" />
              </div>
            </div>

            <p className="mt-4 text-xs text-[var(--supordo-graphite)]/70">
              {DEMO_LABEL} — {demoSite.companyName}, entreprise fictive.
            </p>

            <p className="mt-6 max-w-[600px] text-sm leading-relaxed text-[var(--supordo-graphite)]/80 lg:text-base">
              Il en va de même pour vos communes d'intervention, vos chantiers publiés et vos
              coordonnées.
            </p>
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
            {/* Composition inversée par rapport à l'étape 01 : le cadre
                passe à gauche, le texte à droite. La page a trois moments,
                ils ne doivent pas se lire comme trois fois la même mise en
                page. */}
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-14">
              <div className="order-2 lg:order-1">
                {/* Champs repris de l'écran réel des demandes : nom, e-mail,
                    téléphone, message, date, marqueur « Nouveau » et l'action
                    « Marquer comme lu ». Rien d'autre n'est montré, parce que
                    rien d'autre n'existe. */}
                <SupordoAdminPanel
                  label="Vos demandes"
                  tone="flag"
                  ariaLabel="Une demande reçue dans l'espace SUPORDO : nom, coordonnées, message, date, marqueur « Nouveau » et action « Marquer comme lu »."
                >
                  <div className="space-y-3.5">
                    <SupordoAdminField label="Demande reçue" divider={false}>
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">Claire Fontaine</span>
                        <span className="rounded-[4px] bg-[var(--supordo-green)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                          Nouveau
                        </span>
                      </span>
                    </SupordoAdminField>
                    <SupordoAdminField label="Coordonnées">
                      01 99 00 00 00 · claire.fontaine@example.com
                    </SupordoAdminField>
                    <SupordoAdminField label="Message">
                      <span className="text-[var(--supordo-graphite)]">
                        Bonjour, une tuile est tombée après l'orage et je vois une trace d'humidité
                        au plafond. Pouvez-vous passer regarder ?
                      </span>
                    </SupordoAdminField>
                    <SupordoAdminField label="Reçue le">
                      <span className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-[var(--supordo-graphite)]">14 mars, 08:12</span>
                        <SupordoAdminAction>Marquer comme lu</SupordoAdminAction>
                      </span>
                    </SupordoAdminField>
                  </div>
                </SupordoAdminPanel>
                <p className="mt-3 text-xs text-[var(--supordo-graphite)]/70">
                  {DEMO_LABEL} — demande fictive.
                </p>
              </div>

              <div className="order-1 lg:order-2">
                <h2
                  id="ccm-final-title"
                  className="text-[1.75rem] font-extrabold leading-[1.15] text-[var(--supordo-forest)] sm:text-[2rem]"
                >
                  Les demandes arrivent dans votre espace
                </h2>
                <p className="mt-3 max-w-[52ch] text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
                  Les demandes envoyées depuis votre site sont enregistrées dans votre espace
                  SUPORDO. Vous pouvez les consulter et les marquer comme lues.
                </p>
              </div>
            </div>

            <div className="mt-12 max-w-[600px] lg:mt-16">
              <p className="border-t border-[var(--supordo-mint-200)] pt-8 text-lg font-semibold leading-snug text-[var(--supordo-forest)] lg:text-xl">
                {RESPONSIBILITY_SENTENCE}
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
