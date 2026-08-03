// Google Places (New) integration — the optional "Google reviews" social
// proof feature. Super-admin only, entirely manual. Four actions: search,
// select, refresh, unlink.
//
// Governance (do not weaken):
//  - Google is optional evidence, never a prerequisite. No action here is
//    ever triggered automatically from onboarding, SIRET import, RGE
//    import, or tenant creation — every call originates from an explicit
//    super-admin click (LOT 6C, super-admin UI).
//  - unlink is centralised here rather than a direct client-side UPDATE for
//    governance consistency and a future audit trail — NOT because it's
//    the only line of defense: the enforce_tenant_platform_fields_locked
//    Postgres trigger (see supabase/migrations/20260727102629_*) already
//    blocks any non-super_admin write to `tenants` regardless of which
//    client performs it.
//  - A place with no reviews yet is a normal, successful `select`/`refresh`
//    — Google omits rating/userRatingCount from the response in that case,
//    which is null/0, not an error. A field that IS present but malformed
//    or out of range (e.g. rating: 17) is a different case entirely — that
//    is GOOGLE_INVALID_RESPONSE, nothing is written, and on refresh the
//    previously stored values are left untouched. Absence and invalidity
//    must never be conflated: silently treating a malformed response as
//    "no reviews" could erase a real, valid rating on a later refresh.
//
// Response envelope (same convention as media-import/index.ts):
//   success -> { success: true, request_id, data }
//   failure -> { success: false, request_id, error: { code, message } }
//
// Every response, success or failure, goes through respondOk/respondError
// below, which always logs request_id, action, duration_ms and success —
// so no code path (including early auth/validation failures) can silently
// skip structured logging. Logs never include the JWT, the API key, the
// full search query/address, or Google's raw response body — only
// google_http_status and our own normalised error_code.
//
// Verification status: `deno check`/`deno lint` pass (via a temporary
// npm-installed binary, not the Supabase CLI — still no Supabase CLI in
// this environment). Deployed and invoked (search's tenant read was
// exercised live and its DATABASE_ERROR — a stale `postal_code` column
// reference — fixed and redeployed). SUPABASE_ANON_KEY was confirmed to
// be the correct injected env var name by that same live invocation.
// NOT yet verified: a full search → select → refresh → unlink pass
// through the Google Places API from the super-admin UI.

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLACES_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
const PLACES_DETAILS_URL = "https://places.googleapis.com/v1/places";
const SEARCH_FIELD_MASK = "places.id,places.displayName,places.formattedAddress";
const DETAILS_FIELD_MASK = "rating,userRatingCount";
const MAX_SEARCH_RESULTS = 5;
const MAX_QUERY_LENGTH = 200;
const GOOGLE_FETCH_TIMEOUT_MS = 8000;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ACTIONS = ["search", "select", "refresh", "unlink"] as const;
type Action = (typeof ACTIONS)[number];

function statusForCode(code: string): number {
  switch (code) {
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "INVALID_JSON":
    case "INVALID_ACTION":
    case "INVALID_BODY":
      return 400;
    case "TENANT_NOT_FOUND":
    case "GOOGLE_PLACE_NOT_FOUND":
      return 404;
    case "GOOGLE_PLACE_NOT_LINKED":
      return 409;
    case "GOOGLE_RATE_LIMITED":
      return 429;
    case "GOOGLE_API_ERROR":
    case "GOOGLE_TIMEOUT":
    case "GOOGLE_INVALID_RESPONSE":
      return 502;
    default:
      // DATABASE_ERROR and any unmapped code are our own faults.
      return 500;
  }
}

/** Every response — success or failure — passes through here so structured
 *  logging (request_id, action, duration_ms, success, and whatever extra
 *  fields are available) can never be skipped by an early-exit path. */
