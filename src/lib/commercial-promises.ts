/**
 * Commercial Promises — resolves tenant-confirmed commercial facts (quote
 * gratuity, response delay, emergency service) into display-ready strings,
 * and detects when the CTA text contradicts those facts.
 *
 * Never infers a promise from wording. A field is only used if the tenant
 * has explicitly confirmed it (non-null); a null field falls back to
 * neutral, non-committal copy.
 */

export type CommercialPromisesConfig = {
  quoteIsFree: boolean | null;
  quoteResponseDelayHours: number | null;
  emergencyServiceAvailable: boolean | null;
  ctaText: string | null;
};

export type ResolvedCommercialPromises = {
  shortBadge: string | null;
  quoteFaqQuestion: string;
  quoteFaqAnswer: string;
  /** How fast we reply — CTABanner's subtitle and the contact page's response-time line read this; same question, same answer. Not editorial copy: driven entirely by quoteResponseDelayHours. */
  responseTimeNote: string;
  seoCtaSuffix: string | null;
};

/** Simple, intentionally conservative heuristic — mirrors the DB function of the same name. */
export function mentionsFreeQuote(ctaText: string | null | undefined): boolean {
  return !!ctaText && /gratuit/i.test(ctaText);
}

function formatDelay(hours: number): string {
  if (hours < 24) return `${hours} h`;
  const days = Math.round(hours / 24);
  return `${days} jour${days > 1 ? "s" : ""}`;
}

export function resolveCommercialPromises(
  config: CommercialPromisesConfig,
): ResolvedCommercialPromises {
  const { quoteIsFree, quoteResponseDelayHours, emergencyServiceAvailable } = config;

  const badges: string[] = [];
  if (quoteIsFree === true) badges.push("Devis gratuit");
  if (emergencyServiceAvailable === true) badges.push("Urgence");
  if (quoteResponseDelayHours != null) badges.push(`Réponse sous ${formatDelay(quoteResponseDelayHours)}`);
  const shortBadge = badges.length > 0 ? badges.join(" · ") : null;

  const quoteFaqQuestion = "Le devis est-il payant ?";
  let quoteFaqAnswer: string;
  if (quoteIsFree === true) {
    quoteFaqAnswer = "Le devis est gratuit et sans engagement.";
  } else if (quoteIsFree === false) {
    quoteFaqAnswer =
      "Une étude ou un devis peut être facturé selon la nature de l'intervention. Contactez-nous pour connaître les conditions.";
  } else {
    quoteFaqAnswer = "Contactez-nous pour connaître les conditions du devis.";
  }

  const responseTimeNote =
    quoteResponseDelayHours != null
      ? `Réponse sous ${formatDelay(quoteResponseDelayHours)} en moyenne.`
      : "Nous vous répondons rapidement.";

  const seoCtaSuffix = quoteIsFree === true ? "Devis gratuit." : null;

  return { shortBadge, quoteFaqQuestion, quoteFaqAnswer, responseTimeNote, seoCtaSuffix };
}

/**
 * Admin-only governance codes — never surfaced on the public site. Used by
 * Super Admin / Admin UI to flag a tenant whose CTA asserts a free quote
 * without (or contrary to) confirmation.
 */
export type CommercialPromiseIssue =
  | "CTA_IMPLIES_FREE_QUOTE_BUT_UNCONFIRMED"
  | "CTA_CONTRADICTS_PAID_QUOTE";

export function detectCommercialPromiseIssues(
  config: CommercialPromisesConfig,
): CommercialPromiseIssue[] {
  const issues: CommercialPromiseIssue[] = [];
  if (mentionsFreeQuote(config.ctaText)) {
    if (config.quoteIsFree === null) {
      issues.push("CTA_IMPLIES_FREE_QUOTE_BUT_UNCONFIRMED");
    } else if (config.quoteIsFree === false) {
      issues.push("CTA_CONTRADICTS_PAID_QUOTE");
    }
  }
  return issues;
}
