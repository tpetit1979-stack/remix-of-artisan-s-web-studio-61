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

/** Shared label list for the 4 media_type values — used by every screen that
 *  lets an admin pick a destination type (manual upload, Pixabay import, edit). */
export const MEDIA_TYPE_OPTIONS: { value: TradeMediaType; label: string }[] = [
  { value: "hero", label: "Hero" },
  { value: "service_card", label: "Carte service" },
  { value: "proof", label: "Preuve / chantier" },
  { value: "gallery", label: "Galerie" },
];

/** Build a public URL for a stored path in the trade-media bucket. */
export function tradeMediaPublicUrl(imagePath: string): string {
  return bucketPublicUrl(TRADE_MEDIA_BUCKET, imagePath);
}
