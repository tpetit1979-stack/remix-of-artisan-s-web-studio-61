-- S2: distinguish provenance/origin/editorial-qualification for portfolio media
ALTER TABLE public.portfolio
ADD COLUMN source_template_media_id uuid
  REFERENCES public.trade_media_library(id)
  ON DELETE RESTRICT,
ADD COLUMN media_origin text NOT NULL DEFAULT 'tenant',
ADD COLUMN content_kind text NOT NULL DEFAULT 'real_project';

ALTER TABLE public.portfolio
ADD CONSTRAINT portfolio_media_origin_check
CHECK (media_origin IN ('template', 'tenant')),
ADD CONSTRAINT portfolio_content_kind_check
CHECK (content_kind IN ('illustration', 'real_project'));

-- Targeted backfill: the 5 known EASYDEP demo rows are illustrations, not real projects
UPDATE public.portfolio
SET content_kind = 'illustration'
WHERE tenant_id = 'ae32efca-aa8c-4df9-b1c9-f0d0fc76b848'
  AND id IN (
    'f3ba280f-2bfd-4d42-96ee-bca40ee3fcd2',
    '8fd8ccdf-27e8-406d-aa21-def074dd6263',
    '408996b7-fb1f-48ad-ab2e-5a56bcd5c3cd',
    'b9bb4fc4-f01b-4e9e-a213-212a533d6a72',
    '8efcba40-89c8-4533-aed1-bfd543a78edf'
  )
  AND is_published = false;

CREATE INDEX portfolio_source_template_media_id_idx
ON public.portfolio (source_template_media_id)
WHERE source_template_media_id IS NOT NULL;
