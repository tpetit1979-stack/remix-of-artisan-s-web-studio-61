// Strict gate between "what the model said" and "what the client is ever
// allowed to see". No Deno-specific APIs in this file on purpose — it's
// pure data validation, kept portable so its logic can be reasoned about
// (and eventually unit-tested with any JS test runner) independently of
// the edge function runtime.
//
// Three different failure modes, handled differently:
//  - A required top-level field missing/invalid, or a banned phrase in
//    hero_title/hero_subtitle/cta_text/seo_meta_title/seo_meta_description
//    -> the WHOLE response is rejected (ok: false). Nothing partial is
//    ever returned to the caller.
//  - seo_boost_text specifically is a LOCAL failure, never a whole-dossier
//    one: too long, empty, or a banned phrase (including any RGE/
//    certification mention — see SEO_BOOST_TEXT_BANNED_PATTERNS) just
//    drops that one field (empty string + a warning). Hero, SEO meta,
//    service enrichments and suggestions all stay usable — a single bad
//    editorial sentence must not cost the whole dossier, any more than one
//    bad services_enrichment entry should.
//  - A single services_enrichment/suggested_services array entry that's
//    malformed, references an unknown id, or contains a banned phrase ->
//    that ONE entry is dropped (recorded in `warnings`), the rest of the
//    response still succeeds. A single hallucinated id must not sink an
//    otherwise-good dossier.

export interface ValidatedServiceEnrichment {
  id: string;
  description: string;
  seo_title_template: string | null;
  seo_description_template: string | null;
}

export interface ValidatedSuggestedService {
  name: string;
  description: string;
  reason: string | null;
}

export interface ValidatedTenantOutput {
  hero_title: string;
  hero_subtitle: string;
  cta_text: string;
  /** Suggestion only — never applied automatically by the caller. */
  primary_color: string | null;
  seo_meta_title: string;
  seo_meta_description: string;
  seo_boost_text: string;
  services_enrichment: ValidatedServiceEnrichment[];
  suggested_services: ValidatedSuggestedService[];
}

export type ValidationResult =
  | { ok: true; data: ValidatedTenantOutput; warnings: string[] }
  | { ok: false; reason: string };

// seo_boost_text is deliberately NOT in here — see SEO_BOOST_TEXT_MAX_LENGTH
// and the file header: it fails locally, never the whole response.
const MAX_LENGTHS: Record<string, number> = {
  hero_title: 80,
  hero_subtitle: 200,
  cta_text: 40,
  seo_meta_title: 70,
  seo_meta_description: 170,
};
const SEO_BOOST_TEXT_MAX_LENGTH = 600;

// Best-effort net for the specific unconfirmed-promise phrasings found this
// session — not a semantic guarantee. New patterns should be added here as
// they're found, same as the earlier public-copy lot.
const BANNED_PATTERNS: RegExp[] = [
  /siret/i,
  /garantie\s+(légale|décennale|biennale)/i,
  /travaux?\s+(sont\s+)?garantis?/i,
  /sécurité\s+garantie/i,
  /intervention\s+rapide/i,
  /technicien\s+qualifié\s+et\s+certifié/i,
  /intervient\s+rapidement/i,
];

