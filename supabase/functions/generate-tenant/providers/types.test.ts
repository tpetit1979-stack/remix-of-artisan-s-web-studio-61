// Run with `deno test supabase/functions/generate-tenant/`.

import { assert, assertEquals } from "../testing/assert.ts";
import { AiProviderError, TRANSIENT_AI_ERROR_CODES } from "./types.ts";

Deno.test("TRANSIENT_AI_ERROR_CODES: timeout, rate limit and generic API error are retryable", () => {
  assert(TRANSIENT_AI_ERROR_CODES.includes("AI_TIMEOUT"));
  assert(TRANSIENT_AI_ERROR_CODES.includes("AI_RATE_LIMITED"));
  assert(TRANSIENT_AI_ERROR_CODES.includes("AI_API_ERROR"));
});

Deno.test("TRANSIENT_AI_ERROR_CODES: quota exceeded and invalid response are NOT retryable", () => {
  assert(!TRANSIENT_AI_ERROR_CODES.includes("AI_QUOTA_EXCEEDED"));
  assert(!TRANSIENT_AI_ERROR_CODES.includes("AI_INVALID_RESPONSE"));
});

Deno.test("AiProviderError: carries code, message and optional httpStatus", () => {
  const err = new AiProviderError("AI_RATE_LIMITED", "Trop de requêtes", 429);
  assertEquals(err.code, "AI_RATE_LIMITED");
  assertEquals(err.message, "Trop de requêtes");
  assertEquals(err.httpStatus, 429);
  assert(err instanceof Error);
});
