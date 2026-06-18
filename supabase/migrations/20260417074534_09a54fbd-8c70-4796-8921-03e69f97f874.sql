-- 1. Table trade_media_library
CREATE TABLE public.trade_media_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trade_template_id UUID NOT NULL REFERENCES public.trade_templates(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('hero', 'service_card', 'proof', 'gallery')),
  title TEXT,
  image_path TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_trade_media_lookup
  ON public.trade_media_library (trade_template_id, media_type, is_active, sort_order);

-- 2. Updated_at trigger (reuse existing function)
CREATE TRIGGER trade_media_library_updated_at
  BEFORE UPDATE ON public.trade_media_library
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 3. RLS
ALTER TABLE public.trade_media_library ENABLE ROW LEVEL SECURITY;

-- Public can read only active media (needed for frontend rendering)
CREATE POLICY "public_read_active_trade_media"
  ON public.trade_media_library
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Super admin full CRUD
CREATE POLICY "super_admin_all_trade_media"
  ON public.trade_media_library
  FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- 4. Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('trade-media', 'trade-media', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage policies on trade-media bucket
-- Public read (since bucket is public; explicit policy for clarity)
CREATE POLICY "trade_media_public_read"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'trade-media');

-- Super admin can insert/update/delete
CREATE POLICY "trade_media_super_admin_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'trade-media' AND public.is_super_admin());

CREATE POLICY "trade_media_super_admin_update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'trade-media' AND public.is_super_admin())
  WITH CHECK (bucket_id = 'trade-media' AND public.is_super_admin());

CREATE POLICY "trade_media_super_admin_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'trade-media' AND public.is_super_admin());

-- 6. Seed missing trade_templates for the requested trades
INSERT INTO public.trade_templates (slug, name, sort_order)
VALUES
  ('cvc', 'CVC', 10),
  ('climatisation', 'Climatisation', 20),
  ('frigoriste', 'Frigoriste', 30),
  ('chauffagiste', 'Chauffagiste', 40),
  ('ventilation', 'Ventilation', 50),
  ('pompes-a-chaleur', 'Pompes à chaleur', 60),
  ('photovoltaique', 'Photovoltaïque', 70),
  ('ramoneur', 'Ramoneur', 80),
  ('multi-services', 'Multi-services', 90),
  ('sav', 'SAV', 100),
  ('cuisiniste', 'Cuisiniste', 110),
  ('lutte-nuisibles', 'Lutte contre les nuisibles', 120),
  ('tpe-pme', 'TPE/PME', 130),
  ('auto-entrepreneur', 'Auto-entrepreneur', 140),
  ('plomberie', 'Plomberie', 150),
  ('electricite', 'Électricité', 160),
  ('courant-faible-automatisme', 'Courant faible et automatisme', 170),
  ('serrurerie', 'Serrurerie', 180),
  ('couverture', 'Couverture', 190),
  ('tous-corps-etat', 'Tous corps d''état', 200),
  ('peintre', 'Peintre', 210),
  ('pisciniste', 'Pisciniste', 220),
  ('paysagiste', 'Paysagiste', 230)
ON CONFLICT (slug) DO NOTHING;