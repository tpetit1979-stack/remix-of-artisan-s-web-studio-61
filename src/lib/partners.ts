import { supabase } from "@/integrations/supabase/client";

/**
 * Partner logos feature (tenant_partners table).
 * Types not yet in generated Supabase types — casts through unknown/any.
 */
export interface Partner {
  id: string;
  tenant_id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tbl = () => (supabase as any).from("tenant_partners");

export async function fetchPartners(tenantId: string): Promise<Partner[]> {
  const { data, error } = await tbl()
    .select("*")
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Partner[];
}

export async function fetchActivePartners(tenantId: string): Promise<Partner[]> {
  const { data, error } = await tbl()
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Partner[];
}

export async function insertPartner(input: Omit<Partner, "id" | "created_at" | "updated_at">) {
  const { error } = await tbl().insert(input);
  if (error) throw error;
}

export async function updatePartner(id: string, patch: Partial<Partner>) {
  const { error } = await tbl().update(patch).eq("id", id);
  if (error) throw error;
}

export async function deletePartner(id: string) {
  const { error } = await tbl().delete().eq("id", id);
  if (error) throw error;
}

export async function reorderPartners(ids: string[]) {
  // Bulk update sort_order — one update per row (Postgrest has no bulk upsert-by-id for partial rows).
  await Promise.all(
    ids.map((id, index) => tbl().update({ sort_order: index }).eq("id", id)),
  );
}
