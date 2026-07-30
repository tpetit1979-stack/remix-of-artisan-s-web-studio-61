// The only file in this function allowed to know Pixabay's request/response
// shape. It maps everything to the provider-agnostic types in ./types.ts —
// no governance/business logic (dedup, DB writes, storage paths) lives here.
import {
  DOWNLOAD_TIMEOUT_MS,
  DownloadedMedia,
  fetchWithRetry,
  MAX_DOWNLOAD_BYTES,
  MediaSearchResult,
  ProviderError,
  SEARCH_TIMEOUT_MS,
  SearchOutcome,
  SearchProvider,
} from "./types.ts";

const PIXABAY_API_URL = "https://pixabay.com/api/";
const LICENSE_LABEL = "Pixabay Content License";
const LICENSE_URL = "https://pixabay.com/service/license/";

function apiKey(): string {
  const key = Deno.env.get("PIXABAY_API_KEY");
  if (!key) throw new ProviderError("PROVIDER_NOT_CONFIGURED", "PIXABAY_API_KEY missing");
  return key;
}

// deno-lint-ignore no-explicit-any
function mapHit(hit: any): MediaSearchResult {
  return {
    provider: "pixabay",
    providerId: String(hit.id),
    previewUrl: hit.webformatURL,
    width: hit.imageWidth,
    height: hit.imageHeight,
    authorCredit: hit.user ?? null,
    license: LICENSE_LABEL,
    licenseUrl: LICENSE_URL,
    sourceUrl: hit.pageURL ?? null,
  };
}

export const PixabayProvider: SearchProvider = {
  id: "pixabay",

  async search(query, page, perPage): Promise<SearchOutcome> {
    const url = new URL(PIXABAY_API_URL);
    url.searchParams.set("key", apiKey());
    url.searchParams.set("q", query);
    url.searchParams.set("image_type", "photo");
    url.searchParams.set("safesearch", "true");
    url.searchParams.set("page", String(page));
    url.searchParams.set("per_page", String(perPage));

    const resp = await fetchWithRetry(url.toString(), SEARCH_TIMEOUT_MS);
    if (resp.status === 429) {
      throw new ProviderError("RATE_LIMIT", "Pixabay: quota de requêtes atteint");
    }
    if (!resp.ok) {
      throw new ProviderError("PROVIDER_ERROR", `Pixabay search failed (${resp.status})`);
    }

    const remainingHeader = resp.headers.get("x-ratelimit-remaining");
    const resetHeader = resp.headers.get("x-ratelimit-reset");
    // deno-lint-ignore no-explicit-any
    const data: any = await resp.json();
    const hits = Array.isArray(data.hits) ? data.hits : [];

    return {
      results: hits.map(mapHit),
      rateLimitRemaining: remainingHeader ? Number(remainingHeader) : null,
      rateLimitReset: resetHeader ? Number(resetHeader) : null,
    };
  },

  async download(providerId): Promise<DownloadedMedia> {
    // Pixabay's search endpoint also accepts `id` to fetch a single hit,
    // including `largeImageURL` (the HD asset) that `search()` never exposes.
    const lookupUrl = new URL(PIXABAY_API_URL);
    lookupUrl.searchParams.set("key", apiKey());
    lookupUrl.searchParams.set("id", providerId);

    const lookupResp = await fetchWithRetry(lookupUrl.toString(), SEARCH_TIMEOUT_MS);
    if (lookupResp.status === 429) {
      throw new ProviderError("RATE_LIMIT", "Pixabay: quota de requêtes atteint");
    }
    if (!lookupResp.ok) {
      throw new ProviderError("PROVIDER_ERROR", `Pixabay lookup failed (${lookupResp.status})`);
    }
    // deno-lint-ignore no-explicit-any
    const lookupData: any = await lookupResp.json();
    const hit = lookupData.hits?.[0];
    if (!hit) throw new ProviderError("NOT_FOUND", `Pixabay image ${providerId} introuvable`);

    const imgResp = await fetchWithRetry(hit.largeImageURL, DOWNLOAD_TIMEOUT_MS);
    if (!imgResp.ok) {
      throw new ProviderError("DOWNLOAD_FAILED", `Échec du téléchargement Pixabay (${imgResp.status})`);
    }
    const declaredLength = Number(imgResp.headers.get("content-length") ?? "0");
    if (declaredLength > MAX_DOWNLOAD_BYTES) {
      throw new ProviderError(
        "FILE_TOO_LARGE",
        `Image trop volumineuse (${declaredLength} octets, max ${MAX_DOWNLOAD_BYTES})`,
      );
    }
    const contentType = imgResp.headers.get("content-type") || "image/jpeg";
    const bytes = new Uint8Array(await imgResp.arrayBuffer());
    if (bytes.length > MAX_DOWNLOAD_BYTES) {
      throw new ProviderError(
        "FILE_TOO_LARGE",
        `Image trop volumineuse après téléchargement (${bytes.length} octets, max ${MAX_DOWNLOAD_BYTES})`,
      );
    }
    const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";

    return { bytes, contentType, width: hit.imageWidth, height: hit.imageHeight, ext };
  },
};
