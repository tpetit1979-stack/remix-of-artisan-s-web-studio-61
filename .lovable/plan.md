# Rétablir `main` sur le bon commit

## Diagnostic confirmé

- Le commit attendu `6eb8320` existe bien.
- La branche distante `origin/main` pointe actuellement sur `12f0475`.
- Deux commits supplémentaires ont été ajoutés après le commit attendu : `39421bb` et `12f0475`.
- Ces commits modifient seulement `package.json` et `bun.lock`.
- Il ne faut donc pas chercher un sélecteur de branche dans Lovable : la branche GitHub `main` elle-même doit être rétablie.

## Action recommandée — Terminal local

Depuis un clone local du dépôt `tpetit1979-stack/remix-of-artisan-s-web-studio-61` :

```bash
git fetch origin
git switch main
git pull --ff-only origin main
git branch backup/main-before-restore-2026-07-31
git reset --hard 6eb8320a29797ab8bb5d576d9f26c8cb37ad874c
git push --force-with-lease origin main
```

La branche `backup/main-before-restore-2026-07-31` conserve une sauvegarde locale de l'état actuel. `--force-with-lease` refuse l'écriture si quelqu'un a poussé une nouvelle modification entre-temps.

## Vérification

Sur GitHub, ouvrir la branche `main` et vérifier que le dernier commit est :

```text
6eb8320 refactor(public): consolidate RGE certifications into a single dedicated section
```

Revenir ensuite dans Lovable. La synchronisation GitHub bidirectionnelle doit recharger le projet automatiquement. Si nécessaire, actualiser la page une seule fois, puis demander une vérification du SHA réellement chargé.

## Résultat attendu

- `main` et `origin/main` pointent sur `6eb8320`.
- Les deux commits parasites restent récupérables via la branche locale de sauvegarde.
- Aucun fichier n'est modifié manuellement et aucun composant n'est régénéré.