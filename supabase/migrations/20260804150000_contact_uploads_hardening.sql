-- Hardens the contact-uploads bucket introduced in 20260804140000:
-- public SELECT allowed both guessing AND listing every object in the
-- bucket (Supabase Storage's list API is itself gated by this same RLS
-- policy) -- too permissive for visitor-submitted photos. Make the bucket
-- private, add server-side size/type enforcement, and replace the public
-- read policy with a tenant-scoped one for future signed-URL admin viewing.

UPDATE storage.buckets
SET
  public = false,
  file_size_limit = 8388608, -- 8 MB, matches client-side validateImageFile
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
WHERE id = 'contact-uploads';

DROP POLICY IF EXISTS "Public read access for contact-uploads" ON storage.objects;

-- Only the owning tenant's members or a super admin may read -- needed so a
-- future admin feature can generate signed URLs to display these photos.
-- No public/anon read at all.
CREATE POLICY "Tenant-scoped read contact-uploads"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'contact-uploads'
  AND (
    is_super_admin()
    OR (
      (storage.foldername(name))[1] ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
      AND is_tenant_member(((storage.foldername(name))[1])::uuid)
    )
  )
);
