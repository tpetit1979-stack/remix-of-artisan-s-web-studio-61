import { createFileRoute, notFound } from "@tanstack/react-router";
import { resolveTenantInputForRoute, isMarketingHost } from "@/lib/tenant";
import { SupordoHeader } from "@/components/marketing/SupordoHeader";
import { SupordoFooter } from "@/components/marketing/SupordoFooter";

/**
 * SUPORDO's own privacy policy — marketing surface only. Content mirrors
 * exactly the traceur inventory already closed in the plan directeur (Gate
 * du Lot 1, §17) and the real /demarrer data flow (src/lib/supordo-lead
 * .functions.ts) : no database table, no tracker subject to consent, one
 * third-party font dependency. Nothing here is asserted beyond what those
 * two sources actually prove.
 */
export const Route = createFileRoute("/legal/confidentialite")({
  loader: async () => {
    const input = await resolveTenantInputForRoute().catch(() => null);
    if (!input || !isMarketingHost(input.hostname)) throw notFound();
    return null;
  },
  head: () => ({
    meta: [
      { title: "Politique de confidentialité — SUPORDO" },
      { name: "description", content: "Politique de confidentialité du site SUPORDO." },
    ],
  }),
  component: ConfidentialitePage,
});

const missing = "à compléter avant publication";

function ConfidentialitePage() {
  return (
    <div className="supordo-brand flex min-h-screen flex-col bg-[var(--supordo-warm)] antialiased">
      <SupordoHeader leadIntakeReady={false} />
      <main className="flex-1">
        <section className="mx-auto max-w-[680px] px-5 py-16 md:px-8 md:py-20">
          <h1 className="text-[1.75rem] font-extrabold leading-[1.15] tracking-[-0.02em] text-[var(--supordo-forest)] sm:text-[2.25rem]">
            Politique de confidentialité
          </h1>

          <div className="mt-10 space-y-8 text-sm leading-relaxed text-[var(--supordo-graphite)]">
            <div>
              <h2 className="text-base font-bold text-[var(--supordo-forest)]">
                Données collectées
              </h2>
              <p className="mt-2">
                Les seules données personnelles collectées sur ce site sont celles que vous
                indiquez volontairement dans le formulaire « Demander mon site » : entreprise,
                métier, ville, email, téléphone (facultatif) et message (facultatif).
              </p>
            </div>

            <div>
              <h2 className="text-base font-bold text-[var(--supordo-forest)]">
                Finalité et conservation
              </h2>
              <p className="mt-2">
                Ces informations servent uniquement à vous répondre. Elles ne sont enregistrées
                dans aucune base de données : elles sont transmises par email et conservées dans
                la messagerie de SUPORDO. Vous pouvez demander leur suppression en répondant à
                l'email reçu.
              </p>
              <p className="mt-2 italic text-[var(--supordo-graphite)]/70">
                Durée de conservation précise et adresse dédiée à l'exercice de vos droits :{" "}
                {missing}.
              </p>
            </div>

            <div>
              <h2 className="text-base font-bold text-[var(--supordo-forest)]">
                Sous-traitants techniques
              </h2>
              <p className="mt-2">
                Resend (envoi de l'email de votre demande), Supabase (hébergement de la base de
                données et des fichiers) et Cloudflare (hébergement).
              </p>
            </div>

            <div>
              <h2 className="text-base font-bold text-[var(--supordo-forest)]">
                Cookies et traceurs
              </h2>
              <p className="mt-2">
                Ce site n'utilise aucun outil de mesure d'audience, aucun pixel publicitaire et
                aucun cookie non essentiel. La police de caractères Manrope est chargée depuis
                Google Fonts.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SupordoFooter />
    </div>
  );
}
