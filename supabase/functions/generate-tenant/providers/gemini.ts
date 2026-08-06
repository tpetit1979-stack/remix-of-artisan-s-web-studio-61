// Target provider: calls the Gemini Developer API directly (not Vertex AI —
// see the comparison in the plan presented before this file existed).
// GEMINI_MODEL is required and must be verified against a real account
// before deploy — "gemini-3-flash-preview" (the id seen through the
// Lovable gateway) is NOT assumed to exist under this name in the direct
// API; do not hardcode a guessed equivalent here.

import type { AiProvider, AiGenerationInput, AiGenerationResult } from "./types.ts";
import { AiProviderError } from "./types.ts";

export class GeminiProvider implements AiProvider {
  constructor(private apiKey: string, private model: string) {}

  async generateStructured(
    { systemPrompt, userPrompt, schema }: AiGenerationInput,
    timeoutMs: number,
  ): Promise<AiGenerationResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let response: Response;
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`,
        {
          method: "POST",
          headers: {
            "x-goog-api-key": this.apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: schema,
            },
          }),
          signal: controller.signal,
        },
      );
    } catch (e) {
      const timedOut = e instanceof Error && e.name === "AbortError";
      throw new AiProviderError(
        timedOut ? "AI_TIMEOUT" : "AI_API_ERROR",
        timedOut ? "Gemini n'a pas répondu à temps" : "Gemini est injoignable",
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      if (response.status === 429) {
        throw new AiProviderError("AI_RATE_LIMITED", "Trop de requêtes, réessayez dans quelques secondes.", 429);
      }
      throw new AiProviderError("AI_API_ERROR", `Gemini: erreur ${response.status}`, response.status);
    }

    const json = await response.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string") {
      throw new AiProviderError("AI_INVALID_RESPONSE", "Réponse Gemini sans contenu exploitable");
    }

    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      throw new AiProviderError("AI_INVALID_RESPONSE", "Réponse Gemini non parsable");
    }

    return {
      raw,
      model: this.model,
      usage: {
        inputTokens: json.usageMetadata?.promptTokenCount,
        outputTokens: json.usageMetadata?.candidatesTokenCount,
      },
    };
  }
}
