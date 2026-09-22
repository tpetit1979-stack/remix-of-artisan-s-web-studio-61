import ramoneur from "@/assets/marketing/trades/ramoneur-cheminee.webp.asset.json";
import chauffagiste from "@/assets/marketing/trades/chauffagiste.webp.asset.json";
import climaticien from "@/assets/marketing/trades/climaticien.webp.asset.json";
import couvreur from "@/assets/marketing/trades/couvreur.webp.asset.json";
import macon from "@/assets/marketing/trades/macon.webp.asset.json";
import plombier from "@/assets/marketing/trades/plombier.webp.asset.json";
import electricien from "@/assets/marketing/trades/electricien.webp.asset.json";
import menuisier from "@/assets/marketing/trades/menuisier.webp.asset.json";
import peintre from "@/assets/marketing/trades/peintre.webp.asset.json";

/**
 * Données fictives utilisées uniquement pour les démonstrations visuelles du
 * site marketing SUPORDO. Ne représentent aucun client réel.
 *
 * Quatre entreprises de démonstration, une par métier, pour montrer que le
 * système produit des sites différents plutôt qu'un gabarit repeint : le nom,
 * le métier, la photo d'accueil, le titre, les prestations, les réalisations,
 * les communes, la couleur dominante et la typographie changent ensemble.
 * Ce qui reste commun est le socle — structure, hiérarchie, lisibilité,
 * comportement responsive.
 *
 * Assets de démonstration temporaires. À remplacer progressivement par des
 * réalisations clients autorisées sans modifier l'architecture des
 * composants : seules les valeurs de ce fichier changent.
 *
 * Rien ici ne doit être présenté comme un client, un témoignage, un avis ou
 * un résultat commercial. Les composants qui affichent ces données portent
 * l'étiquette « Démonstration SUPORDO ».
 *
 * Les illustrations viennent des assets de marque SUPORDO. Les couples
 * avant/après attendent leurs photographies : `beforeImage` et `afterImage`
 * restent nuls, et les composants affichent alors un emplacement dimensionné
 * plutôt qu'une image inventée.
 */
export type DemoTrade = "heating" | "plumbing" | "roofing" | "electrical";

export interface DemoTheme {
  /** Couleur dominante du site client — sans rapport avec les tokens SUPORDO. */
  primary: string;
  /** Fond des surfaces calmes de ce site. */
  surface: string;
  /** Couleur de texte principale. */
  text: string;
  /** Pile typographique : elle doit distinguer le site du client de la landing. */
  fontStack: string;
  /** Rayon des boutons — un détail qui change la sensation d'un site à l'autre. */
  radius: string;
}

export interface DemoService {
  name: string;
  description: string;
  image: string;
  imageAlt: string;
}

export interface DemoProject {
  title: string;
  city: string;
  service: string;
  image: string;
  imageAlt: string;
  /** Couple avant/après, lorsque le chantier s'y prête. `null` = à fournir. */
  beforeImage?: string | null;
  afterImage?: string | null;
  beforeAlt?: string;
  afterAlt?: string;
}

export interface DemoSite {
  demo: true;
  id: DemoTrade;
  tradeLabel: string;
  companyName: string;
  trade: string;
  /** Titre du site du client — concret, jamais un slogan d'agence. */
  headline: string;
  city: string;
  areas: readonly string[];
  phone: string;
  email: string;
  nav: readonly string[];
  heroImage: string;
  heroImageAlt: string;
  theme: DemoTheme;
  services: readonly DemoService[];
  projects: readonly DemoProject[];
}

/** Coordonnées manifestement fictives : préfixe réservé, domaine `.example`. */
const FAKE_PHONE = "01 99 00 00 00";

