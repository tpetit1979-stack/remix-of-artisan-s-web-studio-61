// Run with `deno test supabase/functions/generate-tenant/`. Uses the local
// ../testing/assert.ts instead of std/jsr — both deno.land and jsr.io were
// unreachable through this project's outbound network policy when this was
// written, so a zero-dependency alternative was used instead of leaving the
// tests unexecuted.

import { assert, assertEquals } from "../testing/assert.ts";
import { validateTenantOutput } from "./tenant-output.ts";

const KNOWN_IDS = ["svc-1", "svc-2"];

function validOutput() {
  return {
    hero_title: "Chauffagiste à Montpellier",
    hero_subtitle: "Installation et entretien de systèmes de chauffage",
    cta_text: "Demander un devis",
    primary_color: "#2563EB",
    seo_meta_title: "Chauffagiste Montpellier",
    seo_meta_description: "Expert chauffage à Montpellier, devis gratuit",
    seo_boost_text: "Spécialiste poêles à granulés depuis 10 ans",
    services_enrichment: [
      { id: "svc-1", description: "Installation de poêles à granulés", seo_title_template: "Installation {city}", seo_description_template: null },
    ],
    suggested_services: [{ name: "Ramonage", description: "Ramonage annuel de conduits", reason: "Complémentaire au chauffage bois" }],
  };
}

Deno.test("validateTenantOutput: accepts a well-formed response", () => {
  const result = validateTenantOutput(validOutput(), KNOWN_IDS);
  assert(result.ok);
  if (result.ok) {
    assertEquals(result.data.hero_title, "Chauffagiste à Montpellier");
    assertEquals(result.data.services_enrichment.length, 1);
    assertEquals(result.data.suggested_services.length, 1);
    assertEquals(result.warnings.length, 0);
  }
});

Deno.test("validateTenantOutput: rejects the whole response on a missing top-level field", () => {
  const { hero_title, ...rest } = validOutput();
  const result = validateTenantOutput(rest, KNOWN_IDS);
  assert(!result.ok);
});

Deno.test("validateTenantOutput: rejects the whole response on an empty required string", () => {
  const output = { ...validOutput(), hero_title: "   " };
  const result = validateTenantOutput(output, KNOWN_IDS);
  assert(!result.ok);
});

Deno.test("validateTenantOutput: rejects the whole response on a too-long field", () => {
  const output = { ...validOutput(), cta_text: "x".repeat(41) };
  const result = validateTenantOutput(output, KNOWN_IDS);
  assert(!result.ok);
});

Deno.test("validateTenantOutput: rejects the whole response on a top-level banned phrase (SIRET in hero_subtitle)", () => {
  const output = { ...validOutput(), hero_subtitle: "SIRET 123 456 789 00012" };
  const result = validateTenantOutput(output, KNOWN_IDS);
  assert(!result.ok);
});

Deno.test("validateTenantOutput: rejects the whole response on an unconfirmed-promise phrase", () => {
  const output = { ...validOutput(), hero_subtitle: "Travaux garantis et intervention rapide" };
  const result = validateTenantOutput(output, KNOWN_IDS);
  assert(!result.ok);
});

// The banned-phrase list is exact-phrase regex matching (see the file
// header comment: "best-effort... not a semantic guarantee"), not semantic
// analysis. These three cases confirm the concrete failure mode: it does
// NOT false-positive on a negated or neutral sentence that happens to share
// a word with a banned phrase — but that also means a differently-worded
// promise (not on the list) would slip through uncaught. Both properties
// matter and are asserted explicitly here rather than left implicit.
Deno.test("validateTenantOutput: does NOT reject a negated promise ('ne proposons pas d'intervention d'urgence')", () => {
  const output = { ...validOutput(), hero_subtitle: "Nous ne proposons pas d'intervention d'urgence" };
  const result = validateTenantOutput(output, KNOWN_IDS);
  assert(result.ok, "a negated sentence must not be treated as the promise it negates");
});

Deno.test("validateTenantOutput: does NOT reject a neutral procedural sentence about devis conditions", () => {
  const output = { ...validOutput(), hero_subtitle: "Les conditions du devis sont précisées avant intervention" };
  const result = validateTenantOutput(output, KNOWN_IDS);
  assert(result.ok);
});

Deno.test("validateTenantOutput: does NOT reject an explicit absence-of-warranty statement", () => {
  const output = { ...validOutput(), hero_subtitle: "Aucune garantie supplémentaire n'est annoncée" };
  const result = validateTenantOutput(output, KNOWN_IDS);
  assert(result.ok);
});

// RGE certifications are code-owned (buildVerifiedRgeText in lib/seo.ts),
// never AI-owned — see docs/product/objects/rge.md: "IA | Aucune". A
// mention in seo_boost_text is a LOCAL failure (that field only), not a
// whole-dossier rejection: one bad editorial sentence must not cost the
// hero, SEO meta, service enrichments or suggestions, exactly like one bad
// services_enrichment entry doesn't.
Deno.test("validateTenantOutput: seo_boost_text mentioning RGE is dropped locally, whole response still succeeds", () => {
  const output = { ...validOutput(), seo_boost_text: "Entreprise certifiée RGE depuis 2015" };
  const result = validateTenantOutput(output, KNOWN_IDS);
  assert(result.ok, "an invalid seo_boost_text must not sink the rest of the dossier");
  if (result.ok) {
    assertEquals(result.data.seo_boost_text, "");
    assertEquals(result.warnings.length, 1);
    // everything else from validOutput() survives untouched
    assertEquals(result.data.hero_title, "Chauffagiste à Montpellier");
    assertEquals(result.data.services_enrichment.length, 1);
    assertEquals(result.data.suggested_services.length, 1);
  }
});

