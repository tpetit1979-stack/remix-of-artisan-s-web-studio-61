// Single source of truth for what the AI is allowed to produce. Two
// non-negotiable rules, both enforced here AND re-checked in
// validators/tenant-output.ts (defense in depth — a prompt is a request,
// not a guarantee):
//
//  1. Factual data (phone, email, main city, coverage zones, brands,
//     certifications, free quote, emergency availability, delays,
//     warranties) is never in the output schema at all. It comes from the
//     brief text the human already typed, or stays empty — the model is
//     never asked to invent or restate it, so it cannot silently overwrite
//     a manually-entered value.
//  2. Selected services (already chosen deterministically from
//     trade_service_templates before this call ever runs) keep their id,
//     slug and canonical name locked. The model only enriches
//     description/SEO text for those exact ids, via services_enrichment.
//     Anything it thinks is missing from the catalogue goes into
//     suggested_services — never merged automatically, always a suggestion
//     a human confirms.

export interface SelectedServiceContext {
  id: string;
  name: string;
}

export const AI_FETCH_TIMEOUT_MS = 15000;

export function buildSystemPrompt(): string {
  return `Tu es un assistant qui rédige des textes éditoriaux et SEO pour des sites web d'artisans du bâtiment en France.

Règles impératives, sans exception :
- Ne mentionne jamais le SIRET dans un texte que tu rédiges — il apparaît uniquement dans les mentions légales du site, gérées séparément.
- N'affirme jamais une promesse commerciale non confirmée explicitement par le brief fourni : rapidité d'intervention, garantie légale (décennale, biennale ou autre), certification, qualification, gratuité, disponibilité d'urgence, délai. Si le brief ne le confirme pas, n'en parle simplement pas — reste factuel et neutre sur ces points.
- Ne mentionne JAMAIS de certification RGE (ni le sigle RGE, ni un nom de qualification comme Qualibois/Qualipac/Qualisol/Qualifelec/Qualibat) dans "seo_boost_text", même si le brief la confirme : les certifications s'affichent déjà ailleurs sur le site, dans leur propre section fiable — les répéter ici, reformulées par toi, risquerait d'en déformer le libellé exact.
- Pour chaque service listé dans "Services déjà sélectionnés" ci-dessous, tu ne renvoies JAMAIS de nom différent, d'identifiant différent, ni de nouveau service à la place : tu rédiges uniquement sa description et ses textes SEO, à l'identique de l'id fourni.
- Si tu identifies une prestation que ce métier propose probablement mais qui n'est dans aucun service déjà sélectionné, propose-la UNIQUEMENT dans "suggested_services" — jamais mélangée aux services déjà sélectionnés, jamais avec un id ou un slug (ce sont des suggestions libres, pas des entrées de catalogue).
- Vocabulaire cohérent : si le métier ou le brief emploie un terme (ex. "granulés" plutôt que "pellets"), garde ce même terme partout dans ta réponse — jamais deux synonymes pour la même chose.
- Casse : phrases courtes, minuscules sauf première lettre et sigles reconnus (PAC, VMC, RGE, ECS).

Tu DOIS répondre uniquement avec un objet JSON conforme au schéma demandé. Pas de texte en dehors.`;
}

export function buildUserPrompt(brief: string, selectedServices: SelectedServiceContext[]): string {
  const servicesList = selectedServices.length > 0
    ? selectedServices.map((s) => `- id=${s.id} : ${s.name}`).join("\n")
    : "(aucun service présélectionné)";
  return `Brief client :
${brief}

Services déjà sélectionnés pour ce tenant (rédige uniquement leur description/SEO, ne change jamais leur nom ni leur id) :
${servicesList}

Génère la configuration éditoriale demandée.`;
}

/** JSON Schema sent to the provider. Deliberately excludes phone, email,
 * city, cities, company_name — see file header. */
export const TENANT_GENERATION_SCHEMA = {
  type: "object",
  properties: {
    hero_title: {
      type: "string",
      description: "Titre hero accrocheur (max 60 caractères), orienté conversion, sans promesse non confirmée",
    },
    hero_subtitle: {
      type: "string",
      description: "Sous-titre hero descriptif (max 160 caractères) avec mots-clés SEO",
    },
    cta_text: {
      type: "string",
      description: "Texte neutre du bouton d'appel à l'action (ex: Demander un devis)",
    },
    primary_color: {
      type: "string",
      description: "Suggestion de couleur primaire hex adaptée au métier — restera une suggestion à valider, jamais appliquée automatiquement",
    },
    seo_meta_title: {
      type: "string",
      description: "Meta title SEO (max 60 caractères)",
    },
    seo_meta_description: {
      type: "string",
      description: "Meta description SEO (max 160 caractères)",
    },
    seo_boost_text: {
      type: "string",
      description: "Texte SEO différenciant mentionnant marques et spécialités confirmées par le brief uniquement. Jamais de SIRET, jamais de certification (même confirmée — elle a sa propre section sur le site), jamais de garantie non confirmée par le brief.",
    },
    services_enrichment: {
      type: "array",
      description: "Un élément par service déjà sélectionné, jamais plus, jamais moins, même id.",
      items: {
        type: "object",
        properties: {
          id: { type: "string", description: "Id repris exactement de la liste fournie" },
          description: { type: "string", description: "Description courte du service (1-2 phrases)" },
          seo_title_template: { type: "string" },
          seo_description_template: { type: "string" },
        },
        required: ["id", "description"],
      },
    },
    suggested_services: {
      type: "array",
      description: "Prestations hors catalogue, jamais fusionnées automatiquement — structure volontairement sans id/slug.",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          reason: { type: "string", description: "Pourquoi cette prestation semble pertinente pour ce métier" },
        },
        required: ["name", "description"],
      },
    },
  },
  required: [
    "hero_title",
    "hero_subtitle",
    "cta_text",
    "seo_meta_title",
    "seo_meta_description",
    "seo_boost_text",
    "services_enrichment",
    "suggested_services",
  ],
} as const;
