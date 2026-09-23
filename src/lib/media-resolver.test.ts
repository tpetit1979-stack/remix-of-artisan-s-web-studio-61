import { describe, it, expect } from "vitest";
import { templateMediaTypesFor } from "./media-resolver";

/**
 * La règle absolue de la photothèque, tenue par un test.
 *
 * Une image de `trade_media_library` est générique : elle est partagée par
 * tous les tenants d'un métier. Un emplacement « portfolio » ou « gallery »
 * est lu par un visiteur comme « nos réalisations » — le chantier que cette
 * entreprise-là a fait. Brancher l'un sur l'autre ferait affirmer au site un
 * travail qui n'a pas eu lieu.
 *
 * Ce test existe parce que la chaîne de repli l'autorisait : `portfolio`
 * acceptait `service_card` en dernier recours, et les seules lignes actives
 * de la bibliothèque sont précisément des `service_card`.
 */
describe("templateMediaTypesFor", () => {
  it("ne propose aucun média générique à un emplacement de réalisations", () => {
    expect(templateMediaTypesFor("portfolio")).toEqual([]);
    expect(templateMediaTypesFor("gallery")).toEqual([]);
  });

  it("laisse les fiches prestation et l'accueil puiser dans la bibliothèque", () => {
    expect(templateMediaTypesFor("service")).toEqual(["service_card"]);
    expect(templateMediaTypesFor("hero")).toEqual(["hero"]);
  });

  it("ne fournit jamais de logo ni de favicon depuis un gabarit métier", () => {
    expect(templateMediaTypesFor("logo")).toEqual([]);
    expect(templateMediaTypesFor("favicon")).toEqual([]);
  });
});
