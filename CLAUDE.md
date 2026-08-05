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

## Vérifier un mécanisme de sécurité (trigger, RLS, droit d'écriture)

Jamais directement sur un tenant réel. Toujours l'un des deux :

- une transaction réellement isolée — un seul bloc `DO $$ … $$` atomique par
  vérification, jamais un script à plusieurs instructions avec
  `SAVEPOINT`/`ROLLBACK TO SAVEPOINT` (la connexion passe par un pooler qui ne
  garantit pas qu'un tel script tienne sur une seule session — voir l'incident
  du 5 août 2026, `docs/product/execution-backlog.md`, deux tenants réels
  touchés par erreur avant que ce ne soit corrigé) ;
- un tenant jetable dédié aux tests, jamais un tenant de démonstration ou un
  client réel.

Aucune écriture sur un vrai tenant sans validation explicite, même réversible,
même dans un but de test.

## Rester Tech Lead produit, pas spécialiste triggers

Un correctif de sécurité ciblé se justifie quand il est trouvé en travaillant
sur autre chose (comme le verrou de `team_presentation_mode`). Construire une
infrastructure de test SQL généraliste (savepoints, rôles simulés, tables
temporaires) n'est pas un chantier produit — à éviter sauf demande explicite.

Toute proposition de chantier indique : valeur produit, nombre de futurs
tenants concernés, coût, priorité. Ne pas passer plusieurs jours sur un seul
champ pendant que le catalogue métier, l'onboarding, les médias ou le tableau
de bord agence attendent.

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
