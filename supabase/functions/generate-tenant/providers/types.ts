// Provider-agnostic contract for the AI call generate-tenant makes. A
// provider only knows how to send a system/user prompt + JSON schema and
// get structured JSON back — it never knows about tenants, services, or
// business rules. Those live in prompts/ and validators/, not here.

export interface AiGenerationInput {
  systemPrompt: string;
  userPrompt: string;
  /** JSON Schema (subset understood by both providers: object/string/array/boolean/number, enum, required). */
  schema: Record<string, unknown>;
}

export interface AiGenerationResult {
  raw: unknown;
  model: string;
  usage?: { inputTokens?: number; outputTokens?: number };
}

export interface AiProvider {
  generateStructured(input: AiGenerationInput, timeoutMs: number): Promise<AiGenerationResult>;
}

export type AiProviderErrorCode =
  | "AI_TIMEOUT"
  | "AI_RATE_LIMITED"
  | "AI_QUOTA_EXCEEDED"
  | "AI_API_ERROR"
  | "AI_INVALID_RESPONSE";

/** Transient = safe to retry once. Everything else is not. */
export const TRANSIENT_AI_ERROR_CODES: readonly AiProviderErrorCode[] = [
  "AI_TIMEOUT",
  "AI_RATE_LIMITED",
  "AI_API_ERROR",
];

export class AiProviderError extends Error {
  code: AiProviderErrorCode;
  httpStatus?: number;
  constructor(code: AiProviderErrorCode, message: string, httpStatus?: number) {
    super(message);
    this.code = code;
    this.httpStatus = httpStatus;
  }
}
