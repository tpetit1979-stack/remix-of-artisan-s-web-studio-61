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

Backlog d'exécution en cours : `docs/product/execution-backlog.md`.
