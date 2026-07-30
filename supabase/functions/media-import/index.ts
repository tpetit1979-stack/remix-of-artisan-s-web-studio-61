// Single entry point for every media search/import provider (Pixabay today,
// Gemini/Unsplash/Pexels later). This file is provider-agnostic: it only
// knows the SearchProvider interface (./providers/types.ts) and the
// registry (./providers/registry.ts) — never a provider's raw API shape.
//
// Responsibilities kept here on purpose:
//  - normalise every response to { success, request_id, data } |
//    { success:false, request_id, error } with real HTTP status codes (401
//    is handled upstream by the Supabase gateway itself, since this
//    function has verify_jwt = true — an invalid JWT never reaches this code)
//  - own the Storage upload (needs the service role key, so it can't live
//    client-side) using the same path convention as buildMediaPath()
//    (src/lib/media-upload.ts): `${scope}/${kind}-${timestamp}.${ext}`
//  - enforce the shared download size cap, content-type allowlist and a
//    magic-byte signature check a second time here (defense in depth:
//    providers/pixabay.ts already rejects an oversized Content-Length
//    before reading the body, but any future provider that forgets to
//    self-enforce this is still caught here)
//  - never write to trade_media_library: the caller (client, authenticated
//    as super admin) does that insert, exactly like the manual-upload path
//    in super-admin.media-library.tsx — this function never bypasses that
//    governance with the service role key.
//
// Known MVP debt (accepted, not fixed here — would require making
// upload+insert atomic inside this function, i.e. a real architecture
// change): between a successful Storage upload and the client-side INSERT
// into trade_media_library, an object can be left orphaned in Storage if
// the browser is closed or loses connection before the insert runs. A
// future V2 could make this atomic by having the function itself perform
// the insert (with the caller's JWT, not the service role, to keep RLS/
// governance intact) — out of scope for P0.2A.
import { getProvider } from "./providers/registry.ts";
import {
  ALLOWED_MEDIA_CONTENT_TYPES,
  MAX_DOWNLOAD_BYTES,
  normalizeContentType,
  ProviderError,
  sniffImageContentType,
} from "./providers/types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TRADE_MEDIA_BUCKET = "trade-media";

