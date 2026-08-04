-- WhatsApp click-to-chat + click-to-call configuration, and photo attachments
-- on the public contact form.

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS whatsapp_number text,
  ADD COLUMN IF NOT EXISTS whatsapp_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_message_template text;

COMMENT ON COLUMN public.site_settings.whatsapp_number IS
  'Tenant''s WhatsApp number, digits only (E.164 without +), e.g. 33612345678. Null = not configured.';
COMMENT ON COLUMN public.site_settings.whatsapp_enabled IS
  'Explicit opt-in. The WhatsApp button never renders unless true AND whatsapp_number is set.';
COMMENT ON COLUMN public.site_settings.whatsapp_message_template IS
  'Pre-filled wa.me message. Kept neutral by default in the UI (no "gratuit") -- never assumes a promise.';

ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS photo_urls text[];

COMMENT ON COLUMN public.contacts.photo_urls IS
  'Public URLs of photos attached by the visitor to this request, uploaded to the contact-uploads bucket.';

-- Dedicated bucket for anonymous visitor uploads, kept separate from `media`
-- (which is scoped to authenticated tenant members / super admin only).
INSERT INTO storage.buckets (id, name, public)
VALUES ('contact-uploads', 'contact-uploads', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access for contact-uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'contact-uploads');

-- Anonymous visitors may only write under a folder named after a real, active
-- tenant id -- prevents writing to an arbitrary path or to an inactive/unknown
-- tenant. No UPDATE/DELETE policy for anon: uploads are write-once from the
-- public form, cleanup is a Super Admin concern if ever needed.
CREATE POLICY "Tenant-scoped anon insert contact-uploads"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'contact-uploads'
  AND (storage.foldername(name))[1] ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
  AND EXISTS (
    SELECT 1 FROM public.tenants
    WHERE id = ((storage.foldername(name))[1])::uuid AND is_active = true
  )
);
