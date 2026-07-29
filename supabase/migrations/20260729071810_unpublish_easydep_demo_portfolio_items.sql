-- Data migration, not a schema change: the 5 EASYDEP portfolio rows below are
-- stock-photo (Unsplash) placeholders that were bulk-inserted outside any
-- application flow and published as if they were real completed jobs.
-- PD-001 requires that a tenant with no authentic portfolio item shows its
-- "Réalisations" section masked rather than a generic/fictitious photo.
-- This unpublishes them (reversible, not a delete) so the section masks
-- itself. Idempotent: matches only rows still published, scoped to this one
-- tenant and these five ids.
UPDATE public.portfolio
SET
  is_published = false,
  updated_at = now()
WHERE tenant_id = 'ae32efca-aa8c-4df9-b1c9-f0d0fc76b848'
  AND id IN (
    'f3ba280f-2bfd-4d42-96ee-bca40ee3fcd2',
    '8fd8ccdf-27e8-406d-aa21-def074dd6263',
    '408996b7-fb1f-48ad-ab2e-5a56bcd5c3cd',
    'b9bb4fc4-f01b-4e9e-a213-212a533d6a72',
    '8efcba40-89c8-4533-aed1-bfd543a78edf'
  )
  AND is_published = true;
