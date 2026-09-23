import { describe, it, expect } from "vitest";
import { MARKETING_NAV, MARKETING_FOOTER_SECTIONS, MARKETING_SITEMAP_PATHS } from "./supordo-nav";
import { DEMO_TRADES, DEMO_SITES, DEMO_SITE_BY_SLUG } from "./supordo-demo-site";
import { TRADE_PAGES, TRADE_PAGE_BY_SLUG } from "./supordo-trade-pages";

/**
 * L'architecture marketing tient sur une seule liste. Ces tests vérifient
 * qu'elle reste une seule liste : un lien de navigation vers une page absente
 * du sitemap, ou un sitemap annonçant une démonstration qui n'existe plus,
 * sont exactement les régressions que la centralisation devait empêcher.
 */
describe("inventaire des pages marketing", () => {
  it("n'annonce aucun chemin en double", () => {
    expect(new Set(MARKETING_SITEMAP_PATHS).size).toBe(MARKETING_SITEMAP_PATHS.length);
  });

  it("n'annonce que des chemins absolus", () => {
    for (const path of MARKETING_SITEMAP_PATHS) expect(path.startsWith("/")).toBe(true);
  });

  it("ne met dans la navigation aucune page absente du sitemap", () => {
    const known = new Set(MARKETING_SITEMAP_PATHS);
    for (const link of MARKETING_NAV) expect(known.has(link.to)).toBe(true);
    for (const section of MARKETING_FOOTER_SECTIONS) {
      for (const link of section.links) expect(known.has(link.to)).toBe(true);
    }
  });

  it("annonce exactement les quatre démonstrations existantes", () => {
    const announced = MARKETING_SITEMAP_PATHS.filter((p) => p.startsWith("/exemples/"));
    expect(announced).toHaveLength(DEMO_TRADES.length);
    for (const path of announced) {
      expect(DEMO_SITE_BY_SLUG[path.replace("/exemples/", "")]).toBeDefined();
    }
  });

  it("annonce exactement les quatre pages métier existantes", () => {
    const announced = MARKETING_SITEMAP_PATHS.filter((p) => p.startsWith("/metiers/"));
    expect(announced).toHaveLength(TRADE_PAGES.length);
    for (const path of announced) {
      expect(TRADE_PAGE_BY_SLUG[path.replace("/metiers/", "")]).toBeDefined();
    }
  });
});

describe("démonstrations", () => {
  it("donne à chaque entreprise un slug unique et résolvable", () => {
    const slugs = DEMO_TRADES.map((id) => DEMO_SITES[id].slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(DEMO_SITE_BY_SLUG[slug]?.slug).toBe(slug);
  });

  it("ne présente aucune réalisation sans photographie", () => {
    for (const id of DEMO_TRADES) {
      for (const project of DEMO_SITES[id].projects) {
        expect(project.image.length).toBeGreaterThan(0);
        expect(project.imageAlt.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("pages métier", () => {
  it("rattache chaque page à une démonstration existante", () => {
    for (const page of TRADE_PAGES) expect(DEMO_SITES[page.demo]).toBeDefined();
  });

  it("donne à chaque page un slug unique", () => {
    const slugs = TRADE_PAGES.map((page) => page.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
