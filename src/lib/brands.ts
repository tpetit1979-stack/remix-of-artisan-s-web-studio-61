import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

/**
 * Global brand catalogue. Super Admin curates `brands`; tenants only ever
 * select from it (tenant_brands, tenant_service_brands) -- no tenant-facing
 * screen accepts a free-typed brand name.
 */

export type Brand = Tables<"brands">;
export type TenantBrand = Tables<"tenant_brands">;
export type TenantServiceBrand = Tables<"tenant_service_brands">;

/** Fixed vocabulary shown in the Super Admin brand form -- keeps `category`
 *  and `brand_type` from drifting into near-duplicate free-text variants
 *  ("PAC" / "Pompe à chaleur" / ...). The DB columns stay plain text so a
 *  new value never requires a migration; only this list needs updating. */
export const BRAND_CATEGORY_OPTIONS = [
  "Poêles",
  "Climatisation",
  "PAC",
  "Chaudières",
  "Fumisterie",
  "Ventilation",
  "Isolation",
  "Outillage",
] as const;

export const BRAND_TYPE_OPTIONS = [
  { value: "manufacturer", label: "Fabricant" },
  { value: "flue", label: "Fumisterie / conduits" },
  { value: "accessory", label: "Accessoire" },
  { value: "fuel", label: "Combustible" },
  { value: "distributor", label: "Distributeur" },
] as const;

export async function fetchAllBrands(): Promise<Brand[]> {
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchActiveBrands(): Promise<Brand[]> {
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function insertBrand(input: Omit<Brand, "id" | "created_at" | "updated_at">) {
  const { error } = await supabase.from("brands").insert(input);
  if (error) throw error;
}

export async function updateBrand(id: string, patch: Partial<Brand>) {
  const { error } = await supabase.from("brands").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteBrand(id: string) {
  const { error } = await supabase.from("brands").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchTenantBrands(tenantId: string): Promise<(TenantBrand & { brand: Brand })[]> {
  const { data, error } = await supabase
    .from("tenant_brands")
    .select("*, brand:brands(*)")
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as (TenantBrand & { brand: Brand })[];
}

/** Replace the tenant's general brand selection in one pass: inserts the
 *  newly-checked brand ids, deletes the unchecked ones. Never touches rows
 *  for brand ids outside `brandIds` that belong to other tenants (scoped by
 *  tenant_id on both statements). */
export async function setTenantBrands(tenantId: string, brandIds: string[]) {
  const { data: existing, error: fetchErr } = await supabase
    .from("tenant_brands")
    .select("brand_id")
    .eq("tenant_id", tenantId);
  if (fetchErr) throw fetchErr;

  const existingIds = new Set((existing ?? []).map((r) => r.brand_id));
  const nextIds = new Set(brandIds);

  const toInsert = brandIds.filter((id) => !existingIds.has(id));
  const toDelete = [...existingIds].filter((id) => !nextIds.has(id));

  if (toInsert.length > 0) {
    const { error } = await supabase
      .from("tenant_brands")
      .insert(toInsert.map((brand_id) => ({ tenant_id: tenantId, brand_id })));
    if (error) throw error;
  }
  if (toDelete.length > 0) {
    const { error } = await supabase
      .from("tenant_brands")
      .delete()
      .eq("tenant_id", tenantId)
      .in("brand_id", toDelete);
    if (error) throw error;
  }
}

export async function setTenantBrandFeatured(tenantId: string, brandId: string, isFeatured: boolean) {
  const { error } = await supabase
    .from("tenant_brands")
    .update({ is_featured: isFeatured })
    .eq("tenant_id", tenantId)
    .eq("brand_id", brandId);
  if (error) throw error;
}

export async function fetchServiceBrands(serviceId: string): Promise<(TenantServiceBrand & { brand: Brand })[]> {
  const { data, error } = await supabase
    .from("tenant_service_brands")
    .select("*, brand:brands(*)")
    .eq("service_id", serviceId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as (TenantServiceBrand & { brand: Brand })[];
}

/** Same replace-set approach as setTenantBrands, scoped to one service. */
export async function setServiceBrands(tenantId: string, serviceId: string, brandIds: string[]) {
  const { data: existing, error: fetchErr } = await supabase
    .from("tenant_service_brands")
    .select("brand_id")
    .eq("service_id", serviceId);
  if (fetchErr) throw fetchErr;

  const existingIds = new Set((existing ?? []).map((r) => r.brand_id));
  const nextIds = new Set(brandIds);

  const toInsert = brandIds.filter((id) => !existingIds.has(id));
  const toDelete = [...existingIds].filter((id) => !nextIds.has(id));

  if (toInsert.length > 0) {
    const { error } = await supabase.from("tenant_service_brands").insert(
      toInsert.map((brand_id) => ({ tenant_id: tenantId, service_id: serviceId, brand_id })),
    );
    if (error) throw error;
  }
  if (toDelete.length > 0) {
    const { error } = await supabase
      .from("tenant_service_brands")
      .delete()
      .eq("service_id", serviceId)
      .in("brand_id", toDelete);
    if (error) throw error;
  }
}
