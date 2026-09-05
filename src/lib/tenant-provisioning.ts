import { supabase } from "@/integrations/supabase/client";
import { getPlatformOrigin } from "@/lib/platform-url";

export type AccountStatus = "prêt" | "invitation envoyée" | "aucun compte";
export type DomainStatus = "configuré" | "à vérifier";

export interface TenantProvisioningStatus {
  compte: AccountStatus;
  domaine: DomainStatus;
}

/**
 * Recomputed on demand, never cached in a DB column — derived from the same
 * facts every time (auth/tenant_members/user_roles, the domain field), so
 * it can never go stale relative to reality. Same principle already used
 * by hasPublishedPortfolioItem().
 *
 * Deliberately separate states, not one merged boolean — "compte prêt" and
 * "site prêt" answer different questions and shouldn't be conflated.
 *
 * No "contenu" field here: the header's existing completion badges already
 * show a "Services" indicator built on the exact same fact (at least one
 * active service) — a second badge here would just duplicate it, not add
 * information. "Recette humaine" is absent for the same reason it can't be
 * a field here at all: it can't be derived from data, only a person can
 * confirm it — it's rendered as a static label, never implied as verified.
 */
export async function checkTenantProvisioningStatus(tenantId: string): Promise<TenantProvisioningStatus> {
  const [{ data: tenant }, { data: members }] = await Promise.all([
    supabase.from("tenants").select("domain").eq("id", tenantId).maybeSingle(),
    supabase.from("tenant_members").select("user_id").eq("tenant_id", tenantId),
  ]);

  let compte: AccountStatus = "aucun compte";
  if (members && members.length > 0) {
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .in("user_id", members.map((m) => m.user_id))
      .eq("role", "tenant_admin");
    compte = roles && roles.length > 0 ? "prêt" : "invitation envoyée";
  }

  return {
    compte,
    domaine: tenant?.domain?.trim() ? "configuré" : "à vérifier",
  };
}

export type MembershipDecision =
  | { kind: "allow"; reason: "new_user" | "already_member" }
  | { kind: "deny"; reason: "role_conflict"; existingRole: string }
  | { kind: "deny"; reason: "other_tenant"; otherTenantId: string };

/**
 * Pure decision for whether an existing Auth user may be attached to the
 * requested tenant — kept separate from any I/O so it can be tested without
 * mocking Supabase, same convention as portfolio.ts/access-guard.ts in this
 * repo. Mirrored (not imported — the Edge Function runs on Deno, this file
 * imports the browser Supabase client) inside invite-tenant-admin/index.ts;
 * keep both in sync if this logic changes.
 *
 * Today's operational model is "one artisan = one tenant" — a user already
 * a member of a DIFFERENT tenant is refused outright, no override offered.
 * If that model ever changes, this is the one place to revisit.
 */
export function decideTenantMembership(input: {
  tenantId: string;
  existingRole: string | null;
  existingMemberships: { tenant_id: string }[];
}): MembershipDecision {
  if (input.existingRole && input.existingRole !== "tenant_admin") {
    return { kind: "deny", reason: "role_conflict", existingRole: input.existingRole };
  }
  const otherMembership = input.existingMemberships.find((m) => m.tenant_id !== input.tenantId);
  if (otherMembership) {
    return { kind: "deny", reason: "other_tenant", otherTenantId: otherMembership.tenant_id };
  }
  return {
    kind: "allow",
    reason: input.existingMemberships.length > 0 ? "already_member" : "new_user",
  };
}

export interface InviteTenantAdminResult {
  status: "invited" | "existing_account";
  user_id: string;
}

/**
 * Calls the invite-tenant-admin Edge Function — the only step that needs
 * the service role (Auth user creation/invite). Everything else that
 * function does (tenant_members, user_roles) is already permitted for a
 * super_admin by RLS; it's bundled there as a single provisioning operation
 * from this one explicit action, not because it requires elevated privilege.
 * Not atomic in the transactional sense — see the Edge Function's own
 * header comment for the invite/membership/role sequence and its partial-
 * failure behavior.
 *
 * redirect_to targets /accept-invite (not /update-password — that route is
 * reserved for resetPasswordForEmail(); see update-password.tsx), built via
 * getPlatformOrigin() (src/lib/platform-url.ts) — the single source of
 * truth shared with forgot-password.tsx, so the invite link and the reset
 * link are always built the same way and never from a tenant's own domain.
 * Must be allow-listed in Supabase Dashboard → Authentication → URL
 * Configuration → Redirect URLs. Never a tenant's own domain by design —
 * /super-admin/* never resolves a tenant by hostname either (see
 * docs/product/objects/domaine.md).
 */
export async function inviteTenantAdmin(tenantId: string, email: string): Promise<InviteTenantAdminResult> {
  const origin = getPlatformOrigin();
  const redirectTo = origin ? `${origin}/accept-invite` : undefined;
  const { data, error } = await supabase.functions.invoke("invite-tenant-admin", {
    body: { tenant_id: tenantId, email, redirect_to: redirectTo },
  });
  if (error) {
    // FunctionsHttpError (non-2xx response) carries the real Response as
    // `context` — the function's own { error, detail } JSON body is only
    // reachable there, never on `error.message` (which is just a generic
    // "Edge Function returned a non-2xx status code").
    const context = (error as { context?: Response }).context;
    let detail: string | undefined;
    if (context && typeof context.json === "function") {
      try {
        const body = (await context.json()) as { error?: string; detail?: string };
        detail = body.detail ?? body.error;
      } catch {
        // Body wasn't JSON or already consumed — no detail to extract.
      }
    }
    throw new Error(detail ?? error.message);
  }
  return data as InviteTenantAdminResult;
}
