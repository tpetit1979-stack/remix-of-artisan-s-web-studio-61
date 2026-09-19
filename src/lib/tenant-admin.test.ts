import { describe, expect, it } from "vitest";
import { generateSlug } from "./tenant-admin";

describe("generateSlug → native SUPORDO domain", () => {
  it("produces the exact domain written on tenant creation (super-admin.onboarding.tsx)", () => {
    const baseSlug = generateSlug("EASYDEP");
    expect(`${baseSlug}.supordo.com`).toBe("easydep.supordo.com");
  });

  it("normalizes accents and spacing the same way before building the domain", () => {
    const baseSlug = generateSlug("Électricité Général & Fils");
    expect(`${baseSlug}.supordo.com`).toBe("electricite-general-fils.supordo.com");
  });
});