export const DEMO_SITES: Record<DemoTrade, DemoSite> = {
  heating: {
    demo: true,
    id: "heating",
    tradeLabel: "Chauffage",
    companyName: "Atelier du Feu",
    trade: "Poêles et cheminées",
    headline: "Installation de poêles et cheminées autour d'Aubagne",
    city: "Aubagne",
    areas: ["Aubagne", "Gémenos", "La Penne-sur-Huveaune", "Roquevaire", "Cuges-les-Pins"],
    phone: FAKE_PHONE,
    email: "contact@atelier-du-feu.example",
    nav: ["Accueil", "Prestations", "Réalisations", "Contact"],
    heroImage: ramoneur.url,
    heroImageAlt: "Entretien d'un conduit de poêle à bois",
    theme: {
      primary: "#B4541E",
      surface: "#FBF6F1",
      text: "#241A14",
      fontStack: '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif',
      radius: "9999px",
    },
    services: [
      {
        name: "Installation de poêle à bois",
        description:
          "Pose du poêle, raccordement au conduit et mise en service, avec contrôle du tirage.",
        image: chauffagiste.url,
        imageAlt: "Pose d'un appareil de chauffage dans un séjour",
      },
      {
        name: "Poêle à granulés",
        description: "Installation de l'appareil, raccordement et réglage du fonctionnement.",
        image: climaticien.url,
        imageAlt: "Installation d'un appareil de chauffage",
      },
      {
        name: "Entretien",
        description: "Nettoyage de l'appareil, vérification du conduit et des joints.",
        image: ramoneur.url,
        imageAlt: "Entretien d'un conduit de fumée",
      },
    ],
    projects: [
      {
        title: "Remplacement d'un insert par un poêle à bois",
        city: "Gémenos",
        service: "Installation de poêle à bois",
        image: macon.url,
        imageAlt: "Ouvrage de maçonnerie autour d'un âtre",
        beforeImage: null,
        afterImage: null,
        beforeAlt: "Ancienne cheminée avant remplacement",
        afterAlt: "Poêle à bois installé à la place de l'ancienne cheminée",
      },
      {
        title: "Réfection de conduit avant installation",
        city: "Aubagne",
        service: "Entretien",
        image: couvreur.url,
        imageAlt: "Intervention sur un conduit en toiture",
      },
    ],
  },

  plumbing: {
    demo: true,
    id: "plumbing",
    tradeLabel: "Plomberie",
    companyName: "Provence Sanitaire",
    trade: "Plomberie et salle de bain",
    headline: "Plomberie et rénovation de salle de bain à Aix-en-Provence",
    city: "Aix-en-Provence",
    areas: ["Aix-en-Provence", "Venelles", "Le Tholonet", "Bouc-Bel-Air", "Gardanne"],
    phone: FAKE_PHONE,
    email: "contact@provence-sanitaire.example",
    nav: ["Accueil", "Prestations", "Réalisations", "Contact"],
    heroImage: plombier.url,
    heroImageAlt: "Intervention de plomberie sous un meuble de salle de bain",
    theme: {
      primary: "#1F4E6B",
      surface: "#F4F7F9",
      text: "#15242E",
      fontStack: '"Helvetica Neue", Helvetica, Arial, system-ui, sans-serif',
      radius: "4px",
    },
    services: [
      {
        name: "Rénovation de salle de bain",
        description:
          "Dépose de l'ancienne installation, plomberie, faïence et pose des équipements.",
        image: peintre.url,
        imageAlt: "Travaux de rénovation intérieure",
      },
      {
        name: "Remplacement de chauffe-eau",
        description: "Dépose de l'ancien appareil, pose et mise en service du nouveau.",
        image: plombier.url,
        imageAlt: "Intervention sur une installation sanitaire",
      },
      {
        name: "Dépannage plomberie",
        description: "Fuite, évacuation bouchée, robinetterie : intervention rapide.",
        image: menuisier.url,
        imageAlt: "Travail d'atelier sur une installation",
      },
    ],
    projects: [
      {
        title: "Rénovation complète d'une salle de bain",
        city: "Venelles",
        service: "Rénovation de salle de bain",
        image: peintre.url,
        imageAlt: "Pièce en cours de rénovation",
        beforeImage: null,
        afterImage: null,
        beforeAlt: "Salle de bain avant rénovation, baignoire et carrelage anciens",
        afterAlt: "Même salle de bain après rénovation, douche et faïence neuves",
      },
      {
        title: "Remplacement d'un chauffe-eau",
        city: "Bouc-Bel-Air",
        service: "Remplacement de chauffe-eau",
        image: plombier.url,
        imageAlt: "Installation sanitaire remise à neuf",
      },
    ],
  },

  roofing: {
    demo: true,
    id: "roofing",
    tradeLabel: "Couverture",
    companyName: "Toitures Durand",
    trade: "Couverture et charpente",
    headline: "Couverture et rénovation de toiture autour de Salon-de-Provence",
    city: "Salon-de-Provence",
    areas: ["Salon-de-Provence", "Pélissanne", "Lançon-Provence", "Grans", "La Barben"],
    phone: FAKE_PHONE,
    email: "contact@toitures-durand.example",
    nav: ["Accueil", "Prestations", "Réalisations", "Contact"],
    heroImage: couvreur.url,
    heroImageAlt: "Couvreur travaillant sur une toiture",
    theme: {
      primary: "#8C3A2B",
      surface: "#F7F4EF",
      text: "#2A2320",
      fontStack: '"Trebuchet MS", "Segoe UI", system-ui, sans-serif',
      radius: "2px",
    },
    services: [
      {
        name: "Rénovation de toiture",
        description: "Dépose des tuiles, reprise du support et remise en état de la couverture.",
        image: couvreur.url,
        imageAlt: "Chantier de couverture",
      },
      {
        name: "Zinguerie",
        description: "Gouttières, noues et solins : pose et remplacement.",
        image: macon.url,
        imageAlt: "Travaux sur un ouvrage extérieur",
      },
      {
        name: "Recherche de fuite",
        description: "Repérage de l'infiltration et réparation de la zone concernée.",
        image: menuisier.url,
        imageAlt: "Intervention sur une charpente",
      },
    ],
    projects: [
      {
        title: "Réfection d'une toiture en tuiles",
        city: "Pélissanne",
        service: "Rénovation de toiture",
        image: couvreur.url,
        imageAlt: "Toiture en cours de réfection",
        beforeImage: null,
        afterImage: null,
        beforeAlt: "Toiture avant réfection, tuiles vieillies et zones dégradées",
        afterAlt: "Même toiture après réfection, couverture et zinguerie neuves",
      },
      {
        title: "Remplacement des gouttières",
        city: "Grans",
        service: "Zinguerie",
        image: macon.url,
        imageAlt: "Ouvrage extérieur remis en état",
      },
    ],
  },

  electrical: {
    demo: true,
    id: "electrical",
    tradeLabel: "Électricité",
    companyName: "Berger Électricité",
    trade: "Électricité générale",
    headline: "Électricité générale pour votre logement à Marseille",
    city: "Marseille",
    areas: [
      "Marseille",
      "Allauch",
      "Plan-de-Cuques",
      "Septèmes-les-Vallons",
      "Les Pennes-Mirabeau",
    ],
    phone: FAKE_PHONE,
    email: "contact@berger-electricite.example",
    nav: ["Accueil", "Prestations", "Réalisations", "Contact"],
    heroImage: electricien.url,
    heroImageAlt: "Électricien travaillant sur un tableau électrique",
    theme: {
      primary: "#2F3A45",
      surface: "#F5F5F4",
      text: "#1B2026",
      fontStack: '"DejaVu Sans", Verdana, system-ui, sans-serif',
      radius: "6px",
    },
    services: [
      {
        name: "Mise aux normes",
        description: "Vérification de l'installation et reprise des points non conformes.",
        image: electricien.url,
        imageAlt: "Travail sur une installation électrique",
      },
      {
        name: "Tableau électrique",
        description: "Remplacement du tableau, repérage des circuits et protection différentielle.",
        image: menuisier.url,
        imageAlt: "Intervention technique en intérieur",
      },
      {
        name: "Installation et rénovation",
        description: "Création de circuits, prises, éclairage et raccordements.",
        image: peintre.url,
        imageAlt: "Travaux de rénovation intérieure",
      },
    ],
    projects: [
      {
        title: "Remplacement d'un tableau électrique",
        city: "Allauch",
        service: "Tableau électrique",
        image: electricien.url,
        imageAlt: "Tableau électrique remis à neuf",
        beforeImage: null,
        afterImage: null,
        beforeAlt: "Ancien tableau électrique avant remplacement",
        afterAlt: "Même emplacement après pose du nouveau tableau",
      },
      {
        title: "Rénovation de l'éclairage d'un séjour",
        city: "Marseille",
        service: "Installation et rénovation",
        image: peintre.url,
        imageAlt: "Séjour rénové",
      },
    ],
  },
};

/** Ordre d'affichage du sélecteur de métier. */
export const DEMO_TRADES: readonly DemoTrade[] = ["heating", "plumbing", "roofing", "electrical"];

/** Démonstration par défaut, utilisée quand aucun métier n'est sélectionné. */
export const SUPORDO_DEMO_SITE: DemoSite = DEMO_SITES.heating;

/** Étiquette obligatoire partout où ces données sont affichées. */
export const DEMO_LABEL = "DÉMONSTRATION SUPORDO";
