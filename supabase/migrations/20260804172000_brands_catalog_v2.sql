-- Second refinement round on the brand catalogue:
--  - drop tenant_brands.notes (added speculatively, no clear reader/use case)
--  - add brands.brand_type (manufacturer / flue / accessory / fuel...) --
--    a property of the brand itself, distinct from category
--  - add brands.logo_dark_url, a second logo variant for dark backgrounds
--    (footer, dark CTA sections) so a brand mark never renders invisible
--
-- category and brand_type stay plain text columns -- the controlled
-- vocabulary lives in the Super Admin UI (a fixed <Select> list), not a DB
-- enum/CHECK, so adding a new value never requires a migration.

alter table public.tenant_brands
  drop column notes;

alter table public.brands
  add column brand_type text,
  add column logo_dark_url text;
