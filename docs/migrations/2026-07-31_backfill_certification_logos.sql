-- Backfill de tenant_certifications.logo_url
--
-- Contexte : logo_url est calculé une seule fois à l'import (guessLogoUrl()
-- dans src/lib/rge-api.functions.ts) puis figé en base. CertificationBadges.tsx
-- lit la valeur telle quelle. Après mise à jour du mapping (nouvelle identité
-- Qualit'EnR + 3 nouvelles familles Ventilation + / Chauffage + / Recharge Elec +),
-- il faut recalculer les lignes déjà importées.
--
-- La logique reproduit exactement guessLogoUrl() :
--  - familles historiques testées EN PREMIER (QualiPAC contient déjà le mot
--    "chauffage" : "QualiPAC module Chauffage et ECS") ;
--  - "chauffage +" / "chaudière à condensation" uniquement pour Chauffage + ;
--  - comparaisons insensibles à la casse ET aux accents (unaccent non requis :
--    on énumère les variantes rencontrées dans les données ADEME).
--
-- À exécuter dans le SQL Editor Supabase (une seule fois).

UPDATE public.tenant_certifications AS tc
SET logo_url = sub.new_logo_url,
    updated_at = now()
FROM (
  SELECT
    id,
    CASE
      -- Familles historiques Qualit'EnR (priorité absolue)
      WHEN lower(certification_name) LIKE '%qualibois%' THEN '/logos/qualibois.png'
      WHEN lower(certification_name) LIKE '%qualipac%'  THEN '/logos/qualipac.png'
      WHEN lower(certification_name) LIKE '%qualisol%'  THEN '/logos/qualisol.png'
      WHEN lower(certification_name) LIKE '%qualipv%'   THEN '/logos/qualipv.png'

      -- Nouvelles familles
      WHEN lower(certification_name) LIKE '%ventilation%' THEN '/logos/ventilation-plus.png'
      WHEN lower(certification_name) LIKE '%recharge%'    THEN '/logos/recharge-elec-plus.png'
      WHEN lower(certification_name) LIKE '%chauffage +%'
        OR lower(certification_name) LIKE '%chauffage+%'
        OR lower(certification_name) LIKE '%chaudiere a condensation%'
        OR lower(certification_name) LIKE '%chaudière à condensation%'
        OR lower(certification_name) LIKE '%chaudieres a condensation%'
        OR lower(certification_name) LIKE '%chaudières à condensation%'
        THEN '/logos/chauffage-plus.png'

      -- Autres organismes certificateurs
      WHEN lower(organisme) LIKE '%qualibat%'   THEN '/logos/qualibat.svg'
      WHEN lower(organisme) LIKE '%qualifelec%' THEN '/logos/qualifelec.png'
      WHEN lower(organisme) LIKE '%certibat%'   THEN '/logos/certibat.png'
      WHEN lower(organisme) LIKE '%qualitenr%'
        OR lower(organisme) LIKE '%qualit enr%'
        OR lower(organisme) LIKE '%qualit''enr%'
        THEN '/logos/qualitenr.png'

      ELSE NULL
    END AS new_logo_url
  FROM public.tenant_certifications
) AS sub
WHERE tc.id = sub.id
  AND tc.logo_url IS DISTINCT FROM sub.new_logo_url;

-- Contrôle : plus aucune ligne active ne doit rester sans logo.
-- SELECT certification_name, organisme, logo_url
-- FROM public.tenant_certifications
-- WHERE is_active AND logo_url IS NULL;
