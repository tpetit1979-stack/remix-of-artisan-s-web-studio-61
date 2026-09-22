import ramoneur from "@/assets/marketing/trades/ramoneur-cheminee.webp.asset.json";
import chauffagiste from "@/assets/marketing/trades/chauffagiste.webp.asset.json";
import climaticien from "@/assets/marketing/trades/climaticien.webp.asset.json";
import couvreur from "@/assets/marketing/trades/couvreur.webp.asset.json";
import macon from "@/assets/marketing/trades/macon.webp.asset.json";

/**
 * Données fictives utilisées uniquement pour les démonstrations visuelles du
 * site marketing SUPORDO. Ne représentent aucun client réel.
 *
 * L'entreprise, les prestations, les chantiers, la commune, le téléphone et
 * l'adresse email sont inventés. Rien ici ne doit être présenté comme un
 * client, un témoignage, un résultat commercial ou une réalisation réelle :
 * chaque composant qui affiche ces données porte l'étiquette
 * « Démonstration SUPORDO ».
 *
 * Les illustrations proviennent des assets de marque SUPORDO. Elles servent
 * d'images de démonstration, jamais de preuve d'un chantier réalisé pour un
 * client.
 *
 * Remplacement prévu : lorsqu'un vrai site client autorisé existera, seules
 * les valeurs de ce fichier changent — les composants
 * `SupordoSiteDemo`, `SupordoDemoService` et `SupordoDemoProject` n'ont pas à
 * être réécrits. Le drapeau `demo` restera à `false` uniquement le jour où
 * l'entreprise affichée est réelle et a donné son accord écrit.
 */
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
}

export interface DemoSite {
  demo: true;
  companyName: string;
  trade: string;
  tagline: string;
  city: string;
  areas: readonly string[];
  phone: string;
  email: string;
  nav: readonly string[];
  heroImage: string;
  heroImageAlt: string;
  services: readonly DemoService[];
  projects: readonly DemoProject[];
}

export const SUPORDO_DEMO_SITE: DemoSite = {
  demo: true,
  companyName: "Atelier du Feu",
  trade: "Poêles et cheminées",
  tagline: "Installation et entretien de poêles à bois et à granulés.",
  city: "Aubagne",
  areas: ["Aubagne", "Gémenos", "La Penne-sur-Huveaune", "Roquevaire", "Cuges-les-Pins"],
  // Coordonnées manifestement fictives : préfixe de numéro réservé à la
  // fiction, domaine .example réservé par la norme.
  phone: "01 99 00 00 00",
  email: "contact@atelier-du-feu.example",
  nav: ["Accueil", "Prestations", "Réalisations", "Contact"],
  heroImage: ramoneur.url,
  heroImageAlt: "Professionnel entretenant un conduit de poêle à bois",
  services: [
    {
      name: "Installation de poêle à bois",
      description:
        "Pose du poêle, raccordement au conduit et mise en service, avec contrôle du tirage.",
      image: chauffagiste.url,
      imageAlt: "Pose d'un appareil de chauffage dans un séjour",
    },
    {
      name: "Installation de poêle à granulés",
      description: "Installation de l'appareil, raccordement et réglage du fonctionnement.",
      image: climaticien.url,
      imageAlt: "Installation d'un appareil de chauffage",
    },
    {
      name: "Entretien annuel",
      description: "Nettoyage de l'appareil, vérification du conduit et des joints.",
      image: ramoneur.url,
      imageAlt: "Entretien d'un conduit de poêle à bois",
    },
  ],
  projects: [
    {
      title: "Remplacement d'un insert par un poêle à bois",
      city: "Gémenos",
      service: "Installation de poêle à bois",
      image: macon.url,
      imageAlt: "Ouvrage de maçonnerie autour d'un âtre",
    },
    {
      title: "Réfection de conduit avant installation",
      city: "Aubagne",
      service: "Entretien annuel",
      image: couvreur.url,
      imageAlt: "Intervention sur un conduit en toiture",
    },
  ],
} as const;

/** Étiquette obligatoire partout où ces données sont affichées. */
export const DEMO_LABEL = "DÉMONSTRATION SUPORDO";
