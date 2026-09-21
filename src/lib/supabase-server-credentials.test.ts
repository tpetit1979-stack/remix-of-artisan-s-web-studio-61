import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  hasSupabaseServerCredentials,
  missingCredentialsMessage,
  readSupabaseServerCredentials,
  SUPABASE_SECRET_KEY_ENV,
} from "./supabase-server-credentials";

const CLES = ["SUPABASE_URL", "SUPORDO_SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY"] as const;
const CLE_SECRETE = "sb_secret_valeur_de_test";

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

function configurer() {
  process.env["SUPABASE_URL"] = "https://exemple.supabase.co";
  process.env["SUPORDO_SUPABASE_SECRET_KEY"] = CLE_SECRETE;
}

describe("readSupabaseServerCredentials", () => {
  it("renvoie l'URL et la clé secrète quand les deux sont présentes", () => {
    configurer();
    expect(readSupabaseServerCredentials()).toEqual({
      url: "https://exemple.supabase.co",
      secretKey: CLE_SECRETE,
    });
  });

  it("renvoie null si la clé manque", () => {
    process.env["SUPABASE_URL"] = "https://exemple.supabase.co";
    expect(readSupabaseServerCredentials()).toBeNull();
  });

  it("renvoie null si l'URL manque", () => {
    process.env["SUPORDO_SUPABASE_SECRET_KEY"] = CLE_SECRETE;
    expect(readSupabaseServerCredentials()).toBeNull();
  });

  it("ignore une valeur faite d'espaces", () => {
    process.env["SUPABASE_URL"] = "https://exemple.supabase.co";
    process.env["SUPORDO_SUPABASE_SECRET_KEY"] = "   ";
    expect(readSupabaseServerCredentials()).toBeNull();
  });

  it("ignore l'ancien nom SUPABASE_SECRET_KEY, refusé par Lovable (préfixe réservé)", () => {
    process.env["SUPABASE_URL"] = "https://exemple.supabase.co";
    process.env["SUPABASE_SECRET_KEY"] = "ancien-nom-reserve";
    expect(readSupabaseServerCredentials()).toBeNull();
    expect(hasSupabaseServerCredentials()).toBe(false);
    delete process.env["SUPABASE_SECRET_KEY"];
  });

  it("n'utilise pas SUPABASE_SERVICE_ROLE_KEY comme repli", () => {
    process.env["SUPABASE_URL"] = "https://exemple.supabase.co";
    process.env["SUPABASE_SERVICE_ROLE_KEY"] = "ancienne-cle-legacy";
    expect(readSupabaseServerCredentials()).toBeNull();
    expect(hasSupabaseServerCredentials()).toBe(false);
  });
});

describe("missingCredentialsMessage", () => {
  it("cite le nom de la variable attendue", () => {
    expect(missingCredentialsMessage()).toContain(SUPABASE_SECRET_KEY_ENV);
  });

  it("ne contient jamais la valeur de la clé", () => {
    configurer();
    expect(missingCredentialsMessage()).not.toContain(CLE_SECRETE);
  });

  it("ne mentionne plus l'ancienne variable", () => {
    expect(missingCredentialsMessage()).not.toContain("SERVICE_ROLE");
  });
});