function respondOk(
  requestId: string,
  action: string,
  startedAt: number,
  data: unknown,
  extra: Record<string, unknown> = {}
): Response {
  console.log(
    JSON.stringify({
      event: "google_places",
      request_id: requestId,
      action,
      duration_ms: Date.now() - startedAt,
      success: true,
      ...extra,
    })
  );
  return new Response(JSON.stringify({ success: true, request_id: requestId, data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function respondError(
  requestId: string,
  action: string,
  startedAt: number,
  code: string,
  message: string,
  extra: Record<string, unknown> = {}
): Response {
  console.log(
    JSON.stringify({
      event: "google_places",
      request_id: requestId,
      action,
      duration_ms: Date.now() - startedAt,
      success: false,
      error_code: code,
      ...extra,
    })
  );
  return new Response(JSON.stringify({ success: false, request_id: requestId, error: { code, message } }), {
    status: statusForCode(code),
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

class GooglePlacesError extends Error {
  code: string;
  httpStatus?: number;
  constructor(code: string, message: string, httpStatus?: number) {
    super(message);
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

type GoogleMetrics = { rating: number | null; userRatingCount: number; httpStatus: number };

/** Calls Place Details (New) for a single place_id with the minimal field
 *  mask. Distinguishes two genuinely different cases:
 *   - rating/userRatingCount ABSENT from the response -> valid "no reviews
 *     yet" place, returns { rating: null, userRatingCount: 0 }.
 *   - rating/userRatingCount PRESENT but malformed or out of range (not a
 *     number, rating outside [0,5], count not a non-negative integer) ->
 *     GOOGLE_INVALID_RESPONSE. Never silently downgraded to "no reviews",
 *     since that could overwrite a real value with null/0 on a refresh. */
async function fetchGooglePlaceMetrics(placeId: string, apiKey: string): Promise<GoogleMetrics> {
  const url = `${PLACES_DETAILS_URL}/${encodeURIComponent(placeId)}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GOOGLE_FETCH_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": DETAILS_FIELD_MASK,
      },
      signal: controller.signal,
    });
  } catch (e) {
    const timedOut = e instanceof Error && e.name === "AbortError";
    throw new GooglePlacesError(
      timedOut ? "GOOGLE_TIMEOUT" : "GOOGLE_API_ERROR",
      timedOut ? "Google Places n'a pas répondu à temps" : "Google Places est injoignable"
    );
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 404) {
    throw new GooglePlacesError("GOOGLE_PLACE_NOT_FOUND", "Cette fiche Google n'existe plus", response.status);
  }
  if (response.status === 429) {
    throw new GooglePlacesError(
      "GOOGLE_RATE_LIMITED",
      "Quota Google Places atteint, réessayez plus tard",
      response.status
    );
  }
  if (!response.ok) {
    throw new GooglePlacesError(
      "GOOGLE_API_ERROR",
      `Google Places a renvoyé une erreur (${response.status})`,
      response.status
    );
  }

  // deno-lint-ignore no-explicit-any
  const json: any = await response.json();

  const rawRating = json.rating;
  let rating: number | null;
  if (rawRating == null) {
    rating = null; // absent OR explicit null -> genuinely no reviews yet, valid
  } else if (typeof rawRating === "number" && Number.isFinite(rawRating) && rawRating >= 0 && rawRating <= 5) {
    rating = rawRating;
  } else {
    throw new GooglePlacesError(
      "GOOGLE_INVALID_RESPONSE",
      "Réponse Google Places invalide (note hors plage)",
      response.status
    );
  }

  const rawCount = json.userRatingCount;
  let userRatingCount: number;
  if (rawCount == null) {
    userRatingCount = 0; // absent OR explicit null -> genuinely no reviews yet, valid
  } else if (typeof rawCount === "number" && Number.isInteger(rawCount) && rawCount >= 0) {
    userRatingCount = rawCount;
  } else {
    throw new GooglePlacesError(
      "GOOGLE_INVALID_RESPONSE",
      "Réponse Google Places invalide (nombre d'avis invalide)",
      response.status
    );
  }

  return { rating, userRatingCount, httpStatus: response.status };
}

/** Shape of one entry in Text Search (New)'s `places[]`, restricted to the
 *  fields our SEARCH_FIELD_MASK actually requests. */
type RawGooglePlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
};

type TenantSearchFields = {
  id: string;
  company_name: string | null;
  address: string | null;
  city: string | null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const requestId = crypto.randomUUID();
  const startedAt = Date.now();

  // deno-lint-ignore no-explicit-any
  let body: any;
  try {
    body = await req.json();
  } catch {
    return respondError(requestId, "unknown", startedAt, "INVALID_JSON", "Corps de requête invalide");
  }

  const action = typeof body?.action === "string" ? (body.action as Action) : undefined;
  if (!action || !ACTIONS.includes(action)) {
    return respondError(
      requestId,
      "unknown",
      startedAt,
      "INVALID_ACTION",
      `Action inconnue: ${body?.action}`
    );
  }

  const tenantId = typeof body?.tenant_id === "string" ? body.tenant_id : "";
  if (!UUID_RE.test(tenantId)) {
    return respondError(requestId, action, startedAt, "INVALID_BODY", "tenant_id manquant ou invalide");
  }

  // --- Auth: explicit checks, never rely solely on the platform's
  // verify_jwt gate. Nothing below this point calls Google until the
  // caller is confirmed to be a super_admin. ---
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return respondError(requestId, action, startedAt, "UNAUTHORIZED", "Authentification requise", { tenant_id: tenantId });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
  const GOOGLE_PLACES_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return respondError(requestId, action, startedAt, "DATABASE_ERROR", "Configuration serveur invalide", {
      tenant_id: tenantId,
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return respondError(requestId, action, startedAt, "UNAUTHORIZED", "Session invalide ou expirée", {
      tenant_id: tenantId,
    });
  }

  const { data: isSuperAdmin, error: roleError } = await supabase.rpc("is_super_admin");
  if (roleError) {
    return respondError(requestId, action, startedAt, "DATABASE_ERROR", "Vérification du rôle impossible", {
      tenant_id: tenantId,
    });
  }
  if (!isSuperAdmin) {
    return respondError(requestId, action, startedAt, "FORBIDDEN", "Réservé aux super-administrateurs", {
      tenant_id: tenantId,
    });
  }

  // --- unlink: pure DB write, no Google call, no API key required. ---
  if (action === "unlink") {
    const { data, error } = await supabase
      .from("tenants")
      .update({
        google_place_id: null,
        google_rating: null,
        google_review_count: null,
        google_rating_updated_at: null,
      })
      .eq("id", tenantId)
      .select("id")
      .maybeSingle();

    if (error) {
      return respondError(requestId, action, startedAt, "DATABASE_ERROR", "Échec de la dissociation", {
        tenant_id: tenantId,
      });
    }
    if (!data) {
      return respondError(requestId, action, startedAt, "TENANT_NOT_FOUND", "Tenant introuvable", {
        tenant_id: tenantId,
      });
    }
    // Idempotent: calling this on an already-unlinked tenant still succeeds.
    return respondOk(requestId, action, startedAt, { unlinked: true }, { tenant_id: tenantId });
  }

  if (!GOOGLE_PLACES_API_KEY) {
    return respondError(requestId, action, startedAt, "DATABASE_ERROR", "Clé Google Places non configurée", {
      tenant_id: tenantId,
    });
  }

  // --- search: read-only, no DB write. ---
  if (action === "search") {
    const queryOverride = typeof body?.query_override === "string" ? body.query_override.trim() : "";
    if (queryOverride.length > MAX_QUERY_LENGTH) {
      return respondError(requestId, action, startedAt, "INVALID_BODY", "query_override trop long", {
        tenant_id: tenantId,
      });
    }

    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id, company_name, address, city")
      .eq("id", tenantId)
      .maybeSingle<TenantSearchFields>();

    if (tenantError) {
      return respondError(requestId, action, startedAt, "DATABASE_ERROR", "Lecture du tenant impossible", {
        tenant_id: tenantId,
      });
    }
    if (!tenant) {
      return respondError(requestId, action, startedAt, "TENANT_NOT_FOUND", "Tenant introuvable", {
        tenant_id: tenantId,
      });
    }

    const defaultQuery = [tenant.company_name, tenant.address, tenant.city]
      .filter(Boolean)
      .join(" ");
    const textQuery = queryOverride || defaultQuery;
    if (!textQuery) {
      return respondError(
        requestId,
        action,
        startedAt,
        "INVALID_BODY",
        "Aucune donnée exploitable pour construire la recherche",
        { tenant_id: tenantId }
      );
    }

    let response: Response;
    try {
      response = await fetch(PLACES_SEARCH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
          "X-Goog-FieldMask": SEARCH_FIELD_MASK,
        },
        body: JSON.stringify({ textQuery, maxResultCount: MAX_SEARCH_RESULTS }),
      });
    } catch {
      return respondError(requestId, action, startedAt, "GOOGLE_API_ERROR", "Google Places est injoignable", {
        tenant_id: tenantId,
      });
    }

    if (response.status === 429) {
      return respondError(
        requestId,
        action,
        startedAt,
        "GOOGLE_RATE_LIMITED",
        "Quota Google Places atteint, réessayez plus tard",
        { tenant_id: tenantId, google_http_status: response.status }
      );
    }
    if (!response.ok) {
      return respondError(
        requestId,
        action,
        startedAt,
        "GOOGLE_API_ERROR",
        `Google Places a renvoyé une erreur (${response.status})`,
        { tenant_id: tenantId, google_http_status: response.status }
      );
    }

    // deno-lint-ignore no-explicit-any
    const json: any = await response.json();
    const rawPlaces: RawGooglePlace[] = Array.isArray(json.places) ? json.places : [];
    // No results is a normal, successful search — never an error.
    const results = rawPlaces.slice(0, MAX_SEARCH_RESULTS).map((p) => ({
      place_id: typeof p.id === "string" ? p.id : "",
      name: typeof p.displayName?.text === "string" ? p.displayName.text : "",
      address: typeof p.formattedAddress === "string" ? p.formattedAddress : "",
    }));

    return respondOk(requestId, action, startedAt, { results }, {
      tenant_id: tenantId,
      result_count: results.length,
      google_http_status: response.status,
    });
  }

  // --- select / refresh: both resolve a place_id, call Place Details, then
  // do a single atomic UPDATE. Never write google_place_id before Google
  // has confirmed the place — and never touch any column on failure. ---
  let placeId: string;
  if (action === "select") {
    placeId = typeof body?.place_id === "string" ? body.place_id : "";
    if (!placeId) {
      return respondError(requestId, action, startedAt, "INVALID_BODY", "place_id manquant", {
        tenant_id: tenantId,
      });
    }
  } else {
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("google_place_id")
      .eq("id", tenantId)
      .maybeSingle<{ google_place_id: string | null }>();

    if (tenantError) {
      return respondError(requestId, action, startedAt, "DATABASE_ERROR", "Lecture du tenant impossible", {
        tenant_id: tenantId,
      });
    }
    if (!tenant) {
      return respondError(requestId, action, startedAt, "TENANT_NOT_FOUND", "Tenant introuvable", {
        tenant_id: tenantId,
      });
    }
    if (!tenant.google_place_id) {
      return respondError(
        requestId,
        action,
        startedAt,
        "GOOGLE_PLACE_NOT_LINKED",
        "Aucune fiche Google associée à ce tenant",
        { tenant_id: tenantId }
      );
    }
    placeId = tenant.google_place_id;
  }

  let metrics: GoogleMetrics;
  try {
    metrics = await fetchGooglePlaceMetrics(placeId, GOOGLE_PLACES_API_KEY);
  } catch (e) {
    const code = e instanceof GooglePlacesError ? e.code : "GOOGLE_API_ERROR";
    const message = e instanceof Error ? e.message : "Erreur Google Places";
    const httpStatus = e instanceof GooglePlacesError ? e.httpStatus : undefined;
    // Nothing written — any previously stored values are untouched.
    return respondError(requestId, action, startedAt, code, message, {
      tenant_id: tenantId,
      place_id: placeId,
      ...(httpStatus ? { google_http_status: httpStatus } : {}),
    });
  }

  const nowIso = new Date().toISOString();
  const updatePayload =
    action === "select"
      ? {
          google_place_id: placeId,
          google_rating: metrics.rating,
          google_review_count: metrics.userRatingCount,
          google_rating_updated_at: nowIso,
        }
      : {
          google_rating: metrics.rating,
          google_review_count: metrics.userRatingCount,
          google_rating_updated_at: nowIso,
        };

  const { data: updated, error: updateError } = await supabase
    .from("tenants")
    .update(updatePayload)
    .eq("id", tenantId)
    .select("id")
    .maybeSingle();

  if (updateError) {
    return respondError(requestId, action, startedAt, "DATABASE_ERROR", "Échec de l'enregistrement", {
      tenant_id: tenantId,
      place_id: placeId,
    });
  }
  if (!updated) {
    return respondError(requestId, action, startedAt, "TENANT_NOT_FOUND", "Tenant introuvable", {
      tenant_id: tenantId,
      place_id: placeId,
    });
  }

  return respondOk(
    requestId,
    action,
    startedAt,
    {
      google_place_id: placeId,
      google_rating: metrics.rating,
      google_review_count: metrics.userRatingCount,
      google_rating_updated_at: nowIso,
    },
    {
      tenant_id: tenantId,
      place_id: placeId,
      google_http_status: metrics.httpStatus,
    }
  );
});
