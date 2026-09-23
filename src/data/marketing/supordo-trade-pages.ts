import type { DemoTrade } from "./supordo-demo-site";

import heating from "@/assets/marketing/brand/trades/supordo-trade-heating.webp";
import plumbing from "@/assets/marketing/brand/trades/supordo-trade-plumbing.webp";
import roofing from "@/assets/marketing/brand/trades/supordo-trade-roofing.webp";
import electrical from "@/assets/marketing/brand/trades/supordo-trade-electrical.webp";

/**
 * Les quatre pages métier pilotes de `/metiers`.
 *
 * Quatre pages, une seule implémentation React : la route `/metiers/$tradeSlug`
 * lit ce fichier. Quatre composants jumeaux auraient divergé dès la première
 * correction. À l'inverse, aucun moteur générique n'est construit ici — ces
 * pages sont des données, pas un CMS, et le jour où une cinquième arrive, on
 * ajoute une entrée.
 *
 * `wordingKey` pointe vers `src/lib/trade-wording.ts`, qui reste la source de
 * vérité du vocabulaire métier dans tout le produit. Le segment d'URL peut en
 * différer : la taxonomie interne dit « couverture », un artisan se cherche
 * comme « couvreur ».
 *
 * Illustrations : lot `brand` de la photothèque. Ces pages sont de la
 * communication SUPORDO, pas le site d'une entreprise — une photographie de
 * chantier y ressemblerait à la réalisation de quelqu'un. La démonstration
 * correspondante, elle, est montrée étiquetée, avec un lien vers sa page.
 *
 * Aucun chiffre, aucune part de marché, aucune promesse de résultat : rien
 * ici n'est mesuré, donc rien ici ne se chiffre.
 */
export interface MarketingTradePage {
  /** Segment d'URL — `/metiers/<slug>`. */
  slug: string;
  /** Clé de `trade-wording.ts` lorsque le vocabulaire y est déjà défini. */
  wordingKey: string;
  /** Libellé court, navigation et fil d'Ariane. */
  label: string;
  metaTitle: string;
  metaDescription: string;
  /** H1 de la page. */
  headline: string;
  intro: string;
  image: string;
  imageAlt: string;
  /** Ce qu'un particulier cherche à vérifier avant d'appeler ce métier. */
  visitorQuestions: readonly string[];
  /** Prestations typiques — ce que le site doit pouvoir présenter. */
  typicalServices: readonly { name: string; detail: string }[];
  /** Ce qui compte particulièrement pour ce métier sur un site. */
  whatMatters: readonly { title: string; body: string }[];
  /** Démonstration correspondante, montrée en aperçu. */
  demo: DemoTrade;
}

