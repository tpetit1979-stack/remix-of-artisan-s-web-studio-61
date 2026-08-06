// Run with `deno test supabase/functions/generate-tenant/`.
//
// Importing index.ts here does NOT start a server: index.ts only calls
// Deno.serve under `if (import.meta.main)`, which is false for a module
// that's imported rather than run directly.

import { assert, assertEquals } from "./testing/assert.ts";
import { buildProvider, generateWithRetry, handleRequest } from "./index.ts";
import type { AiProvider, AiGenerationInput, AiGenerationResult } from "./providers/types.ts";
import { AiProviderError } from "./providers/types.ts";

function fakeEnv(vars: Record<string, string>): { get(key: string): string | undefined } {
  return { get: (key) => vars[key] };
}

// --- provider selector ---

Deno.test("buildProvider: defaults to lovable when AI_PROVIDER is unset (safe default, no behavior change on deploy)", () => {
  const result = buildProvider(fakeEnv({ LOVABLE_API_KEY: "key" }));
  assert(!("error" in result));
  if (!("error" in result)) assertEquals(result.providerName, "lovable");
});

Deno.test("buildProvider: lovable without LOVABLE_API_KEY -> config error", () => {
  const result = buildProvider(fakeEnv({}));
  assert("error" in result);
});

Deno.test("buildProvider: AI_PROVIDER=gemini with both secrets set -> gemini provider, exact model from env", () => {
  const result = buildProvider(fakeEnv({ AI_PROVIDER: "gemini", GEMINI_API_KEY: "key", GEMINI_MODEL: "gemini-test-model" }));
  assert(!("error" in result));
  if (!("error" in result)) {
    assertEquals(result.providerName, "gemini");
    assertEquals(result.model, "gemini-test-model");
  }
});

Deno.test("buildProvider: AI_PROVIDER=gemini missing GEMINI_MODEL -> config error, never guesses a model id", () => {
  const result = buildProvider(fakeEnv({ AI_PROVIDER: "gemini", GEMINI_API_KEY: "key" }));
  assert("error" in result);
});

Deno.test("buildProvider: unknown AI_PROVIDER value -> config error", () => {
  const result = buildProvider(fakeEnv({ AI_PROVIDER: "openai" }));
  assert("error" in result);
});

// --- retry ---

const DUMMY_INPUT: AiGenerationInput = { systemPrompt: "s", userPrompt: "u", schema: {} };

function providerThatSucceeds(model = "test-model"): AiProvider {
  return {
    generateStructured: () => Promise.resolve<AiGenerationResult>({ raw: {}, model }),
  };
}

function providerThatFailsNTimesThenSucceeds(n: number, code: AiProviderError["code"]): AiProvider {
  let calls = 0;
  return {
    generateStructured: () => {
      calls++;
      if (calls <= n) return Promise.reject(new AiProviderError(code, "erreur transitoire"));
      return Promise.resolve<AiGenerationResult>({ raw: {}, model: "test-model" });
    },
  };
}

function providerThatAlwaysFails(code: AiProviderError["code"]): AiProvider {
  return {
    generateStructured: () => Promise.reject(new AiProviderError(code, "erreur")),
  };
}

Deno.test("generateWithRetry: succeeds on first attempt -> attempts=1", async () => {
  const result = await generateWithRetry(providerThatSucceeds(), DUMMY_INPUT, 1000, 2);
  assert(result.ok);
  if (result.ok) assertEquals(result.attempts, 1);
});

Deno.test("generateWithRetry: transient error then success -> one retry, attempts=2", async () => {
  const provider = providerThatFailsNTimesThenSucceeds(1, "AI_TIMEOUT");
  const result = await generateWithRetry(provider, DUMMY_INPUT, 1000, 2);
  assert(result.ok);
  if (result.ok) assertEquals(result.attempts, 2);
});

Deno.test("generateWithRetry: non-transient error -> no retry, fails after attempt 1", async () => {
  const provider = providerThatAlwaysFails("AI_INVALID_RESPONSE");
  const result = await generateWithRetry(provider, DUMMY_INPUT, 1000, 2);
  assert(!result.ok);
  if (!result.ok) {
    assertEquals(result.attempts, 1);
    assertEquals(result.error.code, "AI_INVALID_RESPONSE");
  }
});

Deno.test("generateWithRetry: transient error persisting beyond maxAttempts -> fails after maxAttempts, not retried forever", async () => {
  const provider = providerThatAlwaysFails("AI_TIMEOUT");
  const result = await generateWithRetry(provider, DUMMY_INPUT, 1000, 2);
  assert(!result.ok);
  if (!result.ok) assertEquals(result.attempts, 2);
});

Deno.test("generateWithRetry: AI_QUOTA_EXCEEDED is never retried", async () => {
  const provider = providerThatAlwaysFails("AI_QUOTA_EXCEEDED");
  const result = await generateWithRetry(provider, DUMMY_INPUT, 1000, 3);
  assert(!result.ok);
  if (!result.ok) assertEquals(result.attempts, 1);
});

// --- auth gate at the handler level (network-free: the missing-header case
// short-circuits before any Supabase client is ever built) ---

Deno.test("handleRequest: no Authorization header -> 401, request never reaches the AI call", async () => {
  const req = new Request("https://example.com/generate-tenant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ brief: "Un artisan à Montpellier", selectedServices: [] }),
  });
  const res = await handleRequest(req);
  assertEquals(res.status, 401);
  const json = await res.json();
  assertEquals(json.success, false);
  assertEquals(json.error.code, "UNAUTHORIZED");
});

Deno.test("handleRequest: OPTIONS is answered directly (CORS preflight), no auth check", async () => {
  const req = new Request("https://example.com/generate-tenant", { method: "OPTIONS" });
  const res = await handleRequest(req);
  assertEquals(res.status, 200);
});
