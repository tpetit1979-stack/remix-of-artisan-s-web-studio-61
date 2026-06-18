
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS hero_image_url text;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS years_experience integer;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS tagline text;
