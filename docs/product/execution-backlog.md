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

**Addendum — chaque action porte désormais une raison.** Pas juste "ajoutez une
zone" mais "vous avez déjà {n} services configurés, mais aucun n'est associé à une
zone — les visiteurs ne verront aucune ville sur Google". 0 raison affichée → 1,
pour les 5 branches. Reste du texte statique par branche, pas une explication
générée — honnête sur ce que c'est aujourd'hui. Un vrai moteur de règles
(`priority`, `title`, `reason`, `confidence`...) devient pertinent quand il y aura
plus de cinq branches à tenir cohérentes entre elles ; prématuré pour cinq,
documenté ici pour qu'on n'oublie pas d'y revenir le jour où ça ne l'est plus.

**Pause volontaire avant le lot F.** Les hypothèses de priorité ci-dessus n'ont
pas encore été confrontées à un usage réel — le lot F touche `admin.settings.tsx`,
le cœur de l'expérience client. Avant de l'enchaîner : observer 1 ou 2 vrais
tenants sur ce tableau de bord pour vérifier que l'ordre proposé correspond à ce
qu'ils font réellement, plutôt que de construire le lot suivant sur une
supposition non vérifiée.

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

## EASYDEP — révélateur, pas un chantier client

EASYDEP a servi de test grandeur nature. Rien ci-dessous n'est un correctif
ponctuel pour ce tenant — chaque item est classé par le principe 11 de la
constitution avant d'être planifié, pour ne jamais confondre un chantier
plateforme (A/B) avec une donnée d'un seul client (C).

| # | Sujet | Catégorie | Autorisation requise | Concerne |
|---|---|---|---|---|
| 1 | Élément "test" dépublié (jamais supprimé) | **C** | Confirmation explicite, tenant par tenant | EASYDEP uniquement |
| 2 | Solo vs équipe | **A** | Validation du lot | Tous les tenants, dès qu'ils ont 0 ou 1 membre actif |
| 3 | Illustrations : badge, blocage publication, filtre public | **A** | Validation du lot | Tous les tenants ; le nettoyage des 5 illustrations d'EASYDEP reste C mais n'a rien à faire — elles sont déjà correctement non publiées |
| 4 | Peupler le catalogue de marques | **B** | Validation de la liste et des contenus | Contenu partagé — bénéficie à tout tenant du même métier, pas seulement EASYDEP |
| 5 | Construire l'affichage public des marques | **A** | Validation du lot | Le mécanisme, pour tous les tenants |
| 6 | Migrer Lorflex / De Dietrich / Klover | **C** | Confirmation explicite, après validation visuelle | EASYDEP uniquement |
| 7 | Affectation en masse Villes × Services | **A** | Validation du lot | Tous les tenants |
| 8 | Simplifier le formulaire Service | **A** | Validation du lot | Tous les tenants |
| 9 | Catalogue de services-types (`trade_service_templates`) | **B** | Différé — gouvernance séparée (taxonomie, SEO, rattachement métier) | — |
| 10 | Bibliothèque de médias métier (`trade_media_library`) | **B** | Différé — gouvernance séparée (provenance, licence, classification) | — |

