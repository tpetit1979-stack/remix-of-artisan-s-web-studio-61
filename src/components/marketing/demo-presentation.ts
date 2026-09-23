import type { DemoSite } from "@/data/marketing/supordo-demo-site";

/**
 * Comment un faux site s'annonce aux technologies d'assistance.
 *
 * Les représentations de `SupordoSiteDemo` sont des IMAGES du produit, pas
 * des documents. Sans traitement, un lecteur d'écran traversait sur
 * `/exemples` quatre fausses navigations, quatre faux titres et quatre faux
 * numéros de téléphone comme s'ils appartenaient à la page SUPORDO — dont un
 * numéro fictif qu'une personne aveugle aurait pu composer.
 *
 * `role="img"` retire le contenu du sous-arbre de l'arbre d'accessibilité et
 * le remplace par le libellé ci-dessous, qui nomme l'entreprise, son métier,
 * sa commune, et dit qu'elle est fictive.
 *
 * Dans un fichier à part parce que c'est une fonction, pas un composant : les
 * sites des artisans, eux, sont de vrais documents et utilisent d'autres
 * composants (`PublicHeader`, `HeroSection`…) — rien ici ne les concerne.
 */
export function demoPresentationProps(site: DemoSite, what: string) {
  return {
    role: "img" as const,
    "aria-label": `${what} — ${site.companyName}, ${site.trade.toLowerCase()} à ${site.city}. Démonstration SUPORDO, entreprise fictive.`,
  };
}
