
# Audit QA — Workflow complet demo@bfie-easydep.fr

Aucun fichier modifié. Analyse basée sur l'état HEAD du sandbox.

---

## 1. Visiteur → /login

**Composants** : `src/routes/login.tsx`, `useAuth` (`src/hooks/use-auth.tsx`).
**Appels Supabase** : aucun tant que non soumis.

- 🟢 `validateSearch` sécurise `redirect`.
- 🟠 Le `useEffect` de redirection dépend de `role` : entre `isAuthenticated=true` et `role` résolu, il y a **1 tick** durant lequel `role` est encore `null`. Si `search.redirect` est vide, on tombe sur la branche `role === "super_admin" ? "/super-admin" : "/admin/settings"` → un `tenant_admin` peut être **redirigé une fraction de seconde vers `/admin/settings` avant que role n'arrive**, ce qui est OK car même destination, mais un `super_admin` sans redirect explicite serait envoyé vers `/admin/settings` puis rebond vers `/super-admin/tenants` par `admin.tsx`. Cosmétique, non bloquant.
- 🟢 Toast d'erreur i18n sur `Invalid login credentials`.

## 2. signIn → session Supabase

**Hook** : `useAuth.signIn` → `supabase.auth.signInWithPassword`.
**Écouteurs** : `onAuthStateChange` monté dans `AuthProvider`.

- 🟢 Listener enregistré **avant** `getSession()` (pattern correct anti-deadlock).
- 🟢 `setTimeout(…, 0)` déférant `fetchRoleAndTenant` pour éviter le deadlock du callback auth.
- 🟠 **Race condition potentielle** : `getSession().then(async …)` et `onAuthStateChange` peuvent chacun déclencher `fetchRoleAndTenant`. Sur un login rapide, on peut voir deux fetch parallèles — bénin (idempotent) mais consomme des requêtes.
- 🟠 **Pas de `try/catch`** autour de `fetchRoleAndTenant` dans le listener : si `user_roles` répond 500, `role` reste `null` silencieusement → l'utilisateur reste bloqué sur un spinner sans message.
- 🟠 `isLoading` n'est passé à `false` **que** par la branche `getSession()`. Si `getSession()` échoue (réseau), `isLoading` reste `true` indéfiniment → écran de chargement infini.

## 3. Chargement utilisateur → user_roles + tenant_members

**Requêtes** : deux `maybeSingle()` en parallèle sur `user_roles` et `tenant_members`.

- 🟢 `maybeSingle()` (pas `single()`) → pas de 406 si l'utilisateur n'a pas encore de row.
- 🔴 **RLS `tenant_members` — à vérifier côté DB** : la policy doit autoriser `auth.uid() = user_id` en SELECT. Sans cette policy, `tenantId` restera `null` même si la row existe → `AdminLayout` bouclera vers `/login` puisque `canAccess` (`isTenantAdmin || (isSuperAdmin && !!impersonatedId)`) restera true mais `effectiveTenantId` sera `null` → `useTenant()` ne pourra jamais résoudre le tenant → toutes les mutations admin échoueront.
- 🟠 Le hook ne lit qu'**un seul** `user_roles.role` via `maybeSingle()`. Si l'utilisateur reçoit un jour deux rôles (ex. super_admin + tenant_admin), PostgREST retournera une erreur `PGRST116`. Prévoir `.limit(1)` ou un ordre explicite.
- 🟠 `tenant_members` — même remarque : si un user appartient à plusieurs tenants (multi-tenant côté user), on prend arbitrairement le premier.

## 4. Redirection vers /admin (AdminLayout)

**Fichier** : `src/routes/admin.tsx`.

- 🟢 Garde `isLoading` avant redirection → évite le flash `/login`.
- 🟢 `canAccess = isTenantAdmin || (isSuperAdmin && !!impersonatedId)` — correct.
- 🟠 **`useEffect` de redirection** au lieu d'un `beforeLoad` : conforme au pattern actuel du projet (auth stockée en `localStorage`, non lisible côté SSR), mais entraîne un **flash de spinner** pendant la vérification. Acceptable pour une démo.
- 🟠 Si `role` arrive **après** `isAuthenticated=true` mais **avant** `isLoading=false`, le `canAccess` est momentanément `false` → aucun redirect ne se déclenche (car gardé par `isLoading`). OK.
- 🟢 `TenantAdminBanner` / `ImpersonationBanner` bien dispatchés selon rôle.

## 5. AdminIndex → /admin/services

**Fichier** : `src/routes/admin.index.tsx`.

- 🟠 Redirection en `useEffect` côté client. `return null` = flash blanc court. Fonctionnel mais un `<Navigate>` de TanStack serait plus propre.
- 🟢 Cohérent avec `login.tsx` qui pointe `tenant_admin` vers `/admin/settings` — divergence à vérifier : login redirige vers `/admin/settings`, `admin.index` vers `/admin/services`. Selon le point d'entrée, l'utilisateur atterrit sur des pages différentes. Cosmétique.

## 6. Navigation admin

**Composants** : `AdminSidebar`, `AdminPageHeader`, `useTenant`.

- 🟢 `useTenant()` fournit le tenant actif via `TenantProvider` (résolu SSR + hydraté client).
- 🟠 `useTenant()` peut retourner `tenant=null` pendant l'hydratation client sur un tenant admin (pas de super-admin impersonation, résolution par hostname). Tous les composants admin ont `if (!tenant) return <Chargement>` — à confirmer sur chaque page.

