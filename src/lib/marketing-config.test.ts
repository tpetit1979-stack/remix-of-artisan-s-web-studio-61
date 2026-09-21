import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  isLeadIntakeReady,
  isLeadPersistenceConfigured,
  readLeadDeliveryConfig,
} from "./marketing-config";

const CLES = [
  "RESEND_API_KEY",
  "SUPORDO_LEAD_TO_EMAIL",
  "SUPORDO_LEAD_FROM_EMAIL",
  "SUPABASE_URL",
  "SUPABASE_SECRET_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

let initial: Record<string, string | undefined>;

beforeEach(() => {
  initial = Object.fromEntries(CLES.map((c) => [c, process.env[c]]));
  for (const c of CLES) delete process.env[c];
});

afterEach(() => {
  for (const c of CLES) {
    if (initial[c] === undefined) delete process.env[c];
    else process.env[c] = initial[c];
  }
});

function configurerEnvoi() {
  process.env["RESEND_API_KEY"] = "cle";
  process.env["SUPORDO_LEAD_TO_EMAIL"] = "contact@supordo.com";
  process.env["SUPORDO_LEAD_FROM_EMAIL"] = "site@supordo.com";
}

function configurerPersistance() {
  process.env["SUPABASE_URL"] = "https://exemple.supabase.co";
  process.env["SUPABASE_SECRET_KEY"] = "sb_secret_exemple";
}

describe("readLeadDeliveryConfig", () => {
  it("ne renvoie rien tant que les trois paramètres ne sont pas là", () => {
    expect(readLeadDeliveryConfig()).toBeNull();
    process.env["RESEND_API_KEY"] = "cle";
    expect(readLeadDeliveryConfig()).toBeNull();
  });

  it("renvoie la configuration complète", () => {
    configurerEnvoi();
    expect(readLeadDeliveryConfig()).toEqual({
      apiKey: "cle",
      to: "contact@supordo.com",
      from: "site@supordo.com",
    });
  });

  it("ignore une valeur vide ou faite d'espaces", () => {
    configurerEnvoi();
    process.env["SUPORDO_LEAD_TO_EMAIL"] = "   ";
    expect(readLeadDeliveryConfig()).toBeNull();
  });
});

describe("isLeadPersistenceConfigured", () => {
  it("est vrai avec l'URL et la clé secrète", () => {
    configurerPersistance();
    expect(isLeadPersistenceConfigured()).toBe(true);
  });

  it("est faux sans clé secrète", () => {
    process.env["SUPABASE_URL"] = "https://exemple.supabase.co";
    expect(isLeadPersistenceConfigured()).toBe(false);
  });

  it("est faux sans URL", () => {
    process.env["SUPABASE_SECRET_KEY"] = "sb_secret_exemple";
    expect(isLeadPersistenceConfigured()).toBe(false);
  });

  it("est faux quand rien n'est configuré", () => {
    expect(isLeadPersistenceConfigured()).toBe(false);
  });

  // Bascule nette : l'ancienne variable ne doit plus avoir aucun effet.
  it("ignore SUPABASE_SERVICE_ROLE_KEY, qui n'est plus un repli", () => {
    process.env["SUPABASE_URL"] = "https://exemple.supabase.co";
    process.env["SUPABASE_SERVICE_ROLE_KEY"] = "ancienne-cle-legacy";
    expect(isLeadPersistenceConfigured()).toBe(false);
  });

  it("reste vrai avec la clé secrète même si l'ancienne variable est absente", () => {
    configurerPersistance();
    delete process.env["SUPABASE_SERVICE_ROLE_KEY"];
    expect(isLeadPersistenceConfigured()).toBe(true);
  });

  it("ne renvoie jamais la clé elle-même, seulement un booléen", () => {
    configurerPersistance();
    expect(typeof isLeadPersistenceConfigured()).toBe("boolean");
  });
});

describe("isLeadIntakeReady", () => {
  it("reste faux si la demande peut être envoyée mais pas conservée", () => {
    configurerEnvoi();
    expect(isLeadIntakeReady()).toBe(false);
  });

  it("reste faux si la demande peut être conservée mais pas signalée", () => {
    configurerPersistance();
    expect(isLeadIntakeReady()).toBe(false);
  });

  it("n'est vrai qu'avec les deux", () => {
    configurerEnvoi();
    configurerPersistance();
    expect(isLeadIntakeReady()).toBe(true);
  });
});
