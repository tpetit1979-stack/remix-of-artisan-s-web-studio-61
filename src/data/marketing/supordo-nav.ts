import { DEMO_TRADES, DEMO_SITES } from "./supordo-demo-site";
import { TRADE_PAGES } from "./supordo-trade-pages";

/**
 * L'inventaire des pages marketing SUPORDO, en un seul endroit.
 *
 * L'en-tête, le pied de page et `/sitemap.xml` lisent tous ce fichier. C'est
 * la raison d'être de ce module : tant que les trois surfaces dérivent de la
 * même liste, aucune ne peut pointer vers une page absente ni oublier une
 * page présente. Le pied de page portait jusqu'ici un commentaire expliquant
 * pourquoi « Exemples » en était retiré — ce genre de désynchronisation
 * disparaît avec une liste unique.
 *
 * Ce n'est pas un routeur : les routes restent des fichiers dans
 * `src/routes/`. C'est leur table des matières publique.
 */

/** Navigation principale de l'en-tête — volontairement courte. */
export const MARKETING_NAV = [
  { to: "/comment-ca-marche", label: "Comment ça marche" },
  { to: "/exemples", label: "Exemples" },
  { to: "/metiers", label: "Métiers" },
  { to: "/tarifs", label: "Tarifs" },
] as const;

/** Colonnes du pied de page. L'accès client et la marque restent à part. */
export const MARKETING_FOOTER_SECTIONS = [
  {
    title: "Produit",
    links: [
      { to: "/", label: "SUPORDO Sites" },
      { to: "/comment-ca-marche", label: "Comment ça marche" },
      { to: "/tarifs", label: "Tarifs" },
    ],
  },
  {
    title: "Découvrir",
    links: [
      { to: "/exemples", label: "Exemples de sites" },
      { to: "/metiers", label: "Métiers" },
      { to: "/demarrer", label: "Demander mon site" },
    ],
  },
  {
    title: "Légal",
    links: [
      { to: "/legal/mentions-legales", label: "Mentions légales" },
      { to: "/legal/confidentialite", label: "Confidentialité" },
    ],
  },
] as const;

/**
 * Les chemins servis par `/sitemap.xml` sur l'hôte SUPORDO.
 *
 * `/demarrer/confirmation` en est absent : c'est une page d'après-envoi, sans
 * intérêt pour un moteur et sans sens hors parcours.
 */
export const MARKETING_SITEMAP_PATHS: readonly string[] = [
  "/",
  "/comment-ca-marche",
  "/exemples",
  ...DEMO_TRADES.map((id) => `/exemples/${DEMO_SITES[id].slug}`),
  "/metiers",
  ...TRADE_PAGES.map((page) => `/metiers/${page.slug}`),
  "/tarifs",
  "/demarrer",
  "/legal/mentions-legales",
  "/legal/confidentialite",
];
