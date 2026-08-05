# Backlog d'exécution

Référence durable du backlog produit. Voir `docs/product/constitution.md` pour les
principes et la Definition of Done que chaque lot doit satisfaire avant d'être
considéré terminé.

## Ordre

```
0 → A → D → F → E → C → B
    ↑   ↑
   fait fait
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

**Statut : fait.** Principes : 1, 6, 10.

`/admin` répond en un écran à trois questions : que dois-je faire maintenant,
ai-je reçu une nouvelle demande, comment accéder aux actions les plus courantes.
Volontairement limité — une seule action mise en avant à la fois, deux raccourcis
secondaires, aucune métrique décorative, aucun score.

**Ordre de priorité de la "prochaine meilleure action" — hypothèse produit, pas
une règle mesurée** : service manquant → zone manquante → réalisation manquante →
marque manquante → SEO manquant. Documenté en commentaire directement dans
`admin.index.tsx` pour qu'il ne se dilue pas au premier refactor. Exclut
délibérément le logo et le RGE : tous deux verrouillés à l'agence (voir
`docs/product/objects/apparence.md` et `rge.md`) — un copilote ne pointe jamais
vers une action que l'utilisateur ne peut pas faire.

Le SEO pointe encore vers `/admin/settings` (pas d'écran dédié tant que le lot F
n'est pas livré) — à corriger quand ce lot passera.

**Découverte en vérifiant les usages avant de toucher au comportement de `/admin`
(règle CLAUDE.md)** : `login.tsx` redirigeait les tenant_admin directement vers
`/admin/settings` après connexion, en court-circuitant l'index. Sans corriger ce
point, le nouveau tableau de bord n'aurait jamais été vu à la première connexion —
corrigé dans le même lot.

### Ce que ce lot simplifie

- 0 écran d'accueil → 1, avec une action mise en avant au lieu d'un choix à faire
  soi-même parmi 8 entrées de menu identiques visuellement.
- Après connexion, le chemin vers "quoi faire maintenant" passe de : deviner un
  menu de 8 items sans hiérarchie → 0 clic, la réponse est affichée directement.
- Nav client : 8 items → 9 (Tableau de bord ajouté en tête).

### Ce que ce lot supprime

- La redirection automatique et silencieuse de `/admin/` vers `/admin/services` —
  remplacée par un écran réel.
- Le renvoi direct de la page de connexion vers `/admin/settings`, qui rendait
  la page d'accueil inatteignable au premier login.

### Ce qui reste à migrer

- Le lien SEO de la prochaine meilleure action, vers `/admin/settings` en
  attendant l'écran dédié du lot F.

### Risques connus

- L'ordre de priorité des actions est une hypothèse non testée en usage réel (voir
  ci-dessus) — à revoir si les artisans ignorent systématiquement l'action mise en
  avant.
- Build et typecheck vérifiés ; pas de test en navigateur connecté (identifiants
  tenant_admin non disponibles dans cet environnement).

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
