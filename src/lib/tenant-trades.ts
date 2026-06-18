import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type TradeTemplate = Tables<"trade_templates">;
export type TradeServiceTemplate = Tables<"trade_service_templates">;
export type TenantTradeActivation = Tables<"tenant_trade_activations">;

/**
 * Pareto threshold: a service is considered "Pareto top" when its
 * priority_score is >= this value. Default seed gives top-5 scores 1..5.
 */
export const PARETO_MIN_SCORE = 1;

/**
 * Fetch all trade activations for a tenant with the joined trade template.
 * Source of truth for "what trades does this tenant do".
 */
export async function fetchTenantTradeActivations(tenantId: string) {
  const { data, error } = await supabase
    .from("tenant_trade_activations")
    .select("*, trade_templates(*)")
    .eq("tenant_id", tenantId)
    .order("is_primary", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Array<TenantTradeActivation & { trade_templates: TradeTemplate | null }>;
}

/**
 * Fetch the Pareto-prioritized service templates for a given trade.
 * Sorted by priority_score DESC. If `limit` is given, returns only the top N.
 */
export async function fetchParetoServiceTemplates(
  tradeTemplateId: string,
  limit?: number
): Promise<TradeServiceTemplate[]> {
  let query = supabase
    .from("trade_service_templates")
    .select("*")
    .eq("trade_template_id", tradeTemplateId)
    .gte("priority_score", PARETO_MIN_SCORE)
    .order("priority_score", { ascending: false })
    .order("sort_order", { ascending: true });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/**
 * Fetch ALL service templates for one or many trades (Pareto + others),
 * sorted primarily by priority_score DESC then sort_order.
 */
export async function fetchServiceTemplatesForTrades(
  tradeTemplateIds: string[]
): Promise<TradeServiceTemplate[]> {
  if (tradeTemplateIds.length === 0) return [];
  const { data, error } = await supabase
    .from("trade_service_templates")
    .select("*")
    .in("trade_template_id", tradeTemplateIds)
    .order("priority_score", { ascending: false })
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/**
 * Insert tenant_trade_activations for a new tenant in one round-trip.
 * - One row per trade. Exactly one is_primary=true (the first id).
 * - The DB trigger keeps tenants.trade_template_id in sync.
 */
export async function activateTenantTrades(params: {
  tenantId: string;
  primaryTradeId: string;
  complementaryTradeIds: string[];
  source?: "onboarding" | "manual" | "import";
}) {
  const { tenantId, primaryTradeId, complementaryTradeIds, source = "onboarding" } = params;
  const rows = [
    { tenant_id: tenantId, trade_template_id: primaryTradeId, is_primary: true, source },
    ...complementaryTradeIds
      .filter((id) => id !== primaryTradeId)
      .map((id) => ({ tenant_id: tenantId, trade_template_id: id, is_primary: false, source })),
  ];
  const { error } = await supabase
    .from("tenant_trade_activations")
    .upsert(rows, { onConflict: "tenant_id,trade_template_id" });
  if (error) throw error;
}

/**
 * Switch the primary trade safely (RPC handles unset-then-set without
 * colliding with the partial unique index).
 */
export async function setPrimaryTrade(tenantId: string, tradeTemplateId: string) {
  const { error } = await supabase.rpc("set_primary_trade", {
    _tenant_id: tenantId,
    _trade_template_id: tradeTemplateId,
  });
  if (error) throw error;
}
