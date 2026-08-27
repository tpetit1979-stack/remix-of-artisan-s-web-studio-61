/**
 * Single source of truth for the platform's own origin — used to build
 * redirect_to for every back-office Auth flow (invite, password reset), so
 * none of them can ever be built from a tenant's own domain. Authentication
 * belongs to the Lignia platform, never to an artisan's public site.
 *
 * Fails closed in production if VITE_PLATFORM_URL is missing, rather than
 * silently falling back to window.location.origin — a production Auth link
 * must never accidentally point at wherever the browser happens to be (a
 * tenant domain, a preview origin). import.meta.env.PROD is Vite's own
 * build-mode flag — no new environment/staging concept introduced here.
 * Dev/preview fall back to window.location.origin, unchanged.
 *
 * Future improvement, not implemented here (would need Dashboard email
 * template changes + a new confirmation route, out of scope for this
 * stabilization pass): Supabase's token_hash + type + verifyOtp() pattern
 * gives an explicit, SDK-native 'invite' vs 'recovery' signal and removes
 * the onAuthStateChange race entirely — see the audit for this lot.
 */
export function getPlatformOrigin(): string | undefined {
  const platformUrl = (import.meta.env.VITE_PLATFORM_URL as string | undefined)?.trim();
  if (import.meta.env.PROD && !platformUrl) {
    throw new Error(
      "VITE_PLATFORM_URL n'est pas configuré — impossible de générer un lien d'authentification stable en production.",
    );
  }
  return platformUrl || (typeof window !== "undefined" ? window.location.origin : undefined);
}
