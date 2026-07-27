DROP POLICY IF EXISTS "tenant_media_super_admin" ON public.tenant_media;

CREATE POLICY "tenant_media_super_admin" ON public.tenant_media
FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());
