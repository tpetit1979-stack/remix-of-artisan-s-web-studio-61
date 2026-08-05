import { describe, expect, it } from "vitest";
import { resolveTeamPresentation, type TeamMember } from "./team";

function member(overrides: Partial<TeamMember>): TeamMember {
  return {
    id: "id",
    tenant_id: "tenant",
    full_name: "Full Name",
    role_title: "Role",
    photo_url: null,
    storage_path: null,
    sort_order: 0,
    is_active: true,
    ...overrides,
  };
}

describe("resolveTeamPresentation", () => {
  it("hides when mode is null (not yet arbitrated), regardless of member count", () => {
    expect(resolveTeamPresentation(null, []).visible).toBe(false);
    expect(resolveTeamPresentation(null, [member({ id: "a" })]).visible).toBe(false);
    expect(
      resolveTeamPresentation(null, [member({ id: "a" }), member({ id: "b" })]).visible,
    ).toBe(false);
  });

  it("hides when mode is explicitly 'hidden', regardless of member count", () => {
    expect(resolveTeamPresentation("hidden", []).visible).toBe(false);
    expect(resolveTeamPresentation("hidden", [member({ id: "a" })]).visible).toBe(false);
  });

  it("hides 'artisan' mode when there is nothing to show", () => {
    const r = resolveTeamPresentation("artisan", []);
    expect(r.visible).toBe(false);
  });

  it("hides 'company' mode when there is nothing to show", () => {
    const r = resolveTeamPresentation("company", []);
    expect(r.visible).toBe(false);
  });

  it("'artisan' with one member: solo layout, generic wording, no name in the subtitle", () => {
    const r = resolveTeamPresentation("artisan", [member({ id: "a", full_name: "Yann Dupont" })]);
    expect(r.visible).toBe(true);
    expect(r.layout).toBe("solo");
    expect(r.eyebrow).toBe("À propos");
    expect(r.title).toBe("Votre artisan");
    expect(r.subtitle).not.toContain("Yann");
    expect(r.membersToShow).toHaveLength(1);
    expect(r.membersToShow[0].id).toBe("a");
  });

  it("'artisan' with several active members shows only the first by sort_order", () => {
    const r = resolveTeamPresentation("artisan", [
      member({ id: "second", sort_order: 2 }),
      member({ id: "first", sort_order: 1 }),
    ]);
    expect(r.visible).toBe(true);
    expect(r.layout).toBe("solo");
    expect(r.membersToShow).toHaveLength(1);
    expect(r.membersToShow[0].id).toBe("first");
  });

  it("'company' with one member: grid layout, institutional wording, still shows the card", () => {
    const r = resolveTeamPresentation("company", [member({ id: "a" })]);
    expect(r.visible).toBe(true);
    expect(r.layout).toBe("grid");
    expect(r.eyebrow).toBe("Qui sommes-nous ?");
    expect(r.title).toBe("L'entreprise");
    expect(r.membersToShow).toHaveLength(1);
  });

  it("'company' with several members shows all of them", () => {
    const r = resolveTeamPresentation("company", [
      member({ id: "a" }),
      member({ id: "b" }),
      member({ id: "c" }),
    ]);
    expect(r.visible).toBe(true);
    expect(r.layout).toBe("grid");
    expect(r.membersToShow).toHaveLength(3);
  });

  it("never asserts a role or name not present in the data", () => {
    const solo = resolveTeamPresentation("artisan", [member({ id: "a", full_name: "Anyone" })]);
    const company = resolveTeamPresentation("company", [member({ id: "a" })]);
    expect(solo.subtitle).not.toMatch(/vous accompagne|Anyone/);
    expect(company.subtitle).not.toMatch(/vous accompagne/);
  });
});
