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
  it("falls back to a neutral CTA when nothing is set", () => {
    const r = resolveCommercialPromises(base);
    expect(r.primaryCta).toBe("Demander un devis");
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

  it("uses the tenant's own cta_text when set", () => {
    const r = resolveCommercialPromises({ ...base, ctaText: "Demander un diagnostic" });
    expect(r.primaryCta).toBe("Demander un diagnostic");
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
