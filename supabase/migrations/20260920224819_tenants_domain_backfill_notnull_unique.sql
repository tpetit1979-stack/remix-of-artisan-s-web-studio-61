-- The tenants_platform_fields_locked trigger (added separately to protect
-- domain/logo/etc. from tenant_admin writes) also blocks this migration's
-- own backfill UPDATE, since the migration runner is neither service_role
-- nor an authenticated super_admin from the trigger's point of view.
-- Disabled only for the duration of this one authorized backfill statement,
-- then re-enabled immediately — the trigger's protection is not weakened
-- afterwards.
ALTER TABLE public.tenants DISABLE TRIGGER trg_tenants_platform_fields_locked;

-- Backfill: every existing tenant must have a non-null domain before NOT
-- NULL can be enforced. Test/pilot tenants without a domain get the same
-- default the onboarding flow already assigns to new tenants —
-- {slug}.supordo.com, derived from the tenant's own unique, immutable slug.
-- Pre-checked read-only beforehand: no collision with any existing
-- non-null domain.
UPDATE public.tenants
SET domain = slug || '.supordo.com'
WHERE domain IS NULL;

ALTER TABLE public.tenants ENABLE TRIGGER trg_tenants_platform_fields_locked;

-- Guarantee every tenant has a public address from now on.
ALTER TABLE public.tenants
  ALTER COLUMN domain SET NOT NULL;

-- Case-insensitive uniqueness on the canonical form. The only write path
-- (Super Admin, locked to super_admin/service_role by
-- enforce_tenant_platform_fields_locked()) always canonicalizes via
-- canonicalizeDomainInput() before writing, so no row will ever contain a
-- "www." prefix going forward — lower(domain) is therefore a correct and
-- sufficient collision guard for this single write path, not a general
-- canonical-form guarantee covering every conceivable future write path.
CREATE UNIQUE INDEX IF NOT EXISTS tenants_domain_canonical_key
  ON public.tenants (lower(domain));
