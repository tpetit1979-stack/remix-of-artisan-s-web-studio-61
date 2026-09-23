import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { resolveMarketingRoute } from "@/lib/tenant";
import { buildMarketingHead } from "@/lib/seo";
import { SupordoHeader } from "@/components/marketing/SupordoHeader";
import { SupordoSiteDemo } from "@/components/marketing/SupordoSiteDemo";
import { DEMO_SITES, DEMO_LABEL } from "@/data/marketing/supordo-demo-site";
import {
  ARTISAN_KEEPS,
  SUPORDO_KEEPS,
  RESPONSIBILITY_COLUMNS,
  RESPONSIBILITY_SENTENCE,
} from "@/data/marketing/supordo-promise";
import { SupordoFooter } from "@/components/marketing/SupordoFooter";

/**
 * SUPORDO Sites pricing page — marketing surface only (supordo.com).
 *
 * Answers one question the home's Acte 6 deliberately doesn't: exactly what
 * the 199 € HT mise en place initiale and the 49 € HT/mois abonnement each
 * cover. Amounts are the closed V1 decision (plan §19) — never modified
 * here. Every inclusion/exclusion below is the commercial arbitration
 * closed for V1 (plan §15, questions 2 and 14) — nothing on this page is a
 * new decision, only its detailed, honest expression.
 *
 * Deliberately absent: an "export du site" or any data-recovery promise.
 * The product has no real export mechanism today (verified: no export/CSV/
 * download feature exists anywhere in src/routes/admin.*.tsx or
 * src/components/admin/*.tsx — only the JS `export` keyword). A principle
 * without a working mechanism behind it is not published as a commercial
 * promise, so this page says nothing about recovering data on departure.
 *
 * Les appels à l'action marketing sont visibles en permanence : leur
 * destination existe, et /demarrer dit lui-même quand une demande ne peut pas
 * encore être reçue. Seule la soumission du formulaire reste gardée.
 */
export const Route = createFileRoute("/tarifs")({
  loader: async () => {
    const marketing = await resolveMarketingRoute();
    if (!marketing) throw notFound();
    return marketing;
  },
  head: ({ loaderData }) =>
    buildMarketingHead({
      title: "Tarif d'un site internet pour artisan | SUPORDO",
      description:
        "Découvrez le tarif de SUPORDO Sites, ce que couvre la mise en place initiale et ce que comprend l'abonnement mensuel.",
      path: "/tarifs",
      canonicalOrigin: loaderData?.canonicalOrigin ?? null,
    }),
  component: TarifsPage,
});

/**
 * Ce que l'on obtient, avant ce que cela coûte.
 *
 * La page listait le prix puis, immédiatement, inclus / non inclus, deux
 * fois de suite. La transparence était intacte mais l'ordre faisait lire
 * quatre listes dont deux de négations avant d'avoir compris ce qu'on
 * achetait. L'ordre change ; le contenu, non. Aucune exclusion n'a quitté
 * cette page : elles sont regroupées plus bas, sous leur propre titre.
 *
 * Chaque ligne ci-dessous est un résumé d'éléments déjà présents dans les
 * listes détaillées — aucune promesse nouvelle.
 */
const CE_QUE_VOUS_OBTENEZ = [
  "Un site professionnel, préparé à partir des informations de votre entreprise",
  "Vos prestations, vos communes d'intervention, vos chantiers et vos coordonnées",
  "Un site lisible sur téléphone comme sur ordinateur",
  "Votre espace SUPORDO, pour tenir ces informations à jour vous-même",
  "L'hébergement, la maintenance technique et la mise en ligne",
] as const;

/** Le site montré en preuve — volontairement une autre entreprise que celle du premier écran de la page d'accueil. */
const proofSite = DEMO_SITES.electrical;

const MISE_EN_PLACE_INCLUS = [
  "Préparation de la première version de votre site",
  "Configuration des informations de votre entreprise",
  "Intégration de votre logo, si vous le fournissez",
  "Vos prestations initiales",
  "Vos zones d'intervention",
  "Vos coordonnées",
  "Reprise de vos couleurs ou de votre identité existante, lorsqu'elles sont fournies et compatibles",
  "Votre équipe et vos partenaires, si vous fournissez les informations et souhaitez les afficher",
  "Intégration des photos que vous fournissez, dans les emplacements prévus",
  "Votre adresse SUPORDO",
  "La mise en ligne de votre site",
  "Des ajustements raisonnables au lancement, sur les informations que vous avez fournies",
] as const;

