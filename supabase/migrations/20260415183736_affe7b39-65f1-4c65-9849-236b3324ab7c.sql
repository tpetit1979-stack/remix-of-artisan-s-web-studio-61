-- Allow public insert on tenants (temporary until auth is implemented)
CREATE POLICY "Public insert tenants"
ON public.tenants
FOR INSERT
TO public
WITH CHECK (true);

-- Allow public insert on site_settings (temporary until auth is implemented)
CREATE POLICY "Public insert site_settings"
ON public.site_settings
FOR INSERT
TO public
WITH CHECK (true);

-- Allow public update on tenants (temporary until auth is implemented)
CREATE POLICY "Public update tenants"
ON public.tenants
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Allow public update on site_settings (temporary until auth is implemented)
CREATE POLICY "Public update site_settings"
ON public.site_settings
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);