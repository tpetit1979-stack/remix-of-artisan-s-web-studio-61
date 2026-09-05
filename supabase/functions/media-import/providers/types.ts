// Shared contract every media search provider must satisfy. The dispatcher
// (../index.ts) only ever talks to this interface — it never imports a
// provider-specific module or knows a provider's raw response shape.

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

export interface DownloadedMedia {
  bytes: Uint8Array;
  contentType: string;
  width: number;
  height: number;
  ext: string;
}

export interface SearchProvider {
  id: string;
  search(query: string, page: number, perPage: number): Promise<SearchOutcome>;
  download(providerId: string): Promise<DownloadedMedia>;
}

/** Attach a stable error code so the dispatcher can map it to an HTTP status
 *  and a normalised { success:false, error:{code,message} } body without
 *  ever forwarding a provider's raw error payload to the client. */
export class ProviderError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

// Shared infra limits — every provider must respect these, not just Pixabay.
export const SEARCH_TIMEOUT_MS = 10_000;
export const DOWNLOAD_TIMEOUT_MS = 20_000;
export const MAX_DOWNLOAD_BYTES = 20 * 1024 * 1024; // 20 MB
export const ALLOWED_MEDIA_CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
export const MEDIA_IMPORT_USER_AGENT = "SUPORDO Media Importer";

/** fetch() with an upper bound on wait time. A hung external API must never
 *  block this function for 30-60s — it fails fast with a TIMEOUT ProviderError. */
export async function fetchWithTimeout(url: string, timeoutMs: number, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: { "User-Agent": MEDIA_IMPORT_USER_AGENT, ...init?.headers },
    });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new ProviderError("TIMEOUT", `Délai dépassé (${timeoutMs}ms) sur ${url}`);
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Same as fetchWithTimeout, with exactly one automatic retry — and only for
 * the two failure modes that are safe to retry blindly:
 *  - a timeout (our own ProviderError("TIMEOUT", ...));
 *  - a genuine network failure, i.e. the request never reached a server at
 *    all. Per the Fetch spec (browsers and Deno alike), that surfaces as a
 *    TypeError — nothing else does. A JSON-parse error, a programming bug,
 *    or any other unexpected exception is NOT a TypeError and is NOT
 *    retried here; it propagates immediately.
 * Any error that came back WITH an HTTP response (429 rate limit, 404, ...)
 * is decided by the caller after inspecting `resp.status` — it never throws
 * here, so it's never retried by this helper either.
 * Each attempt calls fetchWithTimeout() fresh, so each gets its own
 * AbortController/timer — a signal already aborted by attempt 1 is never
 * reused for attempt 2. Never use this for Storage/DB writes.
 */
export async function fetchWithRetry(url: string, timeoutMs: number, init?: RequestInit): Promise<Response> {
  try {
    return await fetchWithTimeout(url, timeoutMs, init);
  } catch (e) {
    const isTimeout = e instanceof ProviderError && e.code === "TIMEOUT";
    const isNetworkFailure = e instanceof TypeError;
    if (!isTimeout && !isNetworkFailure) throw e;
    return await fetchWithTimeout(url, timeoutMs, init);
  }
}

/** Strips `; charset=...` and normalises case so header comparisons don't
 *  reject a technically-equivalent Content-Type. */
export function normalizeContentType(contentType: string): string {
  return contentType.split(";")[0].trim().toLowerCase();
}

const IMAGE_SIGNATURES: { type: string; bytes: number[] }[] = [
  { type: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { type: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  // WebP: "RIFF" .... "WEBP" — the 4 size bytes at offset 4-7 vary, skipped.
];

/** Light magic-byte sniff so a mislabeled Content-Type (proxy error, wrong
 *  header, HTML error page served as "image/jpeg") can't reach Storage. */
export function sniffImageContentType(bytes: Uint8Array): string | null {
  for (const sig of IMAGE_SIGNATURES) {
    if (sig.bytes.every((b, i) => bytes[i] === b)) return sig.type;
  }
  if (bytes.length >= 12) {
    const isRiff = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;
    const isWebp = bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
    if (isRiff && isWebp) return "image/webp";
  }
  return null;
}
