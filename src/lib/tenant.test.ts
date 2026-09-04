import { describe, expect, it, vi } from "vitest";

// Minimal chainable mock scoped to this file's own needs — fetchSiteSettings
// only ever calls .from().select().eq().maybeSingle(), so that's all this
// fakes. Not shared/reused infrastructure: this repo has no Supabase client
// mock elsewhere and none is introduced beyond this one function's contract.
const maybeSingle = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle,
        }),
      }),
    }),
  },
}));

const { fetchSiteSettings } = await import("./tenant");

describe("fetchSiteSettings", () => {
  it("returns the row when the tenant has site_settings — existing behavior preserved", async () => {
    maybeSingle.mockResolvedValueOnce({
      data: { tenant_id: "t1", hero_title: "Bienvenue" },
      error: null,
    });
    const result = await fetchSiteSettings("t1");
    expect(result).toEqual({ tenant_id: "t1", hero_title: "Bienvenue" });
  });

  it("returns null, without throwing, when the tenant has zero site_settings rows", async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const result = await fetchSiteSettings("tenant-without-settings");
    expect(result).toBeNull();
  });

  it("still throws on a real Supabase error — never silently absorbed into null", async () => {
    maybeSingle.mockResolvedValueOnce({
      data: null,
      error: new Error("connection refused"),
    });
    await expect(fetchSiteSettings("t1")).rejects.toThrow("connection refused");
  });
});
