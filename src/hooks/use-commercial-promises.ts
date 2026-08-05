import { useTenant } from "@/hooks/use-tenant";
import { resolveCommercialPromises, type ResolvedCommercialPromises } from "@/lib/commercial-promises";

/**
 * Single source of every commercial-promise string shown on the public
 * site (button labels, banner heading/subtitle, FAQ, SEO suffix). Reads
 * only the tenant's confirmed facts from site_settings — never infers a
 * promise from cta_text wording. Public components should read from this
 * hook instead of deciding locally.
 */
export function useCommercialPromises(): ResolvedCommercialPromises {
  const { settings } = useTenant();
  return resolveCommercialPromises({
    quoteIsFree: settings?.quote_is_free ?? null,
    quoteResponseDelayHours: settings?.quote_response_delay_hours ?? null,
    emergencyServiceAvailable: settings?.emergency_service_available ?? null,
    ctaText: settings?.cta_text ?? null,
  });
}
