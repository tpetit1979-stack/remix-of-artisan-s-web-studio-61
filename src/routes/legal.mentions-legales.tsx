import { createFileRoute, notFound } from "@tanstack/react-router";
import { resolveTenantInputForRoute, isMarketingHost } from "@/lib/tenant";
import { SupordoHeader } from "@/components/marketing/SupordoHeader";
import { SupordoFooter } from "@/components/marketing/SupordoFooter";

/**
 * SUPORDO's own legal notice — marketing surface only, distinct from
 * `/mentions-legales` (the artisan tenant's own legal page, unrelated route,
 * unrelated content). Gated on the platform host exactly like `/demarrer`.
 *
 * Doctrine (plan §17, "Informations légales") : never invent what is not
 * provided. Facts already established are written as facts; everything else
 * is marked "à compléter" rather than filled with a plausible-looking guess.
 */
export const Route = createFileRoute("/legal/mentions-legales")({
  loader: async () => {
    const input = await resolveTenantInputForRoute().catch(() => null);
    if (!input || !isMarketingHost(input.hostname)) throw notFound();
    return null;
  },
  head: () => ({
    meta: [
      { title: "Mentions légales — SUPORDO" },
      { name: "description", content: "Mentions légales du site SUPORDO." },
    ],
  }),
  component: MentionsLegalesPage,
});

const missing = "à compléter avant publication";

function MentionsLegalesPage() {
  return (
    <div className="supordo-brand flex min-h-screen flex-col bg-[var(--supordo-warm)] antialiased">
      <SupordoHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-[680px] px-5 py-16 md:px-8 md:py-20">
          <h1 className="text-[1.75rem] font-extrabold leading-[1.15] tracking-[-0.02em] text-[var(--supordo-forest)] sm:text-[2.25rem]">
            Mentions légales
          </h1>

          <div className="mt-10 space-y-8 text-sm leading-relaxed text-[var(--supordo-graphite)]">
            <div>
              <h2 className="text-base font-bold text-[var(--supordo-forest)]">Éditeur du site</h2>
              <p className="mt-2 italic text-[var(--supordo-graphite)]/70">
                Dénomination sociale, forme juridique, capital, adresse du siège, SIRET/SIREN,
                numéro de TVA intracommunautaire, nom du responsable de la publication : {missing}.
              </p>
            </div>

            <div>
              <h2 className="text-base font-bold text-[var(--supordo-forest)]">Contact</h2>
              <p className="mt-2 italic text-[var(--supordo-graphite)]/70">
                Adresse email et téléphone de contact à publier : {missing}.
              </p>
            </div>

            <div>
              <h2 className="text-base font-bold text-[var(--supordo-forest)]">Hébergement</h2>
              <p className="mt-2">
                Ce site est hébergé par Supabase (base de données et fichiers) et Cloudflare.
              </p>
            </div>

            <div>
              <h2 className="text-base font-bold text-[var(--supordo-forest)]">
                Registre du commerce
              </h2>
              <p className="mt-2 italic text-[var(--supordo-graphite)]/70">
                Numéro d'inscription, si applicable : {missing}.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SupordoFooter />
    </div>
  );
}
