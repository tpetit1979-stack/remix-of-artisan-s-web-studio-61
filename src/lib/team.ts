import { supabase } from "@/integrations/supabase/client";

/**
 * Team members feature.
 *
 * Table `tenant_team_members` is created by a manual migration that the
 * operator applies separately. Until the generated Supabase types catch up,
 * we use a local interface and a `from()` cast through `unknown` so the rest
 * of the app stays strictly typed.
 */
export interface TeamMember {
  id: string;
  tenant_id: string;
  full_name: string;
  role_title: string;
  photo_url: string | null;
  storage_path: string | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tbl = () => (supabase as any).from("tenant_team_members");

export async function fetchTeamMembers(tenantId: string): Promise<TeamMember[]> {
  const { data, error } = await tbl()
    .select("*")
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as TeamMember[];
}

export async function fetchActiveTeamMembers(tenantId: string): Promise<TeamMember[]> {
  const { data, error } = await tbl()
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as TeamMember[];
}

export async function insertTeamMember(input: Omit<TeamMember, "id" | "created_at" | "updated_at">) {
  const { error } = await tbl().insert(input);
  if (error) throw error;
}

export async function updateTeamMember(id: string, patch: Partial<TeamMember>) {
  const { error } = await tbl().update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteTeamMember(id: string) {
  const { error } = await tbl().delete().eq("id", id);
  if (error) throw error;
}
