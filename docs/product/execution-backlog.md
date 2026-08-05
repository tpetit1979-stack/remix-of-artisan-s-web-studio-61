# Backlog d'exécution

Référence durable du backlog produit. Voir `docs/product/constitution.md` pour les
principes et la Definition of Done que chaque lot doit satisfaire avant d'être
considéré terminé.

## Ordre

```
0 → A → D → F → E → C → B
```

Risque décroissant : on commence par ce qui ne peut rien casser (documentation),
on construit ensuite ce qui sert tous les jours (pilotage, dashboard client), on
clarifie les objets (F) avant d'organiser le menu autour d'eux (E) — faire l'inverse
obligerait à retoucher le menu une seconde fois — puis on bouche les petits trous
(C), et on termine par le seul vrai chantier (B), découpé en sous-lots livrables un
par un.

## Lot 0 — Documentation de référence

**Statut : fait.**

`docs/product/constitution.md` et `docs/product/objects/` — une vérité unique pour
les six prochains mois de refactoring, relue automatiquement via `CLAUDE.md`.

## Lot A — Pilotage agence

**Effort : 1 à 3 jours. Principes : 5, 9, 10.**

Fusionne `super-admin.dashboard.tsx` (compteurs) et `super-admin.tenants.index.tsx`
(recherche, filtres, badges de complétude, détecteur d'anomalies commerciales déjà
fonctionnel) en un seul écran. Les deux existent aujourd'hui séparément et
recalculent les mêmes chiffres.

À ajouter : filtre "sans réponse récente" (donnée déjà chargée, jamais exposée
comme filtre), filtre "aucune marque" (même schéma que les compteurs existants),
filtre "prêt à publier" (combinaison de signaux déjà calculés).

Reste une liste de clients qui sert à retrouver quelqu'un et à savoir qui a besoin
d'une action — pas un tableau de bord surchargé.

Supprime : `super-admin.dashboard.tsx` comme écran séparé.

## Lot D — Tableau de bord client + prochaine meilleure action

**Effort : 1 à 2 jours pour la v1. Principes : 1, 6, 10.**

Réutilise le calcul de complétude déjà présent côté agence, reformulé en actions
plutôt qu'en cases cochées. V1 limitée aux actions déjà mûres : réalisation
manquante, zone manquante, marque manquante, SEO manquant. L'assignation
marque↔service (`tenant_service_brands`, existe depuis `0bffb3e`) rejoindra la
liste une fois son propre workflow stabilisé — le modèle de données n'est pas un
obstacle, la maturité du workflow l'est.

Devient la page d'accueil de `/admin`. Supprime la redirection actuelle vers
`/admin/services`.

## Lot F — Séparer Entreprise / Apparence / SEO / Contact

**Effort : 2 à 3 jours. Principes : 3, 7, 8.**

`admin.settings.tsx` cumule aujourd'hui identité, logo, hero, couleurs, CTA,
WhatsApp, réservation et SEO. Redistribution en Mon entreprise / Apparence / SEO
(écran neuf) / Contact (WhatsApp + réservation rejoignent `admin.contacts.tsx`).
Aucune nouvelle donnée ni logique, uniquement une redistribution de champs déjà
fonctionnels.

## Lot E — Menu client à deux paliers

**Effort : quick win. Principe : 7.**

`AdminSidebar.tsx` passe d'une liste plate de 8 items à deux paliers : Travailler
(quotidien/mensuel) et **Paramètres** (annuel — pas "Mon entreprise", déjà pris par
un écran précis à l'intérieur de ce palier). Après F, pas avant : F redistribue les
écrans, E organise le menu autour de cette nouvelle structure.

## Lot C — Marques accessibles depuis la fiche agence

**Effort : quick win. Principes : 4, 10.**

Le catalogue global est déjà relié depuis la nav Super Admin (`4dce739`). Ce qui
manque encore : un accès direct, depuis la fiche d'un client précis, à la sélection
de marques de ce client. Duplique le bouton "Gérer ce site" déjà existant avec une
redirection vers l'écran des marques — aucun nouveau mécanisme.

Après A, D, F, E : corrige un irritant ponctuel, pas la confusion générale.

## Lot B — Interface client à droits élevés côté agence

**Effort : chantier, découpé en sous-lots. Principes : 3, 4, 5, 8.**

Remplace les 9 onglets de `super-admin.tenants.$tenantId.tsx` par les écrans client
existants, à droits élevés — sur le modèle déjà prouvé par `TeamManager` et
`PartnersManager`.

Ordre interne : Services et Zones d'abord (risque le plus faible) → Paramètres/
Design ensuite (après le lot F) → Certifications et RDV/IA en dernier. Chaque
onglet migré individuellement derrière le mécanisme d'impersonation déjà existant
— les onglets non encore migrés continuent de fonctionner pendant la transition.

Supprime, à terme, les 7 composants Super-Admin-only listés ci-dessus.
