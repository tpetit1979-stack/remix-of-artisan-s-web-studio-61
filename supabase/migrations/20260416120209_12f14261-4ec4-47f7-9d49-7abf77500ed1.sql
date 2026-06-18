
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS border_radius integer DEFAULT 8,
  ADD COLUMN IF NOT EXISTS gradient_style text DEFAULT 'flat',
  ADD COLUMN IF NOT EXISTS header_style text DEFAULT 'solid',
  ADD COLUMN IF NOT EXISTS font_family text DEFAULT 'inter';
