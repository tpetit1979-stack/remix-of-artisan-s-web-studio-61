# Instructions projet — Lignia

Avant toute modification significative de l'Admin, du Super Admin, des routes ou
du modèle de données :

1. Lire `docs/product/constitution.md`.
2. Lire la fiche correspondante dans `docs/product/objects/`.
3. Vérifier qu'aucun écran, composant ou workflow parallèle n'est recréé — chercher
   d'abord si un composant, une route ou une table similaire existe déjà.
4. Privilégier les composants partagés entre Admin et Super Admin (voir `TeamManager`
   et `PartnersManager` comme modèles déjà en production).
5. Signaler toute contradiction avec la constitution avant d'écrire du code, plutôt
   que de la contourner en silence.

Le client pilote son entreprise, pas un CMS.
Le Super Admin ajoute des capacités, jamais une application parallèle.

## Un écran, une question

Chaque écran doit répondre à une seule question principale. Si deux questions
principales apparaissent en le concevant, ce sont probablement deux écrans — pas
un écran avec deux sections. C'est cette règle, appliquée dès le départ, qui
aurait évité `admin.settings.tsx` (identité, logo, hero, couleurs, CTA, WhatsApp,
réservation et SEO empilés dans un seul formulaire — voir le lot F du backlog).

## Avant chaque commit

1. Build.
2. Typecheck.
3. Si un écran, composant ou fichier est supprimé : vérifier que 100 % de ses
   usages sont repris ailleurs avant de le supprimer — pas après.
4. Mesurer le gain, pas seulement l'affirmer : clics économisés, écrans en moins,
   lignes supprimées, filtres/signaux gagnés. Un chiffre, pas une impression.
5. Si une affirmation n'est pas vérifiable dans le code (jugement produit, donnée
   qu'on ne peut pas encore observer en usage réel), l'écrire explicitement comme
   hypothèse — ne jamais la présenter comme un fait constaté.
6. Ne jamais écrire "testé" pour quelque chose qui ne l'a été que par build/typecheck.
   Nommer précisément ce qui a été vérifié et ce qui ne l'a pas été (ex. : test
   visuel en navigateur connecté).

## Après chaque lot

Documenter dans `docs/product/execution-backlog.md`, sous quatre titres fixes :

```
## Ce que ce lot simplifie
## Ce que ce lot supprime
## Ce qui reste à migrer
## Risques connus
```

Écrire au présent, comme une description du produit tel qu'il fonctionne
désormais — pas comme un journal de ce qui a été fait.

Backlog d'exécution en cours : `docs/product/execution-backlog.md`.
