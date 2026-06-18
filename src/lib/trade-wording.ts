/**
 * Front-only display wording overrides for trade templates.
 * The DB stays canonical (e.g. slug "poeles-cheminees" / name "Poêles & Cheminées"),
 * but the public site / onboarding can show a more conversion-oriented label
 * such as "Installateur de poêles à granulés / bois & cheminées".
 *
 * Keep this file the single source of truth for trade wording on the front.
 * Do NOT special-case wording inside components.
 */

type TradeWording = {
  /** Long, conversion-oriented label for hero/SEO copy. */
  display: string;
  /** Short label used in pickers/badges. Falls back to DB name when omitted. */
  short?: string;
  /** Person noun, e.g. "installateur de poêles à granulés". */
  professional?: string;
  /** Tagline used as default hero subtitle when none is set. */
  tagline?: string;
};

const TRADE_WORDING: Record<string, TradeWording> = {
  "poeles-cheminees": {
    display: "Installateur poêles & cheminées",
    short: "Poêles & cheminées",
    professional: "installateur de poêles à granulés / bois",
    tagline:
      "Installation et entretien de poêles à granulés, poêles à bois, inserts et cheminées.",
  },
  ramoneur: {
    display: "Ramoneur certifié",
    professional: "ramoneur",
    tagline: "Ramonage, entretien et débistrage de vos conduits.",
  },
  chauffagiste: {
    display: "Chauffagiste",
    professional: "chauffagiste",
    tagline: "Installation, entretien et dépannage de votre chauffage.",
  },
  photovoltaique: {
    display: "Installateur photovoltaïque",
    short: "Photovoltaïque",
    professional: "installateur photovoltaïque",
    tagline: "Panneaux solaires, autoconsommation et batteries de stockage.",
  },
  "pompes-a-chaleur": {
    display: "Installateur pompes à chaleur",
    short: "Pompes à chaleur",
    professional: "installateur de pompes à chaleur",
    tagline: "PAC air/eau, air/air et géothermie : étude, pose, entretien.",
  },
  cvc: {
    display: "Spécialiste CVC",
    short: "CVC",
    professional: "technicien CVC",
    tagline: "Chauffage, ventilation et climatisation pour particuliers et pros.",
  },
  climatisation: {
    display: "Climaticien",
    professional: "climaticien",
    tagline: "Installation et entretien de climatisations réversibles.",
  },
  ventilation: {
    display: "Spécialiste ventilation",
    professional: "spécialiste ventilation",
    tagline: "VMC simple/double flux et qualité de l'air intérieur.",
  },
  frigoriste: {
    display: "Frigoriste",
    professional: "frigoriste",
    tagline: "Installation et maintenance d'équipements frigorifiques.",
  },
  energeticien: {
    display: "Énergéticien",
    professional: "énergéticien",
    tagline: "Audit, rénovation énergétique et solutions bas carbone.",
  },
  plombier: {
    display: "Plombier",
    professional: "plombier",
  },
  plomberie: {
    display: "Plomberie",
    professional: "plombier",
  },
  electricien: {
    display: "Électricien",
    professional: "électricien",
  },
  electricite: {
    display: "Électricité",
    professional: "électricien",
  },
  serrurerie: {
    display: "Serrurier",
    professional: "serrurier",
  },
  "serrurerie-metallerie": {
    display: "Serrurier / Métallier",
    short: "Serrurerie / Métallerie",
    professional: "serrurier-métallier",
  },
  couverture: {
    display: "Couvreur",
    professional: "couvreur",
  },
  maconnerie: {
    display: "Maçon",
    professional: "maçon",
  },
  charpente: {
    display: "Charpentier",
    professional: "charpentier",
  },
  carrelage: {
    display: "Carreleur",
    professional: "carreleur",
  },
  "menuiserie-agencement": {
    display: "Menuisier / Agenceur",
    short: "Menuiserie & Agencement",
    professional: "menuisier",
  },
  peinture: { display: "Peintre", professional: "peintre" },
  peintre: { display: "Peintre", professional: "peintre" },
  "plaquiste-isolation": {
    display: "Plaquiste / Isolation",
    short: "Plaquiste",
    professional: "plaquiste",
  },
  cuisiniste: { display: "Cuisiniste", professional: "cuisiniste" },
  "courant-faible-automatisme": {
    display: "Courant faible & automatisme",
    short: "Courant faible",
  },
  "multi-services": {
    display: "Multi-services bâtiment",
    short: "Multi-services",
  },
  sav: { display: "Service après-vente", short: "SAV" },
  "lutte-nuisibles": {
    display: "Lutte contre les nuisibles",
    short: "Nuisibles",
  },
  "tous-corps-etat": {
    display: "Entreprise tous corps d'état",
    short: "Tous corps d'état",
  },
  pisciniste: { display: "Pisciniste", professional: "pisciniste" },
  paysagiste: { display: "Paysagiste", professional: "paysagiste" },
  "tpe-pme": { display: "TPE / PME du bâtiment", short: "TPE / PME" },
  "auto-entrepreneur": {
    display: "Auto-entrepreneur du bâtiment",
    short: "Auto-entrepreneur",
  },
};

export function getTradeDisplayName(
  slug: string | null | undefined,
  fallbackName?: string | null
): string {
  if (!slug) return fallbackName ?? "Artisan";
  return TRADE_WORDING[slug]?.display ?? fallbackName ?? slug;
}

export function getTradeShortName(
  slug: string | null | undefined,
  fallbackName?: string | null
): string {
  if (!slug) return fallbackName ?? "";
  return TRADE_WORDING[slug]?.short ?? fallbackName ?? slug;
}

export function getTradeProfessional(
  slug: string | null | undefined,
  fallbackName?: string | null
): string {
  if (!slug) return fallbackName ?? "artisan";
  return (
    TRADE_WORDING[slug]?.professional ??
    fallbackName?.toLowerCase() ??
    slug
  );
}

export function getTradeTagline(
  slug: string | null | undefined
): string | null {
  if (!slug) return null;
  return TRADE_WORDING[slug]?.tagline ?? null;
}
