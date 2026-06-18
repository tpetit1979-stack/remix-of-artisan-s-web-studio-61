-- Migration to apply manually on the connected external Supabase project
-- (bygdvkpjreuilqghtnka). Run this SQL in the Supabase SQL editor.
--
-- Adds online booking columns to site_settings. Covered by existing RLS
-- policies on site_settings — no new policies required.

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS booking_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS booking_provider text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS booking_url text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS booking_button_label text DEFAULT 'Prendre rendez-vous';
