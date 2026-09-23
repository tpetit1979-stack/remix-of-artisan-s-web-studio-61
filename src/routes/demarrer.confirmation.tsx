import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { resolveTenantInputForRoute, isMarketingHost } from "@/lib/tenant";
import { SupordoHeader } from "@/components/marketing/SupordoHeader";
import { SupordoFooter } from "@/components/marketing/SupordoFooter";

/**
 * Atteinte seulement après une demande réellement enregistrée : un échec
 * d'enregistrement affiche une erreur sur le formulaire et ne navigue jamais
 * ici. Non indexée.
 *
 * Cette page affirmait « Elle est arrivée par email chez SUPORDO ». C'était
 * faux dans trois cas : envoi non configuré, échec Resend, erreur réseau —
 * `submitSupordoLead` renvoie alors un succès légitime (la demande EST
 * conservée) et laisse `notified_at` nul. Le visiteur lisait donc une
 * affirmation que le code ne garantit pas.
 *
 * Ce qui est garanti à ce stade, et donc la seule chose affirmée ici : la
 * demande est enregistrée. Le reste décrit la suite sans inventer de délai —
 * aucune promesse de 24 h, aucun engagement de rappel daté, puisque rien de
 * tel n'est acté.
 */
export const Route = createFileRoute("/demarrer/confirmation")({
  loader: async () => {
    const input = await resolveTenantInputForRoute().catch(() => null);
    if (!input || !isMarketingHost(input.hostname)) throw notFound();
    return null;
  },
  head: () => ({
    meta: [
      { title: "Demande enregistrée — SUPORDO" },
      { name: "robots", content: "noindex" },
      { name: "description", content: "Votre demande est enregistrée chez SUPORDO." },
      { property: "og:title", content: "Demande enregistrée — SUPORDO" },
      { property: "og:description", content: "Votre demande est enregistrée chez SUPORDO." },
    ],
  }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  return (
    <div className="supordo-brand flex min-h-screen flex-col bg-[var(--supordo-warm)] antialiased">
      <SupordoHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-[640px] px-5 py-16 md:px-8 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--supordo-green)]">
            DEMANDE ENREGISTRÉE
          </p>
          <h1 className="mt-4 text-[1.75rem] font-extrabold leading-[1.15] tracking-[-0.02em] text-[var(--supordo-forest)] sm:text-[2.25rem]">
            Votre demande est enregistrée.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-[var(--supordo-graphite)]">
            Elle est conservée chez SUPORDO avec vos coordonnées. Nous reprenons contact avec vous
            au numéro que vous avez indiqué.
          </p>

          <div className="mt-10 border-t border-[var(--supordo-mint-200)] pt-8">
            <h2 className="text-base font-extrabold text-[var(--supordo-forest)]">
              Ce que vous pouvez préparer
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--supordo-graphite)]">
              Rien n'est obligatoire pour la suite. Si vous les avez déjà sous la main, ces trois
              éléments feront gagner du temps :
            </p>
            <ul className="mt-4 space-y-2.5">
              {[
                "Votre logo",
                "Quelques photos de vos chantiers",
                "La liste de vos principales prestations",
              ].map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-relaxed text-[var(--supordo-graphite)]"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--supordo-green)]"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 border-t border-[var(--supordo-mint-200)] pt-8">
            <h2 className="text-base font-extrabold text-[var(--supordo-forest)]">Et ensuite</h2>
            <p className="mt-2 max-w-[56ch] text-sm leading-relaxed text-[var(--supordo-graphite)]">
              Une première version de votre site pourra être préparée à partir de vos informations,
              puis vous être présentée. Rien n'est mis en ligne avant que vous l'ayez vue.
            </p>
          </div>

          <Link
            to="/"
            className="mt-10 inline-flex min-h-12 items-center justify-center rounded-[6px] border border-[var(--supordo-mint-200)] bg-white px-5 text-sm font-semibold text-[var(--supordo-forest)] transition-colors hover:border-[var(--supordo-green)] hover:text-[var(--supordo-green)] active:text-[var(--supordo-green-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-green)]"
          >
            Retour à l'accueil
          </Link>
        </section>
      </main>
      <SupordoFooter />
    </div>
  );
}
