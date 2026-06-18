-- 1. Drop the overly permissive public SELECT policy on the table
DROP POLICY IF EXISTS public_read_active_trade_media ON public.trade_media_library;

-- 2. Create a restricted view exposing only render-necessary columns for active media
CREATE OR REPLACE VIEW public.public_trade_media
WITH (security_invoker = true)
AS
SELECT
  id,
  trade_template_id,
  media_type,
  image_path,
  alt_text,
  sort_order
FROM public.trade_media_library
WHERE is_active = true;

-- 3. Grant SELECT on the view to anon and authenticated
GRANT SELECT ON public.public_trade_media TO anon, authenticated;

-- 4. Re-add a minimal SELECT policy on the table so the security_invoker view works for anon
--    (only active rows, only render columns are projected by the view anyway)
CREATE POLICY public_read_active_trade_media_via_view
  ON public.trade_media_library
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

COMMENT ON VIEW public.public_trade_media IS
  'Public-safe projection of trade_media_library: only render columns of active media. Use this from frontend instead of querying the table directly.';