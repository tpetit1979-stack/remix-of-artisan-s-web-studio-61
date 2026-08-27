// Provisions the artisan's login for a tenant, triggered explicitly by a
// Super Admin from that tenant's own fiche (never a free-typed tenant_id —
// enforced by the caller UI, not by this function alone).
//
// This is the ONLY step in tenant provisioning that genuinely requires the
// service role: creating/inviting an Auth user. Writing tenant_members and
// user_roles is already permitted for a super_admin by existing RLS
// policies (super_admin_manage_members / super_admin_manage_roles) — this
// function does those writes too, for a single atomic call from the UI,
// but doesn't need elevated privilege to do so.
//
// Order of operations matters: the Auth step runs first. If it fails,
// nothing else has been written. If Auth succeeds but a later step fails,
// the Auth user is left without a completed tenant_members/user_roles
// link — a partial, recoverable state, not an "orphan" in the sense of
// something unrecoverable: re-running this function with the same email
// is safe, inviteUserByEmail() reports "already exists", the function
// recovers the existing user via findUserByEmail() and redoes the upserts.
//
// Operational model today is "one artisan = one tenant": an existing
// tenant_admin already belonging to a DIFFERENT tenant is refused outright
// (decideTenantMembership below) — a Super Admin's email typo must never
// silently grant access to a second company's data. Mirrors the pure
// decision function in src/lib/tenant-provisioning.ts (kept in sync by
// hand, not imported — this runs on Deno, that file pulls in the browser
// Supabase client).
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

/**
 * Finds an existing Auth user by email. The Admin API in the version this
 * repo is pinned to (@supabase/supabase-js@^2.103.2 → @supabase/auth-js's
 * GoTrueAdminApi, verified directly against the installed type
 * definitions before writing this) has no getUserByEmail() — listUsers()
 * with pagination is the only available method. `nextPage` is the loop's
 * real termination signal (null once exhausted), not an assumption that
 * the first page is enough.
 */
async function findUserByEmail(
  // deno-lint-ignore no-explicit-any
  adminClient: any,
  email: string,
) {
  const target = email.trim().toLowerCase();
  let page = 1;
  for (;;) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find(
      (u: { email?: string }) => u.email?.trim().toLowerCase() === target,
    );
    if (found) return found;
    if (data.nextPage === null) return null;
    page = data.nextPage;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json(401, { error: "missing_authorization" });

  // Client scoped to the CALLER's own JWT — used only to verify who is
  // calling. Never used for the privileged writes below.
  const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user: caller }, error: callerErr } = await callerClient.auth.getUser();
  if (callerErr || !caller) return json(401, { error: "invalid_session" });

  // Explicit server-side check — never trust a role claimed by the client.
  const { data: callerRole } = await callerClient
    .from("user_roles")
    .select("role")
    .eq("user_id", caller.id)
    .maybeSingle();
  if (callerRole?.role !== "super_admin") {
    return json(403, { error: "forbidden", detail: "super_admin role required" });
  }

  let body: { tenant_id?: string; email?: string; redirect_to?: string };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }
  const tenantId = body.tenant_id?.trim();
  const email = body.email?.trim();
  const redirectTo = body.redirect_to?.trim() || undefined;
  if (!tenantId || !email) {
    return json(400, { error: "tenant_id and email are required" });
  }

  // Privileged client — created only now, after the super_admin check above.
  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: tenant, error: tenantErr } = await adminClient
    .from("tenants")
    .select("id")
    .eq("id", tenantId)
    .maybeSingle();
  if (tenantErr) return json(500, { error: "tenant_lookup_failed", detail: tenantErr.message });
  if (!tenant) return json(404, { error: "tenant_not_found" });

  let userId: string;
  let status: "invited" | "existing_account";

  const { data: inviteData, error: inviteErr } = await adminClient.auth.admin.inviteUserByEmail(email, {
    redirectTo,
  });
  if (inviteErr) {
    const alreadyExists =
      inviteErr.status === 422 || /already registered|already exists/i.test(inviteErr.message);
    if (!alreadyExists) {
      return json(500, { error: "invite_failed", detail: inviteErr.message });
    }
    const existing = await findUserByEmail(adminClient, email);
    if (!existing) {
      // Auth says this email is taken, but listUsers() couldn't locate it —
      // surface this loudly rather than silently giving up or risking a
      // duplicate account.
      return json(500, {
        error: "inconsistent_state",
        detail: "Auth reports this email already exists, but it could not be located via listUsers().",
      });
    }
    userId = existing.id;
    status = "existing_account";
  } else {
    userId = inviteData.user.id;
    status = "invited";
  }

  // Refuse to silently overwrite a different existing role — user_roles has
  // a UNIQUE(user_id) constraint, so an upsert would otherwise clobber it.
  const { data: existingRole } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  if (existingRole && existingRole.role !== "tenant_admin") {
    return json(409, {
      error: "role_conflict",
      detail: `This email is already associated with role "${existingRole.role}".`,
    });
  }

  // Refuse to attach an existing tenant_admin to a SECOND tenant — see the
  // header comment. No write happens below this point in that case.
  const { data: existingMemberships } = await adminClient
    .from("tenant_members")
    .select("tenant_id")
    .eq("user_id", userId);
  const otherMembership = (existingMemberships ?? []).find((m) => m.tenant_id !== tenantId);
  if (otherMembership) {
    const { data: otherTenant } = await adminClient
      .from("tenants")
      .select("company_name")
      .eq("id", otherMembership.tenant_id)
      .maybeSingle();
    return json(409, {
      error: "other_tenant",
      detail: `This email is already the admin of another tenant (${otherTenant?.company_name ?? otherMembership.tenant_id}). An artisan can only administer one tenant today.`,
    });
  }

  const { error: memberErr } = await adminClient
    .from("tenant_members")
    .upsert({ tenant_id: tenantId, user_id: userId }, { onConflict: "user_id,tenant_id" });
  if (memberErr) return json(500, { error: "membership_failed", detail: memberErr.message });

  const { error: roleErr } = await adminClient
    .from("user_roles")
    .upsert({ user_id: userId, role: "tenant_admin" }, { onConflict: "user_id" });
  if (roleErr) return json(500, { error: "role_assignment_failed", detail: roleErr.message });

  return json(200, { status, user_id: userId });
});
