import { useTenant } from "@/hooks/use-tenant";
import { resolveEditorialTexts, type ResolvedEditorialTexts } from "@/lib/editorial-texts";

/** Button label + banner heading for the current tenant. See editorial-texts.ts for why this is not part of useCommercialPromises(). */
export function useEditorialTexts(): ResolvedEditorialTexts {
  const { settings } = useTenant();
  return resolveEditorialTexts(settings?.cta_text ?? null);
}
