-- MEDIA-001: provenance and review governance for trade_media_library
ALTER TABLE public.trade_media_library
ADD COLUMN source_type text NOT NULL DEFAULT 'unclassified',
ADD COLUMN source_provider text NULL,
ADD COLUMN source_reference text NULL,
ADD COLUMN license_code text NULL,
ADD COLUMN author_credit text NULL,
ADD COLUMN review_status text NOT NULL DEFAULT 'pending',
ADD COLUMN metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.trade_media_library
ADD CONSTRAINT trade_media_library_source_type_check
CHECK (source_type IN (
  'unclassified',
  'legacy_unknown',
  'licensed_stock',
  'ai_generated',
  'owned',
  'manufacturer_authorized'
)),
ADD CONSTRAINT trade_media_library_review_status_check
CHECK (review_status IN ('pending', 'approved', 'rejected')),
ADD CONSTRAINT trade_media_library_metadata_object_check
CHECK (jsonb_typeof(metadata) = 'object'),
ADD CONSTRAINT trade_media_library_review_source_consistency_check
CHECK (
  review_status <> 'approved'
  OR source_type NOT IN ('unclassified', 'legacy_unknown')
),
ADD CONSTRAINT trade_media_library_source_provider_not_blank_check
CHECK (source_provider IS NULL OR btrim(source_provider) <> ''),
ADD CONSTRAINT trade_media_library_source_reference_not_blank_check
CHECK (source_reference IS NULL OR btrim(source_reference) <> ''),
ADD CONSTRAINT trade_media_library_license_code_not_blank_check
CHECK (license_code IS NULL OR btrim(license_code) <> ''),
ADD CONSTRAINT trade_media_library_author_credit_not_blank_check
CHECK (author_credit IS NULL OR btrim(author_credit) <> '');

-- Backfill contrôlé des 4 médias legacy identifiés avant MEDIA-001
DO $$
DECLARE
  affected_rows integer;
BEGIN
  UPDATE public.trade_media_library
  SET
    source_type = 'legacy_unknown',
    review_status = 'pending'
  WHERE id IN (
    'dcfa534b-2c41-478c-abaf-62110f3b22e7',
    '01a34ea4-00b1-4371-b289-7aad245b76f2',
    '3c48fcac-8b9c-4e14-91de-09f0e1172c83',
    'f51db602-2215-4ed7-aed7-1d33630466e8'
  );

  GET DIAGNOSTICS affected_rows = ROW_COUNT;

  IF affected_rows <> 4 THEN
    RAISE EXCEPTION
      'MEDIA-001 backfill expected 4 rows, updated %',
      affected_rows;
  END IF;
END
$$;
