import { supabase } from "@/integrations/supabase/client";

type FindExistingTenantByIdentityParams = {
  companyName?: string;
  slug?: string;
  siret?: string | null;
  excludeTenantId?: string;
};

export type ExistingTenantMatch = {
  id: string;
  company_name: string;
  slug: string;
};

export function generateSlug(value: string, fallback = "tenant") {
  const slug = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || fallback;
}

export async function findExistingTenantByIdentity({
  companyName,
  slug,
  siret,
  excludeTenantId,
}: FindExistingTenantByIdentityParams): Promise<ExistingTenantMatch | null> {
  const lookupSiret = siret?.trim();
  const lookupSlug = (slug?.trim() || generateSlug(companyName ?? "")).trim();

  if (lookupSiret) {
    let siretQuery = supabase
      .from("tenants")
      .select("id, company_name, slug")
      .eq("siret", lookupSiret)
      .limit(1);

    if (excludeTenantId) {
      siretQuery = siretQuery.neq("id", excludeTenantId);
    }

    const { data, error } = await siretQuery.maybeSingle();
    if (error) throw error;
    if (data) return data;
  }

  if (!lookupSlug) return null;

  let slugQuery = supabase
    .from("tenants")
    .select("id, company_name, slug")
    .eq("slug", lookupSlug)
    .limit(1);

  if (excludeTenantId) {
    slugQuery = slugQuery.neq("id", excludeTenantId);
  }

  const { data, error } = await slugQuery.maybeSingle();
  if (error) throw error;

  return data;
}

export function getTenantDuplicateMessage(error: unknown) {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code ?? "")
      : "";

  if (code !== "23505") return null;

  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message?: unknown }).message ?? "")
      : "";

  if (message.includes("tenants_siret_key")) {
    return "Ce SIRET existe déjà pour un client.";
  }

  if (message.includes("tenants_slug_key")) {
    return "Cette entreprise existe déjà dans vos tenants.";
  }

  return "Ce client existe déjà.";
}

export function toTenantMutationError(error: unknown) {
  return new Error(
    getTenantDuplicateMessage(error) ??
      (error instanceof Error ? error.message : "Impossible d'enregistrer ce client.")
  );
}