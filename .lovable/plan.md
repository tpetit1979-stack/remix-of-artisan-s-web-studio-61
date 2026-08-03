# Vérification factuelle : synchronisation GitHub ↔ preview

## 1. SHA réellement déployé dans la preview

```text
HEAD (branche de travail de la preview) : 22e86b6c4befa6023714f282db49bbd104ca31b7
  edit/edt-54f61f7c-7ddf-4aad-9462-3c129b38d5f0
main (local)                            : 22e86b6c4befa6023714f282db49bbd104ca31b7
origin/main (après git fetch)            : 22e86b6c4befa6023714f282db49bbd104ca31b7
git diff HEAD origin/main               : (vide)
git status --porcelain                  : (vide)
```

Derniers commits :

```text
22e86b6 feat(admin): sync tenant detail tabs with ?tab= search param
5488c8b fix(google-places): remove invalid postal code lookup
01e5660 Syncé avec main (SHA 912c561)
```

## 2. Est-ce bien `22e86b6` ?

Oui. C'est le HEAD de `origin/main`, le HEAD local et l'arbre de travail servi par la preview, avec zéro différence et zéro fichier modifié. Aucune resynchronisation n'est nécessaire.

## 3. Construction automatique ou cache ?

La preview sert directement l'arbre de travail du dépôt via le serveur de dev (Vite, HMR) — il n'y a pas d'étape de build figée côté serveur à invalider. Vérifié : `node_modules/.vite/deps` daté du 3 août 12:52, soit régénéré à l'ouverture de la session. Le seul cache réellement en jeu est celui de **l'onglet du navigateur** (bundle JS déjà chargé), pas un cache de déploiement.

## 4. Le code `?tab=` est bien présent

Contenu vérifié dans `src/routes/super-admin.tenants.$tenantId.tsx` :

- ligne 80 : liste `VALID_TABS` (tenant, settings, services, zones, certifications, team, partners, booking, ai)
- lignes 88-93 : `validateSearch` qui parse `?tab=`
- lignes 218-219 : `Route.useSearch()` → `activeTab`
- lignes 226-228 : `setTab` qui écrit dans la search param
- ligne 372 : `<Tabs value={activeTab} onValueChange={setTab}>`

Le code est donc bel et bien déployé. Ce qui a été observé en preview n'est pas un décalage de commit.

### Ce que montre l'inspection de la preview ouverte

L'onglet de preview actuellement ouvert est sur :

```text
/login?redirect=%2Flogin      (aucun élément [role="tab"] dans le DOM)
```

Une requête directe sur `/super-admin/tenants/<id>?tab=rdv` renvoie **307** (redirection). La page est protégée : `src/routes/super-admin.tsx` (lignes 19-24) redirige toute session non `super_admin` vers `/login`. Tant que la session n'est pas authentifiée en super-admin, la page ne s'affiche pas du tout — donc `?tab=` ne peut pas être observé.

### Anomalie réelle identifiée (à confirmer avec toi avant correction)

Le garde de `/super-admin` fait :

```ts
navigate({ to: "/login", search: { redirect: location.pathname } })
```

`location.pathname` **exclut la query string**. Conséquence : un lien `/super-admin/tenants/<id>?tab=rdv` ouvert sans session valide perd le `?tab=rdv` au passage par `/login`, et après connexion l'utilisateur retombe sur l'onglet par défaut (`tenant`). C'est cohérent avec le symptôme décrit, et c'est un défaut de code, pas de synchronisation.

Le même schéma existe dans `src/routes/admin.tsx` (lignes 28 et 35).

## 5. Procédure de resynchronisation

Sans objet ici : le commit attendu est déjà celui servi. Si un doute revient, le contrôle est celui exécuté ci-dessus (`git fetch` + comparaison des trois SHA + `git diff`). Pour lever un cache de navigateur, un rechargement forcé de l'onglet de preview suffit.

## Correction proposée (si tu la valides)

1. Se connecter en super-admin dans la preview et ouvrir `/super-admin/tenants/<id>?tab=rdv` pour confirmer que la synchronisation d'onglets fonctionne bien une fois la page accessible.
2. Corriger la perte de query string dans les redirections d'authentification : utiliser le chemin complet (pathname + search) comme valeur de `redirect` dans `src/routes/super-admin.tsx` et `src/routes/admin.tsx`, et restaurer cette valeur telle quelle après connexion dans `src/routes/login.tsx`.

Aucun fichier n'a été modifié pendant cette vérification.
