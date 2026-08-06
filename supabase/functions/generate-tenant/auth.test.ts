// Run with `deno test supabase/functions/generate-tenant/`.
//
// verifySuperAdmin takes an injectable buildClient so the 403/500 paths can
// be tested without a network call — the missing-Authorization-header case
// (401) doesn't even need that, it short-circuits before buildClient runs.

import { assert, assertEquals } from "./testing/assert.ts";
import { verifySuperAdmin, type AuthClient } from "./auth.ts";

function fakeClient(opts: {
  userError?: unknown;
  user?: unknown;
  roleError?: unknown;
  isSuperAdmin?: boolean | null;
}): AuthClient {
  return {
    auth: {
      getUser: () =>
        Promise.resolve({
          data: opts.user !== undefined ? { user: opts.user } : null,
          error: opts.userError ?? null,
        }),
    },
    rpc: (_fn: "is_super_admin") =>
      Promise.resolve({ data: opts.isSuperAdmin ?? null, error: opts.roleError ?? null }),
  };
}

Deno.test("verifySuperAdmin: no Authorization header -> UNAUTHORIZED, no client built", async () => {
  const req = new Request("https://example.com/generate-tenant", { method: "POST" });
  const result = await verifySuperAdmin(req, () => {
    throw new Error("buildClient must not be called without an Authorization header");
  });
  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.code, "UNAUTHORIZED");
});

Deno.test("verifySuperAdmin: server misconfiguration (no client buildable) -> DATABASE_ERROR", async () => {
  const req = new Request("https://example.com/generate-tenant", {
    method: "POST",
    headers: { Authorization: "Bearer some-jwt" },
  });
  const result = await verifySuperAdmin(req, () => null);
  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.code, "DATABASE_ERROR");
});

Deno.test("verifySuperAdmin: invalid/expired session -> UNAUTHORIZED", async () => {
  const req = new Request("https://example.com/generate-tenant", {
    method: "POST",
    headers: { Authorization: "Bearer expired-jwt" },
  });
  const result = await verifySuperAdmin(req, () => fakeClient({ userError: new Error("invalid token") }));
  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.code, "UNAUTHORIZED");
});

Deno.test("verifySuperAdmin: authenticated but not super_admin -> FORBIDDEN", async () => {
  const req = new Request("https://example.com/generate-tenant", {
    method: "POST",
    headers: { Authorization: "Bearer tenant-admin-jwt" },
  });
  const result = await verifySuperAdmin(req, () => fakeClient({ user: { id: "u1" }, isSuperAdmin: false }));
  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.code, "FORBIDDEN");
});

Deno.test("verifySuperAdmin: role check itself fails -> DATABASE_ERROR", async () => {
  const req = new Request("https://example.com/generate-tenant", {
    method: "POST",
    headers: { Authorization: "Bearer some-jwt" },
  });
  const result = await verifySuperAdmin(req, () => fakeClient({ user: { id: "u1" }, roleError: new Error("rpc failed") }));
  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.code, "DATABASE_ERROR");
});

Deno.test("verifySuperAdmin: authenticated super_admin -> ok", async () => {
  const req = new Request("https://example.com/generate-tenant", {
    method: "POST",
    headers: { Authorization: "Bearer super-admin-jwt" },
  });
  const result = await verifySuperAdmin(req, () => fakeClient({ user: { id: "u1" }, isSuperAdmin: true }));
  assert(result.ok);
});
