# Accès de tpetit1979@gmail.com + boucle /login

## Le mot de passe ne peut pas être récupéré

Supabase ne stocke que des hachages : aucun outil, ni le dashboard, ne permet de lire
un mot de passe existant. Deux chemins possibles, tous les deux à ta main :

1. **Lien de réinitialisation** — ouvrir `/forgot-password`, saisir
   `tpetit1979@gmail.com`, cliquer le lien reçu, définir le nouveau mot de passe sur
   `/update-password`. Ces deux écrans existent déjà et fonctionnent.
2. **Définition manuelle** — Supabase Dashboard > Authentication > Users >
   `tpetit1979@gmail.com` > menu `...` > *Reset password* (envoi d'un mail) ou
   *Update user* pour saisir directement un mot de passe. Réservé au dashboard, car
   cela exige la clé `service_role`, qui ne doit jamais passer par l'app.

Aucun code n'est nécessaire pour cette partie.

## Mais la connexion est actuellement cassée

L'URL de la preview boucle : `/login?redirect=/login?redirect=/login?…` (plus de 50
niveaux), avec l'erreur runtime « Maximum update depth exceeded ». Tant que ce n'est
pas corrigé, se reconnecter avec un nouveau mot de passe échouera.

Cause, vérifiée dans le code :

- `src/routes/admin.tsx` (l. 28 et 36) redirige vers `/login` en passant
  `redirect: location.href`, **y compris quand l'URL courante est déjà `/login?redirect=…`**.
- `src/routes/login.tsx` (l. 36-44) navigue aveuglément vers `search.redirect`, donc
  vers `/login` à nouveau — chaque aller-retour ajoute un niveau d'encodage.

Le déclencheur : un utilisateur authentifié dont `role`/`tenantId` ne donnent pas accès
à `/admin` (par exemple `tenant_admin` sans ligne `tenant_members`, ou `role` null).

```text
/admin  →  /login?redirect=/admin  →  (session OK, role KO)  →  /admin
   ↑                                                             │
   └──────── /login?redirect=%2Flogin%3Fredirect%3D… ←───────────┘
```

## Correction proposée

1. **`src/routes/login.tsx`** — assainir `redirect` : n'accepter qu'un chemin interne
   commençant par `/`, sans `//`, et **jamais** une cible `/login`, `/forgot-password`
   ou `/update-password`. Sinon retomber sur la destination par défaut selon le rôle.
2. **`src/routes/admin.tsx`** — ne plus renvoyer vers `/login` quand la session est
   valide mais l'accès refusé. Afficher un écran explicite « Ce compte n'est rattaché à
   aucune entreprise » avec bouton *Se déconnecter*. Le renvoi vers `/login` reste
   uniquement pour l'absence réelle de session, et sans réinjecter une URL `/login`.
3. **`src/routes/super-admin.tsx`** (l. 21) — même assainissement du `redirect` capturé.
4. Vérifier ensuite en preview : `/admin` sans session → `/login?redirect=%2Fadmin`
   (un seul niveau) ; session sans rattachement → écran explicatif, pas de boucle.

## Détails techniques

Un helper partagé `safeRedirect(href: string): string` (dans `src/lib/`) fait la
validation, utilisé par les deux gardes et par `login.tsx`. Aucun changement de
schéma Supabase, de route ou de RLS. Aucun mot de passe manipulé par le code.

## Deux erreurs de typage préexistantes à corriger dans la même passe

- `src/routes/login.tsx` (l. 42) : l'objet passé à `search` n'est pas accepté par le
  typage du router — le remplacement par `safeRedirect` + `search: () => ({...})` règle
  aussi ce point.
- `src/routes/super-admin.tenants.$tenantId.tsx` (l. 229) : paramètre `prev` implicitement
  `any` dans `navigate({ search: (prev) => … })` — à typer explicitement.

Ces deux erreurs bloquent le build actuel, indépendamment de la boucle de connexion.
