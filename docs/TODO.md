# TODO

## Edge Function `refresh-google-ratings`

**Statut** : non implémenté, aucun code écrit — noté pour référence future.

**Objectif** : rafraîchir périodiquement la note Google et le nombre d'avis de chaque tenant.

**Comportement attendu** :
1. Lit tous les tenants avec `google_place_id` non null.
2. Appelle Google Places API Details (champs : `rating`, `user_ratings_total`).
3. Met à jour `tenants.google_rating`, `tenants.google_review_count`, `tenants.google_rating_updated_at`.
4. Planifiée une fois par semaine, via pg_cron ou Supabase Scheduled Functions.

**Contexte vérifié en base au moment de la rédaction (2026-07-22, projet `bygdvkpjreuilqghtnka`)** :
- Les colonnes `google_place_id` (text), `google_rating` (numeric), `google_review_count` (integer) et `google_rating_updated_at` (timestamptz) existent déjà sur `tenants` en production.
- Elles ne sont **pas** présentes dans `src/integrations/supabase/types.ts` — même désynchronisation que celle traitée pour `tenant_partners`/`booking_*`/`opening_hours`. À corriger avant ou pendant l'implémentation de cette fonction.
- Aucune clé Google Places API n'est configurée dans les secrets Edge Functions actuellement — à ajouter (ex. `GOOGLE_PLACES_API_KEY`).

**À faire à l'implémentation** :
- [ ] Créer `supabase/functions/refresh-google-ratings/index.ts`
- [ ] Ajouter/régénérer le type des 4 colonnes `google_*` dans `types.ts`
- [ ] Configurer le secret `GOOGLE_PLACES_API_KEY`
- [ ] Planifier l'exécution hebdomadaire (pg_cron ou Scheduled Functions)
- [ ] Décider du comportement en cas d'échec d'appel Google pour un tenant donné (retry, skip silencieux, log) — ne doit pas bloquer le traitement des autres tenants
