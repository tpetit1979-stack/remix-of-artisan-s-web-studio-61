/** Minuscules sans accents, pour des comparaisons de libellés fiables
 *  (les données ADEME arrivent parfois sans accents). */
function normalize(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export type RgeFamilyDescriptor = {
  /** Identifiant stable de la famille (ex. "qualipac"), à utiliser comme clé
   *  de regroupement — jamais le texte affiché, pour pouvoir renommer
   *  titreCarte plus tard sans casser le regroupement. */
  familyKey: string;
  /** Nom de marque officiel Qualit'EnR (ex. "QualiPAC"). Non affiché
   *  aujourd'hui, conservé pour un usage futur éventuel. */
  labelOfficiel: string;
  /** Titre de carte destiné au particulier — seul texte remplacé par
   *  rapport à certification_name brut. */
  titreCarte: string;
  /** Phrase d'explication courte, affichée sous le titre. */
  explication: string;
  /** Porteuse de la mention RGE ou non (QualiPV Bât et Recharge Elec +
   *  ne le sont pas). Non affiché aujourd'hui, conservé pour un usage
   *  futur éventuel — voir consigne "pas de badge RGE / non RGE". */
  estRge: boolean;
};

type FamilyRule = { match: (combinedName: string) => boolean; descriptor: RgeFamilyDescriptor };

/**
 * Familles Qualit'EnR reconnues, testées dans cet ordre. Les familles
 * historiques (Qualibois/QualiPAC/Qualisol/QualiPV/forage) sont testées
 * avant "chauffage +" pour éviter toute collision avec "QualiPAC module
 * Chauffage et ECS" (qui contient déjà le mot "chauffage").
 */
const RGE_FAMILIES: FamilyRule[] = [
  {
    match: (n) => n.includes("qualibois"),
    descriptor: {
      familyKey: "qualibois",
      labelOfficiel: "Qualibois",
      titreCarte: "Chauffage au bois",
      explication: "Poêles, inserts et chaudières bois ou granulés",
      estRge: true,
    },
  },
  {
    match: (n) => n.includes("qualipac"),
    descriptor: {
      familyKey: "qualipac",
      labelOfficiel: "QualiPAC",
      titreCarte: "Pompes à chaleur",
      explication: "Installation de pompes à chaleur et chauffe-eau thermodynamiques",
      estRge: true,
    },
  },
  {
    match: (n) => n.includes("forage"),
    descriptor: {
      familyKey: "forage",
      labelOfficiel: "Certification forage",
      titreCarte: "Forage géothermique",
      explication: "Préparation du captage pour pompe à chaleur géothermique",
      estRge: true,
    },
  },
  {
    match: (n) => n.includes("qualisol"),
    descriptor: {
      familyKey: "qualisol",
      labelOfficiel: "Qualisol",
      titreCarte: "Solaire thermique",
      explication: "Chauffage et eau chaude grâce au soleil",
      estRge: true,
    },
  },
  {
    match: (n) => n.includes("qualipv"),
    descriptor: {
      familyKey: "qualipv",
      labelOfficiel: "QualiPV",
      titreCarte: "Photovoltaïque",
      explication: "Production d'électricité solaire pour votre logement",
      estRge: true,
    },
  },
  {
    match: (n) => n.includes("ventilation"),
    descriptor: {
      familyKey: "ventilation_plus",
      labelOfficiel: "Ventilation +",
      titreCarte: "Ventilation mécanique",
      explication: "Qualité de l'air intérieur et renouvellement d'air",
      estRge: true,
    },
  },
  {
    match: (n) => n.includes("recharge"),
    descriptor: {
      familyKey: "recharge_elec_plus",
      labelOfficiel: "Recharge Elec +",
      titreCarte: "Bornes de recharge",
      explication: "Recharge de véhicules électriques",
      estRge: false,
    },
  },
  {
    match: (n) =>
      n.includes("chauffage +") ||
      n.includes("chauffage+") ||
      n.includes("chaudiere a condensation") ||
      n.includes("chaudieres a condensation"),
    descriptor: {
      familyKey: "chauffage_plus",
      labelOfficiel: "Chauffage +",
      titreCarte: "Chaudières performantes",
      explication: "Chaudières à condensation et micro-cogénération",
      estRge: true,
    },
  },
];

/**
 * Descripteur public (destiné au particulier) pour une qualification RGE —
 * utilisé pour le titre de carte et la phrase d'explication dans
 * CertificationBadges.tsx. Les données officielles (qualification_name,
 * qualification_code, url_qualification, domaine) restent affichées telles
 * quelles à côté ; ce descripteur ne fait que reformuler le titre de groupe.
 *
 * Famille non reconnue : titreCarte retombe sur certification_name tel
 * quel, explication vide — on ne fabrique jamais un intitulé. familyKey
 * retombe sur le certification_name normalisé, pour que deux lignes non
 * reconnues avec le même certification_name se regroupent quand même.
 */
export function getRgeFamilyDescriptor(
  certificationName: string | null | undefined,
  qualificationName: string | null | undefined
): RgeFamilyDescriptor {
  const name = `${normalize(certificationName)} ${normalize(qualificationName)}`;

  for (const family of RGE_FAMILIES) {
    if (family.match(name)) return family.descriptor;
  }

  return {
    familyKey: normalize(certificationName),
    labelOfficiel: certificationName ?? "",
    titreCarte: certificationName ?? "",
    explication: "",
    estRge: true,
  };
}
