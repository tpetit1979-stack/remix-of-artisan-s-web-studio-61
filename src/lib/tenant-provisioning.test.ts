import { describe, expect, it } from "vitest";
import { decideTenantMembership } from "./tenant-provisioning";

const TENANT_A = "tenant-a";
const TENANT_B = "tenant-b";

describe("decideTenantMembership", () => {
  it("allows a brand new user (no role, no membership)", () => {
    expect(
      decideTenantMembership({ tenantId: TENANT_A, existingRole: null, existingMemberships: [] }),
    ).toEqual({ kind: "allow", reason: "new_user" });
  });

  it("allows an existing tenant_admin already correctly associated with this tenant", () => {
    expect(
      decideTenantMembership({
        tenantId: TENANT_A,
        existingRole: "tenant_admin",
        existingMemberships: [{ tenant_id: TENANT_A }],
      }),
    ).toEqual({ kind: "allow", reason: "already_member" });
  });

  it("allows a tenant_admin role with no membership yet (e.g. role attributed but linkage never completed)", () => {
    expect(
      decideTenantMembership({ tenantId: TENANT_A, existingRole: "tenant_admin", existingMemberships: [] }),
    ).toEqual({ kind: "allow", reason: "new_user" });
  });

  it("refuses a tenant_admin already belonging to a different tenant — one artisan, one tenant", () => {
    expect(
      decideTenantMembership({
        tenantId: TENANT_A,
        existingRole: "tenant_admin",
        existingMemberships: [{ tenant_id: TENANT_B }],
      }),
    ).toEqual({ kind: "deny", reason: "other_tenant", otherTenantId: TENANT_B });
  });

  it("refuses a different global role (e.g. super_admin) regardless of membership", () => {
    expect(
      decideTenantMembership({ tenantId: TENANT_A, existingRole: "super_admin", existingMemberships: [] }),
    ).toEqual({ kind: "deny", reason: "role_conflict", existingRole: "super_admin" });
  });

  it("role conflict is checked before the other-tenant check", () => {
    expect(
      decideTenantMembership({
        tenantId: TENANT_A,
        existingRole: "super_admin",
        existingMemberships: [{ tenant_id: TENANT_B }],
      }),
    ).toEqual({ kind: "deny", reason: "role_conflict", existingRole: "super_admin" });
  });
});
