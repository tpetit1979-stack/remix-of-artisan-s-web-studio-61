-- Backfill de tenant_certifications.logo_url
--
-- Contexte : logo_url est calculé une seule fois à l'import (guessLogoUrl()
-- dans src/lib/rge-api.functions.ts) puis figé en base. CertificationBadges.tsx
-- lit la valeur telle quelle. Après mise à jour du mapping (nouvelle identité
-- Qualit'EnR + 3 nouvelles familles Ventilation + / Chauffage + / Recharge Elec +),
-- il faut recalculer les lignes déjà importées.
--
-- La logique reproduit exactement guessLogoUrl() :
--  - le nom de famille est cherché dans certification_name ET
--    qualification_name concaténés (sur des données réelles, une ligne peut
--    avoir un certification_name générique "RGE" alors que le nom de
--    famille, ex. "Qualibois Bois & Granulés", n'existe que dans
--    qualification_name) ;
--  - familles historiques testées EN PREMIER (QualiPAC contient déjà le mot
--    "chauffage" : "QualiPAC module Chauffage et ECS") ;
--  - "chauffage +" / "chaudière à condensation" uniquement pour Chauffage + ;
--  - comparaisons insensibles à la casse ET aux accents (unaccent non requis :
--    on énumère les variantes rencontrées dans les données ADEME).
--
-- Sécurité : une ligne dont ni le nom de qualification ni l'organisme ne
-- correspond à une famille reconnue conserve sa valeur actuelle (ELSE
-- tc.logo_url, jamais NULL) — ce backfill ne doit jamais effacer un logo
-- déjà renseigné pour une famille qu'il ne reconnaît pas.

UPDATE public.tenant_certifications AS tc
SET logo_url = sub.new_logo_url,
    updated_at = now()
FROM (
  SELECT
    id,
    organisme,
    combined_name,
    CASE
      -- Familles historiques Qualit'EnR (priorité absolue)
      WHEN combined_name LIKE '%qualibois%' THEN '/logos/qualibois.png'
      WHEN combined_name LIKE '%qualipac%'  THEN '/logos/qualipac.png'
      WHEN combined_name LIKE '%qualisol%'  THEN '/logos/qualisol.png'
      WHEN combined_name LIKE '%qualipv%'   THEN '/logos/qualipv.png'

      -- Nouvelles familles
      WHEN combined_name LIKE '%ventilation%' THEN '/logos/ventilation-plus.png'
      WHEN combined_name LIKE '%recharge%'    THEN '/logos/recharge-elec-plus.png'
      WHEN combined_name LIKE '%chauffage +%'
        OR combined_name LIKE '%chauffage+%'
        OR combined_name LIKE '%chaudiere a condensation%'
        OR combined_name LIKE '%chaudière à condensation%'
        OR combined_name LIKE '%chaudieres a condensation%'
        OR combined_name LIKE '%chaudières à condensation%'
        THEN '/logos/chauffage-plus.png'

      -- Autres organismes certificateurs
      WHEN lower(organisme) LIKE '%qualibat%'   THEN '/logos/qualibat.svg'
      WHEN lower(organisme) LIKE '%qualifelec%' THEN '/logos/qualifelec.png'
      WHEN lower(organisme) LIKE '%certibat%'   THEN '/logos/certibat.png'
      WHEN lower(organisme) LIKE '%qualitenr%'
        OR lower(organisme) LIKE '%qualit enr%'
        OR lower(organisme) LIKE '%qualit''enr%'
        THEN '/logos/qualitenr.png'

      -- Famille/organisme non reconnu par ce mapping : ne rien changer.
      ELSE logo_url
    END AS new_logo_url
  FROM (
    SELECT
      tc2.id,
      tc2.organisme,
      tc2.logo_url,
      lower(coalesce(tc2.certification_name, '') || ' ' || coalesce(tc2.qualification_name, '')) AS combined_name
    FROM public.tenant_certifications tc2
  ) AS named
) AS sub
WHERE tc.id = sub.id
  AND tc.logo_url IS DISTINCT FROM sub.new_logo_url;

-- Contrôle : lignes actives dont la famille EST reconnue par ce mapping
-- (qualibois/qualipac/qualisol/qualipv/ventilation/recharge/chauffage+) mais
-- qui restent sans logo — un résultat vide est attendu après ce backfill.
-- Ne pas utiliser ce contrôle pour des familles hors de ce mapping : un
-- organisme non couvert peut légitimement n'avoir aucun logo.
-- SELECT certification_name, qualification_name, organisme, logo_url
-- FROM public.tenant_certifications
-- WHERE is_active
--   AND logo_url IS NULL
--   AND (
--     lower(coalesce(certification_name,'') || ' ' || coalesce(qualification_name,''))
--       ~ 'qualibois|qualipac|qualisol|qualipv|ventilation|recharge|chauffage\s*\+|chaudi[eè]res?\s*[aà]\s*condensation'
--     OR lower(organisme) ~ 'qualibat|qualifelec|certibat|qualit.?enr'
--   );
