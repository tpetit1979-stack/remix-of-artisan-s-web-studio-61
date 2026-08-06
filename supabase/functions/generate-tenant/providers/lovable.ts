// Existing behavior, extracted as-is behind the AiProvider interface — kept
// only as a rollback path (AI_PROVIDER=lovable) once GeminiProvider is the
// default. Not the target architecture, do not extend this one further.

import type { AiProvider, AiGenerationInput, AiGenerationResult } from "./types.ts";
import { AiProviderError } from "./types.ts";

const LOVABLE_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export class LovableProvider implements AiProvider {
  constructor(private apiKey: string, private model: string) {}

  async generateStructured(
    { systemPrompt, userPrompt, schema }: AiGenerationInput,
    timeoutMs: number,
  ): Promise<AiGenerationResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let response: Response;
    try {
      response = await fetch(LOVABLE_GATEWAY_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "suggest_tenant_config",
                description: "Génère la configuration structurée demandée.",
                parameters: schema,
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "suggest_tenant_config" } },
        }),
        signal: controller.signal,
      });
    } catch (e) {
      const timedOut = e instanceof Error && e.name === "AbortError";
      throw new AiProviderError(
        timedOut ? "AI_TIMEOUT" : "AI_API_ERROR",
        timedOut ? "La passerelle IA n'a pas répondu à temps" : "La passerelle IA est injoignable",
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      if (response.status === 429) {
        throw new AiProviderError("AI_RATE_LIMITED", "Trop de requêtes, réessayez dans quelques secondes.", 429);
      }
      if (response.status === 402) {
        throw new AiProviderError("AI_QUOTA_EXCEEDED", "Crédits IA épuisés.", 402);
      }
      throw new AiProviderError("AI_API_ERROR", `Passerelle IA: erreur ${response.status}`, response.status);
    }

    const json = await response.json();
    const toolCall = json.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new AiProviderError("AI_INVALID_RESPONSE", "Réponse IA sans appel de fonction");

    let raw: unknown;
    try {
      raw = JSON.parse(toolCall.function.arguments);
    } catch {
      throw new AiProviderError("AI_INVALID_RESPONSE", "Réponse IA non parsable");
    }

    // The Lovable gateway response shape observed so far does not expose a
    // reliable token count — left undefined rather than guessed.
    return { raw, model: this.model, usage: undefined };
  }
}
