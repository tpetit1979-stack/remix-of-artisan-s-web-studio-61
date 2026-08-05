# Backlog d'exécution

Référence durable du backlog produit. Voir `docs/product/constitution.md` pour les
principes et la Definition of Done que chaque lot doit satisfaire avant d'être
considéré terminé.

## Ordre

```
0 → A → D → F → E → C → B
    ↑
  fait
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

**Statut : fait.** Principes : 5, 9, 10. Commit `13ad2b5`.

Le Super Admin n'a plus qu'un seul écran d'entrée — "Pilotage", à
`/super-admin/tenants` — qui sert à la fois de vue d'ensemble et de recherche de
client. `/super-admin/` y redirige directement ; la sidebar n'a plus qu'un lien là
où elle en avait deux.

Le filtre "Demande non lue" (`contacts.is_read = false`) remplace ce qui était
prévu comme "sans réponse récente" — `contacts` ne trace pas si le tenant a
répondu au client, seulement si l'agence a ouvert la demande. **Hypothèse non
vérifiable dans le code, à surveiller en usage réel** : `is_read` a été conçu comme
un indicateur de lecture, pas de suivi commercial — si un futur usage le fait
basculer sans action réelle de l'agence, le filtre perd sa valeur.

**Prêt à publier** est défini comme services + zones + logo présents. C'est un
jugement produit, pas une règle qui existait déjà dans le code — à réévaluer si
l'usage montre qu'un autre signal (RGE, marques) devrait aussi compter.

### Ce que ce lot simplifie

- 2 écrans qui recalculaient les mêmes chiffres séparément → 1 seul.
- 2 liens de navigation Super Admin → 1 seul.
- 6 filtres disponibles → 9 (Sans marque, Demande non lue, Prêt à publier en plus).
- 4 badges de complétude par client dans la liste → 5 (Marques en plus).
- Passer d'une vue d'ensemble à la recherche d'un client précis ne demande plus de
  changer d'écran — 1 clic de transition en moins.
- Net **-152 lignes** de code produit (117 insertions, 269 suppressions, hors
  fichier de route auto-généré).

### Ce que ce lot supprime

- `super-admin.dashboard.tsx` (213 lignes) et son lien de navigation "Dashboard".
- La liste "Tenants incomplets" à 2 signaux (Services, Zones) — remplacée par les
  badges et le filtre "Incomplets" de l'écran fusionné, qui portent sur 5 signaux.

Vérifié avant suppression, pas après : les 4 cartes KPI, la liste des tenants
incomplets et les deux liens rapides (Onboarding, Tenants) du dashboard supprimé
ont chacun un équivalent direct dans l'écran fusionné ou restent accessibles
depuis la sidebar elle-même.

### Ce qui reste à migrer

Rien pour cet objet — le lot est autonome. Aucune dépendance créée pour les lots
suivants (D, F, E, C, B).

### Risques connus

- "Demande non lue" repose sur un champ qui n'a pas été pensé à l'origine comme un
  indicateur de suivi commercial (voir hypothèse ci-dessus).
- Build et typecheck vérifiés ; pas de test en navigateur connecté (identifiants
  Super Admin non disponibles dans cet environnement).

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