**Ordre d'exécution retenu** : `2 → 3 → 1 (après confirmation) → 4 (après
validation de la liste) → 5 → 6 (après validation visuelle) → 7 → 8`. On
commence par les deux corrections génériques les plus sûres (A), pas par une
écriture en production sur les données d'un client — même réversible.

### Découverte en vérifiant avant d'écrire le plan

`tenant_brands` n'a **aucun consommateur public** — recherché dans tout `src/`,
seuls `admin.index.tsx`, `admin.brands.tsx`, `admin.services.tsx`,
`super-admin.tenants.index.tsx` et `lib/brands.ts` y font référence. Il n'existe
pas de `BrandsSection.tsx` : contrairement à `tenant_partners` (lu par
`PartnersSection.tsx`, monté sur `index.tsx`), sélectionner une marque en admin
aujourd'hui n'a **aucun effet visible sur le site public**. Le lot 5 n'est donc
pas une vérification — c'est un composant à construire. Sans lui, migrer
Lorflex/De Dietrich/Klover ferait disparaître ces trois logos du site vivant,
exactement le risque signalé avant de planifier quoi que ce soit.

### Lot 1 — Nettoyer l'élément "test" (catégorie C)

- **Fichiers concernés** : aucun — correction de données uniquement, via
  `/admin/portfolio`.
- **Données modifiées** : `portfolio` id `1d07292d-a5c6-406d-bc62-c10cdc3e4357`
  (tenant EASYDEP) — `is_published: true → false` **uniquement**. Jamais de
  suppression définitive : dépublier est réversible, supprimer ne l'est pas.
- **Definition of Done** : l'entrée ne remonte plus sur `/realisations`
  d'EASYDEP, vérifié après correction.
- **Tests** : Public uniquement. Aucun changement de code, donc rien à tester
  côté Admin/Super Admin.
- **Dépendances** : aucune. Nécessite une confirmation explicite avant d'agir —
  c'est une donnée de production, pas un brouillon.

### Lot 2 — Solo vs équipe (catégorie A)

- **Fichiers concernés** : `src/components/public/TeamSection.tsx`.
- **Données modifiées** : aucune — lecture seule de `members.length`, déjà
  chargé par le composant.
- **Definition of Done** : 0 membre → section masquée (déjà le cas, vérifié) ;
  1 membre → "Votre interlocuteur" (jamais "À propos de moi") ; 2+ → "Notre
  équipe" (comportement actuel, inchangé).
- **Tests** : Public — les 3 cas rendus et vérifiés visuellement. Admin/Super
  Admin non concernés (`TeamManager` ne change pas).
- **Dépendances** : aucune.

### Lot 3 — Illustrations : badge, blocage, conversion, filtre renforcé (catégorie A)

- **Fichiers concernés** : `src/routes/admin.portfolio.tsx` (badge "Exemple — à
  remplacer" sur `content_kind=illustration`, désactivation du toggle "Publier"
  tant que `content_kind=illustration`, action "Remplacer par mon chantier" qui
  bascule `content_kind: illustration → real_project` et
  `media_origin: template → tenant` à la confirmation) ; `src/routes/realisations.tsx`
  (filtre : `is_published = true AND content_kind = 'real_project'`, plus
  seulement `is_published`). À vérifier avant de coder : si une page Services
  affiche aussi des éléments `portfolio` par `service_id`, appliquer le même
  filtre renforcé là-bas.
- **Données modifiées** : aucune migration de masse. Les 5 illustrations
  d'EASYDEP n'ont pas besoin d'être touchées — déjà correctement non publiées.
- **Definition of Done** : impossible de publier un `illustration` sans passer
  par "Remplacer par mon chantier" ; le filtre public exige les deux conditions ;
  badge visible dans l'admin.
- **Tests** : Admin (toggle bloqué, conversion fonctionnelle) ; Public (filtre
  vérifié avec un cas `illustration` + `is_published=true` en base de test —
  ne doit jamais apparaître) ; Super Admin (même écran via "Gérer les
  réalisations", pas de changement propre à cet espace).
- **Dépendances** : aucune.

### Lot 4 — Peupler le catalogue de marques (catégorie B)

- **Fichiers concernés** : aucun — contenu, pas code. Passe par
  `super-admin.brands.tsx`, déjà fonctionnel.
- **Données modifiées** : table `brands` — Lorflex, De Dietrich, Klover et
  toute autre marque confirmée pour le métier d'EASYDEP. Rien d'autre : pas de
  templates de service, pas de médias (voir lots 9 et 10, différés).
- **Definition of Done** : marques actives dans le catalogue global, visibles
  dans `/admin/brands` pour sélection.
- **Tests** : Super Admin (écran catalogue) ; Admin ("Mes marques" affiche les
  nouvelles entrées) ; Public non concerné avant le lot 5.
- **Dépendances** : aucune technique — nécessite une confirmation humaine sur
  la liste exacte des marques à créer.

### Lot 5 — Construire l'affichage public des marques (catégorie A)

- **Fichiers concernés** : nouveau `src/components/public/BrandsSection.tsx`
  (sur le modèle de `PartnersSection.tsx`) ; montage dans `src/routes/index.tsx` ;
  vérifier si `lib/brands.ts` a besoin d'une fonction de lecture publique dédiée
  respectant `is_featured` et `sort_order`, ou si l'existante suffit.
- **Données modifiées** : aucune — lecture seule.
- **Décision de positionnement, prise avant le code** : trois sections
  publiques distinctes, jamais fusionnées visuellement.

  | Objet | Message public |
  |---|---|
  | Marques (`BrandsSection`) | "Marques installées et entretenues" (ou formulation équivalente) |
  | Partenaires (`PartnersSection`, existant) | "Nos partenaires" — réseaux, organismes de confiance |
  | Certifications (`CertificationBadges`, existant) | Qualifications réellement détenues |

- **Definition of Done** : les marques sélectionnées par un tenant s'affichent
  publiquement, dans l'ordre, avec la mise en avant respectée ; **uniquement**
  les marques explicitement rattachées au tenant — jamais le catalogue global ;
  section **masquée entièrement** si aucune marque n'est sélectionnée, même
  règle que `TeamSection` et `PartnersSection`.
- **Tests** : Public (nouveau composant, testé avec un tenant ayant au moins
  une marque sélectionnée, et avec un tenant sans aucune — section absente).
  Admin/Super Admin non concernés.
- **Dépendances** : lot 4 (avoir au moins une marque à afficher pour tester
  réellement, pas seulement en théorie).

### Lot 6 — Migrer Lorflex / De Dietrich / Klover pour EASYDEP (catégorie C)

- **Fichiers concernés** : aucun — donnée uniquement.
- **Données modifiées**, en deux phases explicites, jamais atomique :
  1. Créer `tenant_brands` pour EASYDEP vers les 3 entrées `brands` du lot 4,
     même `logo_url`. Vérifier visuellement le rendu public (lot 5 déjà livré).
  2. Seulement après validation visuelle explicite : désactiver ou supprimer
     les 3 lignes `tenant_partners` correspondantes.
- **Definition of Done** : les 3 logos visibles publiquement sous "marques"
  **avant** toute suppression côté partenaires ; aucune perte d'URL de logo.
- **Tests** : Public (les 3 logos apparaissent, avant toute suppression) ;
  Admin ("Mes marques" les montre cochées) ; Super Admin (visible depuis la
  fiche EASYDEP une fois le lot C du backlog principal livré).
- **Dépendances** : lots 4 et 5, dans cet ordre, sans exception.

### Lot 7 — Affectation en masse Villes × Services (catégorie A)

- **Fichiers concernés** : `src/routes/admin.service-areas.tsx`.
- **Données modifiées** : insertions dans `service_areas` via upsert sur la
  contrainte unique `(service_id, city_slug)` déjà existante — jamais de
  suppression d'une association existante.
- **Definition of Done** : sélection explicite des villes (proposées depuis les
  `city`/`city_slug` déjà utilisés par ce tenant, aucune table nouvelle) ;
  sélection explicite des services ; aucune case précochée ; aperçu du nombre
  d'associations à créer et de celles déjà existantes qui seront ignorées ;
  confirmation explicite requise avant écriture.
- **Tests** : Admin (workflow complet, y compris 0 sélection) ; Super Admin
  (même écran à droits élevés, après le lot B) ; Public (nouvelles pages
  service×ville accessibles pour les combinaisons créées).
- **Dépendances** : aucune technique.

### Lot 8 — Simplifier le formulaire Service (catégorie A)

- **Fichiers concernés** : `src/routes/admin.services.tsx`.
- **Données modifiées** : aucune migration — génération automatique du slug
  à la création uniquement, les 103 services existants gardent leur slug actuel.
- **Definition of Done** : vue client limitée à nom, description, actif, mise
  en avant, marques associées ; slug généré automatiquement à la création,
  non modifiable côté client après création (une modification de slug change
  les URL déjà publiées) ; `sort_order` non exposé en saisie numérique brute
  côté client ; templates SEO cachés côté client, valeurs conservées en base
  (jamais réinitialisées) ; section avancée réservée au Super Admin, avec
  avertissement explicite si le slug est modifié après publication.
- **Tests** : Admin (formulaire simplifié, création + édition) ; Super Admin
  (accès complet conservé, avertissement affiché) ; Public (URLs des services
  existants inchangées — vérifier qu'aucun slug n'a bougé après le lot).
- **Dépendances** : aucune. Ne construit pas la sélection depuis
  `trade_service_templates` — catalogue de prestations, lot 9, différé.

### Lots 9 et 10 — différés, hors de ce backlog

Catalogue de services-types et bibliothèque de médias métier : deux chantiers
**B** séparés, chacun avec sa propre gouvernance (taxonomie et intention SEO
pour l'un, provenance et licence pour l'autre). Ne pas les débuter comme
sous-produit d'un correctif EASYDEP.
