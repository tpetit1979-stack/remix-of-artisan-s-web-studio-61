
CREATE POLICY "Public delete contacts" ON public.contacts FOR DELETE TO public USING (true);
CREATE POLICY "Public delete portfolio" ON public.portfolio FOR DELETE TO public USING (true);
CREATE POLICY "Public delete service_areas" ON public.service_areas FOR DELETE TO public USING (true);
CREATE POLICY "Public delete services" ON public.services FOR DELETE TO public USING (true);
CREATE POLICY "Public delete tenant_certifications" ON public.tenant_certifications FOR DELETE TO public USING (true);
CREATE POLICY "Public delete analytics_monthly" ON public.analytics_monthly FOR DELETE TO public USING (true);
CREATE POLICY "Public delete site_settings" ON public.site_settings FOR DELETE TO public USING (true);
CREATE POLICY "Public delete tenants" ON public.tenants FOR DELETE TO public USING (true);
