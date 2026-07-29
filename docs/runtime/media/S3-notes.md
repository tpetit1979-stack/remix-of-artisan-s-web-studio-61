# S3 — services / trade_media_library → trade_service_templates

## Pourquoi aucun backfill

Vérifié le 2026-07-29 sur la base de production (bygdvkpjreuilqghtnka) :
jointure de toutes les lignes `services` existantes (68 lignes, ~10 tenants)
contre `trade_service_templates` sur `(tenant.trade_template_id, service.slug)
= (trade_service_templates.trade_template_id, trade_service_templates.slug)`.

Résultat : 0 correspondance, y compris pour les tenants dont
`tenants.trade_template_id` est renseigné. Les services existants ont été
créés avant l'introduction du catalogue `trade_service_templates` et leurs
slugs ne correspondent à aucune ligne du catalogue.

Un backfill automatique aurait donc introduit soit des associations
arbitraires (rapprochement approximatif par nom), soit aucune association
réelle — dans les deux cas, plus de dette que de valeur.

## Stratégie retenue

`services.trade_service_template_id` et `trade_media_library.trade_service_template_id`
sont ajoutées comme colonnes nullables, sans backfill. Elles restent NULL sur
toutes les lignes existantes. Le lien ne sera peuplé qu'à la création (S4 —
onboarding) et, pour les données historiques, uniquement par une
réconciliation manuelle explicite si elle est un jour décidée — hors
périmètre de S3.

## ON DELETE RESTRICT

Choisi plutôt que SET NULL : une suppression de `trade_service_templates`
correspond à une fusion/consolidation de gabarits, jamais à un renommage
(qui est un simple UPDATE, non concerné par cette contrainte). RESTRICT
force une réaffectation explicite (`UPDATE ... SET trade_service_template_id
= <survivant>`) avant toute suppression, évitant qu'une fusion n'orpheline
silencieusement la classification de services et de médias à travers
plusieurs tenants.
