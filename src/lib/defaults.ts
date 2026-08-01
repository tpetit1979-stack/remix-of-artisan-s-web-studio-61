/**
 * Visual fallbacks per trade / service.
 * Used until tenants upload their own hero image, service photos,
 * or fill years_experience. Keeps every tenant looking pro on day 1.
 *
 * Keyed by stable slugs (trade_template.slug, service.slug).
 * Add a new entry whenever a new trade/service is supported.
 */

/**
 * Last-resort hero fallback. MUST be a construction/craftsman scene
 * (never an office, code, or generic stock image). Used only when the
 * trade slug is unknown — e.g. tenant has no trade_template assigned.
 */
const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80";

export const TRADE_HERO_DEFAULTS: Record<string, string> = {
  "installateur-enr":
    "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1600&q=80",
  photovoltaique:
    "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1600&q=80",
  energeticien:
    "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1600&q=80",
  chauffagiste:
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1600&q=80",
  cvc:
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1600&q=80",
  climatisation:
    "https://images.unsplash.com/photo-1631545308456-9e918e9c5c52?auto=format&fit=crop&w=1600&q=80",
  ventilation:
    "https://images.unsplash.com/photo-1631545308456-9e918e9c5c52?auto=format&fit=crop&w=1600&q=80",
  "pompes-a-chaleur":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1600&q=80",
  frigoriste:
    "https://images.unsplash.com/photo-1631545308456-9e918e9c5c52?auto=format&fit=crop&w=1600&q=80",
  electricien:
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1600&q=80",
  electricite:
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1600&q=80",
  plombier:
    "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=1600&q=80",
  plomberie:
    "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=1600&q=80",
  ramoneur:
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=80",
  "poeles-cheminees":
    "https://images.unsplash.com/photo-1601342630314-8427c38bf5e6?auto=format&fit=crop&w=1600&q=80",
  serrurerie:
    "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=1600&q=80",
  "serrurerie-metallerie":
    "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=1600&q=80",
  couverture:
    "https://images.unsplash.com/photo-1632759145355-8b8f3f2a7e6e?auto=format&fit=crop&w=1600&q=80",
  maconnerie:
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80",
  charpente:
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80",
  carrelage:
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
  "menuiserie-agencement":
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1600&q=80",
  peinture:
    "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1600&q=80",
  peintre:
    "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1600&q=80",
  "plaquiste-isolation":
    "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1600&q=80",
  cuisiniste:
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1600&q=80",
  pisciniste:
    "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=1600&q=80",
  paysagiste:
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1600&q=80",
  "multi-services":
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80",
  "tous-corps-etat":
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80",
};

export function getDefaultHeroForTrade(tradeSlug?: string | null): string {
  if (!tradeSlug) return FALLBACK_HERO;
  return TRADE_HERO_DEFAULTS[tradeSlug] ?? FALLBACK_HERO;
}

const FALLBACK_SERVICE =
  "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80";

/**
 * Service image defaults keyed by service.slug.
 * Matches the slugs seeded in trade_service_templates.
 */
export const SERVICE_IMAGE_DEFAULTS: Record<string, string> = {
  // ENR
  "panneaux-solaires-photovoltaiques":
    "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80",
  "panneaux-photovoltaiques":
    "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80",
  "pompe-a-chaleur-air-eau":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80",
  "pompe-a-chaleur":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80",
  "chauffe-eau-thermodynamique":
    "https://images.unsplash.com/photo-1622219809260-ce065fc5277f?auto=format&fit=crop&w=1200&q=80",
  "ballon-thermodynamique":
    "https://images.unsplash.com/photo-1622219809260-ce065fc5277f?auto=format&fit=crop&w=1200&q=80",
  // Chauffagiste
  chaudiere:
    "https://images.unsplash.com/photo-1567769541495-138f4ea73f7e?auto=format&fit=crop&w=1200&q=80",
  "chaudiere-gaz":
    "https://images.unsplash.com/photo-1567769541495-138f4ea73f7e?auto=format&fit=crop&w=1200&q=80",
  // Électricien
  "tableau-electrique":
    "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80",
  "borne-de-recharge":
    "https://images.unsplash.com/photo-1647500666543-c2d0bc8c4203?auto=format&fit=crop&w=1200&q=80",
  // Plombier
  "salle-de-bain":
    "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=80",
  // Ramoneur
  ramonage:
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
};

export function getDefaultServiceImage(serviceSlug: string): string {
  return SERVICE_IMAGE_DEFAULTS[serviceSlug] ?? FALLBACK_SERVICE;
}

/**
 * Suggested primary color per trade slug.
 * Applied at onboarding when the artisan hasn't picked a brand color.
 * Avoids the generic "blue SaaS" look that fights against the trade identity
 * (orange = feu/chaleur, green = ENR, etc.).
 */
export const TRADE_PRIMARY_COLOR_DEFAULTS: Record<string, string> = {
  "installateur-enr": "#16a34a",
  photovoltaique: "#16a34a",
  energeticien: "#16a34a",
  chauffagiste: "#ea580c",
  cvc: "#ea580c",
  "pompes-a-chaleur": "#0ea5e9",
  climatisation: "#0ea5e9",
  ventilation: "#0ea5e9",
  frigoriste: "#0ea5e9",
  electricien: "#eab308",
  electricite: "#eab308",
  "courant-faible-automatisme": "#eab308",
  plombier: "#0891b2",
  plomberie: "#0891b2",
  ramoneur: "#78350f",
  "poeles-cheminees": "#b91c1c",
  serrurerie: "#475569",
  "serrurerie-metallerie": "#475569",
  couverture: "#7c2d12",
  maconnerie: "#78716c",
  charpente: "#78350f",
  carrelage: "#0f766e",
  "menuiserie-agencement": "#92400e",
  peinture: "#7c3aed",
  peintre: "#7c3aed",
  "plaquiste-isolation": "#64748b",
  cuisiniste: "#b45309",
  pisciniste: "#0284c7",
  paysagiste: "#15803d",
  "multi-services": "#2563eb",
  "tous-corps-etat": "#2563eb",
};

export function getDefaultPrimaryColorForTrade(tradeSlug?: string | null): string {
  if (!tradeSlug) return "#2563eb";
  return TRADE_PRIMARY_COLOR_DEFAULTS[tradeSlug] ?? "#2563eb";
}
