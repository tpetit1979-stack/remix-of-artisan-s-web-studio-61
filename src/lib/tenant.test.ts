import { describe, expect, it, vi } from "vitest";

// Minimal chainable mock scoped to this file's own needs. fetchSiteSettings
// calls .from().select().eq().maybeSingle(); fetchTenantByHostname calls
// .from().select().or().maybeSingle() — both chains are faked below, and
// `or`/`maybeSingle` stay individually spy-able so a test can assert a
// query was never made. Not shared/reused infrastructure: this repo has no
// Supabase client mock elsewhere and none is introduced beyond what these
// two functions' contracts need.
const maybeSingle = vi.fn();
const or = vi.fn(() => ({ maybeSingle }));
const eq = vi.fn(() => ({ maybeSingle }));
const select = vi.fn(() => ({ eq, or }));
const from = vi.fn(() => ({ select }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from },
}));

const getPlatformOrigin = vi.fn();

vi.mock("./platform-url", () => ({ getPlatformOrigin }));

const { fetchSiteSettings, fetchTenantByHostname, isPlatformHost } = await import("./tenant");

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

describe("isPlatformHost", () => {
  it("matches the platform's exact hostname", () => {
    getPlatformOrigin.mockReturnValue("https://supordo.com");
    expect(isPlatformHost("supordo.com")).toBe(true);
  });

  it("matches the www. variant of the platform hostname", () => {
    getPlatformOrigin.mockReturnValue("https://supordo.com");
    expect(isPlatformHost("www.supordo.com")).toBe(true);
  });

  it("rejects a real tenant domain", () => {
    getPlatformOrigin.mockReturnValue("https://supordo.com");
    expect(isPlatformHost("mon-artisan-ramoneur.fr")).toBe(false);
  });

  it("rejects a domain that merely contains the platform name as a substring — never .includes()", () => {
    getPlatformOrigin.mockReturnValue("https://supordo.com");
    expect(isPlatformHost("supordo-artisan.fr")).toBe(false);
  });

  it("rejects a subdomain of the platform host — not proven to belong to the platform", () => {
    getPlatformOrigin.mockReturnValue("https://supordo.com");
    expect(isPlatformHost("foo.supordo.com")).toBe(false);
  });

  it("rejects a Lovable preview host", () => {
    getPlatformOrigin.mockReturnValue("https://supordo.com");
    expect(isPlatformHost("some-id.lovableproject.com")).toBe(false);
  });

  it("returns false, never throws, when getPlatformOrigin() fails closed (prod, unset)", () => {
    getPlatformOrigin.mockImplementation(() => {
      throw new Error("VITE_PLATFORM_URL n'est pas configuré");
    });
    expect(isPlatformHost("supordo.com")).toBe(false);
  });
});

describe("fetchTenantByHostname — platform host short-circuit", () => {
  it("never queries Supabase for the platform's own host — returns null immediately", async () => {
    getPlatformOrigin.mockReturnValue("https://supordo.com");
    or.mockClear();
    maybeSingle.mockClear();
    const result = await fetchTenantByHostname("supordo.com");
    expect(result).toBeNull();
    expect(or).not.toHaveBeenCalled();
    expect(maybeSingle).not.toHaveBeenCalled();
  });
});