// Certifications RGE have their own dedicated, always-live display surface
// (CertificationBadges, reading tenant_certifications directly — see
// docs/product/objects/rge.md: "IA | Aucune") — seo_boost_text must never
// restate them, confirmed by the brief or not, since a reformulation here
// could drift from the exact qualification on file. Scoped to this one
// field only (not the global BANNED_PATTERNS above) — a hero_subtitle
// mentioning being "reconnu" isn't the same risk as this field echoing a
// specific RGE qualification.
const SEO_BOOST_TEXT_BANNED_PATTERNS: RegExp[] = [
  /\brge\b/i,
  /certifi/i,
  /qualibois/i,
  /qualipac/i,
  /qualisol/i,
  /qualipv/i,
  /qualifelec/i,
  /qualibat/i,
  /qualit['\s]?enr/i,
  /certibat/i,
];

function isNonEmptyString(v: unknown, maxLen: number): v is string {
  return typeof v === "string" && v.trim().length > 0 && v.length <= maxLen;
}

function findBannedPhrase(text: string, extra: RegExp[] = []): string | null {
  for (const re of [...BANNED_PATTERNS, ...extra]) {
    const m = text.match(re);
    if (m) return m[0];
  }
  return null;
}

export function validateTenantOutput(raw: unknown, knownServiceIds: readonly string[]): ValidationResult {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { ok: false, reason: "réponse IA: pas un objet" };
  }
  const r = raw as Record<string, unknown>;
  const warnings: string[] = [];

  for (const [field, max] of Object.entries(MAX_LENGTHS)) {
    if (!isNonEmptyString(r[field], max)) {
      return { ok: false, reason: `champ "${field}" absent, vide ou trop long (max ${max})` };
    }
  }

  const freeTextFields = [
    "hero_title",
    "hero_subtitle",
    "cta_text",
    "seo_meta_title",
    "seo_meta_description",
  ] as const;
  for (const field of freeTextFields) {
    const banned = findBannedPhrase(String(r[field]));
    if (banned) return { ok: false, reason: `champ "${field}" contient une formulation interdite ("${banned}")` };
  }

  // seo_boost_text: local failure only (see file header). An invalid value
  // becomes an empty string with a warning — the caller (onboarding.tsx)
  // already falls back to the previously-held value via `|| prev.seo_boost_text`
  // when it gets an empty string back, so "field ignored" and "previous
  // value kept" collapse into the same behavior without extra plumbing here.
  let seo_boost_text = "";
  const rawBoostText = r.seo_boost_text;
  if (!isNonEmptyString(rawBoostText, SEO_BOOST_TEXT_MAX_LENGTH)) {
    warnings.push(`seo_boost_text ignoré: absent, vide ou trop long (max ${SEO_BOOST_TEXT_MAX_LENGTH})`);
  } else {
    const banned = findBannedPhrase(rawBoostText, SEO_BOOST_TEXT_BANNED_PATTERNS);
    if (banned) {
      warnings.push(`seo_boost_text ignoré: formulation interdite ("${banned}")`);
    } else {
      seo_boost_text = rawBoostText;
    }
  }

  if (!Array.isArray(r.services_enrichment)) {
    return { ok: false, reason: "services_enrichment absent ou n'est pas un tableau" };
  }
  const knownIds = new Set(knownServiceIds);
  const services_enrichment: ValidatedServiceEnrichment[] = [];
  for (const entry of r.services_enrichment) {
    if (typeof entry !== "object" || entry === null) {
      warnings.push("entrée services_enrichment ignorée: pas un objet");
      continue;
    }
    const e = entry as Record<string, unknown>;
    if (typeof e.id !== "string" || !knownIds.has(e.id)) {
      warnings.push(`entrée services_enrichment ignorée: id inconnu ou absent ("${String(e.id)}")`);
      continue;
    }
    if (!isNonEmptyString(e.description, 400)) {
      warnings.push(`entrée services_enrichment ignorée pour id ${e.id}: description invalide`);
      continue;
    }
    const banned = findBannedPhrase(String(e.description));
    if (banned) {
      warnings.push(`entrée services_enrichment ignorée pour id ${e.id}: formulation interdite ("${banned}")`);
      continue;
    }
    services_enrichment.push({
      id: e.id,
      description: e.description,
      seo_title_template: typeof e.seo_title_template === "string" && e.seo_title_template.trim() ? e.seo_title_template : null,
      seo_description_template:
        typeof e.seo_description_template === "string" && e.seo_description_template.trim() ? e.seo_description_template : null,
    });
  }

  if (!Array.isArray(r.suggested_services)) {
    return { ok: false, reason: "suggested_services absent ou n'est pas un tableau" };
  }
  const suggested_services: ValidatedSuggestedService[] = [];
  for (const entry of r.suggested_services) {
    if (typeof entry !== "object" || entry === null) {
      warnings.push("entrée suggested_services ignorée: pas un objet");
      continue;
    }
    const e = entry as Record<string, unknown>;
    // A suggestion must never carry a structuring field — if the model
    // tries to sneak an id/slug/trade_service_template_id in here, drop it
    // rather than let a caller mistake it for a catalogue entry.
    if ("id" in e || "slug" in e || "trade_service_template_id" in e) {
      warnings.push(`entrée suggested_services ignorée: champ structurant interdit présent ("${String(e.name ?? "?")}")`);
      continue;
    }
    if (!isNonEmptyString(e.name, 100) || !isNonEmptyString(e.description, 400)) {
      warnings.push("entrée suggested_services ignorée: name/description invalides");
      continue;
    }
    const banned = findBannedPhrase(`${e.name} ${e.description}`);
    if (banned) {
      warnings.push(`entrée suggested_services ignorée: formulation interdite ("${banned}")`);
      continue;
    }
    suggested_services.push({
      name: e.name,
      description: e.description,
      reason: typeof e.reason === "string" && e.reason.trim() ? e.reason : null,
    });
  }

  const primary_color =
    typeof r.primary_color === "string" && /^#[0-9a-fA-F]{6}$/.test(r.primary_color) ? r.primary_color : null;

  return {
    ok: true,
    warnings,
    data: {
      hero_title: r.hero_title as string,
      hero_subtitle: r.hero_subtitle as string,
      cta_text: r.cta_text as string,
      primary_color,
      seo_meta_title: r.seo_meta_title as string,
      seo_meta_description: r.seo_meta_description as string,
      seo_boost_text,
      services_enrichment,
      suggested_services,
    },
  };
}