Deno.test("validateTenantOutput: seo_boost_text mentioning a specific RGE qualification family is dropped locally", () => {
  const output = { ...validOutput(), seo_boost_text: "Spécialiste Qualibois pour vos projets bois-énergie" };
  const result = validateTenantOutput(output, KNOWN_IDS);
  assert(result.ok);
  if (result.ok) assertEquals(result.data.seo_boost_text, "");
});

Deno.test("validateTenantOutput: the RGE/certification guard is scoped to seo_boost_text only, not global", () => {
  const output = { ...validOutput(), hero_subtitle: "Une équipe reconnue et certifiée par ses clients" };
  const result = validateTenantOutput(output, KNOWN_IDS);
  assert(result.ok, "the seo_boost_text-only certification guard must not reject other fields");
  if (result.ok) assertEquals(result.data.hero_subtitle, "Une équipe reconnue et certifiée par ses clients");
});

Deno.test("validateTenantOutput: seo_boost_text too long is dropped locally, not a whole-dossier rejection", () => {
  const output = { ...validOutput(), seo_boost_text: "x".repeat(601) };
  const result = validateTenantOutput(output, KNOWN_IDS);
  assert(result.ok);
  if (result.ok) {
    assertEquals(result.data.seo_boost_text, "");
    assertEquals(result.warnings.length, 1);
  }
});

Deno.test("validateTenantOutput: seo_boost_text missing entirely is dropped locally, not a whole-dossier rejection", () => {
  const { seo_boost_text, ...rest } = validOutput();
  const result = validateTenantOutput(rest, KNOWN_IDS);
  assert(result.ok);
  if (result.ok) assertEquals(result.data.seo_boost_text, "");
});

Deno.test("validateTenantOutput: never rejects the whole response for one bad services_enrichment entry", () => {
  const output = {
    ...validOutput(),
    services_enrichment: [
      { id: "svc-1", description: "Installation de poêles à granulés" },
      { id: "unknown-id", description: "Un service qui n'existe pas dans le catalogue" },
    ],
  };
  const result = validateTenantOutput(output, KNOWN_IDS);
  assert(result.ok);
  if (result.ok) {
    assertEquals(result.data.services_enrichment.length, 1);
    assertEquals(result.data.services_enrichment[0].id, "svc-1");
    assert(result.warnings.length === 1);
  }
});

Deno.test("validateTenantOutput: exact id preservation — services_enrichment id is never rewritten", () => {
  const result = validateTenantOutput(validOutput(), KNOWN_IDS);
  assert(result.ok);
  if (result.ok) {
    assertEquals(result.data.services_enrichment[0].id, "svc-1");
  }
});

Deno.test("validateTenantOutput: suggested_services entry carrying a structuring field (id) is dropped, not the whole response", () => {
  const output = {
    ...validOutput(),
    suggested_services: [
      { name: "Ramonage", description: "Ramonage annuel de conduits", id: "sneaky-id" },
    ],
  };
  const result = validateTenantOutput(output, KNOWN_IDS);
  assert(result.ok);
  if (result.ok) {
    assertEquals(result.data.suggested_services.length, 0);
    assertEquals(result.warnings.length, 1);
  }
});

Deno.test("validateTenantOutput: suggested_services entry carrying trade_service_template_id is dropped", () => {
  const output = {
    ...validOutput(),
    suggested_services: [
      { name: "Ramonage", description: "Ramonage annuel", trade_service_template_id: "svc-1" },
    ],
  };
  const result = validateTenantOutput(output, KNOWN_IDS);
  assert(result.ok);
  if (result.ok) assertEquals(result.data.suggested_services.length, 0);
});

Deno.test("validateTenantOutput: services and suggested_services never mix — separate arrays stay separate", () => {
  const result = validateTenantOutput(validOutput(), KNOWN_IDS);
  assert(result.ok);
  if (result.ok) {
    const enrichmentIds = result.data.services_enrichment.map((e) => e.id);
    const suggestedNames = result.data.suggested_services.map((s) => s.name);
    assert(!enrichmentIds.includes("Ramonage"));
    assert(!suggestedNames.includes("svc-1"));
  }
});

Deno.test("validateTenantOutput: invalid primary_color format falls back to null, doesn't reject", () => {
  const output = { ...validOutput(), primary_color: "not-a-color" };
  const result = validateTenantOutput(output, KNOWN_IDS);
  assert(result.ok);
  if (result.ok) assertEquals(result.data.primary_color, null);
});

Deno.test("validateTenantOutput: rejects a non-object payload outright", () => {
  const result = validateTenantOutput("just a string", KNOWN_IDS);
  assert(!result.ok);
});

Deno.test("validateTenantOutput: missing services_enrichment array rejects the whole response", () => {
  const { services_enrichment, ...rest } = validOutput();
  const result = validateTenantOutput(rest, KNOWN_IDS);
  assert(!result.ok);
});

Deno.test("validateTenantOutput: missing suggested_services array rejects the whole response", () => {
  const { suggested_services, ...rest } = validOutput();
  const result = validateTenantOutput(rest, KNOWN_IDS);
  assert(!result.ok);
});