const MISE_EN_PLACE_NON_INCLUS = [
  "Création ou refonte de logo",
  "Une identité visuelle complète sur mesure",
  "Un shooting photo",
  "Du contenu inventé pour combler un vide",
  "De nouvelles pages ou sections spécifiques",
  "Un travail éditorial important sur mesure",
] as const;

const ABONNEMENT_COUVRE = [
  "Votre site maintenu en ligne",
  "L'hébergement",
  "La maintenance technique",
  "Les évolutions communes à tous les sites SUPORDO",
  "L'accès à votre espace SUPORDO",
  "L'actualisation autonome des informations disponibles dans votre espace",
  "La réception et la consultation des demandes envoyées depuis votre site, lorsque cette fonction est active",
  "Votre adresse SUPORDO",
  "Un support par email, sans délai de réponse garanti",
] as const;

const ABONNEMENT_NE_COUVRE_PAS = [
  "Des retouches réalisées chaque mois par SUPORDO sur votre contenu",
  "La création régulière de nouveau contenu",
  "De nouvelles pages sur mesure",
  "Un travail graphique",
  "Un shooting photo",
  "Un domaine personnalisé",
  "Des corrections manuelles illimitées",
] as const;

function TarifsPage() {
  return (
    <div className="supordo-brand flex min-h-screen flex-col bg-[var(--supordo-warm)] antialiased">
      <SupordoHeader />
      <main className="flex-1">
        {/* Entrée + prix — un seul moment de respiration majeure sur cette
            page, réservé à la seule information qui doit s'imposer avant
            tout le reste : combien, et sous quelle forme. */}
        <section
          className="bg-[var(--supordo-warm)] py-24 md:py-28 lg:py-32"
          aria-labelledby="tarifs-title"
        >
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <div className="max-w-[760px]">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--supordo-green)] lg:text-sm">
                TARIFS
              </p>
              <h1
                id="tarifs-title"
                className="mt-4 text-[2rem] font-extrabold leading-[1.12] tracking-[-0.02em] text-[var(--supordo-forest)] sm:text-[2.5rem] lg:text-[3rem]"
              >
                Un tarif clair, expliqué en détail.
              </h1>
              <p className="mt-5 max-w-[650px] text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
                SUPORDO Sites tient sur une mise en place initiale et un abonnement mensuel. Voici
                ce que vous obtenez, ce que cela coûte, et ce qui n'est pas compris.
              </p>
            </div>

            {/* Ce qu'on obtient précède ce que ça coûte : un montant ne veut
                rien dire tant qu'on ne sait pas à quoi il correspond. */}
            <ul className="mt-10 grid max-w-[900px] gap-x-10 gap-y-3.5 lg:mt-12 lg:grid-cols-2">
              {CE_QUE_VOUS_OBTENEZ.map((item) => (
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

            <div className="mt-14 grid grid-cols-1 gap-10 lg:mt-16 lg:grid-cols-2 lg:gap-16">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.08em] text-[var(--supordo-forest)]/70">
                  Mise en place initiale
                </p>
                <p className="mt-3 flex items-baseline gap-2">
                  <span className="text-[3rem] font-extrabold leading-none tracking-[-0.02em] text-[var(--supordo-forest)] sm:text-[3.5rem] lg:text-[4rem]">
                    199 €
                  </span>
                  <span className="text-base font-medium text-[var(--supordo-graphite)] lg:text-lg">
                    HT
                  </span>
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--supordo-graphite)] lg:text-base">
                  Réglée une seule fois, au lancement de votre site.
                </p>
              </div>

              <div className="lg:border-l lg:border-[var(--supordo-mint-200)] lg:pl-16">
                <p className="text-sm font-bold uppercase tracking-[0.08em] text-[var(--supordo-green)]">
                  Abonnement
                </p>
                <p className="mt-3 flex items-baseline gap-2">
                  <span className="text-[3rem] font-extrabold leading-none tracking-[-0.02em] text-[var(--supordo-forest)] sm:text-[3.5rem] lg:text-[4rem]">
                    49 €
                  </span>
                  <span className="text-base font-medium text-[var(--supordo-graphite)] lg:text-lg">
                    HT / mois
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Le prix flottait au-dessus de listes. Un montant devient
            compréhensible quand il est attaché à un objet : l'aperçu répond à
            « 199 € + 49 €/mois me donnent quoi, exactement ? ». Une seule
            preuve — cette page n'est pas /exemples, et la comparaison
            appartient à cette page-là. */}
        <section
          className="border-t border-[var(--supordo-mint-200)] bg-[var(--supordo-mint-100)] py-16 md:py-20 lg:py-24"
          aria-labelledby="tarifs-resultat-title"
        >
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-16">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--supordo-green)] lg:text-sm">
                  CE QUE ÇA DONNE
                </p>
                <h2
                  id="tarifs-resultat-title"
                  className="mt-4 max-w-[18ch] text-[2rem] font-extrabold leading-[1.12] text-[var(--supordo-forest)] sm:text-[2.5rem]"
                >
                  Voilà le site que ce tarif finance.
                </h2>
                <p className="mt-5 max-w-[48ch] text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
                  Le vôtre partira de votre métier, de vos prestations et de vos communes. La
                  structure, la lisibilité et le comportement sur téléphone, eux, sont les mêmes
                  pour tout le monde — c'est ce que l'abonnement entretient.
                </p>
                <Link
                  to="/exemples"
                  className="mt-6 inline-flex min-h-11 items-center text-base font-semibold text-[var(--supordo-forest)] underline underline-offset-4 transition-colors hover:text-[var(--supordo-green)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-green)]"
                >
                  Voir d'autres exemples →
                </Link>
              </div>

              <div>
                <SupordoSiteDemo site={proofSite} variant="preview" previewAspect="1 / 1" />
                <p className="mt-3 text-xs text-[var(--supordo-graphite)]/70">
                  {DEMO_LABEL} — {proofSite.companyName}, entreprise fictive.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mise en place — densité plus forte, mesure resserrée (registre
            "produit/explicatif", cohérent avec Acte 3/Acte 5 de la home). */}
        <section
          className="border-t border-[var(--supordo-mint-200)] bg-white py-16 md:py-20 lg:py-24"
          aria-labelledby="tarifs-mise-en-place-title"
        >
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <div className="max-w-[600px]">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--supordo-green)] lg:text-sm">
                MISE EN PLACE INITIALE
              </p>
              <h2
                id="tarifs-mise-en-place-title"
                className="mt-4 text-[2rem] font-extrabold leading-[1.12] text-[var(--supordo-forest)] sm:text-[2.5rem] lg:text-[3rem]"
              >
                Ce que couvrent les 199 € HT de mise en place.
              </h2>
            </div>

            <div className="mt-10 lg:mt-14">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-[var(--supordo-green)]">
                  Inclus
                </h3>
                <ul className="mt-5 grid gap-x-10 gap-y-3.5 lg:grid-cols-2">
                  {MISE_EN_PLACE_INCLUS.map((item) => (
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

        {/* Abonnement — fond Mint-100 pour distinguer visuellement ce bloc
            de la mise en place qui précède, sans nouvelle couleur : même
            token que la section Métiers de la home. */}
        <section
          className="border-t border-[var(--supordo-mint-200)] bg-[var(--supordo-mint-100)] py-16 md:py-20 lg:py-24"
          aria-labelledby="tarifs-abonnement-title"
        >
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <div className="max-w-[600px]">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--supordo-green)] lg:text-sm">
                ABONNEMENT
              </p>
              <h2
                id="tarifs-abonnement-title"
                className="mt-4 text-[2rem] font-extrabold leading-[1.12] text-[var(--supordo-forest)] sm:text-[2.5rem] lg:text-[3rem]"
              >
                Ce que couvre l'abonnement à 49 € HT / mois.
              </h2>
            </div>

            <div className="mt-10 lg:mt-14">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-[var(--supordo-green)]">
                  Couvre
                </h3>
                <ul className="mt-5 grid gap-x-10 gap-y-3.5 lg:grid-cols-2">
                  {ABONNEMENT_COUVRE.map((item) => (
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

        {/* Ce qui n'est pas compris, rassemblé sous son propre titre.
            Rien n'a quitté cette page et rien n'est parti en FAQ : une
            exclusion utile à la décision se lit là où l'on décide. Ce qui
            change, c'est qu'on ne lit plus deux listes de négations avant
            d'avoir compris ce qu'on achète. */}
        <section
          className="border-t border-[var(--supordo-mint-200)] bg-white py-16 md:py-20 lg:py-24"
          aria-labelledby="tarifs-exclusions-title"
        >
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <div className="max-w-[640px]">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--supordo-green)] lg:text-sm">
                HORS PÉRIMÈTRE
              </p>
              <h2
                id="tarifs-exclusions-title"
                className="mt-4 text-[2rem] font-extrabold leading-[1.12] text-[var(--supordo-forest)] sm:text-[2.5rem] lg:text-[3rem]"
              >
                Ce qui n'est pas compris.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
                Mieux vaut le savoir avant de commencer qu'après. Un besoin qui figure ici peut être
                étudié au cas par cas, sur proposition préalable — il n'est simplement pas couvert
                par le tarif.
              </p>
            </div>

            <div className="mt-10 grid gap-12 lg:mt-14 lg:grid-cols-2 lg:gap-16">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-[var(--supordo-forest)]/70">
                  Pas dans la mise en place
                </h3>
                <ul className="mt-5 space-y-3.5">
                  {MISE_EN_PLACE_NON_INCLUS.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-base leading-relaxed text-[var(--supordo-graphite)]"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[0.65em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--supordo-forest)]/40"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lg:border-l lg:border-[var(--supordo-mint-200)] lg:pl-16">
                <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-[var(--supordo-forest)]/70">
                  Pas dans l'abonnement
                </h3>
                <ul className="mt-5 space-y-3.5">
                  {ABONNEMENT_NE_COUVRE_PAS.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-base leading-relaxed text-[var(--supordo-graphite)]"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[0.65em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--supordo-forest)]/40"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Au quotidien — le partage des responsabilités, lu depuis
            `supordo-promise.ts`. Deux colonnes parce que la question est
            binaire : ce qui est à vous, ce qui est à nous. Aucune grille de
            suppléments, jamais un tarif inventé. */}
        <section
          className="border-t border-[var(--supordo-mint-200)] bg-[var(--supordo-mint-100)] py-16 md:py-20 lg:py-24"
          aria-labelledby="tarifs-quotidien-title"
        >
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <div className="max-w-[640px]">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--supordo-green)] lg:text-sm">
                AU QUOTIDIEN
              </p>
              <h2
                id="tarifs-quotidien-title"
                className="mt-4 text-[2rem] font-extrabold leading-[1.12] text-[var(--supordo-forest)] sm:text-[2.5rem] lg:text-[3rem]"
              >
                Qui s'occupe de quoi, une fois votre site en ligne ?
              </h2>
              <p className="mt-5 text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
                {RESPONSIBILITY_SENTENCE}
              </p>
            </div>

            <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-2 lg:gap-16">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-[var(--supordo-green)]">
                  {RESPONSIBILITY_COLUMNS.artisan}
                </h3>
                <ul className="mt-5 space-y-3.5">
                  {ARTISAN_KEEPS.map((item) => (
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

              <div className="lg:border-l lg:border-[var(--supordo-mint-200)] lg:pl-16">
                <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-[var(--supordo-forest)]">
                  {RESPONSIBILITY_COLUMNS.supordo}
                </h3>
                <ul className="mt-5 space-y-3.5">
                  {SUPORDO_KEEPS.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-base leading-relaxed text-[var(--supordo-graphite)]"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[0.65em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--supordo-forest)]/40"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="mt-10 max-w-[640px] text-base leading-relaxed text-[var(--supordo-graphite)]">
              Un besoin structurel ou spécifique, en dehors de ce que votre espace permet, peut être
              étudié au cas par cas, sur proposition préalable.
            </p>
          </div>
        </section>

        {/* Action finale — sobre : un titre, une phrase, un seul CTA. */}
        <section
          className="border-t border-[var(--supordo-mint-200)] bg-[var(--supordo-warm)] py-16 md:py-20 lg:py-24"
          aria-labelledby="tarifs-cta-title"
        >
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <div className="max-w-[600px]">
              <h2
                id="tarifs-cta-title"
                className="text-[2rem] font-extrabold leading-[1.12] text-[var(--supordo-forest)] sm:text-[2.5rem] lg:text-[3rem]"
              >
                Prêt à démarrer ?
              </h2>
              <p className="mt-5 text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
                SUPORDO prépare votre site et s'occupe de sa partie technique. Vous gardez la main
                sur les informations de votre entreprise.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
                <Link
                  to="/demarrer"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-[6px] bg-[var(--supordo-green)] px-6 text-sm font-semibold text-white transition-colors hover:bg-[var(--supordo-green-hover)] active:bg-[var(--supordo-forest)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-forest)] sm:w-auto lg:min-h-[52px] lg:px-7 lg:text-base"
                >
                  Demander mon site
                </Link>
                <Link
                  to="/comment-ca-marche"
                  className="inline-flex min-h-12 items-center justify-center rounded-[6px] text-sm font-medium text-[var(--supordo-graphite)] underline-offset-4 transition-colors hover:text-[var(--supordo-green)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-green)] lg:text-base"
                >
                  Comment ça marche →
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
