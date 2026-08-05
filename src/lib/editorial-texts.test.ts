import { describe, expect, it } from "vitest";
import { resolveEditorialTexts } from "./editorial-texts";

describe("resolveEditorialTexts", () => {
  it("falls back to a neutral button label when no cta_text is set", () => {
    expect(resolveEditorialTexts(null).buttonLabel).toBe("Demander un devis");
    expect(resolveEditorialTexts(undefined).buttonLabel).toBe("Demander un devis");
    expect(resolveEditorialTexts("").buttonLabel).toBe("Demander un devis");
    expect(resolveEditorialTexts("   ").buttonLabel).toBe("Demander un devis");
  });

  it("uses the tenant's own cta_text for the button when set", () => {
    expect(resolveEditorialTexts("Demander un diagnostic").buttonLabel).toBe("Demander un diagnostic");
  });

  it("never lets cta_text leak into the banner heading — that field is a button label, not a heading", () => {
    expect(resolveEditorialTexts("Devis gratuit sous 48h").bannerHeading).toBe("Parlons de votre projet");
    expect(resolveEditorialTexts(null).bannerHeading).toBe("Parlons de votre projet");
  });
});
