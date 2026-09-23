import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
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

/**
 * L'attribution ne tient que si chaque bouton la transporte.
 *
 * Avant ce lot, `/demarrer` écrivait `start` en dur : la colonne `source`
 * était `NOT NULL` et ne disait rien. Un lien ajouté demain sans `src`
 * retomberait silencieusement sur `direct` — visible nulle part, sauf ici.
 */
describe("attribution des appels à l'action", () => {
  const files = [
    "src/components/marketing/SupordoHeader.tsx",
    "src/components/marketing/SupordoHero.tsx",
    "src/components/marketing/SupordoActSix.tsx",
    "src/components/marketing/SupordoActFinal.tsx",
    "src/routes/comment-ca-marche.tsx",
    "src/routes/tarifs.tsx",
    "src/routes/exemples.index.tsx",
    "src/routes/exemples.$demoSlug.tsx",
    "src/routes/metiers.index.tsx",
    "src/routes/metiers.$tradeSlug.tsx",
  ];

  it("fait porter une origine au lien du pied de page", () => {
    // Le pied de page construit ses liens depuis ce fichier, pas depuis un
    // `to="/demarrer"` littéral : il échappait au contrôle ci-dessous, et
    // c'est exactement par là que l'attribution a fui la première fois.
    const links: { to: string; src?: string }[] = [];
    for (const section of MARKETING_FOOTER_SECTIONS) {
      for (const link of section.links) links.push(link as { to: string; src?: string });
    }
    const entry = links.find((link) => link.to === "/demarrer");
    expect(entry).toBeDefined();
    expect(entry?.src).toBe("footer");
  });

  it("fait porter une origine à chaque lien vers /demarrer", () => {
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      const links = source.split('to="/demarrer"').length - 1;
      expect(links, file).toBeGreaterThan(0);
      // Chaque occurrence doit être immédiatement suivie de son `src`.
      for (const after of source.split('to="/demarrer"').slice(1)) {
        expect(after.slice(0, 80), file).toContain("src:");
      }
    }
  });

  it("couvre toutes les surfaces marketing qui convertissent", () => {
    const all = files.map((file) => readFileSync(file, "utf8")).join("\n");
    for (const surface of [
      'src: "home"',
      'src: "pricing"',
      'src: "how_it_works"',
      'src: "examples"',
      'src: "trades"',
    ]) {
      expect(all, surface).toContain(surface);
    }
    expect(all).toContain("src: `example.${");
    expect(all).toContain("src: `trade.${");
  });
});
