-- Tenant-scoped write access for the public "media" bucket.
--
-- Context: INSERT/UPDATE/DELETE policies on storage.objects for bucket
-- "media" were previously gated only by `bucket_id = 'media'`, with no
-- check on which tenant folder was being written to. Any authenticated
-- user (any tenant_admin, of any tenant) could write/replace/delete
-- objects under another tenant's folder.
--
-- Path convention (confirmed against every real write path in the code —
-- admin.portfolio.tsx, super-admin.tenants.$tenantId.media.tsx,
-- TeamManager.tsx, PartnersManager.tsx — and against every object
-- currently stored in the bucket): the first path segment is always the
-- tenant's UUID, e.g. "{tenant_id}/portfolio/xxx.jpg" or "{tenant_id}/logo-xxx.jpg".
--
-- SELECT is untouched: the bucket is public and reads already bypass RLS
-- via public URLs, so the existing "Public read access for media" policy
-- is left exactly as-is.
--
-- The "trade-media" bucket is untouched — it has no tenant_id concept
-- (paths are scoped by trade slug) and its policies are already correctly
-- gated by is_super_admin().

DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete media" ON storage.objects;

CREATE POLICY "Tenant-scoped insert media" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'media'
  AND (
    is_super_admin()
    OR (
      (storage.foldername(name))[1] ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
      AND is_tenant_member((storage.foldername(name))[1]::uuid)
    )
  )
);

CREATE POLICY "Tenant-scoped update media" ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'media'
  AND (
    is_super_admin()
    OR (
      (storage.foldername(name))[1] ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
      AND is_tenant_member((storage.foldername(name))[1]::uuid)
    )
  )
)
WITH CHECK (
  bucket_id = 'media'
  AND (
    is_super_admin()
    OR (
      (storage.foldername(name))[1] ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
      AND is_tenant_member((storage.foldername(name))[1]::uuid)
    )
  )
);

CREATE POLICY "Tenant-scoped delete media" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'media'
  AND (
    is_super_admin()
    OR (
      (storage.foldername(name))[1] ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
      AND is_tenant_member((storage.foldername(name))[1]::uuid)
    )
  )
);
