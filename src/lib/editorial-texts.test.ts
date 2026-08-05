import { describe, expect, it } from "vitest";
import { resolveEditorialTexts } from "./editorial-texts";

describe("resolveEditorialTexts", () => {
  it("falls back to a neutral button label when no cta_text is set", () => {
    expect(resolveEditorialTexts(null, null).buttonLabel).toBe("Demander un devis");
    expect(resolveEditorialTexts(undefined, null).buttonLabel).toBe("Demander un devis");
    expect(resolveEditorialTexts("", null).buttonLabel).toBe("Demander un devis");
    expect(resolveEditorialTexts("   ", null).buttonLabel).toBe("Demander un devis");
  });

  it("uses the tenant's own cta_text for the button when it makes no free-quote claim", () => {
    expect(resolveEditorialTexts("Demander un diagnostic", null).buttonLabel).toBe("Demander un diagnostic");
    expect(resolveEditorialTexts("Demander un diagnostic", false).buttonLabel).toBe("Demander un diagnostic");
  });

  it("never lets cta_text leak into the banner heading — that field is a button label, not a heading", () => {
    expect(resolveEditorialTexts("Devis gratuit sous 48h", true).bannerHeading).toBe("Parlons de votre projet");
    expect(resolveEditorialTexts(null, null).bannerHeading).toBe("Parlons de votre projet");
  });

  describe("cta_text cannot bypass the commercial-promises truth gate", () => {
    it("publishes a free-quote cta_text verbatim only when quote_is_free is confirmed true", () => {
      expect(resolveEditorialTexts("Demander un devis gratuit", true).buttonLabel).toBe("Demander un devis gratuit");
    });

    it("neutralizes a free-quote cta_text when quote_is_free is unconfirmed (null)", () => {
      expect(resolveEditorialTexts("Demander un devis gratuit", null).buttonLabel).toBe("Demander un devis");
    });

    it("neutralizes a free-quote cta_text when quote_is_free is explicitly false", () => {
      expect(resolveEditorialTexts("Étude gratuite sous 48h", false).buttonLabel).toBe("Demander un devis");
    });
  });
});
