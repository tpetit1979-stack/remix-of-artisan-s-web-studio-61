import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { resolveTenantInputForRoute, isPlatformHost } from "@/lib/tenant";
import { getLeadIntakeStatus, submitSupordoLead } from "@/lib/supordo-lead.functions";
import { SupordoHeader } from "@/components/marketing/SupordoHeader";
import { SupordoFooter } from "@/components/marketing/SupordoFooter";

/**
 * SUPORDO commercial request page — marketing surface only.
 *
 * Gated on the platform host exactly like the landing at "/": on an artisan
 * hostname this route does not exist and 404s, so no tenant site gains a
 * SUPORDO marketing page. The artisan routes and the host fallback are
 * untouched.
 *
 * The form is only rendered when a request can really be sent (recipient,
 * sender and Resend key all configured server-side). Until then the page says
 * so plainly rather than showing a form that silently loses the request — and
 * the landing hides its call to action for the same reason.
 */
export const Route = createFileRoute("/demarrer/")({
  loader: async () => {
    const input = await resolveTenantInputForRoute().catch(() => null);
    if (!input || !isPlatformHost(input.hostname)) throw notFound();
    const { configured } = await getLeadIntakeStatus();
    return { configured };
  },
  head: () => {
    const title = "Demander mon site — SUPORDO Sites";
    const description =
      "Parlons de votre site : décrivez votre entreprise, votre métier et votre ville, SUPORDO vous répond par email.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: DemarrerPage,
});

interface FormState {
  company: string;
  trade: string;
  city: string;
  email: string;
  phone: string;
  message: string;
  trap: string;
}

const EMPTY: FormState = {
  company: "",
  trade: "",
  city: "",
  email: "",
  phone: "",
  message: "",
  trap: "",
};

const labelClass =
  "block text-sm font-semibold text-[var(--supordo-forest)]";
const inputClass =
  "mt-2 block w-full min-h-12 rounded-[6px] border border-[var(--supordo-mint-200)] bg-white px-4 text-base text-[var(--supordo-forest)] outline-none placeholder:text-[var(--supordo-graphite)]/50 focus-visible:border-[var(--supordo-green)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-green)]";

function DemarrerPage() {
  const { configured } = Route.useLoaderData();
  const navigate = useNavigate();
  const submit = useServerFn(submitSupordoLead);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const mountedAt = useRef<number>(Date.now());

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const update = (field: keyof FormState) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    // Client-side validation, mirrored server-side — never trusted alone.
    if (!form.company.trim() || !form.trade.trim() || !form.city.trim() || !form.email.trim()) {
      setError("Entreprise, métier, ville et email sont nécessaires pour vous répondre.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
      setError("Cette adresse email n'est pas valide.");
      return;
    }

    setSending(true);
    try {
      const result = await submit({
        data: {
          company: form.company,
          trade: form.trade,
          city: form.city,
          email: form.email,
          phone: form.phone,
          message: form.message,
          trap: form.trap,
          elapsedMs: Date.now() - mountedAt.current,
        },
      });
      if (result.ok) {
        // Only a real send reaches the confirmation page.
        await navigate({ to: "/demarrer/confirmation" });
        return;
      }
      if (result.reason === "invalid") setError(result.message);
      else if (result.reason === "not_configured")
        setError(
          "Votre demande n'a pas pu être envoyée : l'envoi n'est pas encore configuré. Réessayez plus tard.",
        );
      else
        setError(
          "Votre demande n'a pas pu être envoyée. Réessayez dans quelques instants ; si le problème persiste, écrivez-nous directement.",
        );
    } catch {
      setError(
        "Votre demande n'a pas pu être envoyée. Réessayez dans quelques instants ; si le problème persiste, écrivez-nous directement.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="supordo-brand flex min-h-screen flex-col bg-[var(--supordo-warm)] antialiased">
      <SupordoHeader leadIntakeReady={configured} />
      <main className="flex-1">
        <section className="mx-auto max-w-[720px] px-5 py-12 md:px-8 md:py-16">
          <h1 className="text-[2rem] font-extrabold leading-[1.1] tracking-[-0.02em] text-[var(--supordo-forest)] sm:text-[2.5rem]">
            Parlons de votre site.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
            Dites-nous qui vous êtes et ce que vous faites. Nous revenons vers vous par
            email pour comprendre votre besoin et vous expliquer comment SUPORDO Sites
            fonctionne.
          </p>

          {!configured ? (
            <div className="mt-8 rounded-[10px] border border-[var(--supordo-mint-200)] bg-white p-5 md:p-6">
              <p className="text-base font-semibold text-[var(--supordo-forest)]">
                Le formulaire n'est pas encore ouvert.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--supordo-graphite)]">
                L'adresse de réception des demandes n'est pas encore en place. Plutôt
                qu'un formulaire qui perdrait votre message sans rien dire, cette page
                reste volontairement sans envoi jusqu'à ce que la réception fonctionne
                réellement.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="company" className={labelClass}>
                    Entreprise
                  </label>
                  <input
                    id="company"
                    name="company"
                    className={inputClass}
                    value={form.company}
                    onChange={update("company")}
                    required
                    maxLength={120}
                    autoComplete="organization"
                  />
                </div>
                <div>
                  <label htmlFor="trade" className={labelClass}>
                    Métier
                  </label>
                  <input
                    id="trade"
                    name="trade"
                    className={inputClass}
                    value={form.trade}
                    onChange={update("trade")}
                    required
                    maxLength={80}
                    placeholder="Plombier, couvreur, électricien…"
                  />
                </div>
                <div>
                  <label htmlFor="city" className={labelClass}>
                    Ville
                  </label>
                  <input
                    id="city"
                    name="city"
                    className={inputClass}
                    value={form.city}
                    onChange={update("city")}
                    required
                    maxLength={80}
                    autoComplete="address-level2"
                  />
                </div>
                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={inputClass}
                    value={form.email}
                    onChange={update("email")}
                    required
                    maxLength={255}
                    autoComplete="email"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="phone" className={labelClass}>
                    Téléphone <span className="font-normal text-[var(--supordo-graphite)]">(facultatif)</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className={inputClass}
                    value={form.phone}
                    onChange={update("phone")}
                    maxLength={30}
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className={labelClass}>
                  Votre message <span className="font-normal text-[var(--supordo-graphite)]">(facultatif)</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  maxLength={2000}
                  className={`${inputClass} min-h-[140px] py-3`}
                  value={form.message}
                  onChange={update("message")}
                />
              </div>

              {/* Honeypot: never visible, never focusable for a real visitor. */}
              <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
                <label htmlFor="trap">Ne pas remplir</label>
                <input
                  id="trap"
                  name="trap"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.trap}
                  onChange={update("trap")}
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-[6px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={sending}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-[6px] bg-[var(--supordo-green)] px-6 text-sm font-semibold text-white transition-colors hover:bg-[var(--supordo-green-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-forest)] disabled:opacity-60 sm:w-auto lg:min-h-[52px] lg:px-7 lg:text-base"
              >
                {sending ? "Envoi en cours…" : "Envoyer ma demande"}
              </button>

              <div className="border-t border-[var(--supordo-mint-200)] pt-6 text-sm leading-relaxed text-[var(--supordo-graphite)]">
                <p className="font-semibold text-[var(--supordo-forest)]">
                  Ce qui se passe ensuite
                </p>
                <p className="mt-2">
                  Votre demande est envoyée par email à SUPORDO. Elle n'est pas
                  enregistrée dans une base de données. Une personne de SUPORDO vous
                  répond à l'adresse que vous avez indiquée.
                </p>
                <p className="mt-3">
                  Vos informations servent uniquement à répondre à cette demande. Elles
                  sont transmises et conservées dans la messagerie de SUPORDO. Vous
                  pouvez demander leur suppression en répondant à notre email. La durée
                  de conservation et la politique de confidentialité complète seront
                  précisées sur cette page dès leur publication.
                </p>
              </div>
            </form>
          )}
        </section>
      </main>
      <SupordoFooter />
    </div>
  );
}
