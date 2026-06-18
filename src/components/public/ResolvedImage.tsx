/**
 * Single image component that ALWAYS goes through the media resolver.
 * Use this everywhere a public-facing image is rendered (hero, service card,
 * portfolio thumb, certification logo). It guarantees the 3-level fallback:
 *   tenant_media → trade_media_library → neutral placeholder
 *
 * Never read image_url / hero_image_url / logo_url directly in a component.
 */
import { useResolvedMedia, type MediaCategory } from "@/lib/media-resolver";
import { useTenant } from "@/hooks/use-tenant";

interface ResolvedImageProps {
  category: MediaCategory;
  /** services.id / portfolio.id / tenant_certifications.id when relevant */
  targetId?: string | null;
  /** Used when neither tenant nor template provides an alt text */
  altFallback?: string;
  className?: string;
  loading?: "lazy" | "eager";
  /** Optional explicit URL override — when provided, skips the resolver entirely.
   *  Useful for logos that are still stored on site_settings during transition. */
  overrideUrl?: string | null;
  overrideAlt?: string | null;
}

export function ResolvedImage({
  category,
  targetId,
  altFallback,
  className,
  loading = "lazy",
  overrideUrl,
  overrideAlt,
}: ResolvedImageProps) {
  const { tenant } = useTenant();
  const resolved = useResolvedMedia({
    tenantId: tenant?.id ?? null,
    tradeTemplateId: tenant?.trade_template_id ?? null,
    category,
    targetId: targetId ?? null,
    altFallback: altFallback ?? null,
  });

  const url = overrideUrl ?? resolved.url;
  const alt = overrideAlt ?? resolved.alt ?? altFallback ?? "";

  return <img src={url} alt={alt} className={className} loading={loading} />;
}

/**
 * Variant that exposes the resolved URL via render prop — for cases where
 * the image is set as a CSS background (e.g. Hero with overlay).
 */
export function useResolvedImageUrl(
  category: MediaCategory,
  targetId?: string | null,
  altFallback?: string,
) {
  const { tenant } = useTenant();
  return useResolvedMedia({
    tenantId: tenant?.id ?? null,
    tradeTemplateId: tenant?.trade_template_id ?? null,
    category,
    targetId: targetId ?? null,
    altFallback: altFallback ?? null,
  });
}
