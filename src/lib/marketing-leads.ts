import type { Tables } from "@/integrations/supabase/types";

/**
 * Règles pures de la boîte de réception des demandes.
 *
 * Séparées de l'écran pour la même raison que `supordo-lead.ts` : ce sont
 * les règles qu'on veut pouvoir vérifier sans navigateur ni base.
 */
export type MarketingLead = Tables<"marketing_leads">;

/**
 * Les trois statuts existaient déjà en base avant ce lot — contrainte
 * `marketing_leads_status_check`, vérifiée : `new | contacted | closed`. Rien
 * n'est inventé ici, et surtout pas un pipeline commercial complet : la
 * colonne était simplement écrite par défaut et lue par personne.
 */
export const LEAD_STATUSES = ["new", "contacted", "closed"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new: "À traiter",
  contacted: "Contacté",
  closed: "Clos",
};

/**
 * Les transitions autorisées.
 *
 * Volontairement permissif dans les deux sens : une demande marquée
 * « contacté » par erreur doit pouvoir revenir à « à traiter », sinon la
 * boîte devient un piège. Le seul interdit est la transition vers soi-même,
 * qui ne produirait qu'une écriture inutile.
 */
export function canTransition(from: LeadStatus, to: LeadStatus): boolean {
  return from !== to;
}

/**
 * Traduit l'origine technique en français lisible.
 *
 * `example.toitures-durand` et `trade.couvreur` gardent leur slug : c'est
 * l'information utile — savoir que la demande vient de la page couvreur vaut
 * mieux que de lire « une page métier ».
 */
export function formatLeadSource(source: string): string {
  const labels: Record<string, string> = {
    home: "Page d'accueil",
    pricing: "Tarifs",
    how_it_works: "Comment ça marche",
    examples: "Exemples",
    trades: "Métiers",
    header: "En-tête",
    footer: "Pied de page",
    confirmation: "Confirmation",
    direct: "Accès direct",
    start: "Accès direct (ancienne valeur)",
  };
  if (labels[source]) return labels[source]!;
  const separator = source.indexOf(".");
  if (separator === -1) return source;
  const surface = source.slice(0, separator);
  const slug = source.slice(separator + 1);
  if (surface === "example") return `Exemple · ${slug}`;
  if (surface === "trade") return `Métier · ${slug}`;
  return source;
}

/** Le nom affiché d'une demande, jamais vide. */
export function leadDisplayName(lead: Pick<MarketingLead, "first_name" | "last_name">): string {
  return `${lead.first_name} ${lead.last_name}`.trim();
}

/**
 * Compte les demandes par origine.
 *
 * C'est toute la « mesure » de ce lot : pas de tableau de bord, pas de
 * graphique, pas de fournisseur. La colonne `source` devient exploitable,
 * donc la question « combien de demandes, depuis quelle page » se répond en
 * regardant la liste.
 */
export function countBySource(leads: readonly MarketingLead[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const lead of leads) counts.set(lead.source, (counts.get(lead.source) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}
