import { describe, expect, it } from "vitest";
import {
  buildNotification,
  escapeHtml,
  isLikelyBot,
  leadSchema,
  toRow,
  TRADE_OTHER,
} from "./supordo-lead";

const callback = {
  intent: "callback" as const,
  source: "home" as const,
  firstName: "Marie",
  lastName: "Durand",
  phone: "06 12 34 56 78",
  elapsedMs: 5000,
};

const siteRequest = {
  intent: "site_request" as const,
  source: "start" as const,
  firstName: "Marie",
  lastName: "Durand",
  phone: "06 12 34 56 78",
  company: "Durand Plomberie",
  trade: "plombier",
  city: "Annecy",
  email: "marie@durand-plomberie.fr",
  elapsedMs: 5000,
};

describe("leadSchema — rappel express", () => {
  it("accepte prénom, nom et téléphone seuls", () => {
    expect(leadSchema.safeParse(callback).success).toBe(true);
  });

  it("n'exige ni entreprise, ni ville, ni email", () => {
    const parsed = leadSchema.parse(callback);
    expect(parsed.intent).toBe("callback");
    expect(toRow(parsed)).toMatchObject({ company: null, city: null, email: null });
  });

  it("refuse un rappel sans téléphone", () => {
    const { phone: _unused, ...sansTelephone } = callback;
    expect(leadSchema.safeParse(sansTelephone).success).toBe(false);
  });

  it("refuse un rappel sans nom", () => {
    expect(leadSchema.safeParse({ ...callback, lastName: "" }).success).toBe(false);
  });

  it("accepte un métier facultatif", () => {
    expect(leadSchema.safeParse({ ...callback, trade: "couvreur" }).success).toBe(true);
  });
});

describe("leadSchema — demande de site", () => {
  it("accepte une demande complète", () => {
    expect(leadSchema.safeParse(siteRequest).success).toBe(true);
  });

  it.each(["company", "city", "email", "trade", "phone", "firstName", "lastName"])(
    "refuse une demande sans %s",
    (champ) => {
      expect(leadSchema.safeParse({ ...siteRequest, [champ]: "" }).success).toBe(false);
    },
  );

  it("refuse un email mal formé", () => {
    expect(leadSchema.safeParse({ ...siteRequest, email: "marie@" }).success).toBe(false);
  });

  it("accepte site actuel et message vides", () => {
    const parsed = leadSchema.parse(siteRequest);
    expect(toRow(parsed)).toMatchObject({ current_website: null, message: null });
  });
});

describe("leadSchema — métier hors liste", () => {
  it("exige le texte libre quand le métier est « autre »", () => {
    expect(leadSchema.safeParse({ ...callback, trade: TRADE_OTHER }).success).toBe(false);
  });

  it("accepte « autre » accompagné du texte libre", () => {
    const parsed = leadSchema.parse({
      ...callback,
      trade: TRADE_OTHER,
      tradeOther: "Poseur de pierre sèche",
    });
    expect(toRow(parsed)).toMatchObject({
      trade: TRADE_OTHER,
      trade_other: "Poseur de pierre sèche",
    });
  });

  it("refuse un texte libre sans « autre » — même règle que la contrainte en base", () => {
    expect(
      leadSchema.safeParse({ ...callback, trade: "plombier", tradeOther: "parasite" }).success,
    ).toBe(false);
  });

  it("ne recopie jamais le texte libre quand le métier est dans la liste", () => {
    const parsed = leadSchema.parse({ ...callback, trade: "plombier" });
    expect(toRow(parsed).trade_other).toBeNull();
  });
});

describe("leadSchema — source", () => {
  it("refuse une source inconnue", () => {
    expect(leadSchema.safeParse({ ...callback, source: "chatbot" }).success).toBe(false);
  });

  it("accepte chacune des sources prévues", () => {
    for (const source of ["home", "pricing", "how_it_works", "examples", "start", "confirmation"]) {
      expect(leadSchema.safeParse({ ...callback, source }).success).toBe(true);
    }
  });
});

describe("anti-bot — piège et délai", () => {
  // Le point clé : la validation ne doit PAS rejeter une soumission piégée.
  // Un rejet renverrait une erreur au robot, donc l'information qu'il a été
  // repéré. Le schéma accepte, puis isLikelyBot tranche, et l'appelant répond
  // un succès ordinaire sans rien écrire ni envoyer.
  it("accepte à la validation une soumission dont le piège est rempli", () => {
    const parsed = leadSchema.safeParse({ ...callback, trap: "http://spam.example" });
    expect(parsed.success).toBe(true);
  });

  it("identifie ensuite cette soumission comme automatisée", () => {
    const lead = leadSchema.parse({ ...callback, trap: "http://spam.example" });
    expect(isLikelyBot(lead)).toBe(true);
  });

  it("détecte le piège même rempli d'espaces seuls sans le confondre avec vide", () => {
    expect(isLikelyBot(leadSchema.parse({ ...callback, trap: "   x   " }))).toBe(true);
    expect(isLikelyBot(leadSchema.parse({ ...callback, trap: "   " }))).toBe(false);
  });

  it("accepte à la validation un envoi trop rapide, puis le juge automatisé", () => {
    const parsed = leadSchema.safeParse({ ...callback, elapsedMs: 0 });
    expect(parsed.success).toBe(true);
    expect(isLikelyBot(leadSchema.parse({ ...callback, elapsedMs: 0 }))).toBe(true);
  });

  it("laisse passer une soumission humaine : piège vide et délai suffisant", () => {
    expect(isLikelyBot(leadSchema.parse(callback))).toBe(false);
  });

  it("juge automatisé un envoi juste sous le seuil, humain juste au-dessus", () => {
    expect(isLikelyBot(leadSchema.parse({ ...callback, elapsedMs: 2999 }))).toBe(true);
    expect(isLikelyBot(leadSchema.parse({ ...callback, elapsedMs: 3000 }))).toBe(false);
  });

  it("borne la taille du piège sans le rejeter pour autant", () => {
    expect(leadSchema.safeParse({ ...callback, trap: "x".repeat(200) }).success).toBe(true);
    expect(leadSchema.safeParse({ ...callback, trap: "x".repeat(201) }).success).toBe(false);
  });
});

describe("buildNotification", () => {
  it("distingue rappel et demande de site dans l'objet", () => {
    expect(buildNotification(leadSchema.parse(callback)).subject).toBe(
      "Rappel demandé — Marie Durand",
    );
    expect(buildNotification(leadSchema.parse(siteRequest)).subject).toBe(
      "Demande de site — Durand Plomberie (Annecy)",
    );
  });

  it("signale un métier hors liste comme tel", () => {
    const lead = leadSchema.parse({
      ...callback,
      trade: TRADE_OTHER,
      tradeOther: "Poseur de pierre sèche",
    });
    expect(buildNotification(lead).lines.join("\n")).toContain(
      "Poseur de pierre sèche (hors liste)",
    );
  });

  it("indique toujours la page d'origine", () => {
    expect(buildNotification(leadSchema.parse(callback)).lines.join("\n")).toContain(
      "Origine : home",
    );
  });
});

describe("escapeHtml", () => {
  it("neutralise le balisage saisi par un visiteur", () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe(
      '&lt;script&gt;alert("x")&lt;/script&gt;',
    );
  });
});
