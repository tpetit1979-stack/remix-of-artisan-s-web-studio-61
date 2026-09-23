import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABEL,
  canTransition,
  countBySource,
  formatLeadSource,
  leadDisplayName,
  type MarketingLead,
} from "./marketing-leads";

const lead = (over: Partial<MarketingLead> = {}): MarketingLead =>
  ({
    id: "00000000-0000-0000-0000-000000000000",
    created_at: "2026-09-20T08:12:00Z",
    intent: "site_request",
    source: "home",
    first_name: "Claire",
    last_name: "Fontaine",
    phone: "01 99 00 00 00",
    company: "Fontaine Couverture",
    city: "Salon-de-Provence",
    email: "claire@example.com",
    trade: "couverture",
    trade_other: null,
    current_website: null,
    message: null,
    status: "new",
    notified_at: null,
    ...over,
  }) as MarketingLead;

describe("statuts des demandes", () => {
  it("n'utilise que les trois statuts déjà autorisés en base", () => {
    // `marketing_leads_status_check` : new | contacted | closed. Ce test
    // existe pour qu'un quatrième statut ajouté ici échoue ici plutôt qu'en
    // production, sur une contrainte violée.
    expect([...LEAD_STATUSES]).toEqual(["new", "contacted", "closed"]);
  });

  it("donne un libellé lisible à chacun", () => {
    for (const status of LEAD_STATUSES) {
      expect(LEAD_STATUS_LABEL[status]?.length, status).toBeGreaterThan(2);
    }
  });

  it("autorise le retour en arrière, mais pas la transition vers soi-même", () => {
    expect(canTransition("contacted", "new")).toBe(true);
    expect(canTransition("closed", "contacted")).toBe(true);
    expect(canTransition("new", "new")).toBe(false);
  });
});

describe("lecture d'une demande", () => {
  it("traduit les origines simples", () => {
    expect(formatLeadSource("home")).toBe("Page d'accueil");
    expect(formatLeadSource("direct")).toBe("Accès direct");
  });

  it("garde le slug des origines détaillées, qui est l'information utile", () => {
    expect(formatLeadSource("example.toitures-durand")).toBe("Exemple · toitures-durand");
    expect(formatLeadSource("trade.couvreur")).toBe("Métier · couvreur");
  });

  it("n'invente rien pour une origine qu'elle ne connaît pas", () => {
    expect(formatLeadSource("mystere")).toBe("mystere");
  });

  it("compose un nom affichable", () => {
    expect(leadDisplayName(lead())).toBe("Claire Fontaine");
  });

  it("compte les demandes par origine, de la plus fréquente à la moins", () => {
    const leads = [
      lead({ source: "home" }),
      lead({ source: "trade.couvreur" }),
      lead({ source: "home" }),
      lead({ source: "pricing" }),
    ];
    expect(countBySource(leads)).toEqual([
      ["home", 2],
      ["pricing", 1],
      ["trade.couvreur", 1],
    ]);
  });
});

describe("page de confirmation", () => {
  /**
   * La page affirmait « Elle est arrivée par email chez SUPORDO » alors que
   * trois chemins de `submitSupordoLead` renvoient un succès sans qu'aucun
   * email ne soit parti. Ce test garde la propriété : la confirmation ne
   * promet que ce qui est garanti à ce stade, l'enregistrement.
   */
  const source = readFileSync("src/routes/demarrer.confirmation.tsx", "utf8");
  const visible = source.slice(source.indexOf("function ConfirmationPage"));

  it("affirme l'enregistrement", () => {
    expect(visible).toContain("Votre demande est enregistrée.");
  });

  it("n'affirme nulle part qu'un email est parti", () => {
    for (const claim of ["arrivée par email", "envoyée", "e-mail a été envoyé", "bien reçu"]) {
      expect(visible.toLowerCase(), claim).not.toContain(claim.toLowerCase());
    }
  });

  it("ne promet aucun délai", () => {
    for (const promise of ["24 h", "24h", "sous 48", "dans la journée", "immédiatement"]) {
      expect(visible.toLowerCase(), promise).not.toContain(promise.toLowerCase());
    }
  });
});
