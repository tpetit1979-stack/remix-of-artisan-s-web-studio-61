-- Migration to apply manually on the connected external Supabase project
-- (bygdvkpjreuilqghtnka). Run this SQL in the Supabase SQL editor.
--
-- Goal: only super_admin can modify brand visuals.
--   * site_settings.logo_url / favicon_url / hero_image_url     → UPDATE guard
--   * tenant_media rows with category in ('logo', 'favicon')    → INSERT/UPDATE/DELETE guard
--
-- Relies on public.is_super_admin() (already present in the schema).
-- Service role bypasses these triggers (session_user = 'postgres' / role bypasses RLS,
-- but we add an explicit bypass for service_role as defense in depth on
-- maintenance scripts that may run as a privileged role without auth.uid()).

-- ──────────────────────────────────────────────────────────────────────
-- 1. site_settings: block UPDATE of brand image columns for non super-admins
-- ──────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.enforce_brand_assets_locked()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_role text := current_setting('request.jwt.claim.role', true);
BEGIN
  -- Allow service_role (server-side admin operations) to pass through.
  IF v_role = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- If no authenticated user (shouldn't happen via PostgREST without JWT),
  -- block to be safe.
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'brand_assets_locked: authentication required to modify brand assets';
  END IF;

  -- Super-admin can do anything.
  IF public.is_super_admin(v_uid) THEN
    RETURN NEW;
  END IF;

  -- For everyone else: forbid any change to brand image columns.
  IF NEW.logo_url IS DISTINCT FROM OLD.logo_url THEN
    RAISE EXCEPTION 'brand_assets_locked: only super_admin can modify logo_url';
  END IF;
  IF NEW.favicon_url IS DISTINCT FROM OLD.favicon_url THEN
    RAISE EXCEPTION 'brand_assets_locked: only super_admin can modify favicon_url';
  END IF;
  IF NEW.hero_image_url IS DISTINCT FROM OLD.hero_image_url THEN
    RAISE EXCEPTION 'brand_assets_locked: only super_admin can modify hero_image_url';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_site_settings_brand_assets_locked ON public.site_settings;
CREATE TRIGGER trg_site_settings_brand_assets_locked
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_brand_assets_locked();

-- ──────────────────────────────────────────────────────────────────────
-- 2. tenant_media: block INSERT/UPDATE/DELETE of category in ('logo','favicon')
--    for non super-admins. Other categories (portfolio, gallery, service…)
--    remain editable by tenant_admin as before.
-- ──────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.enforce_tenant_media_brand_locked()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_role text := current_setting('request.jwt.claim.role', true);
  v_protected_categories text[] := ARRAY['logo', 'favicon'];
  v_is_super boolean;
BEGIN
  IF v_role = 'service_role' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  v_is_super := (v_uid IS NOT NULL AND public.is_super_admin(v_uid));
  IF v_is_super THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'brand_assets_locked: authentication required for tenant_media operations';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.category = ANY(v_protected_categories) THEN
      RAISE EXCEPTION 'brand_assets_locked: only super_admin can insert tenant_media with category=%', NEW.category;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    -- Block if the row was already a protected brand asset…
    IF OLD.category = ANY(v_protected_categories) THEN
      RAISE EXCEPTION 'brand_assets_locked: only super_admin can modify tenant_media with category=%', OLD.category;
    END IF;
    -- …or if the update would promote a row into a protected category.
    IF NEW.category = ANY(v_protected_categories) THEN
      RAISE EXCEPTION 'brand_assets_locked: only super_admin can set tenant_media.category=%', NEW.category;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    IF OLD.category = ANY(v_protected_categories) THEN
      RAISE EXCEPTION 'brand_assets_locked: only super_admin can delete tenant_media with category=%', OLD.category;
    END IF;
    RETURN OLD;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_tenant_media_brand_locked ON public.tenant_media;
CREATE TRIGGER trg_tenant_media_brand_locked
  BEFORE INSERT OR UPDATE OR DELETE ON public.tenant_media
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_tenant_media_brand_locked();

-- ──────────────────────────────────────────────────────────────────────
-- 3. Smoke test (run as a tenant_admin in the SQL editor with role switched,
--    or simply attempt from the app while logged as a tenant_admin):
--
--   UPDATE public.site_settings SET logo_url = 'x' WHERE tenant_id = '<your-tenant>';
--   -- expected: ERROR  brand_assets_locked: only super_admin can modify logo_url
--
--   INSERT INTO public.tenant_media(tenant_id, category, url)
--     VALUES ('<your-tenant>', 'logo', 'x');
--   -- expected: ERROR  brand_assets_locked: only super_admin can insert tenant_media with category=logo
--
-- Super-admin should be able to run the same statements without error.
