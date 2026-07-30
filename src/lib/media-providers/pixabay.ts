/**
 * Client-side entry points for the Pixabay provider. Both functions only
 * talk to the `media-import` Edge Function and to `trade_media_library` —
 * never to Pixabay directly (the API key stays server-side).
 *
 * `importPixabayResult` performs the same governed insert as the manual
 * upload path in super-admin.media-library.tsx (uploadMutation): pending by
 * default, source_type fixed to `licensed_stock`, full provenance kept in
 * `metadata`. This is P0.2A infrastructure — no UI wires into it yet.
 */
import { supabase } from "@/integrations/supabase/client";
import type { TradeMediaType } from "@/lib/trade-media";
import { invokeMediaImport, MediaSearchResult, SearchOutcome } from "./types";

// mapping_version tracks OUR mapping code (this file) — bump it if the
// metadata shape below changes. provider_api_version tracks the external
// Pixabay API surface we integrated against — both are static today but
// track genuinely different things over time.
const METADATA_MAPPING_VERSION = 1;
const METADATA_PROVIDER_API_VERSION = "v1";

export function searchPixabay(query: string, page = 1, perPage = 24): Promise<SearchOutcome> {
  return invokeMediaImport<SearchOutcome>({ action: "search", provider: "pixabay", query, page, perPage });
}

/** Checks which of the given Pixabay providerIds are already present in the
 *  library, so the picker can offer "Ouvrir" instead of a duplicate import. */
export async function findExistingPixabayImports(
  providerIds: string[],
): Promise<Map<string, string>> {
  if (providerIds.length === 0) return new Map();
  const { data, error } = await supabase
    .from("trade_media_library")
    .select("id, metadata")
    .eq("metadata->>provider", "pixabay")
    .in("metadata->>provider_id", providerIds);
  if (error) throw error;
  const found = new Map<string, string>();
  for (const row of data ?? []) {
    const providerId = (row.metadata as Record<string, unknown> | null)?.provider_id;
    if (typeof providerId === "string") found.set(providerId, row.id);
  }
  return found;
}

export async function importPixabayResult(opts: {
  result: MediaSearchResult;
  searchQuery: string;
  tradeTemplateId: string;
  tradeSlug: string;
  mediaType: TradeMediaType;
  tradeServiceTemplateId: string | null;
}): Promise<string> {
  const { result, searchQuery, tradeTemplateId, tradeSlug, mediaType, tradeServiceTemplateId } = opts;

  const { path } = await invokeMediaImport<{ path: string }>({
    action: "import",
    provider: "pixabay",
    providerId: result.providerId,
    scope: tradeSlug,
    kind: mediaType,
  });

  const { data: row, error: insertError } = await supabase
    .from("trade_media_library")
    .insert({
      trade_template_id: tradeTemplateId,
      trade_service_template_id: tradeServiceTemplateId,
      media_type: mediaType,
      image_path: path,
      source_type: "licensed_stock",
      source_provider: "Pixabay",
      source_reference: result.sourceUrl,
      author_credit: result.authorCredit,
      license_code: "pixabay-content-license",
      metadata: {
        provider: "pixabay",
        provider_api_version: METADATA_PROVIDER_API_VERSION,
        mapping_version: METADATA_MAPPING_VERSION,
        provider_id: result.providerId,
        provider_url: result.sourceUrl,
        photographer: result.authorCredit,
        imported_at: new Date().toISOString(),
        search_query: searchQuery,
        license: result.license,
        license_url: result.licenseUrl,
      },
      // review_status intentionally omitted — same rule as manual upload:
      // the DB default 'pending' is the only source of truth.
    })
    .select("id")
    .single();
  if (insertError) throw insertError;
  return row.id;
}
