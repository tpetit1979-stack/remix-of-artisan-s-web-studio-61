-- S3: link tenant services and generic trade media to the canonical
-- per-métier service-type catalog (trade_service_templates).
-- Purely additive: nullable FKs, no backfill (see docs/runtime/media/S3-notes.md).
ALTER TABLE public.services
ADD COLUMN trade_service_template_id uuid
  REFERENCES public.trade_service_templates(id)
  ON DELETE RESTRICT;

ALTER TABLE public.trade_media_library
ADD COLUMN trade_service_template_id uuid
  REFERENCES public.trade_service_templates(id)
  ON DELETE RESTRICT;

CREATE INDEX services_trade_service_template_id_idx
ON public.services (trade_service_template_id)
WHERE trade_service_template_id IS NOT NULL;

CREATE INDEX trade_media_library_trade_service_template_id_idx
ON public.trade_media_library (trade_service_template_id)
WHERE trade_service_template_id IS NOT NULL;
