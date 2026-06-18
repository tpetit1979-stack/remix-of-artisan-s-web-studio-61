
-- Storage bucket for media uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Public read access for media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Authenticated users can update media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media');

CREATE POLICY "Authenticated users can delete media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media');

-- Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_monthly ENABLE ROW LEVEL SECURITY;

-- Public read policies for public-facing site
CREATE POLICY "Public read tenants" ON public.tenants FOR SELECT USING (true);
CREATE POLICY "Public read site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public read services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Public read service_areas" ON public.service_areas FOR SELECT USING (true);
CREATE POLICY "Public read portfolio" ON public.portfolio FOR SELECT USING (true);
CREATE POLICY "Public read analytics" ON public.analytics_monthly FOR SELECT USING (true);

-- Public can submit contact forms
CREATE POLICY "Public insert contacts" ON public.contacts FOR INSERT WITH CHECK (true);

-- Authenticated users can manage all data (admin - will be refined with proper tenant check later)
CREATE POLICY "Auth manage tenants" ON public.tenants FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth manage site_settings" ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth manage services" ON public.services FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth manage service_areas" ON public.service_areas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth manage portfolio" ON public.portfolio FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth manage contacts" ON public.contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth manage analytics" ON public.analytics_monthly FOR ALL TO authenticated USING (true) WITH CHECK (true);
