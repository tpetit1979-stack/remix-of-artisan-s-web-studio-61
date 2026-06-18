-- Backfill: copy legacy image columns into tenant_media so the new resolver
-- finds them. Idempotent: skips rows where an equivalent tenant_media entry
-- already exists (same tenant + category + target_id).

-- 1. Hero images from site_settings
INSERT INTO public.tenant_media (tenant_id, category, target_id, public_url, storage_path, alt_text, sort_order, is_active)
SELECT s.tenant_id, 'hero', NULL, s.hero_image_url, s.hero_image_url, t.company_name, 0, true
FROM public.site_settings s
JOIN public.tenants t ON t.id = s.tenant_id
WHERE s.hero_image_url IS NOT NULL
  AND s.hero_image_url <> ''
  AND NOT EXISTS (
    SELECT 1 FROM public.tenant_media tm
    WHERE tm.tenant_id = s.tenant_id AND tm.category = 'hero' AND tm.target_id IS NULL
  );

-- 2. Logo from site_settings
INSERT INTO public.tenant_media (tenant_id, category, target_id, public_url, storage_path, alt_text, sort_order, is_active)
SELECT s.tenant_id, 'logo', NULL, s.logo_url, s.logo_url, t.company_name || ' logo', 0, true
FROM public.site_settings s
JOIN public.tenants t ON t.id = s.tenant_id
WHERE s.logo_url IS NOT NULL
  AND s.logo_url <> ''
  AND NOT EXISTS (
    SELECT 1 FROM public.tenant_media tm
    WHERE tm.tenant_id = s.tenant_id AND tm.category = 'logo' AND tm.target_id IS NULL
  );

-- 3. Favicon from site_settings
INSERT INTO public.tenant_media (tenant_id, category, target_id, public_url, storage_path, alt_text, sort_order, is_active)
SELECT s.tenant_id, 'favicon', NULL, s.favicon_url, s.favicon_url, 'favicon', 0, true
FROM public.site_settings s
WHERE s.favicon_url IS NOT NULL
  AND s.favicon_url <> ''
  AND NOT EXISTS (
    SELECT 1 FROM public.tenant_media tm
    WHERE tm.tenant_id = s.tenant_id AND tm.category = 'favicon' AND tm.target_id IS NULL
  );

-- 4. Service images (per-service, target_id = service id)
INSERT INTO public.tenant_media (tenant_id, category, target_id, public_url, storage_path, alt_text, sort_order, is_active)
SELECT sv.tenant_id, 'service', sv.id, sv.image_url, sv.image_url, sv.name, COALESCE(sv.sort_order, 0), true
FROM public.services sv
WHERE sv.image_url IS NOT NULL
  AND sv.image_url <> ''
  AND NOT EXISTS (
    SELECT 1 FROM public.tenant_media tm
    WHERE tm.tenant_id = sv.tenant_id AND tm.category = 'service' AND tm.target_id = sv.id
  );

-- 5. Portfolio images (per-realisation, target_id = portfolio id)
INSERT INTO public.tenant_media (tenant_id, category, target_id, public_url, storage_path, alt_text, sort_order, is_active)
SELECT p.tenant_id, 'portfolio', p.id, p.image_url, p.image_url, p.title, COALESCE(p.sort_order, 0), true
FROM public.portfolio p
WHERE p.image_url IS NOT NULL
  AND p.image_url <> ''
  AND NOT EXISTS (
    SELECT 1 FROM public.tenant_media tm
    WHERE tm.tenant_id = p.tenant_id AND tm.category = 'portfolio' AND tm.target_id = p.id
  );

-- 6. Certification logos (per-cert, target_id = certification id)
INSERT INTO public.tenant_media (tenant_id, category, target_id, public_url, storage_path, alt_text, sort_order, is_active)
SELECT c.tenant_id, 'certification', c.id, c.logo_url, c.logo_url, c.certification_name, 0, true
FROM public.tenant_certifications c
WHERE c.logo_url IS NOT NULL
  AND c.logo_url <> ''
  AND NOT EXISTS (
    SELECT 1 FROM public.tenant_media tm
    WHERE tm.tenant_id = c.tenant_id AND tm.category = 'certification' AND tm.target_id = c.id
  );