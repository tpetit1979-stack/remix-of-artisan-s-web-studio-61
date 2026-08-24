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

## Marche à suivre recommandée (aucune action effectuée)

**Basculer la branche connectée dans l'éditeur Lovable** vers `claude/prod-repo-seo-setup-8qm5ai` (sélecteur de branche), laisser la preview se reconstruire, puis je vérifie factuellement que le HEAD local est `05ece15` et que les routes SEO concernées répondent. Après la recette, rebasculer sur `main`.

Précautions pendant la recette :
- Aucune modification dans l'éditeur tant que la branche claude est connectée (la sync bidirectionnelle committerait dessus).
- Refuser toute proposition de résolution de conflit ou d'écrasement.
- Le site publié (`craft-site-generator.lovable.app`) n'est pas affecté : seule la preview change.

Variante isolation maximale : créer sur GitHub une branche jetable `preview/seo-05ece15` pointant sur `05ece15` et connecter Lovable à celle-ci, puis la supprimer après la recette.

## Risques connus

- Si la branche claude a été supprimée de GitHub, la bascule est impossible — vérifier l'onglet Branches du dépôt GitHub au préalable.
- Le diagnostic repose sur l'état du stockage git interne Lovable ; un écart éventuel avec GitHub (sync en attente) n'est pas détectable depuis ici.
