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

/**
 * How a tenant wants its team presented publicly -- an explicit choice,
 * never deduced from the active member count (see
 * docs/product/execution-backlog.md, Lot 2 révisé, and Constitution
 * principle 2: propriété non ambiguë). `null` means "not yet arbitrated" --
 * a distinct state from `hidden`, not a synonym for it.
 *
 * Locked to super_admin at the database level (trg_site_settings_team_
 * presentation_mode_locked, covering INSERT and UPDATE) -- writing here as
 * tenant_admin fails at the database, this function does not re-enforce it.
 */
export type TeamPresentationMode = "artisan" | "company" | "hidden" | null;

export async function updateTeamPresentationMode(tenantId: string, mode: TeamPresentationMode) {
  const { error } = await supabase
    .from("site_settings")
    .update({ team_presentation_mode: mode })
    .eq("tenant_id", tenantId);
  if (error) throw error;
}

export interface TeamPresentation {
  visible: boolean;
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Members to render, in display order. Empty when `visible` is false. */
  membersToShow: TeamMember[];
  layout: "solo" | "grid";
}

const HIDDEN: TeamPresentation = {
  visible: false,
  eyebrow: "",
  title: "",
  subtitle: "",
  membersToShow: [],
  layout: "grid",
};

/**
 * Pure resolution of the public team section from the tenant's explicit mode
 * and its currently active members. No inference from the member count --
 * `activeMembers` only decides whether there is anything to render at all,
 * and (in `artisan` mode with several active members) which one to show.
 *
 * `mode` is `null` ("not yet arbitrated") or `hidden` (an explicit choice) ->
 * both render as fully hidden, but callers who need to tell them apart (the
 * Super Admin reconciliation alert) must read `mode` directly, not this
 * function's output -- `visible: false` alone does not say why.
 */
export function resolveTeamPresentation(
  mode: TeamPresentationMode,
  activeMembers: TeamMember[],
): TeamPresentation {
  if (mode === null || mode === "hidden" || activeMembers.length === 0) {
    return HIDDEN;
  }

  if (mode === "artisan") {
    const sorted = [...activeMembers].sort((a, b) => a.sort_order - b.sort_order);
    return {
      visible: true,
      eyebrow: "À propos",
      title: "Votre artisan",
      subtitle: "Découvrez la personne qui met son savoir-faire au service de vos projets.",
      membersToShow: [sorted[0]],
      layout: "solo",
    };
  }

  // mode === "company"
  return {
    visible: true,
    eyebrow: "Qui sommes-nous ?",
    title: "L'entreprise",
    subtitle: "Un savoir-faire au service de vos projets.",
    membersToShow: activeMembers,
    layout: "grid",
  };
}
