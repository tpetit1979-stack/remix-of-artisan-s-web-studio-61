import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { resolveTenantInputForRoute, isMarketingHost } from "@/lib/tenant";
import { SupordoHeader } from "@/components/marketing/SupordoHeader";
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
    const input = await resolveTenantInputForRoute().catch(() => null);
    if (!input || !isMarketingHost(input.hostname)) throw notFound();
    return null;
  },
  head: () => {
    const title = "Tarif d'un site internet pour artisan | SUPORDO";
    const description =
      "Découvrez le tarif de SUPORDO Sites, ce que couvre la mise en place initiale et ce que comprend l'abonnement mensuel.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: TarifsPage,
});

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
                précisément ce que chacun couvre.
              </p>
            </div>

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

            <div className="mt-10 grid gap-12 lg:mt-14 lg:grid-cols-2 lg:gap-16">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-[var(--supordo-green)]">
                  Inclus
                </h3>
                <ul className="mt-5 space-y-3.5">
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

              <div className="lg:border-l lg:border-[var(--supordo-mint-200)] lg:pl-16">
                <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-[var(--supordo-forest)]/70">
                  Non inclus
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

            <div className="mt-10 grid gap-12 lg:mt-14 lg:grid-cols-2 lg:gap-16">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-[var(--supordo-green)]">
                  Couvre
                </h3>
                <ul className="mt-5 space-y-3.5">
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

              <div className="lg:border-l lg:border-[var(--supordo-mint-200)] lg:pl-16">
                <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-[var(--supordo-forest)]/70">
                  Ne couvre pas
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

        {/* Au quotidien — répond à "qui fait quoi", sans grille de
            suppléments : un principe, une phrase, jamais un tarif inventé. */}
        <section
          className="border-t border-[var(--supordo-mint-200)] bg-white py-16 md:py-20 lg:py-24"
          aria-labelledby="tarifs-quotidien-title"
        >
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <div className="max-w-[600px]">
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
                Les informations disponibles dans votre espace — vos prestations, votre secteur, vos
                réalisations, vos coordonnées — sont actualisées directement par vous. Un besoin
                structurel ou spécifique, en dehors de ce que votre espace permet, peut être étudié
                au cas par cas, sur proposition préalable.
              </p>
            </div>
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
