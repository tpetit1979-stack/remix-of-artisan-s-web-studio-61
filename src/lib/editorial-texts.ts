import { mentionsFreeQuote } from "./commercial-promises";

/**
 * Editorial copy for CTA slots — button label and banner heading.
 *
 * Deliberately separate from commercial-promises.ts: these strings are
 * brand voice (what the tenant chose to say), not a commercial fact the
 * tenant confirmed. A component that also needs the response-time note —
 * a fact, not a phrasing choice — reads it from resolveCommercialPromises()
 * instead of here.
 *
 * Brand voice still can't publish an unconfirmed promise: cta_text is only
 * used verbatim when it doesn't claim a free quote, or when it does and
 * quote_is_free is confirmed true. Otherwise it falls back to the neutral
 * default — moving this text out of commercial-promises.ts must not let a
 * free-text cta_text bypass that resolver's truth.
 */

export type ResolvedEditorialTexts = {
  buttonLabel: string;
  bannerHeading: string;
};

const DEFAULT_BUTTON_LABEL = "Demander un devis";
const DEFAULT_BANNER_HEADING = "Parlons de votre projet";

export function resolveEditorialTexts(
  ctaText: string | null | undefined,
  quoteIsFree: boolean | null,
): ResolvedEditorialTexts {
  const trimmed = ctaText?.trim();
  const assertsUnconfirmedFreeQuote = mentionsFreeQuote(trimmed) && quoteIsFree !== true;
  return {
    buttonLabel: trimmed && !assertsUnconfirmedFreeQuote ? trimmed : DEFAULT_BUTTON_LABEL,
    // Never driven by cta_text — that field is written for a button, not a heading.
    bannerHeading: DEFAULT_BANNER_HEADING,
  };
}
