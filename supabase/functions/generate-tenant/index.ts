// Generates editorial/SEO content for a tenant from a brief + a
// deterministically-preselected list of services. Same governance as
// google-places/index.ts:
//  - Auth is checked explicitly here (auth.ts), never assumed from
//    verify_jwt alone. verify_jwt=true (supabase/config.toml) only rejects
//    requests with no JWT at all — the super_admin role check below is what
//    actually gates access.
//  - Response envelope: { success: true, request_id, data } on success,
//    { success: false, request_id, error: { code, message } } on failure.
//    Every path goes through respondOk/respondError so structured logging
//    (request_id, action-less here since there's only one operation,
//    duration_ms, success, provider, model, usage) can never be skipped.
//  - Logs never contain the brief text, the prompts, the raw AI response, or
//    any secret — only provider/model/latency/status/token usage.
//
// Business rules enforced here (see prompts/tenant-generation.ts and
// validators/tenant-output.ts for the detail):
//  - Factual data (phone, email, city, zones, brands, certifications,
//    gratuité, urgence, délais, garanties) is never requested from the AI —
//    it is not in the schema at all.
//  - selectedServices (chosen by the caller via deterministic Pareto
//    preselection from trade_service_templates, BEFORE this function is
//    ever called) keep their id/slug/name untouched. The AI only enriches
//    description/SEO text for those exact ids.
//  - Anything the AI thinks is missing from the catalogue is returned
//    separately in suggested_services — never merged automatically.

import { verifySuperAdmin } from "./auth.ts";
import type { AiProvider, AiGenerationInput, AiGenerationResult } from "./providers/types.ts";
import { AiProviderError, TRANSIENT_AI_ERROR_CODES } from "./providers/types.ts";
import { LovableProvider } from "./providers/lovable.ts";
import { GeminiProvider } from "./providers/gemini.ts";
import { buildSystemPrompt, buildUserPrompt, TENANT_GENERATION_SCHEMA, AI_FETCH_TIMEOUT_MS } from "./prompts/tenant-generation.ts";
import type { SelectedServiceContext } from "./prompts/tenant-generation.ts";
import { validateTenantOutput } from "./validators/tenant-output.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_BRIEF_LENGTH = 20000;
const MAX_SELECTED_SERVICES = 30;
// One real attempt + at most one retry, transient errors only.
const MAX_AI_ATTEMPTS = 2;

export type GenerateWithRetryResult =
  | { ok: true; result: AiGenerationResult; attempts: number }
  | { ok: false; error: AiProviderError; attempts: number };

/** Extracted as a pure function (no fetch/env access of its own — those
 * live in the provider) so retry/transient-error-gating logic can be unit
 * tested with a fake AiProvider, without a network call or a real timer. */
export async function generateWithRetry(
  provider: AiProvider,
  input: AiGenerationInput,
  timeoutMs: number,
  maxAttempts: number,
): Promise<GenerateWithRetryResult> {
  let attempt = 0;
  while (true) {
    attempt++;
    try {
      const result = await provider.generateStructured(input, timeoutMs);
      return { ok: true, result, attempts: attempt };
    } catch (e) {
      const err = e instanceof AiProviderError ? e : new AiProviderError("AI_API_ERROR", "Erreur IA inconnue");
      const canRetry = attempt < maxAttempts && TRANSIENT_AI_ERROR_CODES.includes(err.code);
      if (!canRetry) return { ok: false, error: err, attempts: attempt };
      // transient error, attempts left — loop continues
    }
  }
}

function statusForCode(code: string): number {
  switch (code) {
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "INVALID_JSON":
    case "INVALID_BODY":
      return 400;
    case "AI_RATE_LIMITED":
      return 429;
    case "AI_QUOTA_EXCEEDED":
      return 402;
    case "AI_TIMEOUT":
    case "AI_API_ERROR":
    case "AI_INVALID_RESPONSE":
    case "AI_OUTPUT_REJECTED":
      return 502;
    default:
      // DATABASE_ERROR, CONFIG_ERROR and any unmapped code are our own faults.
      return 500;
  }
}

