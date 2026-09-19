import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { resolveTenantInputForRoute, isPlatformHost } from "@/lib/tenant";
import { SupordoHeader } from "@/components/marketing/SupordoHeader";
import { SupordoFooter } from "@/components/marketing/SupordoFooter";

/**
 * Reached only after a request was really sent (see /demarrer): a failed send
 * shows an error on the form and never navigates here. Not indexed.
 */
export const Route = createFileRoute("/demarrer/confirmation")({
  loader: async () => {
    const input = await resolveTenantInputForRoute().catch(() => null);
    if (!input || !isPlatformHost(input.hostname)) throw notFound();
    return null;
  },
  head: () => ({
    meta: [
      { title: "Demande envoyée — SUPORDO" },
      { name: "robots", content: "noindex" },
      { name: "description", content: "Votre demande a bien été envoyée à SUPORDO." },
      { property: "og:title", content: "Demande envoyée — SUPORDO" },
      { property: "og:description", content: "Votre demande a bien été envoyée à SUPORDO." },
    ],
  }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  return (
    <div className="supordo-brand flex min-h-screen flex-col bg-[var(--supordo-warm)] antialiased">
      <SupordoHeader leadIntakeReady={false} />
      <main className="flex-1">
        <section className="mx-auto max-w-[640px] px-5 py-16 md:px-8 md:py-24">
          <h1 className="text-[1.75rem] font-extrabold leading-[1.15] tracking-[-0.02em] text-[var(--supordo-forest)] sm:text-[2.25rem]">
            Votre demande a bien été envoyée.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-[var(--supordo-graphite)]">
            Elle est arrivée par email chez SUPORDO. Nous vous répondons à l'adresse que
            vous avez indiquée.
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-[6px] border border-[var(--supordo-mint-200)] bg-white px-5 text-sm font-semibold text-[var(--supordo-forest)] transition-colors hover:border-[var(--supordo-green)] hover:text-[var(--supordo-green)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-green)]"
          >
            Retour à l'accueil
          </Link>
        </section>
      </main>
      <SupordoFooter />
    </div>
  );
}
