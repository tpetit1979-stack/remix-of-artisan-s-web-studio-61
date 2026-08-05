# Constitution produit de Lignia

Ce document est la référence. Toute nouvelle fonctionnalité, tout refactor, toute
décision d'écran doit s'y conformer. Il ne se rouvre pas sans contradiction majeure
démontrée — voir "Statut" en bas de page.

## Les 10 principes

1. **Le client pilote son entreprise, pas un site web.** Lignia n'est pas un CMS,
   c'est un copilote métier.
2. **Une donnée a un propriétaire clair à un instant donné** — plateforme ou tenant,
   jamais ambigu. *(Amendement : la propriété peut se transmettre dans le temps —
   ex. la palette dérivée du logo, le hero généré par l'IA puis repris par le
   client — tant qu'elle n'est jamais ambiguë au moment où quelqu'un édite.)*
3. **Un objet = une interface.** Le même composant sert le client et le Super
   Admin. Les droits changent, l'écran ne change pas.
4. **Plusieurs portes peuvent exister**, mais elles ouvrent toujours la même pièce.
5. **Le Super Admin ajoute des capacités**, il ne possède jamais une seconde
   application parallèle.
6. **L'IA travaille avant l'utilisateur.** Tout ce qui peut être détecté, prérempli,
   proposé ou vérifié automatiquement doit l'être.
7. **La fréquence décide de la navigation.** Quotidien/mensuel en haut, annuel dans
   Paramètres.
8. **Une nouvelle fonctionnalité doit en remplacer une.** Le produit devient plus
   simple à chaque version, jamais plus complexe.
9. **Chaque fonctionnalité doit faire gagner du temps** — au client, à l'agence,
   idéalement aux deux.
10. **Le test ultime : est-ce que ça évite un appel ou un mail à l'agence ?**

## Avant de créer

- **Un composant** → chercher s'il existe déjà (voir `docs/product/objects/`).
- **Une route** → chercher si une route similaire existe déjà.
- **Une table** → chercher si une donnée similaire existe déjà.

Ce réflexe, appliqué dès le départ, aurait évité la plupart des doublons trouvés
dans les audits qui précèdent ce document.

## Definition of Done

Un lot n'est terminé que si :

- [ ] build OK
- [ ] typecheck OK
- [ ] aucun écran dupliqué créé
- [ ] `docs/product/objects/` mis à jour si un objet concerné a changé d'écran,
      de composant ou de route référent
- [ ] navigation cohérente avec les paliers Travailler / Paramètres
- [ ] aucun nouveau composant parallèle à un composant déjà partagé
- [ ] testé côté Admin
- [ ] testé côté Super Admin
- [ ] testé côté site public (si l'objet a un rendu public)

## Statut

**Architecture gelée.** Pas de nouvel écran, de nouvelle règle ou de nouveau
principe sans contradiction majeure démontrée par l'implémentation elle-même.
Rôle actuel : exécuter les lots, signaler les risques, proposer des
simplifications locales — pas remettre en question la vision produit.

Voir `docs/product/objects/` pour la fiche de référence de chaque objet métier,
et le backlog d'exécution (lots 0 à B) pour l'ordre de mise en œuvre.