function respondOk(requestId: string, startedAt: number, data: unknown, extra: Record<string, unknown> = {}): Response {
  console.log(
    JSON.stringify({
      event: "generate_tenant",
      request_id: requestId,
      duration_ms: Date.now() - startedAt,
      success: true,
      ...extra,
    }),
  );
  return new Response(JSON.stringify({ success: true, request_id: requestId, data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function respondError(
  requestId: string,
  startedAt: number,
  code: string,
  message: string,
  extra: Record<string, unknown> = {},
): Response {
  console.log(
    JSON.stringify({
      event: "generate_tenant",
      request_id: requestId,
      duration_ms: Date.now() - startedAt,
      success: false,
      error_code: code,
      ...extra,
    }),
  );
  return new Response(JSON.stringify({ success: false, request_id: requestId, error: { code, message } }), {
    status: statusForCode(code),
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function buildProvider(env: { get(key: string): string | undefined } = Deno.env): { provider: AiProvider; providerName: string; model: string } | { error: string } {
  // Default stays "lovable" — the current, already-live behavior — so that
  // simply deploying this rewrite (before AI_PROVIDER is ever set) changes
  // nothing about which gateway is used. Switching to Gemini is an explicit
  // opt-in via the AI_PROVIDER secret, not a side effect of this deploy.
  const providerName = (env.get("AI_PROVIDER") || "lovable").trim().toLowerCase();

  if (providerName === "gemini") {
    const apiKey = env.get("GEMINI_API_KEY");
    const model = env.get("GEMINI_MODEL");
    if (!apiKey || !model) {
      return { error: "GEMINI_API_KEY ou GEMINI_MODEL non configuré" };
    }
    return { provider: new GeminiProvider(apiKey, model), providerName, model };
  }

  if (providerName === "lovable") {
    const apiKey = env.get("LOVABLE_API_KEY");
    if (!apiKey) return { error: "LOVABLE_API_KEY non configuré" };
    return { provider: new LovableProvider(apiKey, "google/gemini-3-flash-preview"), providerName, model: "google/gemini-3-flash-preview" };
  }

  return { error: `AI_PROVIDER inconnu: "${providerName}"` };
}

/** The actual request handler, exported so tests can call it directly
 * without importing this module as a side-effecting Deno.serve entrypoint
 * (see the import.meta.main guard below). */
export async function handleRequest(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const requestId = crypto.randomUUID();
  const startedAt = Date.now();

  // --- Auth first: nothing below runs for a non-super_admin caller. ---
  const auth = await verifySuperAdmin(req);
  if (!auth.ok) {
    return respondError(requestId, startedAt, auth.code, auth.message);
  }

  // deno-lint-ignore no-explicit-any
  let body: any;
  try {
    body = await req.json();
  } catch {
    return respondError(requestId, startedAt, "INVALID_JSON", "Corps de requête invalide");
  }

  const brief = typeof body?.brief === "string" ? body.brief : "";
  if (!brief || brief.length > MAX_BRIEF_LENGTH) {
    return respondError(requestId, startedAt, "INVALID_BODY", `Brief requis (max ${MAX_BRIEF_LENGTH} caractères)`);
  }

  const rawSelectedServices = Array.isArray(body?.selectedServices) ? body.selectedServices : [];
  if (rawSelectedServices.length > MAX_SELECTED_SERVICES) {
    return respondError(requestId, startedAt, "INVALID_BODY", `Trop de services sélectionnés (max ${MAX_SELECTED_SERVICES})`);
  }
  const selectedServices: SelectedServiceContext[] = [];
  for (const entry of rawSelectedServices) {
    if (typeof entry?.id === "string" && typeof entry?.name === "string" && entry.id && entry.name) {
      selectedServices.push({ id: entry.id, name: entry.name });
    }
  }
  if (selectedServices.length !== rawSelectedServices.length) {
    return respondError(requestId, startedAt, "INVALID_BODY", "selectedServices: entrée invalide (id/name requis)");
  }

  const providerSetup = buildProvider();
  if ("error" in providerSetup) {
    return respondError(requestId, startedAt, "CONFIG_ERROR", providerSetup.error);
  }
  const { provider, providerName, model } = providerSetup;

  const input = {
    systemPrompt: buildSystemPrompt(),
    userPrompt: buildUserPrompt(brief, selectedServices),
    schema: TENANT_GENERATION_SCHEMA,
  };

  const attemptResult: GenerateWithRetryResult = await generateWithRetry(provider, input, AI_FETCH_TIMEOUT_MS, MAX_AI_ATTEMPTS);
  if (!attemptResult.ok) {
    return respondError(requestId, startedAt, attemptResult.error.code, attemptResult.error.message, {
      provider: providerName,
      model,
      attempt: attemptResult.attempts,
    });
  }
  const generation = attemptResult.result;
  const attempt = attemptResult.attempts;

  const knownIds = selectedServices.map((s) => s.id);
  const validation = validateTenantOutput(generation.raw, knownIds);
  if (!validation.ok) {
    // Invalid AI output never reaches the caller, partially or otherwise.
    // Onboarding state is untouched — the client sees a clean error and can
    // retry the whole step.
    return respondError(requestId, startedAt, "AI_OUTPUT_REJECTED", validation.reason, {
      provider: providerName,
      model,
      attempt,
    });
  }

  return respondOk(requestId, startedAt, validation.data, {
    provider: providerName,
    model: generation.model,
    attempt,
    warnings_count: validation.warnings.length,
    ...(generation.usage?.inputTokens != null ? { input_tokens: generation.usage.inputTokens } : {}),
    ...(generation.usage?.outputTokens != null ? { output_tokens: generation.usage.outputTokens } : {}),
  });
}

// Only start the server when this file is the actual entrypoint (the
// Supabase runtime, or `deno run` directly) — not when it's imported by a
// test file, which would otherwise open a real listener as a side effect.
if (import.meta.main) {
  Deno.serve(handleRequest);
}
