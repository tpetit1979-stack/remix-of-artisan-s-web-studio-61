-- S5: make MEDIA-001's governance effective in the public runtime, and
-- expose trade_service_template_id for precise per-service resolution.
-- Column order preserved for existing columns; new column appended at the
-- end so CREATE OR REPLACE VIEW can be used without dropping the view
-- (and therefore without losing/needing to reapply its GRANTs).
CREATE OR REPLACE VIEW public.public_trade_media
WITH (security_invoker = true)
AS
SELECT
  id,
  trade_template_id,
  media_type,
  image_path,
  alt_text,
  sort_order,
  trade_service_template_id
FROM public.trade_media_library
WHERE is_active = true
  AND review_status = 'approved';