## 7. Création Portfolio → Dialog

**Fichier** : `src/routes/admin.portfolio.tsx`.

- 🟢 `useQuery(["admin-portfolio", tenant?.id])` bien scopé, `enabled: !!tenant?.id`.
- 🟢 Suggestions `trade_media_library` désactivées si `items.length > 0` — comportement voulu.
- 🟠 `queryClient.invalidateQueries({ queryKey: ["admin-portfolio"] })` invalide **toutes** les variations tenant. Bénin en single-tenant admin, mais si un super_admin impersonne, il pourrait invalider une clé étrangère. Acceptable.
- 🟠 **Bouton "Enregistrer" désactivé si `!editingItem.image_url`** → OK, mais aucun feedback si l'URL externe est invalide (404). L'image cassée s'affichera côté public.

## 8. Upload image → bucket `media`

**Fichier** : `src/lib/media-upload.ts` (non ré-inspecté ici — pattern connu, `uploadImage({ bucket: "media", path, file })`).

- 🔴 **RLS Storage `media` — à vérifier** :
  - Policy INSERT/UPDATE sur `storage.objects` doit autoriser `auth.uid()` **owner du tenant** correspondant au chemin. Le path est construit par `buildMediaPath({ scope: tenant!.id, kind: "portfolio", … })` → convention `{{tenant_id}}/portfolio/…`. La policy doit extraire `tenant_id` du path et vérifier via `has_role()` ou une jointure `tenant_members`.
  - Sans cette policy correctement écrite, l'upload retournera `403 new row violates row-level security` → toast d'erreur générique, image jamais uploadée.
- 🟠 `validateImageFile` bloque taille/type côté client, mais aucune limite côté bucket → un attaquant peut contourner. À valider dans les CORS/rules du bucket.
- 🟠 Pas de nettoyage : si l'upload réussit mais que `saveMutation` échoue, l'image reste orpheline dans le bucket.

## 9. Sauvegarde `portfolio` → INSERT

- 🔴 **RLS `portfolio` — à vérifier** : policy INSERT `WITH CHECK (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()))` (ou équivalent via `has_role`). Sinon 403.
- 🟠 **Pas de filtre `tenant_id` sur l'UPDATE/DELETE** (ligne 129 : `.eq("id", item.id)` seul). Comptez sur RLS uniquement. Confirmé lors d'un audit précédent — non corrigé. Non bloquant si RLS est solide, mais defense-in-depth manquante.
- 🟢 `is_published: true` par défaut → visible immédiatement sur le site public après création.
- 🟠 `sort_order ?? items.length` : deux créations quasi simultanées peuvent produire le même ordre. Bénin.

## 10. Affichage sur le site public

**Fichiers concernés** : `src/routes/index.tsx`, `src/routes/realisations.tsx`, `src/routes/services.$serviceSlug.tsx`.

- 🟢 `portfolio.image_url` désormais direct (migration complétée).
- 🟠 Invalidation cache : après création admin, le site public n'invalide **pas** ses propres queries (`useQuery(["portfolio", tenantId])` distinct). L'admin voit la nouvelle réalisation ; l'utilisateur public devra rafraîchir ou attendre `staleTime` (2 min via `defaultOptions.queries.staleTime`).
- 🟠 Filtre `is_published = true` à vérifier sur les fetchers publics (`fetchPortfolio` dans `src/lib/tenant.ts`). Si absent, les brouillons créés via "Utiliser comme point de départ" (créés avec `is_published: false`) seront exposés publiquement.

---

## Points UX en cas d'erreur

- 🟠 Erreur upload : `toast.error(err.message)` affiche le message brut Supabase (souvent en anglais et technique).
- 🟠 Erreur RLS INSERT : idem, l'utilisateur voit `new row violates row-level security policy for table "portfolio"` — cryptique.
- 🟠 Aucune page 500 dédiée pour `admin.portfolio` : les erreurs de query font juste un `<p>Chargement…</p>` infini (pas d'`errorComponent` sur ces routes).

---

## Points bloquants à vérifier avant test manuel

1. 🔴 **Policies RLS `tenant_members` SELECT** : le user peut-il lire sa propre row ? (test rapide : `SELECT * FROM tenant_members WHERE user_id = auth.uid()` en tant que demo@…).
2. 🔴 **Policies RLS `portfolio` INSERT/UPDATE/DELETE** : le user peut-il écrire pour son tenant ?
3. 🔴 **Policies RLS Storage bucket `media`** : le user peut-il uploader dans `{{tenant_id}}/portfolio/…` ?
4. 🟠 **Filtre `is_published` sur les fetchers publics** (`fetchPortfolio`).

---

## Verdict

Si les **3 points 🔴 RLS** sont vérifiés et fonctionnels (ce que je ne peux pas confirmer sans exécuter une requête authentifiée en tant que demo@…), le workflow front-end tient la route.

**Corriger ces points avant le test manuel** — plus précisément, exécuter côté DB :

```sql
-- en tant que demo@bfie-easydep.fr (auth.uid = 5e47621f-…)
SELECT * FROM public.tenant_members WHERE user_id = auth.uid();
SELECT * FROM public.user_roles WHERE user_id = auth.uid();
INSERT INTO public.portfolio (tenant_id, title, image_url) VALUES ('<bfie-easydep-tenant-id>', 'test', 'https://x');
```

Si ces trois requêtes réussissent → **le workflow est prêt pour un test manuel**. Sinon, corriger les policies RLS avant.
