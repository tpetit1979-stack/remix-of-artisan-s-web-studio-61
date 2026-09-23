import { describe, it, expect } from "vitest";
import { TRADE_PAGES, type TradeProofKind } from "./supordo-trade-pages";
import { DEMO_SITES } from "./supordo-demo-site";

/**
 * Garde-fou contre l'usine à pages.
 *
 * Trente autres métiers existent dans la taxonomie. Le jour où l'on ouvrira
 * les suivants, la tentation sera de cloner ce squelette avec trois
 * paragraphes réécrits — et de produire trente pages qui n'apprennent rien.
 *
 * Ces tests n'imposent pas du contenu au kilo : ils vérifient que les champs
 * qui rendent une page métier différente d'une autre sont réellement
 * renseignés, et surtout qu'ils ne sont pas les mêmes d'un métier à l'autre.
 * Une page qui échoue ici est une page qui n'avait rien à dire.
 */
const DIFFERENTIATING_PROSE = ["intro", "headline", "metaDescription"] as const;

describe("garde-fou des pages métier", () => {
  it("donne à chaque métier une preuve, et une preuve renseignée", () => {
    for (const page of TRADE_PAGES) {
      expect(page.proof, page.slug).toBeDefined();
      expect(page.proof.title.length, page.slug).toBeGreaterThan(12);
      expect(page.proof.body.length, page.slug).toBeGreaterThan(80);
    }
  });

  it("ne donne pas la même preuve à deux métiers", () => {
    const kinds = TRADE_PAGES.map((p) => p.proof.kind);
    expect(new Set(kinds).size).toBe(kinds.length);
    const titles = TRADE_PAGES.map((p) => p.proof.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("peut réellement afficher la preuve annoncée avec la démonstration liée", () => {
    const needs: Record<TradeProofKind, (slug: string) => void> = {
      finished_work: (slug) => {
        const page = TRADE_PAGES.find((p) => p.slug === slug)!;
        expect(DEMO_SITES[page.demo].projects.length, slug).toBeGreaterThan(0);
      },
      intervention: (slug) => {
        const page = TRADE_PAGES.find((p) => p.slug === slug)!;
        expect(DEMO_SITES[page.demo].services.length, slug).toBeGreaterThan(0);
      },
      service_sheets: (slug) => {
        const page = TRADE_PAGES.find((p) => p.slug === slug)!;
        expect(DEMO_SITES[page.demo].services.length, slug).toBeGreaterThanOrEqual(2);
      },
      coverage: (slug) => {
        const page = TRADE_PAGES.find((p) => p.slug === slug)!;
        expect(DEMO_SITES[page.demo].areas.length, slug).toBeGreaterThan(0);
      },
    };
    for (const page of TRADE_PAGES) needs[page.proof.kind](page.slug);
  });

  it("n'accepte aucune prose recopiée d'un métier à l'autre", () => {
    for (const field of DIFFERENTIATING_PROSE) {
      const values = TRADE_PAGES.map((p) => p[field]);
      expect(new Set(values).size, field).toBe(values.length);
    }
  });

  it("exige des questions client et des prestations propres au métier", () => {
    const allQuestions: string[] = [];
    for (const page of TRADE_PAGES) {
      expect(page.visitorQuestions.length, page.slug).toBeGreaterThanOrEqual(3);
      expect(page.typicalServices.length, page.slug).toBeGreaterThanOrEqual(3);
      expect(page.whatMatters.length, page.slug).toBeGreaterThanOrEqual(3);
      // Une question générique peut se répéter (« Intervenez-vous dans ma
      // commune ? ») ; la majorité ne doit pas.
      allQuestions.push(...page.visitorQuestions);
    }
    const shared = allQuestions.filter(
      (q, _i, arr) => arr.filter((other) => other === q).length > 1,
    );
    expect(new Set(shared).size).toBeLessThanOrEqual(1);
  });
});
