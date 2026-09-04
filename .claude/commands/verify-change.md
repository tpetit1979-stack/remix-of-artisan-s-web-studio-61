---
description: Vérifie une implémentation SUPORDO déjà faite — diff, build, tests, effets de bord. Ne commite rien.
---

Vérifie l'implémentation en cours sur : $ARGUMENTS

Contrôles obligatoires, dans cet ordre :
1. Diff réel vs scope initialement autorisé — tout fichier touché hors
   scope est signalé explicitement, pas silencieusement accepté.
2. Fichiers inattendus (untracked ou modifiés sans lien avec la mission).
3. Typecheck (si applicable au projet).
4. Lint (si applicable).
5. Tests disponibles.
6. Build.
7. Si le changement affecte une UI ou un workflow utilisateur : recette
   fonctionnelle/visuelle si l'environnement le permet. Si elle n'a pas
   été réalisée, le signaler explicitement comme (non vérifié) et ne pas
   laisser le build seul valoir validation visuelle.
8. Effets de bord plausibles (mutations/queryKeys/colonnes DB touchées
   au-delà de ce qui était annoncé).
9. Confirmation qu'aucune écriture Supabase n'a eu lieu hors de ce qui
   était prévu.

Termine par un verdict explicite : **VALIDÉ** / **VALIDÉ AVEC RÉSERVES**
(préciser lesquelles) / **ÉCHEC** (préciser pourquoi).
Puis : « STOP — aucun commit/push sans autorisation. »
