import atelierHero from "@/assets/marketing/demos/atelier-du-feu/atelier-du-feu-hero-stove-installation.webp";
import atelierStoveService from "@/assets/marketing/demos/atelier-du-feu/atelier-du-feu-service-stove-repair.webp";
import martinHero from "@/assets/marketing/demos/martin-confort/martin-confort-hero-plumbing.webp";
import martinHeatPump from "@/assets/marketing/demos/martin-confort/martin-confort-service-heat-pump-diagnostics.webp";
import durandHero from "@/assets/marketing/demos/toitures-durand/toitures-durand-hero-roofing.webp";
import bergerEvCharger from "@/assets/marketing/demos/berger-electricite/berger-electricite-service-ev-charger.webp";

import waterHeater from "@/assets/marketing/generic-library/plumbing-heating-thermodynamic-water-heater-service-01.webp";
import roofingZinc from "@/assets/marketing/generic-library/roofing-zinc-service-01.webp";
import roofingLeak from "@/assets/marketing/generic-library/roofing-leak-diagnostic-service-01.webp";
import roofingFinished from "@/assets/marketing/generic-library/roofing-finished-tile-roof-gallery-01.webp";
import electricalPanel from "@/assets/marketing/generic-library/electrical-panel-service-01.webp";
import electricalPanelEntry from "@/assets/marketing/generic-library/electrical-panel-service-02.webp";
import electricalRenovation from "@/assets/marketing/generic-library/electrical-renovation-service-01.webp";
import electricalPanelFinished from "@/assets/marketing/generic-library/electrical-panel-finished-gallery-01.webp";
import electricalLightingFinished from "@/assets/marketing/generic-library/electrical-lighting-finished-gallery-01.webp";

