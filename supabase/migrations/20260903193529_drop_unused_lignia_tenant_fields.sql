-- Removes the unused Lignia-era CRM-link marker on tenants.
-- Verified before this migration: 0/17 tenants have has_lignia = true,
-- lignia_tenant_id filled, or lignia_activated_at filled; no view, index,
-- check constraint, trigger, RLS policy or function body references these
-- columns. The generic enforce_tenant_platform_fields_locked trigger diffs
-- the whole row dynamically (to_jsonb(NEW) - 'phone' - 'email' - 'updated_at')
-- and needs no change — it will simply diff fewer columns going forward.
-- This is a removal of a dead mechanism, not a rename: no replacement
-- column is introduced. A future Sites <-> CRM integration will define its
-- own contract from real requirements when it is actually built.

alter table public.tenants
  drop column if exists has_lignia,
  drop column if exists lignia_tenant_id,
  drop column if exists lignia_activated_at;
