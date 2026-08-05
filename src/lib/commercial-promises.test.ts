import { describe, expect, it } from "vitest";
import {
  detectCommercialPromiseIssues,
  mentionsFreeQuote,
  resolveCommercialPromises,
  type CommercialPromisesConfig,
} from "./commercial-promises";

const base: CommercialPromisesConfig = {
  quoteIsFree: null,
  quoteResponseDelayHours: null,
  emergencyServiceAvailable: null,
  ctaText: null,
};

describe("mentionsFreeQuote", () => {
  it("detects 'gratuit' case-insensitively", () => {
    expect(mentionsFreeQuote("Demander un devis gratuit")).toBe(true);
    expect(mentionsFreeQuote("ÉTUDE GRATUITE")).toBe(true);
  });

  it("returns false for neutral or null text", () => {
    expect(mentionsFreeQuote("Demander un devis")).toBe(false);
    expect(mentionsFreeQuote(null)).toBe(false);
    expect(mentionsFreeQuote(undefined)).toBe(false);
  });
});

describe("resolveCommercialPromises", () => {
  it("asserts nothing when no fact is confirmed", () => {
    const r = resolveCommercialPromises(base);
    expect(r.shortBadge).toBeNull();
    expect(r.seoCtaSuffix).toBeNull();
  });

  it("never asserts free quote unless quoteIsFree is explicitly true", () => {
    const r = resolveCommercialPromises({ ...base, quoteIsFree: null });
    expect(r.shortBadge).toBeNull();
    expect(r.seoCtaSuffix).toBeNull();
  });

  it("surfaces confirmed free quote in the badge and SEO suffix", () => {
    const r = resolveCommercialPromises({ ...base, quoteIsFree: true });
    expect(r.shortBadge).toContain("Devis gratuit");
    expect(r.seoCtaSuffix).toBe("Devis gratuit.");
  });

  it("responseTimeNote mirrors the confirmed response delay, same as the contact page needs", () => {
    const unconfirmed = resolveCommercialPromises(base);
    expect(unconfirmed.responseTimeNote).toBe("Nous étudions votre demande et revenons vers vous.");

    const confirmed = resolveCommercialPromises({ ...base, quoteResponseDelayHours: 24 });
    expect(confirmed.responseTimeNote).toBe("Réponse sous 1 jour en moyenne.");
  });

  it("responseTimeNote never asserts a qualitative speed claim ('rapidement') when unconfirmed", () => {
    const unconfirmed = resolveCommercialPromises(base);
    expect(unconfirmed.responseTimeNote.toLowerCase()).not.toContain("rapide");
  });

  it("quoteFaqAnswer confirms only gratuity, not an unconfirmed absence of commitment", () => {
    const r = resolveCommercialPromises({ ...base, quoteIsFree: true });
    expect(r.quoteFaqAnswer).toBe("Le devis est gratuit.");
    expect(r.quoteFaqAnswer.toLowerCase()).not.toContain("engagement");
  });

  it("responseTimeHeading matches whether the delay is actually confirmed, not just decorative", () => {
    const unconfirmed = resolveCommercialPromises(base);
    expect(unconfirmed.responseTimeHeading).toBe("Traitement de votre demande");

    const confirmed = resolveCommercialPromises({ ...base, quoteResponseDelayHours: 24 });
    expect(confirmed.responseTimeHeading).toBe("Délai de réponse habituel");
  });

  it("quoteFaqQuestion is stable across all three quoteIsFree states — only the answer varies", () => {
    const trueCase = resolveCommercialPromises({ ...base, quoteIsFree: true });
    const falseCase = resolveCommercialPromises({ ...base, quoteIsFree: false });
    const nullCase = resolveCommercialPromises({ ...base, quoteIsFree: null });
    expect(trueCase.quoteFaqQuestion).toBe(falseCase.quoteFaqQuestion);
    expect(falseCase.quoteFaqQuestion).toBe(nullCase.quoteFaqQuestion);
    expect(trueCase.quoteFaqQuestion).toBe("Quelles sont les conditions du devis ?");
  });

  it("emergencyServiceAvailable only ever appears in the badge when explicitly true", () => {
    expect(resolveCommercialPromises({ ...base, emergencyServiceAvailable: null }).shortBadge).toBeNull();
    expect(resolveCommercialPromises({ ...base, emergencyServiceAvailable: false }).shortBadge).toBeNull();
    expect(resolveCommercialPromises({ ...base, emergencyServiceAvailable: true }).shortBadge).toContain("Urgence");
  });

  it("formats delay under 24h in hours, over 24h in days", () => {
    const short = resolveCommercialPromises({ ...base, quoteResponseDelayHours: 4 });
    expect(short.shortBadge).toContain("4 h");

    const long = resolveCommercialPromises({ ...base, quoteResponseDelayHours: 48 });
    expect(long.shortBadge).toContain("2 jours");
  });

  it("produces a distinct FAQ answer for confirmed-paid vs unconfirmed", () => {
    const unconfirmed = resolveCommercialPromises({ ...base, quoteIsFree: null });
    const paid = resolveCommercialPromises({ ...base, quoteIsFree: false });
    expect(unconfirmed.quoteFaqAnswer).not.toBe(paid.quoteFaqAnswer);
    expect(paid.quoteFaqAnswer.toLowerCase()).not.toContain("gratuit");
  });
});

describe("detectCommercialPromiseIssues", () => {
  it("flags a CTA implying free quote when quoteIsFree is unconfirmed", () => {
    const issues = detectCommercialPromiseIssues({
      ...base,
      ctaText: "Demander un devis gratuit",
      quoteIsFree: null,
    });
    expect(issues).toEqual(["CTA_IMPLIES_FREE_QUOTE_BUT_UNCONFIRMED"]);
  });

  it("flags a direct contradiction when quoteIsFree is false", () => {
    const issues = detectCommercialPromiseIssues({
      ...base,
      ctaText: "Étude gratuite",
      quoteIsFree: false,
    });
    expect(issues).toEqual(["CTA_CONTRADICTS_PAID_QUOTE"]);
  });

  it("reports no issue when the CTA is neutral, regardless of quoteIsFree", () => {
    expect(detectCommercialPromiseIssues({ ...base, ctaText: "Demander un devis", quoteIsFree: null })).toEqual([]);
    expect(detectCommercialPromiseIssues({ ...base, ctaText: "Demander un devis", quoteIsFree: false })).toEqual([]);
  });

  it("reports no issue when the CTA mentions free quote and quoteIsFree is confirmed true", () => {
    const issues = detectCommercialPromiseIssues({
      ...base,
      ctaText: "Devis gratuit sous 48h",
      quoteIsFree: true,
    });
    expect(issues).toEqual([]);
  });
});
