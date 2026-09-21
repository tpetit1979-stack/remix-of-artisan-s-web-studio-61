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
  process.env["SUPABASE_SERVICE_ROLE_KEY"] = "cle-service";
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
  it("exige l'URL et la clé service_role", () => {
    expect(isLeadPersistenceConfigured()).toBe(false);
    process.env["SUPABASE_URL"] = "https://exemple.supabase.co";
    expect(isLeadPersistenceConfigured()).toBe(false);
    configurerPersistance();
    expect(isLeadPersistenceConfigured()).toBe(true);
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
