// Explicit auth check, modeled verbatim on the pattern already deployed in
// supabase/functions/google-places/index.ts — never rely solely on the
// platform's verify_jwt gate for the role check, only for the "is there a
// JWT at all" check.

import { createClient } from "npm:@supabase/supabase-js@2";

export type AuthResult =
  | { ok: true }
  | { ok: false; code: "UNAUTHORIZED" | "FORBIDDEN" | "DATABASE_ERROR"; message: string };

/** The minimal slice of the supabase-js client verifySuperAdmin actually
 * uses. Narrowed to this shape (rather than injecting the whole client)
 * so tests can supply a fake without pulling in supabase-js or a network
 * call — this is a single, targeted seam for the 401/403 unit tests the
 * spec asks for, not a general test harness. */
export interface AuthClient {
  auth: { getUser(): Promise<{ data: { user: unknown } | null; error: unknown }> };
  // supabase-js's real .rpc() returns a thenable query builder, not a
  // Promise — PromiseLike is the structural type both it and a plain fake
  // client satisfy.
  rpc(fn: "is_super_admin"): PromiseLike<{ data: boolean | null; error: unknown }>;
}

function defaultBuildClient(authHeader: string): AuthClient | null {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
}

export async function verifySuperAdmin(
  req: Request,
  buildClient: (authHeader: string) => AuthClient | null = defaultBuildClient,
): Promise<AuthResult> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return { ok: false, code: "UNAUTHORIZED", message: "Authentification requise" };
  }

  const supabase = buildClient(authHeader);
  if (!supabase) {
    return { ok: false, code: "DATABASE_ERROR", message: "Configuration serveur invalide" };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return { ok: false, code: "UNAUTHORIZED", message: "Session invalide ou expirée" };
  }

  const { data: isSuperAdmin, error: roleError } = await supabase.rpc("is_super_admin");
  if (roleError) {
    return { ok: false, code: "DATABASE_ERROR", message: "Vérification du rôle impossible" };
  }
  if (!isSuperAdmin) {
    return { ok: false, code: "FORBIDDEN", message: "Réservé aux super-administrateurs" };
  }

  return { ok: true };
}
