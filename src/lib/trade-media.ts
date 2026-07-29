/**
 * Storage helpers for the trade media library.
 *
 * The super admin manages a global pool of per-trade images (hero, service cards,
 * proof, gallery) stored in the `trade-media` Supabase Storage bucket and indexed
 * in `trade_media_library`. This file only exposes the bucket name, its type, and
 * a public-URL builder for that bucket — actual resolution of which image to show
 * for a given tenant/service goes through `src/lib/media-resolver.ts`, the single
 * resolver used across the product.
 */
import { bucketPublicUrl } from "@/lib/media-upload";

export type TradeMediaType = "hero" | "service_card" | "proof" | "gallery";

export const TRADE_MEDIA_BUCKET = "trade-media";

/** Build a public URL for a stored path in the trade-media bucket. */
export function tradeMediaPublicUrl(imagePath: string): string {
  return bucketPublicUrl(TRADE_MEDIA_BUCKET, imagePath);
}
