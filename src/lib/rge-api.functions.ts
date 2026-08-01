import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ADEME_API_URL =
  "https://data.ademe.fr/data-fair/api/v1/datasets/liste-des-entreprises-rge-2/lines";

/** Minuscules sans accents, pour des comparaisons de libellés fiables
 *  (les données ADEME arrivent parfois sans accents). */
function normalize(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * Mapping organisme / famille de qualification → logo URL.
 *
 * Provenance de chaque fichier documentée dans public/logos/README.md.
 */
const CERTIFICATION_LOGOS: Record<string, string> = {
  qualibois: "/logos/qualibois.png",
  qualipac: "/logos/qualipac.png",
  qualisol: "/logos/qualisol.png",
  qualipv: "/logos/qualipv.png",
  ventilation_plus: "/logos/ventilation-plus.png",
  chauffage_plus: "/logos/chauffage-plus.png",
  recharge_elec_plus: "/logos/recharge-elec-plus.png",
  qualitenr: "/logos/qualitenr.png",
  qualibat: "/logos/qualibat.svg",
  qualifelec: "/logos/qualifelec.png",
  certibat: "/logos/certibat.png",
  cnoa: "",
};

/**
 * Résout le logo à partir de l'organisme et des libellés de certification.
 *
 * `certName` (certification_name) ET `qualificationName` (qualification_name)
 * sont inspectés ensemble : sur des données réelles, une ligne peut avoir un
 * certification_name générique ("RGE") alors que le nom de famille
 * ("Qualibois Bois & Granulés") n'existe que dans qualification_name.
 *
 * Attention : on ne matche JAMAIS le simple mot "chauffage" en substring —
 * les lignes QualiPAC contiennent déjà "chauffage" (ex. "QualiPAC module
 * Chauffage et ECS", domaine "Pompe à chaleur : chauffage"). Les familles
 * QualiPAC/QualiPV/Qualisol/Qualibois sont donc testées d'abord, puis
 * "chauffage +" / "chaudière à condensation" pour Chauffage +.
 */
function guessLogoUrl(organisme: string, certName: string, qualificationName: string): string {
  const org = normalize(organisme);
  const name = `${normalize(certName)} ${normalize(qualificationName)}`;

  // Familles historiques Qualit'EnR — testées en premier pour éviter toute
  // collision avec les mots-clés génériques ci-dessous.
  if (name.includes("qualibois")) return CERTIFICATION_LOGOS.qualibois;
  if (name.includes("qualipac")) return CERTIFICATION_LOGOS.qualipac;
  if (name.includes("qualisol")) return CERTIFICATION_LOGOS.qualisol;
  if (name.includes("qualipv")) return CERTIFICATION_LOGOS.qualipv;

  // Nouvelles familles (identité modernisée Qualit'EnR).
  if (name.includes("ventilation")) return CERTIFICATION_LOGOS.ventilation_plus;
  if (name.includes("recharge")) return CERTIFICATION_LOGOS.recharge_elec_plus;
  if (
    name.includes("chauffage +") ||
    name.includes("chauffage+") ||
    name.includes("chaudiere a condensation") ||
    name.includes("chaudieres a condensation")
  ) {
    return CERTIFICATION_LOGOS.chauffage_plus;
  }

  if (org.includes("qualibat")) return CERTIFICATION_LOGOS.qualibat;
  if (org.includes("qualifelec")) return CERTIFICATION_LOGOS.qualifelec;
  if (org.includes("certibat")) return CERTIFICATION_LOGOS.certibat;
  if (org.includes("qualitenr") || org.includes("qualit enr")) return CERTIFICATION_LOGOS.qualitenr;

  return CERTIFICATION_LOGOS[org] ?? "";
}

export type RgeCertification = {
  certification_name: string;
  organisme: string;
  qualification_name: string;
  qualification_code: string;
  domaine: string;
  meta_domaine: string;
  date_debut: string;
  date_fin: string;
  url_qualification: string;
  logo_url: string;
  is_active: boolean;
  company_name: string;
  address: string;
  postal_code: string;
  city: string;
  phone: string;
  email: string;
  website: string;
};

const siretSchema = z.object({
  siret: z
    .string()
    .min(14, "SIRET invalide")
    .max(14, "SIRET invalide")
    .regex(/^\d{14}$/, "SIRET doit contenir 14 chiffres"),
});

export const fetchRgeBySiret = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => siretSchema.parse(input))
  .handler(async ({ data }) => {
    const url = `${ADEME_API_URL}?siret_eq=${data.siret}&size=100`;

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      console.error(`ADEME API error: ${response.status}`);
      return { certifications: [] as RgeCertification[], total: 0 };
    }

    const json = await response.json();
    const results = json.results ?? [];
    const now = new Date().toISOString().split("T")[0];

    const allCerts: RgeCertification[] = results.map((r: any) => ({
      certification_name: r.nom_certificat ?? "",
      organisme: r.organisme ?? "",
      qualification_name: r.nom_qualification ?? "",
      qualification_code: r.code_qualification ?? "",
      domaine: r.domaine ?? "",
      meta_domaine: r.meta_domaine ?? "",
      date_debut: r.lien_date_debut ?? "",
      date_fin: r.lien_date_fin ?? "",
      url_qualification: r.url_qualification ?? "",
      logo_url: guessLogoUrl(r.organisme ?? "", r.nom_certificat ?? "", r.nom_qualification ?? ""),
      is_active: (r.lien_date_fin ?? "") >= now,
      company_name: r.nom_entreprise ?? "",
      address: r.adresse ?? "",
      postal_code: r.code_postal ?? "",
      city: r.commune ?? "",
      phone: r.telephone ?? "",
      email: r.email ?? "",
      website: r.site_internet ?? "",
    }));

    return { certifications: allCerts, total: allCerts.length };
  });
