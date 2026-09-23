import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { resolveMarketingRoute } from "@/lib/tenant";
import { buildMarketingHead } from "@/lib/seo";
import { getLeadIntakeStatus, submitSupordoLead } from "@/lib/supordo-lead.functions";
import { TRADE_OTHER } from "@/lib/supordo-lead";
import { supabase } from "@/integrations/supabase/client";
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
    const marketing = await resolveMarketingRoute();
    if (!marketing) throw notFound();
    const { configured } = await getLeadIntakeStatus();
    // Taxonomie métier réelle (public.trade_templates, lecture publique).
    // Aucune seconde liste n'est maintenue ici.
    const { data: trades } = await supabase
      .from("trade_templates")
      .select("slug, name")
      .order("name", { ascending: true });
    return { ...marketing, configured, trades: trades ?? [] };
  },
  head: ({ loaderData }) =>
    buildMarketingHead({
      title: "Demander un site internet pour votre entreprise | SUPORDO",
      description:
        "Présentez votre entreprise, votre métier et votre secteur d'intervention pour demander votre site SUPORDO.",
      path: "/demarrer",
      canonicalOrigin: loaderData?.canonicalOrigin ?? null,
    }),
  component: DemarrerPage,
});

interface FormState {
  firstName: string;
  lastName: string;
  company: string;
  trade: string;
  tradeOther: string;
  city: string;
  email: string;
  phone: string;
  currentWebsite: string;
  message: string;
  trap: string;
}

const EMPTY: FormState = {
  firstName: "",
  lastName: "",
  company: "",
  trade: "",
  tradeOther: "",
  city: "",
  email: "",
  phone: "",
  currentWebsite: "",
  message: "",
  trap: "",
};

const labelClass = "block text-sm font-semibold text-[var(--supordo-forest)]";
const inputClass =
  "mt-2 block w-full min-h-12 rounded-[6px] border border-[var(--supordo-mint-200)] bg-white px-4 text-base text-[var(--supordo-forest)] outline-none placeholder:text-[var(--supordo-graphite)]/50 focus-visible:border-[var(--supordo-green)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-green)]";

function DemarrerPage() {
  const { configured, trades } = Route.useLoaderData();
  const navigate = useNavigate();
  const submit = useServerFn(submitSupordoLead);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const mountedAt = useRef<number>(Date.now());

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const update =
    (field: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    // Validation côté navigateur, rejouée côté serveur — jamais seule.
    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.company.trim() ||
      !form.trade.trim() ||
      !form.city.trim() ||
      !form.phone.trim() ||
      !form.email.trim()
    ) {
      setError("Tous les champs marqués comme nécessaires doivent être remplis.");
      return;
    }
    if (form.trade === TRADE_OTHER && !form.tradeOther.trim()) {
      setError("Précisez votre métier.");
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
          intent: "site_request",
          source: "start",
          firstName: form.firstName,
          lastName: form.lastName,
          company: form.company,
          trade: form.trade,
          tradeOther: form.trade === TRADE_OTHER ? form.tradeOther : "",
          city: form.city,
          email: form.email,
          phone: form.phone,
          currentWebsite: form.currentWebsite,
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
          "Votre demande n'a pas pu être enregistrée : la réception n'est pas encore en place. Réessayez plus tard.",
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
      <SupordoHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-[720px] px-5 py-12 md:px-8 md:py-16">
          <h1 className="text-[2rem] font-extrabold leading-[1.1] tracking-[-0.02em] text-[var(--supordo-forest)] sm:text-[2.5rem]">
            Parlons de votre site.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
            Dites-nous qui vous êtes et ce que vous faites. Nous revenons vers vous par email pour
            comprendre votre besoin et vous expliquer comment SUPORDO Sites fonctionne.
          </p>

          {!configured ? (
            <div className="mt-8 rounded-[10px] border border-[var(--supordo-mint-200)] bg-white p-5 md:p-6">
              <p className="text-base font-semibold text-[var(--supordo-forest)]">
                Le formulaire n'est pas encore ouvert.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--supordo-graphite)]">
                L'enregistrement et la réception des demandes ne sont pas encore en place. Plutôt
                qu'un formulaire qui perdrait votre message sans rien dire, cette page reste
                volontairement sans envoi jusqu'à ce que la prise en charge fonctionne réellement.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className={labelClass}>
                    Prénom
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    className={inputClass}
                    value={form.firstName}
                    onChange={update("firstName")}
                    required
                    maxLength={80}
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className={labelClass}>
                    Nom
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    className={inputClass}
                    value={form.lastName}
                    onChange={update("lastName")}
                    required
                    maxLength={80}
                    autoComplete="family-name"
                  />
                </div>
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
                  <select
                    id="trade"
                    name="trade"
                    className={inputClass}
                    value={form.trade}
                    onChange={update("trade")}
                    required
                  >
                    <option value="">Choisissez votre métier</option>
                    {trades.map((t) => (
                      <option key={t.slug} value={t.slug}>
                        {t.name}
                      </option>
                    ))}
                    <option value={TRADE_OTHER}>Autre</option>
                  </select>
                </div>
                {form.trade === TRADE_OTHER && (
                  <div>
                    <label htmlFor="tradeOther" className={labelClass}>
                      Précisez votre métier
                    </label>
                    <input
                      id="tradeOther"
                      name="tradeOther"
                      className={inputClass}
                      value={form.tradeOther}
                      onChange={update("tradeOther")}
                      required
                      maxLength={80}
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="city" className={labelClass}>
                    Commune
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
                <div>
                  <label htmlFor="phone" className={labelClass}>
                    Téléphone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className={inputClass}
                    value={form.phone}
                    onChange={update("phone")}
                    required
                    maxLength={30}
                    autoComplete="tel"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="currentWebsite" className={labelClass}>
                    Site internet actuel{" "}
                    <span className="font-normal text-[var(--supordo-graphite)]">(facultatif)</span>
                  </label>
                  <input
                    id="currentWebsite"
                    name="currentWebsite"
                    className={inputClass}
                    value={form.currentWebsite}
                    onChange={update("currentWebsite")}
                    maxLength={255}
                    autoComplete="url"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className={labelClass}>
                  Votre message{" "}
                  <span className="font-normal text-[var(--supordo-graphite)]">(facultatif)</span>
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
                className="inline-flex min-h-12 w-full items-center justify-center rounded-[6px] bg-[var(--supordo-green)] px-6 text-sm font-semibold text-white transition-colors hover:bg-[var(--supordo-green-hover)] active:bg-[var(--supordo-forest)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-forest)] disabled:opacity-60 sm:w-auto lg:min-h-[52px] lg:px-7 lg:text-base"
              >
                {sending ? "Envoi en cours…" : "Envoyer ma demande"}
              </button>

              <div className="border-t border-[var(--supordo-mint-200)] pt-6 text-sm leading-relaxed text-[var(--supordo-graphite)]">
                <p className="font-semibold text-[var(--supordo-forest)]">
                  Ce qui se passe ensuite
                </p>
                <p className="mt-2">
                  Votre demande est enregistrée par SUPORDO, puis signalée par email à notre équipe.
                  Une personne de SUPORDO vous répond à l'adresse ou au numéro que vous avez
                  indiqués.
                </p>
                <p className="mt-3">
                  Vos informations servent uniquement à traiter cette demande. Vous pouvez demander
                  leur suppression à tout moment. Le détail figure dans notre{" "}
                  <Link
                    to="/legal/confidentialite"
                    className="font-semibold text-[var(--supordo-forest)] underline underline-offset-4"
                  >
                    politique de confidentialité
                  </Link>
                  .
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