/**
 * Données fictives utilisées uniquement pour les démonstrations visuelles du
 * site marketing SUPORDO. Ne représentent aucun client réel.
 *
 * Quatre entreprises de démonstration pour montrer que le système produit des
 * sites différents plutôt qu'un gabarit repeint : le nom, le métier, la photo
 * d'accueil, le titre, les prestations, les réalisations, les communes, la
 * couleur dominante et la typographie changent ensemble. Ce qui reste commun
 * est le socle — structure, hiérarchie, lisibilité, comportement responsive.
 *
 * Provenance des images (photothèque SUPORDO) :
 *
 * - lot `demos` — images rattachées à une entreprise de démonstration
 *   nommée. Elles ne servent qu'ici et ne doivent jamais devenir un visuel
 *   générique proposé à un tenant : une image portant le fourgon ou la
 *   signature de « Martin Confort » n'a de sens que pour Martin Confort.
 * - lot `generic-library` — images de métier sans marque, qui complètent une
 *   démonstration lorsqu'elles sont cohérentes avec le métier montré.
 *
 * Toutes ces images sont générées. Le manifeste les marque
 * `can_use_as_customer_project_proof = false` : elles illustrent une
 * prestation ou une entreprise fictive, jamais le chantier réel d'un client.
 * Les blocs qui les affichent portent l'étiquette « Démonstration SUPORDO ».
 *
 * Le nombre de prestations et de réalisations suit les photographies
 * réellement disponibles par entreprise. Une démonstration sans réalisation
 * n'est pas un trou à combler : c'est l'état d'un site neuf, que le produit
 * doit savoir afficher. Les couples avant/après attendent leurs prises de vue
 * — `beforeImage` reste nul et le composant affiche alors un emplacement
 * dimensionné plutôt qu'une image inventée.
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
    nav: ["Accueil", "Prestations", "Contact"],
    heroImage: atelierHero,
    heroImageAlt: "Deux installateurs posent un poêle et son conduit dans une maison.",
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
        image: atelierStoveService,
        imageAlt: "Un installateur contrôle le raccordement d'un poêle à bois.",
      },
    ],
    // Site neuf : aucune réalisation publiée pour l'instant.
    projects: [],
  },

  plumbing: {
    demo: true,
    id: "plumbing",
    tradeLabel: "Plomberie",
    companyName: "Martin Confort",
    trade: "Plomberie et chauffage",
    headline: "Plomberie, chauffage et eau chaude à Aix-en-Provence",
    city: "Aix-en-Provence",
    areas: ["Aix-en-Provence", "Venelles", "Le Tholonet", "Bouc-Bel-Air", "Gardanne"],
    phone: FAKE_PHONE,
    email: "contact@martin-confort.example",
    nav: ["Accueil", "Prestations", "Contact"],
    heroImage: martinHero,
    heroImageAlt: "Un plombier intervient sur les raccordements d'un meuble vasque.",
    theme: {
      primary: "#1F4E6B",
      surface: "#F4F7F9",
      text: "#15242E",
      fontStack: '"Helvetica Neue", Helvetica, Arial, system-ui, sans-serif',
      radius: "4px",
    },
    services: [
      {
        name: "Entretien de pompe à chaleur",
        description:
          "Contrôle des pressions, du circuit et des réglages, puis remise en service de l'appareil.",
        image: martinHeatPump,
        imageAlt:
          "Un technicien contrôle une pompe à chaleur extérieure avec des instruments de mesure.",
      },
      {
        name: "Chauffe-eau thermodynamique",
        description: "Dépose de l'ancien appareil, pose et mise en service du nouveau.",
        image: waterHeater,
        imageAlt:
          "Un technicien contrôle un chauffe-eau thermodynamique dans un garage domestique.",
      },
    ],
    // Site neuf : aucune réalisation publiée pour l'instant.
    projects: [],
  },

  roofing: {
    demo: true,
    id: "roofing",
    tradeLabel: "Couverture",
    companyName: "Toitures Durand",
    trade: "Couverture et zinguerie",
    headline: "Couverture et rénovation de toiture autour de Salon-de-Provence",
    city: "Salon-de-Provence",
    areas: ["Salon-de-Provence", "Pélissanne", "Lançon-Provence", "Grans", "La Barben"],
    phone: FAKE_PHONE,
    email: "contact@toitures-durand.example",
    nav: ["Accueil", "Prestations", "Réalisations", "Contact"],
    heroImage: durandHero,
    heroImageAlt: "Deux couvreurs posent des tuiles sur une toiture résidentielle.",
    theme: {
      primary: "#8C3A2B",
      surface: "#F7F4EF",
      text: "#2A2320",
      fontStack: '"Trebuchet MS", "Segoe UI", system-ui, sans-serif',
      radius: "2px",
    },
    services: [
      {
        name: "Zinguerie",
        description: "Gouttières, noues et solins : pose, reprise et remplacement.",
        image: roofingZinc,
        imageAlt: "Un couvreur travaille une finition en zinc au bord d'une toiture.",
      },
      {
        name: "Recherche de fuite",
        description: "Repérage de l'infiltration dans les combles et réparation de la zone.",
        image: roofingLeak,
        imageAlt:
          "Un professionnel inspecte des traces d'humidité sur la charpente dans des combles.",
      },
    ],
    projects: [
      {
        title: "Couverture et zinguerie refaites",
        city: "Pélissanne",
        service: "Zinguerie",
        image: roofingFinished,
        imageAlt: "Maison résidentielle avec une toiture en tuiles terminée.",
        beforeImage: null,
        afterImage: roofingFinished,
        beforeAlt: "Toiture avant réfection, tuiles vieillies et zinguerie dégradée",
        afterAlt: "Maison résidentielle avec une toiture en tuiles terminée.",
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
    heroImage: electricalPanel,
    heroImageAlt: "Deux électriciens interviennent sur un tableau électrique résidentiel ouvert.",
    theme: {
      primary: "#2F3A45",
      surface: "#F5F5F4",
      text: "#1B2026",
      fontStack: '"DejaVu Sans", Verdana, system-ui, sans-serif',
      radius: "6px",
    },
    services: [
      {
        name: "Borne de recharge",
        description: "Pose de la borne, protection dédiée et raccordement au tableau.",
        image: bergerEvCharger,
        imageAlt:
          "Un électricien de la démonstration Berger Électricité raccorde une borne de recharge.",
      },
      {
        name: "Rénovation électrique",
        description: "Création de circuits, prises, éclairage et raccordements.",
        image: electricalRenovation,
        imageAlt: "Deux électriciens tirent et préparent des câbles dans une maison en rénovation.",
      },
      {
        name: "Tableau électrique",
        description: "Remplacement du tableau, repérage des circuits et protection différentielle.",
        image: electricalPanelEntry,
        imageAlt: "Deux électriciens travaillent dans une entrée autour d'un tableau électrique.",
      },
    ],
    projects: [
      {
        title: "Remplacement d'un tableau électrique",
        city: "Allauch",
        service: "Tableau électrique",
        image: electricalPanelFinished,
        imageAlt: "Tableau électrique résidentiel terminé dans une entrée lumineuse.",
        beforeImage: null,
        afterImage: electricalPanelFinished,
        beforeAlt: "Ancien tableau électrique avant remplacement",
        afterAlt: "Tableau électrique résidentiel terminé dans une entrée lumineuse.",
      },
      {
        title: "Rénovation de l'éclairage d'un séjour",
        city: "Marseille",
        service: "Rénovation électrique",
        image: electricalLightingFinished,
        imageAlt: "Salon et salle à manger éclairés par plusieurs luminaires résidentiels.",
      },
    ],
  },
};

/**
 * Ordre d'affichage du sélecteur de métier, de la démonstration la plus
 * complète à la plus jeune : le visiteur voit d'abord un site fourni, puis
 * découvre qu'un site neuf reste présentable.
 */
export const DEMO_TRADES: readonly DemoTrade[] = ["roofing", "electrical", "plumbing", "heating"];

/** Démonstration par défaut, utilisée quand aucun métier n'est sélectionné. */
export const SUPORDO_DEMO_SITE: DemoSite = DEMO_SITES.roofing;

/** Étiquette obligatoire partout où ces données sont affichées. */
export const DEMO_LABEL = "DÉMONSTRATION SUPORDO";
