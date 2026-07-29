-- S1: public read access to tenant_media, scoped to the only two categories
-- with a real public consumer today (hero: HeroSection.tsx, service: ServiceMedia.tsx).
-- portfolio/gallery/proof/logo/favicon/certification stay excluded until a
-- public route actually reads them via this table.
CREATE POLICY "public_read_hero_service_tenant_media"
ON public.tenant_media
FOR SELECT
TO anon, authenticated
USING (is_active = true AND category IN ('hero', 'service'));

-- Minimal-projection view, mirroring the existing public_trade_media pattern
-- (security_invoker so it enforces the caller's own RLS, not the owner's).
CREATE VIEW public.public_tenant_media
WITH (security_invoker = true) AS
SELECT id, tenant_id, category, target_id, public_url, alt_text, sort_order
FROM public.tenant_media
WHERE is_active = true;

GRANT SELECT ON public.public_tenant_media TO anon, authenticated;
