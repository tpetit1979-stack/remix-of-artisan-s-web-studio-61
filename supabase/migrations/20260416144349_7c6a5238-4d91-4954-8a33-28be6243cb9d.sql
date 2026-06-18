
CREATE POLICY "Public insert certifications"
ON public.tenant_certifications
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Public insert service_areas"
ON public.service_areas
FOR INSERT
TO public
WITH CHECK (true);
