# Recette du commit 05ece15 (branche claude/prod-repo-seo-setup-8qm5ai) dans Lovable

## Ce que je constate (vérifié dans le sandbox)

1. **État local** : le projet est sur une branche d'édition `edit/edt-dc36ba24…` dont le HEAD est `a4d29ab` (« Merge branch 'claude/super-admin-shared-managers' »), strictement identique à `origin/main`. Arbre de travail propre : **aucun travail local non sauvegardé, rien à perdre**.
2. **Le remote Lovable** (`origin`, stockage interne Lovable) ne connaît que deux branches : `main` (a4d29ab) et `lovable-backup-main-1785868874`. Ni la branche `claude/prod-repo-seo-setup-8qm5ai` ni le commit `05ece15` n'existent dans le dépôt Lovable.
3. **Fait majeur** : cette branche a **déjà été mergée deux fois** dans `main` sur GitHub — PR #1 (`8ceab5f`) et PR #2 (`7f7a164`), présentes dans l'historique de `main` 264 commits en arrière. Le contenu déjà intégré inclut : routes serveur `/robots.txt`, `/sitemap.xml`, `/llms.txt`, résolution du tenant côté serveur dans `beforeLoad` (SSR SEO), états vides (services, footer « Zones d'intervention »), état d'erreur de la home au lieu du spinner infini. **Cette partie du travail est donc déjà visible dans la preview actuelle.**
4. Le commit `05ece15` est inconnu localement : c'est vraisemblablement du travail poussé sur GitHub **après** ces merges. Lovable ne synchronise automatiquement que la **branche connectée** (`main`) : les autres branches GitHub sont invisibles pour la preview tant qu'on ne change pas la branche connectée.
5. La preview reflète la branche d'édition Lovable, qui suit la branche GitHub connectée. Il n'existe pas de mécanisme de « preview par branche arbitraire » sans changer la branche connectée.

## Informations qui me manquent (non supposées)

- Le dépôt GitHub est privé et aucun connecteur GitHub n'est configuré dans ce workspace : je n'ai pas pu vérifier que la branche `claude/prod-repo-seo-setup-8qm5ai` existe encore sur GitHub ni que `05ece15` en est le HEAD, ni ce qu'elle contient par rapport à `main`. À confirmer de ton côté (page de la branche sur GitHub).

## Solutions possibles

### Option A — Basculer la branche connectée dans l'éditeur Lovable (recommandée)
Dans l'éditeur Lovable : sélecteur de branche → choisir `claude/prod-repo-seo-setup-8qm5ai`. La preview se reconstruit depuis cette branche ; `main` reste intacte sur GitHub. Après la recette, rebasculer sur `main`.
- Précautions : ne faire **aucune modification** dans l'éditeur pendant la recette (la sync bidirectionnelle committerait sur la branche claude). Si Lovable propose de résoudre un conflit ou d'écraser, refuser.
- Effort : 2 clics, aucun risque pour `main` (elle vit sur GitHub indépendamment).

### Option B — Branche jetable de recette (isolation maximale)
Sur GitHub : créer `preview/seo-05ece15` pointant exactement sur `05ece15` (`git branch preview/seo-05ece15 05ece15 && git push`), puis connecter Lovable à cette branche jetable. Supprimer la branche après la recette.
- Intérêt : même un commit accidentel depuis Lovable ne toucherait pas la branche claude.
- Coût : une manipulation Git supplémentaire.

### Option C — Recette hors Lovable
Cloner le dépôt GitHub en local (`git checkout 05ece15 && bun install && bun run dev`), ou activer les deploy previews (Vercel/Netlify) sur la PR. Zéro impact sur Lovable, mais ce n'est pas « tester dans Lovable ».

### Option D — Merger puis tester (non conforme à l'objectif)
Merger la branche dans `main` via PR : la recette se ferait après intégration définitive. Écartée.

## Recommandation

**Option A**, avec Option B en variante si tu veux une garantie absolue qu'aucun commit ne puisse atterrir sur la branche claude pendant le test. Dans les deux cas :
1. Tu effectues la bascule de branche dans l'éditeur (action UI que je ne peux pas faire à ta place).
2. Je vérifie ensuite factuellement que la preview sert bien `05ece15` (SHA du HEAD local, contenu des fichiers modifiés par ce commit, test fonctionnel des routes concernées).
3. Après la recette, tu rebascules sur `main` et je confirme le retour à `a4d29ab`.

## Risques connus

- Si la branche claude a été supprimée de GitHub après merge, l'option A est impossible — d'où la confirmation préalable demandée.
- Si `05ece15` est ancien (antérieur aux merges PR #1/#2), la preview montrerait une **régression apparente** par rapport à l'actuel : le test serait à interpréter comme un état historique, pas comme du nouveau travail.
- Pendant la bascule, le site publié (`craft-site-generator.lovable.app`) n'est **pas** affecté : seule la preview change.
