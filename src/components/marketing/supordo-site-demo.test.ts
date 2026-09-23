import { describe, it, expect } from "vitest";
import { demoPresentationProps } from "./demo-presentation";
import { DEMO_SITES } from "@/data/marketing/supordo-demo-site";

/**
 * Les faux sites sont des images du produit, pas des documents.
 *
 * Sans ce traitement, `/exemples` faisait traverser à un lecteur d'écran
 * quatre fausses navigations, quatre faux titres et quatre faux numéros de
 * téléphone comme s'ils appartenaient à la page SUPORDO — dont un numéro
 * fictif qu'une personne aveugle aurait pu composer.
 *
 * Testé sur le libellé plutôt que sur le rendu : le projet n'a pas de
 * bibliothèque de test DOM, et ajouter jsdom pour cette seule vérification
 * coûterait plus qu'elle ne rapporte. Ce qui doit rester vrai même si la
 * composition change, c'est que la représentation s'annonce comme une image
 * unique, nommée, et signalée comme fictive.
 */
describe("demoPresentationProps", () => {
  it("annonce une image unique plutôt qu'un document", () => {
    const props = demoPresentationProps(DEMO_SITES.roofing, "Aperçu du site");
    expect(props.role).toBe("img");
  });

  it("nomme l'entreprise, le métier et la commune", () => {
    const props = demoPresentationProps(DEMO_SITES.roofing, "Aperçu du site");
    expect(props["aria-label"]).toContain("Toitures Durand");
    expect(props["aria-label"]).toContain("Salon-de-Provence");
    expect(props["aria-label"]).toContain("Aperçu du site");
  });

  it("dit toujours que l'entreprise est fictive", () => {
    for (const site of Object.values(DEMO_SITES)) {
      const label = demoPresentationProps(site, "Fiche prestation")["aria-label"];
      expect(label, site.slug).toContain("Démonstration SUPORDO");
      expect(label, site.slug).toContain("entreprise fictive");
    }
  });
});
