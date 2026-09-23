import { describe, expect, it } from "vitest";
import {
  buildNotification,
  escapeHtml,
  isLikelyBot,
  leadSchema,
  LEAD_SURFACES,
  normalizeLeadSource,
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
    expect(toRow(parsed, "home")).toMatchObject({ company: null, city: null, email: null });
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
    expect(toRow(parsed, "home")).toMatchObject({ current_website: null, message: null });
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
    expect(toRow(parsed, "home")).toMatchObject({
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
    expect(toRow(parsed, "home").trade_other).toBeNull();
  });
});

describe("leadSchema — source", () => {
  it("n'échoue plus sur une origine inconnue", () => {
    // Une origine inconnue ne fait plus échouer la demande : elle est
    // ramenée à `direct` par `normalizeLeadSource`. Rejeter ici reviendrait à
    // perdre un prospect pour sauver une statistique.
    expect(leadSchema.safeParse({ ...callback, source: "chatbot" }).success).toBe(true);
  });

  it("accepte chacune des sources prévues", () => {
    for (const source of LEAD_SURFACES) {
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
    expect(buildNotification(leadSchema.parse(callback), "home").subject).toBe(
      "Rappel demandé — Marie Durand",
    );
    expect(buildNotification(leadSchema.parse(siteRequest), "home").subject).toBe(
      "Demande de site — Durand Plomberie (Annecy)",
    );
  });

  it("signale un métier hors liste comme tel", () => {
    const lead = leadSchema.parse({
      ...callback,
      trade: TRADE_OTHER,
      tradeOther: "Poseur de pierre sèche",
    });
    expect(buildNotification(lead, "home").lines.join("\n")).toContain(
      "Poseur de pierre sèche (hors liste)",
    );
  });

  it("indique toujours la page d'origine", () => {
    expect(buildNotification(leadSchema.parse(callback), "home").lines.join("\n")).toContain(
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

/**
 * L'attribution, tenue par des tests.
 *
 * Avant ce lot, `/demarrer` inscrivait `start` en dur pour toutes les
 * demandes : la colonne existait, elle était `NOT NULL`, et elle ne disait
 * rien. Ces tests fixent les deux garanties qui remplacent ce comportement :
 * une origine reconnue est conservée telle quelle, et tout le reste devient
 * `direct` — jamais une erreur, jamais une valeur inventée.
 */
const KNOWN = {
  example: ["toitures-durand", "berger-electricite"],
  trade: ["couvreur", "plombier"],
} as const;

describe("normalizeLeadSource", () => {
  it("conserve chaque surface connue", () => {
    for (const surface of LEAD_SURFACES) {
      expect(normalizeLeadSource(surface, KNOWN), surface).toBe(surface);
    }
  });

  it("conserve une page de détail dont le slug existe", () => {
    expect(normalizeLeadSource("example.toitures-durand", KNOWN)).toBe("example.toitures-durand");
    expect(normalizeLeadSource("trade.couvreur", KNOWN)).toBe("trade.couvreur");
  });

  it("refuse un slug qui n'existe pas dans le site", () => {
    expect(normalizeLeadSource("example.entreprise-inventee", KNOWN)).toBe("direct");
    expect(normalizeLeadSource("trade.astronaute", KNOWN)).toBe("direct");
  });

  it("refuse une surface de détail inconnue", () => {
    expect(normalizeLeadSource("client.toitures-durand", KNOWN)).toBe("direct");
  });

  it("refuse un slug mal formé plutôt que de l'écrire en base", () => {
    expect(normalizeLeadSource("trade../../etc", KNOWN)).toBe("direct");
    expect(normalizeLeadSource("trade.Couvreur", KNOWN)).toBe("direct");
    expect(normalizeLeadSource(`trade.${"a".repeat(61)}`, KNOWN)).toBe("direct");
  });

  it("répond direct plutôt que vide quand rien n'est transmis", () => {
    expect(normalizeLeadSource("", KNOWN)).toBe("direct");
    expect(normalizeLeadSource(null, KNOWN)).toBe("direct");
    expect(normalizeLeadSource(undefined, KNOWN)).toBe("direct");
    expect(normalizeLeadSource("   ", KNOWN)).toBe("direct");
  });

  it("ne rejette jamais : toute entrée produit une origine écrivable", () => {
    for (const bogus of ["chatbot", "<script>", "home ; drop table", "trade.", ".couvreur", ".."]) {
      const result = normalizeLeadSource(bogus, KNOWN);
      expect(
        (LEAD_SURFACES as readonly string[]).includes(result) || result.includes("."),
        bogus,
      ).toBe(true);
    }
  });
});

describe("toRow — origine", () => {
  it("écrit l'origine normalisée, pas celle reçue du navigateur", () => {
    const parsed = leadSchema.parse({ ...siteRequest, source: "n'importe quoi" });
    expect(toRow(parsed, "trade.couvreur").source).toBe("trade.couvreur");
  });
});