export const TRADE_PAGES: readonly MarketingTradePage[] = [
  {
    slug: "chauffagiste",
    wordingKey: "chauffagiste",
    label: "Chauffagiste",
    metaTitle: "Site internet pour chauffagiste | SUPORDO",
    metaDescription:
      "Un site qui présente vos installations, vos entretiens et vos dépannages de chauffage, vos zones d'intervention et vos coordonnées.",
    headline: "Un site internet pour votre activité de chauffagiste",
    intro:
      "Installation, entretien, dépannage : votre métier se décide souvent dans l'urgence, et rarement sur une brochure. Un particulier qui tombe en panne de chauffage cherche à savoir, en quelques secondes, si vous intervenez chez lui et comment vous joindre.",
    image: heating,
    imageAlt: "Illustration SUPORDO d'un chauffagiste réglant une chaudière murale.",
    visitorQuestions: [
      "Intervenez-vous dans ma commune ?",
      "Travaillez-vous sur ma marque de chaudière ou de pompe à chaleur ?",
      "Faites-vous l'entretien annuel, ou seulement l'installation ?",
      "Comment vous joindre maintenant ?",
    ],
    typicalServices: [
      {
        name: "Installation de chaudière",
        detail: "Dépose de l'ancien appareil, pose, raccordement et mise en service.",
      },
      {
        name: "Entretien annuel",
        detail: "Contrôle, nettoyage et attestation — la prestation qui fait revenir le client.",
      },
      {
        name: "Dépannage",
        detail: "La prestation qu'on cherche en urgence : elle doit être visible sans défiler.",
      },
      {
        name: "Pompe à chaleur",
        detail:
          "Installation et entretien, souvent la prestation la moins bien expliquée en ligne.",
      },
    ],
    whatMatters: [
      {
        title: "La zone d'intervention avant tout",
        body: "Un chauffagiste se choisit d'abord par la distance. Vos communes sont une information de premier écran, pas une mention de bas de page.",
      },
      {
        title: "L'entretien se présente comme une prestation",
        body: "C'est la ligne qui ramène le même client chaque année. Elle mérite sa fiche, sa description et sa photo, au même titre qu'une installation.",
      },
      {
        title: "Le téléphone reste le canal",
        body: "Votre numéro est visible en permanence sur toutes les pages, sur téléphone comme sur ordinateur.",
      },
    ],
    demo: "heating",
  },
  {
    slug: "plombier",
    wordingKey: "plombier",
    label: "Plombier",
    metaTitle: "Site internet pour plombier | SUPORDO",
    metaDescription:
      "Un site qui présente vos prestations de plomberie, vos zones d'intervention, vos photos de chantier et vos coordonnées.",
    headline: "Un site internet pour votre activité de plombier",
    intro:
      "Une fuite ne se planifie pas. Entre une recherche et un appel, il s'écoule rarement plus d'une minute : votre site doit répondre dans ce temps-là, et sur un téléphone.",
    image: plumbing,
    imageAlt: "Illustration SUPORDO d'un plombier intervenant sous un lavabo.",
    visitorQuestions: [
      "Intervenez-vous dans ma commune ?",
      "Faites-vous du dépannage, ou seulement de la rénovation ?",
      "À quoi ressemble une salle de bain que vous avez faite ?",
      "Comment vous joindre maintenant ?",
    ],
    typicalServices: [
      {
        name: "Dépannage et recherche de fuite",
        detail: "La prestation d'urgence : elle doit être lisible immédiatement.",
      },
      {
        name: "Rénovation de salle de bain",
        detail: "La prestation qui se vend par la photo plus que par le texte.",
      },
      {
        name: "Chauffe-eau",
        detail: "Remplacement, pose et mise en service.",
      },
      {
        name: "Sanitaires et robinetterie",
        detail: "Les petits travaux qui amènent souvent les gros.",
      },
    ],
    whatMatters: [
      {
        title: "Les photos font la décision",
        body: "Une salle de bain terminée convainc plus qu'un paragraphe. Votre site prévoit l'emplacement ; les photographies restent les vôtres.",
      },
      {
        title: "Urgence et rénovation ne parlent pas au même client",
        body: "Les deux doivent se trouver sans se gêner : une prestation par fiche, pas une liste indifférenciée.",
      },
      {
        title: "Un site lisible à une main",
        body: "La plupart de vos visiteurs arrivent sur téléphone, souvent debout devant le problème.",
      },
    ],
    demo: "plumbing",
  },
  {
    slug: "couvreur",
    wordingKey: "couverture",
    label: "Couvreur",
    metaTitle: "Site internet pour couvreur | SUPORDO",
    metaDescription:
      "Un site qui présente vos travaux de couverture et de zinguerie, vos zones d'intervention et vos coordonnées.",
    headline: "Un site internet pour votre activité de couvreur",
    intro:
      "Une toiture est un chantier qu'on ne commande pas à la légère. Le particulier compare, hésite, demande plusieurs avis — et cherche surtout à savoir à qui il confie son toit.",
    image: roofing,
    imageAlt: "Illustration SUPORDO d'un couvreur travaillant sur une toiture en tuiles.",
    visitorQuestions: [
      "Intervenez-vous dans ma commune ?",
      "Faites-vous la zinguerie, ou seulement la couverture ?",
      "À quoi ressemble une toiture que vous avez refaite ?",
      "Êtes-vous assuré, et depuis quand exercez-vous ?",
    ],
    typicalServices: [
      {
        name: "Rénovation de toiture",
        detail: "Le chantier principal : celui que le visiteur veut voir en photo.",
      },
      {
        name: "Zinguerie",
        detail: "Gouttières, noues et solins — souvent la première demande.",
      },
      {
        name: "Recherche de fuite",
        detail: "L'entrée en matière qui mène souvent à une réfection.",
      },
      {
        name: "Entretien et démoussage",
        detail: "La prestation régulière, moins visible et pourtant demandée.",
      },
    ],
    whatMatters: [
      {
        title: "Le chantier terminé est l'argument",
        body: "Un avant/après de toiture se comprend sans légende. Votre site prévoit ces emplacements ; les photographies restent les vôtres.",
      },
      {
        title: "La confiance se construit par les informations",
        body: "Ancienneté, assurance, qualifications : ce sont des informations, pas des slogans, et elles ont leur place sur le site.",
      },
      {
        title: "Une zone d'intervention claire",
        body: "Un couvreur se déplace ; le visiteur veut savoir jusqu'où avant d'appeler.",
      },
    ],
    demo: "roofing",
  },
  {
    slug: "electricien",
    wordingKey: "electricien",
    label: "Électricien",
    metaTitle: "Site internet pour électricien | SUPORDO",
    metaDescription:
      "Un site qui présente vos prestations d'électricité, vos zones d'intervention, vos réalisations et vos coordonnées.",
    headline: "Un site internet pour votre activité d'électricien",
    intro:
      "Mise aux normes, tableau, borne de recharge : vos prestations n'ont pas la même urgence ni le même client. Un site qui les mélange oblige le visiteur à chercher — et il ne cherche pas longtemps.",
    image: electrical,
    imageAlt: "Illustration SUPORDO d'un électricien intervenant sur un tableau résidentiel.",
    visitorQuestions: [
      "Intervenez-vous dans ma commune ?",
      "Posez-vous des bornes de recharge ?",
      "Faites-vous la mise aux normes d'un logement ancien ?",
      "Comment vous joindre maintenant ?",
    ],
    typicalServices: [
      {
        name: "Mise aux normes",
        detail: "Vérification de l'installation et reprise des points non conformes.",
      },
      {
        name: "Tableau électrique",
        detail: "Remplacement, repérage des circuits et protection différentielle.",
      },
      {
        name: "Borne de recharge",
        detail: "Une demande récente, encore mal servie en ligne : elle mérite sa propre fiche.",
      },
      {
        name: "Rénovation électrique",
        detail: "Création de circuits, prises, éclairage et raccordements.",
      },
    ],
    whatMatters: [
      {
        title: "Une prestation, une fiche",
        body: "Une borne de recharge et une mise aux normes ne se cherchent pas avec les mêmes mots. Elles n'ont donc pas à partager le même paragraphe.",
      },
      {
        title: "Le travail fini se montre",
        body: "Un tableau propre, un éclairage réussi : ce sont vos photographies, aux emplacements que le site prévoit.",
      },
      {
        title: "Des informations exactes",
        body: "Qualifications et assurances s'affichent telles que vous les fournissez — le site n'en invente aucune.",
      },
    ],
    demo: "electrical",
  },
];

/** Index par segment d'URL — même rôle que `DEMO_SITE_BY_SLUG`. */
export const TRADE_PAGE_BY_SLUG: Record<string, MarketingTradePage> = Object.fromEntries(
  TRADE_PAGES.map((page) => [page.slug, page]),
);
