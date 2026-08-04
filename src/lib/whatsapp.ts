/**
 * WhatsApp click-to-chat — thin wrapper around the public wa.me link format.
 * No API key, no third-party script: https://wa.me/<digits>?text=<url-encoded>
 */

/**
 * Normalizes a phone number into the digits-only, country-code-prefixed
 * format wa.me expects. Handles the common French input shapes:
 *  - "06 12 34 56 78" / "0612345678"  → "33612345678" (local → international, trunk 0 dropped)
 *  - "+33 6 12 34 56 78" / "0033..."  → "33612345678" (already international)
 * Any other input is returned digit-stripped as-is (best effort, not validated).
 */
export function normalizeWhatsAppNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 10) return `33${digits.slice(1)}`;
  if (digits.startsWith("0033")) return digits.slice(2);
  return digits;
}

const DEFAULT_MESSAGE = "Bonjour, je vous contacte depuis votre site. Voici mon besoin :";

export function buildWhatsAppUrl(number: string, message?: string | null): string {
  const digits = normalizeWhatsAppNumber(number);
  const text = (message?.trim() || DEFAULT_MESSAGE).slice(0, 500);
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
