// The dispatcher (../index.ts) resolves providers only through this registry —
// it never imports a provider module directly. Adding Gemini/Unsplash/Pexels
// later means adding one file + one entry here, nothing else changes.
import { PixabayProvider } from "./pixabay.ts";
import { ProviderError, SearchProvider } from "./types.ts";

const PROVIDERS: Record<string, SearchProvider> = {
  pixabay: PixabayProvider,
};

export function getProvider(id: string): SearchProvider {
  const provider = PROVIDERS[id];
  if (!provider) throw new ProviderError("UNKNOWN_PROVIDER", `Provider inconnu: ${id}`);
  return provider;
}
