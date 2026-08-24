# Diagnostic final — localisation exacte du commit 05ece15

## État prouvé (lecture seule, aucune modification)

| Élément | SHA / état |
|---|---|
| `main` local Lovable | `2249b0d` |
| `origin/main` (vu par Lovable) | `2249b0d` (identique, 0 écart) |
| HEAD preview (branche `edit/edt-77e39e80…`) | `2249b0d` (même commit, arbre propre) |
| `05ece15` | **absent du dépôt local** — objet git inexistant |

## Faits établis

1. `05ece15` n'est **pas** ancêtre de `main` ni de `origin/main` : un fetch de `main` rapatrie tous ses ancêtres ; l'objet étant absent, il n'est pas intégré.
2. La branche `claude/prod-repo-seo-setup-8qm5ai` est intégrée dans `main` **uniquement jusqu'à `fb342f0`** via PR #1 (`8ceab5f`) et PR #2 (`7f7a164`), le 21/07. `05ece15` est du travail postérieur, présent uniquement sur GitHub sur la branche claude.
3. `main` a avancé de `a4d29ab` à `2249b0d` par la bascule de branche test dans l'éditeur (24/08 20:21–20:22 UTC) : 4 commits sans contenu (seul diff : renommage du fichier de plan). Fonctionnellement identique à `a4d29ab`.
4. Limite : le `main` de GitHub et l'existence de `05ece15` sur GitHub ne sont pas vérifiables depuis ce sandbox (remote local = stockage interne Lovable). Si un PR #3 a mergé la branche claude récemment, il n'apparaît pas encore dans `origin/main` vu par Lovable — à confirmer sur la page GitHub du dépôt.

## Schéma

```text
GitHub main          ->  dernier état vu = 2249b0d
GitHub claude/prod…  ->  contient 05ece15 (jamais rapatrié par Lovable)
                         └── intégré dans main jusqu'à fb342f0 (PR #1, PR #2)
Lovable origin/main  ->  2249b0d  (SANS 05ece15)
Lovable main local   ->  2249b0d  (0 écart)
Preview              ->  2249b0d  (même commit)
```

## Procédure de bascule (en cours)

### Préconditions vérifiées le 24/08 à 20:55 UTC
- Arbre de travail **propre** (`git status --porcelain` vide).
- HEAD = `main` = `origin/main` : 0 commit d'avance, 0 de retard — rien à perdre.

### Étape 1 — action utilisateur (je ne peux pas la faire : aucun outil ne change la branche connectée)
Dans l'éditeur Lovable, sélecteur de branche → `claude/prod-repo-seo-setup-8qm5ai`.
Si Lovable propose merge / écrasement / résolution de conflit : **tout refuser** et rapporter le message exact → STOP.

### Étape 2 — vérification agent (après confirmation de la bascule)
1. Lire la branche active et le SHA du HEAD.
2. Comparer au SHA attendu `05ece1542575c061cb5ce9c401ac8cedcd73c860`.
3. SHA différent → signalement explicite + STOP (la bonne version n'est pas chargée).
4. SHA identique → confirmer que la preview peut servir à la recette. STOP (pas de recette, pas de retour sur `main`).

### Interdits pendant toute l'opération
- Aucune modification de fichier, aucun commit, aucun merge, aucun push volontaire, aucune donnée modifiée, aucune résolution de conflit.

## Risques connus

- Si la branche claude a été supprimée de GitHub, la bascule est impossible — vérifier l'onglet Branches du dépôt GitHub au préalable.
- Le diagnostic repose sur l'état du stockage git interne Lovable ; un écart éventuel avec GitHub (sync en attente) n'est pas détectable depuis ici.
- La sync bidirectionnelle committerait toute modification d'éditeur sur la branche claude tant qu'elle est connectée — ne rien éditer pendant la recette.
