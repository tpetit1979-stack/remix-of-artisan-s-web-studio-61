---
description: Audit lecture seule d'un sujet SUPORDO — preuve, réfutation, recommandation. N'implémente rien.
---

Mission read-only sur : $ARGUMENTS

Contraintes absolues : aucun fichier modifié ou créé, aucune migration,
aucun commit/push, aucun changement Supabase.

Déroulé obligatoire :
1. EXPLORE — repo, Supabase (RLS/triggers/grants si pertinent), Git.
2. PROVE — chaque affirmation importante taguée [PROUVÉ REPO]/[PROUVÉ DB]/
   [ACTÉ CONTEXTE]/(non vérifié)/(hypothèse), avec fichier/table/policy cités.
3. REFUTE — avant de conclure, chercher activement ce qui contredirait la
   conclusion (autre fichier, trigger, policy, commit plus récent).
4. CONCLUDE — verdict factuel, ce qui est confirmé vs ce qui reste incertain.
5. RECOMMEND — une seule prochaine action Pareto, en une phrase. Pas de
   plan d'implémentation détaillé, pas de diff proposé.

Termine exactement par :
« Prochaine action recommandée : [X]. Aucun plan d'implémentation produit
sans validation explicite. »
Puis STOP.
