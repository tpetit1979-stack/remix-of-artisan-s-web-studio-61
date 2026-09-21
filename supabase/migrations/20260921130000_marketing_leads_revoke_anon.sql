-- Défense en profondeur sur public.marketing_leads.
--
-- La table hérite des privilèges par défaut du schéma public : `anon` dispose
-- de droits de table directs (SELECT, INSERT, UPDATE, DELETE…). La RLS les
-- neutralise déjà — aucune policy ne vise `anon` — mais cette table n'a
-- aucune raison métier d'être atteignable depuis un navigateur : elle
-- s'écrit uniquement côté serveur via service_role, et se lit uniquement par
-- le Super Admin.
--
-- Une seule couche de protection suffisait en théorie ; deux valent mieux ici.
--
-- Migration volontairement additive : la création de la table est déjà
-- appliquée et n'est pas modifiée rétroactivement.
--
-- `authenticated` conserve ses privilèges : le futur écran Super Admin en a
-- besoin, et la policy `super_admin_manage_marketing_leads` reste le seul
-- filtre qui décide qui voit quoi. `service_role` contourne la RLS et n'est
-- pas concerné par ce revoke.

revoke all on table public.marketing_leads from anon;
