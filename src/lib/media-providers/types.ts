/**
 * Client-side mirror of supabase/functions/media-import/providers/types.ts.
 * Edge Functions run in a separate Deno project and can't share TS modules
 * with the app, so this shape is duplicated deliberately — keep both in sync
 * by hand when the contract changes.
 *
 * The UI is only ever meant to depend on this interface, never on a
 * provider's raw response shape — that's what makes adding Gemini/Unsplash/
 * Pexels later a matter of one new provider client module, not a UI rewrite.
 */
import { supabase } from "@/integrations/supabase/client";

export interface MediaSearchResult {
  provider: string;
  providerId: string;
  previewUrl: string;
  width: number;
  height: number;
  authorCredit: string | null;
  license: string;
  licenseUrl: string | null;
  sourceUrl: string | null;
}

export interface SearchOutcome {
  results: MediaSearchResult[];
  rateLimitRemaining: number | null;
  rateLimitReset: number | null;
}

type EdgeFunctionEnvelope<T> =
  | { success: true; request_id: string; data: T }
  | { success: false; request_id: string; error: { code: string; message: string } };

/** Thrown by invokeMediaImport() on failure. Carries request_id so a support
 *  request ("this import failed") can be matched to the Edge Function's logs. */
export class MediaImportError extends Error {
  code: string;
  requestId: string | null;
  constructor(code: string, message: string, requestId: string | null) {
    super(message);
    this.code = code;
    this.requestId = requestId;
  }
}

/** Unwraps the media-import Edge Function's normalised envelope, or throws
 *  with the provider-agnostic message it returned (never a raw provider error). */
function unwrapMediaImportEnvelope<T>(payload: EdgeFunctionEnvelope<T> | null | undefined): T {
  if (!payload) throw new MediaImportError("EMPTY_RESPONSE", "Réponse vide du service d'import", null);
  if (!payload.success) throw new MediaImportError(payload.error.code, payload.error.message, payload.request_id);
  return payload.data;
}

/**
 * media-import now answers with real HTTP status codes (400/404/429/500/502),
 * so `supabase.functions.invoke()` raises a `FunctionsHttpError` on any
 * non-2xx response — its `.error` object does NOT contain our JSON body.
 * The body only lives on `error.context`, the raw Response, which must be
 * read separately. This wrapper is the single place that does that parsing
 * so every caller gets our actual { code, message } instead of the generic
 * "Edge Function returned a non-2xx status code".
 */
export async function invokeMediaImport<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("media-import", { body });

  if (error) {
    const context: Response | undefined = (error as { context?: Response }).context;
    if (context && typeof context.json === "function") {
      try {
        const parsed = (await context.json()) as EdgeFunctionEnvelope<T>;
        return unwrapMediaImportEnvelope(parsed);
      } catch {
        // context wasn't JSON (network-level failure) — fall through to the raw error.
      }
    }
    throw error;
  }

  return unwrapMediaImportEnvelope(data as EdgeFunctionEnvelope<T>);
}
