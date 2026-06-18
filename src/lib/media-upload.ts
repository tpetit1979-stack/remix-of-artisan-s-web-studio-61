/**
 * Centralised media upload / replace / delete helpers.
 *
 * Single source of truth for every image flow in the app:
 *  - validateImageFile         → client-side file validation (type, size)
 *  - buildMediaPath            → unique, readable, versioned storage path
 *  - bucketPublicUrl           → centralised public URL builder (+ cache-buster)
 *  - uploadImage               → upload to Storage with contentType + cacheControl
 *  - replaceStorageFile        → upload new file at a NEW path (no overwrite)
 *  - removeStorageFile         → best-effort delete (never throws to caller)
 *
 * Rules enforced:
 *  - Always pass `contentType`.
 *  - Never reuse the same path on replacement (forces a new immutable URL).
 *  - DB write is the source of truth: callers must rollback Storage if DB fails.
 *  - Never delete the old Storage file before the DB row points at the new one.
 *  - Public URLs go through `bucketPublicUrl` everywhere — no ad-hoc duplication.
 */
import { supabase } from "@/integrations/supabase/client";

export const ALLOWED_IMAGE_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

export type AllowedImageMime = (typeof ALLOWED_IMAGE_MIME)[number];

/** Returns a localised error message or null when the file is acceptable. */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_MIME.includes(file.type as AllowedImageMime)) {
    return `Format non supporté (${file.type || "inconnu"}). Utilisez JPG, PNG, WebP ou AVIF.`;
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return `Fichier trop lourd (${(file.size / 1024 / 1024).toFixed(1)} Mo). Max 8 Mo.`;
  }
  return null;
}

function safeExt(file: File): string {
  const raw = (file.name.split(".").pop() || "jpg").toLowerCase();
  const cleaned = raw.replace(/[^a-z0-9]/g, "");
  return cleaned || "jpg";
}

/**
 * Build a unique, readable storage path.
 * Always includes a timestamp so a replacement never collides with the previous file.
 */
export function buildMediaPath(opts: {
  scope: string;          // e.g. tenant slug, tenant id, trade slug
  kind: string;           // e.g. "logo", "hero", "portfolio", "service_card"
  file: File;
  subFolder?: string;     // optional extra folder under scope
}): string {
  const { scope, kind, file, subFolder } = opts;
  const folder = subFolder ? `${scope}/${subFolder}` : scope;
  return `${folder}/${kind}-${Date.now()}.${safeExt(file)}`;
}

/**
 * Append a cache-buster to a public URL so swapped images don't display the
 * stale CDN copy. Use the row id (or any stable per-version key) so the URL
 * is deterministic for the current version, but changes when the row id /
 * stored path changes.
 */
export function withCacheBuster(url: string, version: string | number): string {
  if (!url) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${encodeURIComponent(String(version))}`;
}

/** Centralised public URL builder for any bucket. */
export function bucketPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Inverse of `bucketPublicUrl`: extract the storage object path from a public URL.
 * Returns null when the URL doesn't look like a Supabase Storage public URL for
 * the given bucket. Used to clean up the previous file when replacing an image
 * stored on a tenant row that only keeps the public URL (not the path).
 */
export function extractMediaPathFromPublicUrl(
  url: string | null | undefined,
  bucket = "media",
): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const tail = url.slice(idx + marker.length);
  // Strip any query string (cache-buster, transform options, etc.)
  const qIdx = tail.indexOf("?");
  return qIdx === -1 ? tail : tail.slice(0, qIdx);
}

/**
 * Upload a file to a bucket with safe defaults.
 * Throws on failure. Caller is responsible for inserting the matching DB row
 * and for calling `removeStorageFile(bucket, path)` on rollback if the DB
 * write fails.
 */
export async function uploadImage(opts: {
  bucket: string;
  path: string;
  file: File;
  upsert?: boolean;
}): Promise<void> {
  const { bucket, path, file, upsert = false } = opts;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert,
  });
  if (error) throw error;
}

/** Best-effort delete. Never throws — Storage cleanup must not break UX. */
export async function removeStorageFile(bucket: string, path: string | null | undefined) {
  if (!path) return;
  try {
    await supabase.storage.from(bucket).remove([path]);
  } catch {
    /* ignore — cleanup is best-effort */
  }
}
