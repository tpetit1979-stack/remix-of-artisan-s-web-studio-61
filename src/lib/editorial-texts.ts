/**
 * Editorial copy for CTA slots — button label and banner heading.
 *
 * Deliberately separate from commercial-promises.ts: these strings are
 * brand voice (what the tenant chose to say), not a commercial fact the
 * tenant confirmed. A component that also needs the response-time note —
 * a fact, not a phrasing choice — reads it from resolveCommercialPromises()
 * instead of here.
 */

export type ResolvedEditorialTexts = {
  buttonLabel: string;
  bannerHeading: string;
};

const DEFAULT_BUTTON_LABEL = "Demander un devis";
const DEFAULT_BANNER_HEADING = "Parlons de votre projet";

export function resolveEditorialTexts(ctaText: string | null | undefined): ResolvedEditorialTexts {
  return {
    buttonLabel: ctaText?.trim() || DEFAULT_BUTTON_LABEL,
    // Never driven by cta_text — that field is written for a button, not a heading.
    bannerHeading: DEFAULT_BANNER_HEADING,
  };
}