function ok(requestId: string, data: unknown) {
  return new Response(JSON.stringify({ success: true, request_id: requestId, data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function statusForCode(code: string): number {
  switch (code) {
    case "RATE_LIMIT":
      return 429;
    case "NOT_FOUND":
      return 404;
    case "INVALID_JSON":
    case "INVALID_ACTION":
    case "EMPTY_QUERY":
    case "MISSING_PROVIDER_ID":
    case "MISSING_SCOPE":
    case "INVALID_SCOPE":
    case "UNKNOWN_PROVIDER":
      return 400;
    case "PROVIDER_ERROR":
    case "DOWNLOAD_FAILED":
    case "TIMEOUT":
    case "FILE_TOO_LARGE":
    case "INVALID_CONTENT_TYPE":
    case "INVALID_IMAGE_SIGNATURE":
      return 502;
    default:
      // PROVIDER_NOT_CONFIGURED, STORAGE_NOT_CONFIGURED, STORAGE_UPLOAD_FAILED,
      // SEARCH_FAILED, IMPORT_FAILED and any unmapped code are our own faults.
      return 500;
  }
}

function fail(requestId: string, code: string, message: string) {
  return new Response(JSON.stringify({ success: false, request_id: requestId, error: { code, message } }), {
    status: statusForCode(code),
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** Every call includes at minimum request_id/provider/action/duration_ms/success
 *  so the full lifecycle of a single client request can be correlated in the logs —
 *  including early validation failures, which use "unknown" for whichever of
 *  provider/action was never resolved. */
function logEvent(requestId: string, action: string, fields: Record<string, unknown>) {
  console.log(JSON.stringify({ event: "media_import", request_id: requestId, action, ...fields }));
}

function safeExt(ext: string): string {
  const cleaned = ext.toLowerCase().replace(/[^a-z0-9]/g, "");
  return cleaned || "jpg";
}

// scope/kind end up directly in the Storage object path — reject anything
// that isn't a plain slug so a crafted request can't traverse the bucket
// (e.g. "../../other-trade").
const SLUG_RE = /^[a-z0-9][a-z0-9_-]*$/;
function isSafeSlug(value: string): boolean {
  return SLUG_RE.test(value);
}

/** Rejects with a normalised log + response in one call, for the early
 *  validation failures that happen before we're inside a search/import try block. */
function rejectEarly(requestId: string, action: string, providerLabel: string, code: string, message: string) {
  logEvent(requestId, action, { provider: providerLabel, duration_ms: 0, success: false, error_code: code });
  return fail(requestId, code, message);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const requestId = crypto.randomUUID();

  // deno-lint-ignore no-explicit-any
  let body: any;
  try {
    body = await req.json();
  } catch {
    return rejectEarly(requestId, "unknown", "unknown", "INVALID_JSON", "Corps de requête invalide");
  }

  const { action, provider: providerId } = body ?? {};
  const actionLabel = typeof action === "string" ? action : "unknown";
  const providerLabel = typeof providerId === "string" ? providerId : "unknown";

  if (action !== "search" && action !== "import") {
    return rejectEarly(requestId, actionLabel, providerLabel, "INVALID_ACTION", `Action inconnue: ${action}`);
  }

  let provider;
  try {
    provider = getProvider(providerId);
  } catch (e) {
    const code = e instanceof ProviderError ? e.code : "UNKNOWN_PROVIDER";
    return rejectEarly(requestId, actionLabel, providerLabel, code, e instanceof Error ? e.message : "Provider inconnu");
  }

  if (action === "search") {
    const query = typeof body.query === "string" ? body.query.trim() : "";
    if (!query) return rejectEarly(requestId, "search", providerId, "EMPTY_QUERY", "La requête de recherche est vide");

    const page = Number.isFinite(body.page) ? Number(body.page) : 1;
    const perPage = Number.isFinite(body.perPage) ? Number(body.perPage) : 24;
    const startedAt = Date.now();

    try {
      const outcome = await provider.search(query, page, perPage);
      logEvent(requestId, "search", {
        provider: providerId,
        query,
        result_count: outcome.results.length,
        duration_ms: Date.now() - startedAt,
        success: true,
      });
      return ok(requestId, outcome);
    } catch (e) {
      const code = e instanceof ProviderError ? e.code : "SEARCH_FAILED";
      const message = e instanceof Error ? e.message : "Erreur de recherche";
      console.error("media-import search error:", requestId, e);
      logEvent(requestId, "search", {
        provider: providerId,
        query,
        duration_ms: Date.now() - startedAt,
        success: false,
        error_code: code,
      });
      return fail(requestId, code, message);
    }
  }

  // action === "import"
  const assetId = body.providerId;
  const scope = typeof body.scope === "string" ? body.scope.trim() : "";
  const kind = typeof body.kind === "string" ? body.kind.trim() : "";
  if (!assetId) return rejectEarly(requestId, "import", providerId, "MISSING_PROVIDER_ID", "providerId requis");
  if (!scope || !kind) return rejectEarly(requestId, "import", providerId, "MISSING_SCOPE", "scope et kind requis");
  if (!isSafeSlug(scope) || !isSafeSlug(kind)) {
    return rejectEarly(
      requestId,
      "import",
      providerId,
      "INVALID_SCOPE",
      "scope et kind doivent être des identifiants simples (slug)",
    );
  }

  const startedAt = Date.now();
  try {
    const media = await provider.download(String(assetId));

    const contentType = normalizeContentType(media.contentType);
    if (!ALLOWED_MEDIA_CONTENT_TYPES.has(contentType)) {
      throw new ProviderError(
        "INVALID_CONTENT_TYPE",
        `Type de fichier non autorisé: ${media.contentType} (attendu: ${[...ALLOWED_MEDIA_CONTENT_TYPES].join(", ")})`,
      );
    }
    if (media.bytes.length > MAX_DOWNLOAD_BYTES) {
      throw new ProviderError(
        "FILE_TOO_LARGE",
        `Image trop volumineuse (${media.bytes.length} octets, max ${MAX_DOWNLOAD_BYTES})`,
      );
    }
    // The declared Content-Type can be wrong (mislabeled response, proxy
    // rewriting headers, an HTML error page served with an image header) —
    // check the actual bytes match a known image signature before it ever
    // reaches Storage.
    const sniffed = sniffImageContentType(media.bytes);
    if (!sniffed || sniffed !== contentType) {
      throw new ProviderError(
        "INVALID_IMAGE_SIGNATURE",
        `Le contenu téléchargé ne correspond pas au type annoncé (${media.contentType}, signature détectée: ${sniffed ?? "aucune"})`,
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      throw new ProviderError("STORAGE_NOT_CONFIGURED", "Supabase service credentials missing");
    }

    const path = `${scope}/${kind}-${Date.now()}.${safeExt(media.ext)}`;
    // Storage upload is never retried and never given an abort timeout here:
    // a partial/duplicate write to our own bucket is a different risk profile
    // than a stalled call to an external API, and retrying it blindly could
    // race the "never reuse a path" convention used across the app.
    const uploadResp = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${TRADE_MEDIA_BUCKET}/${path}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          "Content-Type": media.contentType,
          "x-upsert": "false",
        },
        // .slice() forces a concrete ArrayBuffer-backed copy: the lib types
        // Uint8Array.buffer as ArrayBufferLike (which includes SharedArrayBuffer),
        // so the original view doesn't satisfy BodyInit even though it's a
        // valid fetch body at runtime.
        body: media.bytes.slice(),
      },
    );
    if (!uploadResp.ok) {
      const text = await uploadResp.text();
      throw new ProviderError("STORAGE_UPLOAD_FAILED", `Échec de l'upload Storage (${uploadResp.status}): ${text}`);
    }

    logEvent(requestId, "import", {
      provider: providerId,
      provider_id: assetId,
      trade_scope: scope,
      media_type: kind,
      duration_ms: Date.now() - startedAt,
      success: true,
    });

    return ok(requestId, {
      path,
      width: media.width,
      height: media.height,
      contentType: media.contentType,
    });
  } catch (e) {
    const code = e instanceof ProviderError ? e.code : "IMPORT_FAILED";
    const message = e instanceof Error ? e.message : "Erreur d'import";
    console.error("media-import import error:", requestId, e);
    logEvent(requestId, "import", {
      provider: providerId,
      provider_id: assetId,
      trade_scope: scope,
      media_type: kind,
      duration_ms: Date.now() - startedAt,
      success: false,
      error_code: code,
    });
    return fail(requestId, code, message);
  }
});
