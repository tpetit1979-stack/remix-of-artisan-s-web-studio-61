-- The column-level restriction from the previous migration was only ever
-- meant to protect against anonymous, unauthenticated over-fetching of a
-- future sensitive column. It broke the Super Admin médiathèque
-- (super-admin.tenants.$tenantId.media.tsx), which does SELECT * and
-- explicitly reads source_template_media_id/storage_path to detect legacy
-- rows and clean up storage on delete. Row-level protection for
-- authenticated users was never column-based — it's RLS
-- (tenant_media_owner / tenant_media_super_admin), untouched here.
GRANT SELECT ON public.tenant_media TO authenticated;
