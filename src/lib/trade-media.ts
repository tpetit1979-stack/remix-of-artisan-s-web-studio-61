/**
 * Centralized trade media library helpers.
 *
 * The super admin manages a global pool of per-trade images (hero, service cards,
 * proof, gallery) stored in the `trade-media` Supabase Storage bucket and indexed
 * in `trade_media_library`.
 *
 * SECURITY: Frontend reads go through the `public_trade_media` view, which only
 * exposes render-safe columns of active rows. The full table is restricted to
 * super-admins.
 *
 * Frontend resolution order (always):
 *   1. Tenant's own uploaded image (with a meaningful alt fallback)
 *   2. First active media for the tenant's trade in trade_media_library (sort_order asc)
 *   3. null  → caller MUST hide the section, never render a placeholder.
 */
import { supabase } from "@/integrations/supabase/client";
import { bucketPublicUrl } from "@/lib/media-upload";

export type TradeMediaType = "hero" | "service_card" | "proof" | "gallery";

export const TRADE_MEDIA_BUCKET = "trade-media";

export interface TradeMedia {
  id: string;
  trade_template_id: string;
  media_type: TradeMediaType;
  title: string | null;
  image_path: string;
  alt_text: string | null;
  sort_order: number;
  is_active: boolean;
}

/** Build a public URL for a stored path in the trade-media bucket. */
export function tradeMediaPublicUrl(imagePath: string): string {
  return bucketPublicUrl(TRADE_MEDIA_BUCKET, imagePath);
}

/**
 * Fetch the first active media for a trade + type, ordered by sort_order asc.
 * Reads from the restricted `public_trade_media` view (render columns only).
 * Returns null when no media exists — callers must hide the section.
 */
export async function getDefaultTradeMedia(
  tradeTemplateId: string | null | undefined,
  mediaType: TradeMediaType,
): Promise<{ url: string; alt: string } | null> {
  if (!tradeTemplateId) return null;

  const { data, error } = await supabase
    .from("public_trade_media")
    .select("image_path, alt_text")
    .eq("trade_template_id", tradeTemplateId)
    .eq("media_type", mediaType)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  return {
    url: tradeMediaPublicUrl(data.image_path as string),
    alt: (data.alt_text as string | null) ?? "",
  };
}

/**
 * Resolve an image with the standard 3-tier fallback.
 *
 * @param tenantImageUrl  Tenant's uploaded image URL (priority 1)
 * @param tradeTemplateId Trade template id used to look up defaults
 * @param mediaType       Which slot we're resolving (hero, service_card, …)
 * @param tenantAltFallback  Meaningful alt text to use when the tenant uploaded
 *   their own image (e.g. hero_title, service.name, portfolio.title). Required
 *   for accessibility and SEO — never let a tenant image render with empty alt.
 *
 * Returns null when nothing is available — caller hides the block.
 */
export async function resolveTradeImage(
  tenantImageUrl: string | null | undefined,
  tradeTemplateId: string | null | undefined,
  mediaType: TradeMediaType,
  tenantAltFallback?: string | null,
): Promise<{ url: string; alt: string } | null> {
  if (tenantImageUrl) {
    return {
      url: tenantImageUrl,
      alt: (tenantAltFallback ?? "").trim(),
    };
  }
  return getDefaultTradeMedia(tradeTemplateId, mediaType);
}
