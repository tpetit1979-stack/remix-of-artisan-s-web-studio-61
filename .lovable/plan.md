# Correction de la boucle `/login?redirect=/login?redirect=…`

## Le symptôme

L'URL de la preview s'empile sur elle-même (plus de 50 niveaux d'encodage) et React
lève « Maximum update depth exceeded ». Tant que ce n'est pas corrigé, se connecter
(même avec un mot de passe fraîchement réinitialisé) échoue.

## La cause, vérifiée dans le code

- `src/routes/admin.tsx` (l. 28 et 36) redirige vers `/login` avec
  `redirect: location.href`, **y compris quand l'URL courante est déjà
  `/login?redirect=…`**.
- `src/routes/super-admin.tsx` (l. 21) fait la même chose.
- `src/routes/login.tsx` (l. 36-44) navigue aveuglément vers `search.redirect`, donc
  de nouveau vers `/login` — chaque aller-retour ajoute un niveau.

Déclencheur : une session valide dont `role` / `tenantId` ne donnent pas accès à
`/admin` (par ex. `tenant_admin` sans ligne `tenant_members`, ou `role` null).

```text
/admin  →  /login?redirect=/admin  →  (session OK, rôle KO)  →  /admin
   ↑                                                             │
   └──────── /login?redirect=%2Flogin%3Fredirect%3D… ←───────────┘
```

## Correction proposée

1. **Nouveau helper `safeRedirect(href)`** dans `src/lib/` : n'accepte qu'un chemin
   interne commençant par `/`, sans `//`, et rejette toute cible `/login`,
   `/forgot-password`, `/update-password`. Sinon renvoie `""`.
2. **`src/routes/login.tsx`** — passer `search.redirect` par `safeRedirect` ; à défaut,
   retomber sur la destination par défaut selon le rôle (`/super-admin` ou `/admin`).
3. **`src/routes/admin.tsx`** — ne plus renvoyer vers `/login` quand la session est
   valide mais l'accès refusé : afficher un écran explicite « Ce compte n'est rattaché
   à aucune entreprise » avec un bouton *Se déconnecter*. Le renvoi vers `/login` ne
   subsiste que pour l'absence réelle de session, avec `safeRedirect(location.href)`.
4. **`src/routes/super-admin.tsx`** — même assainissement du `redirect` capturé.

## Vérification après correction

- `/admin` sans session → `/login?redirect=%2Fadmin`, un seul niveau.
- Session sans rattachement → écran explicatif, aucune boucle, plus d'erreur
  « Maximum update depth exceeded ».
- Connexion super-admin → arrivée sur `/super-admin/tenants`.

## Deux erreurs de typage préexistantes corrigées dans la même passe

- `src/routes/login.tsx` (l. 42) : l'objet passé à `search` n'est pas accepté par le
  typage du router — réglé par le passage à `safeRedirect` + `search: () => ({…})`.
- `src/routes/super-admin.tenants.$tenantId.tsx` (l. 229) : `prev` implicitement `any`
  dans `navigate({ search: (prev) => … })` — à typer via un navigate porté par la route.

Aucun changement de schéma Supabase, de route ou de RLS. Aucun mot de passe manipulé
par le code.
