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

### Lot 2 — Solo vs équipe (catégorie A) — révisé

**Statut : fait.** Remplace la version initialement livrée, qui déduisait le
mode de présentation du nombre de membres actifs — un objet métier confondu
avec un choix éditorial (voir la Constitution, principe 2).

**Décisions retenues**

- Un réglage explicite, jamais déduit : `site_settings.team_presentation_mode`,
  valeurs `null | 'artisan' | 'company' | 'hidden'`. `site_settings` plutôt que
  `tenants` — c'est une décision de présentation du site (même famille que
  `hero_title`, `cta_text`), pas un fait d'identité légale.
- Pas de défaut imposé. `null` = "non arbitré", rendu public **masqué** — sans
  coût de régression mesuré : sur 17 tenants, 15 sont déjà à 0 membre actif
  (déjà masqués) et 2 à 1 membre (actuellement au rendu fautif, donc
  strictement améliorés en étant masqués plutôt que de mentir). Aucun tenant
  n'a 2 membres actifs ou plus aujourd'hui.
- Verrou en base sur **`INSERT` et `UPDATE`**, pas seulement `UPDATE` — un
  trigger étroit propre à cette seule colonne, jamais une extension du verrou
  `tenants` ni un verrou global de `site_settings`. `tenant_admin` peut lire,
  ne peut jamais écrire par aucun chemin ; seuls `super_admin` et
  `service_role` le peuvent.
- Wording neutre, transversal à tous les métiers :
  - `artisan` → eyebrow "À propos", titre "Votre artisan", sous-titre
    "Découvrez la personne qui met son savoir-faire au service de vos
    projets." Nom et fonction réelle uniquement sur la carte, jamais dans le
    sous-titre.
  - `company` → eyebrow "Qui sommes-nous ?", titre "L'entreprise", sous-titre
    "Un savoir-faire au service de vos projets."
- `artisan` + plusieurs membres actifs : seul le premier par `sort_order` est
  affiché publiquement — jamais de suppression ou désactivation automatique.
  Compensé côté Super Admin par une microcopie permanente ("En mode Artisan,
  seule la première personne de la liste est affichée publiquement") et une
  alerte visible dès que 2+ membres actifs existent en mode `artisan`.
- Réconciliation opérationnelle : alerte dans la fiche Super Admin quand
  `team_presentation_mode IS NULL` **et** qu'au moins un membre actif existe —
  pas un nouveau tableau de bord, juste un signal sur les tenants qui
  attendent un arbitrage (2 aujourd'hui).
- EASYDEP ne passe à `artisan` que par une action Super Admin séparée et
  explicite, après le déploiement — jamais par la migration elle-même.

**Fichiers livrés** : migration `20260805090000_team_presentation_mode.sql`
(colonne + contrainte + trigger `INSERT`/`UPDATE`) ; types Supabase régénérés ;
`src/lib/team.ts` (`resolveTeamPresentation`, `updateTeamPresentationMode`,
type `TeamPresentationMode`) ; `src/components/admin/TeamManager.tsx`
(contrôle à 4 états côté Super Admin, lecture seule verrouillée côté Admin,
microcopie, les deux alertes) ; `super-admin.tenants.$tenantId.tsx`
(`canEditPresentationMode` passé uniquement à cet appel) ;
`src/components/public/TeamSection.tsx` (consomme la fonction pure, layout
`solo` dédié — plus la grille réutilisée telle quelle) ; `src/lib/team.test.ts`
(8 tests unitaires, la matrice complète).

**Ce que ce lot simplifie** : 1 logique de déduction implicite (comptage) → 1
réglage explicite avec 4 états nommés, dont un état "non arbitré" qui
n'existait pas avant. La solidité du verrou franchit un cran : le premier
essai ne protégeait rien en base (c'était un simple champ dérivé, pas une
donnée écrite) ; celui-ci est verrouillé par un trigger dédié couvrant
`INSERT` et `UPDATE`, pas seulement `UPDATE`.

**Vérifié en base après migration** : les 16 lignes `site_settings`
existantes sont toutes à `team_presentation_mode = null` — aucun
préremplissage, EASYDEP inclus. `mcp__Supabase__get_advisors` ne signale
aucun avertissement nouveau propre à ce trigger, seulement le même
avertissement générique déjà porté par tous les triggers existants du
projet.

**Definition of Done** : les 7 lignes de la matrice de rendu couvertes par
les tests unitaires (8/8 verts) ; build et typecheck propres ; aucune donnée
d'EASYDEP modifiée automatiquement — confirmé en base, pas seulement
supposé.

**Tests** : unitaires sur `resolveTeamPresentation`, verts (build + typecheck
+ vitest exécutés). Admin/Super Admin/Public — logique vérifiée par lecture de
code et par les tests unitaires, pas par un test en navigateur connecté
(identifiants non disponibles dans cet environnement) : à faire séparément
avant de considérer le rendu visuel validé, notamment le layout `solo` à une
seule carte.

**Addendum sécurité — `20260805100000_lock_team_presentation_mode_trigger_execute.sql`**
Le linter Supabase signalait `enforce_team_presentation_mode_locked()` comme
fonction `SECURITY DEFINER` exécutable par `anon`/`authenticated`. Corrigé par
un `REVOKE` ciblé sur cette seule fonction. Vérifié en direct, en isolant
chaque vérification dans un seul appel atomique (voir incident ci-dessous) :
un `UPDATE` sur un champ autorisé par un `tenant_admin` réussit toujours après
la révocation, et l'écriture de `team_presentation_mode` reste refusée. Les
autres fonctions trigger du projet portant le même avertissement générique ne
sont pas touchées ici — backlog sécurité séparé, non scopé.

**Incident survenu pendant la vérification, corrigé** : une tentative de test
transactionnel combiné (plusieurs `SAVEPOINT`/`ROLLBACK TO SAVEPOINT` dans un
seul script) a mal tourné — la connexion utilisée passe par un pooler qui ne
garantit pas qu'un script multi-instructions s'exécute sur une seule session,
ce qui a rendu les `SAVEPOINT` invisibles. Deux écritures qui devaient être
annulées sont restées commitées : `team_presentation_mode` d'EASYDEP passé à
`artisan`, et celui d'un tenant sans rapport ("SAVENER INSTALLATION") passé à
`company`. Repéré immédiatement en revérifiant l'état après le script, corrigé
dans la minute (les deux remis à `null`, vérifié). Aucun des deux n'était
visible publiquement le temps de l'incident — le rendu `null` était déjà
masqué. Depuis : plus aucun test en plusieurs instructions avec
`SAVEPOINT`/`ROLLBACK` sur cette connexion — chaque vérification tournée en
un seul bloc `DO $$ … $$` atomique, avec relecture de l'état après coup.

**Tenant sans `site_settings`** : 17 tenants, 16 lignes — le tenant manquant
est **"ROBERT ERIC"** (`50d1bec4-5757-4c40-bec5-225e734ed1f1`), `is_active`
mais 0 service, 0 contact, 0 membre d'équipe : un tenant vide, probablement un
artefact d'onboarding jamais terminé plutôt qu'un client réel. Conséquence
directe : `fetchSiteSettings()` utilise `.single()`, qui lève une erreur sur 0
ligne — `TeamManager` (et tout écran s'appuyant sur les paramètres du site)
plante si jamais ouvert pour ce tenant précis. Bug latent préexistant, pas
introduit par ce lot, mais désormais une dépendance réelle de ce lot. Aucune
correction de données appliquée — confirmation requise avant d'agir.

**Suite des tests transactionnels du trigger** : le cas le plus important
(`tenant_admin` + `UPDATE` du mode → refus) est vérifié en direct, isolé, sans
effet de bord. Les cinq autres cas de la matrice demandée
(`tenant_admin` + champ autorisé, `tenant_admin` + `INSERT` mode `null`,
`tenant_admin` + `INSERT` mode non nul, `super_admin`, `service_role`)
restent à tester un par un, en blocs atomiques isolés — pas en script combiné.

**Dépendances** : aucune.

### Lot 11 — `tenant_stage` (catégorie A, différé)

**Statut : backlog, non planifié dans ce chantier.** Distinguer les fixtures
techniques des vrais prospects/clients dans le Pilotage agence et les
statistiques. Valeurs envisagées : `test | prospect | onboarding | active |
paused | archived`. EASYDEP y sera `prospect` ou `onboarding`, jamais `test`.
Aucune suppression de tenant de test prévue — ils servent de cas de
régression (tenant vide, artisan solo, équipe, site complet, cas
incohérent). À scoper séparément (fichiers, données, DoD) avant exécution ;
ne pas le mélanger avec le correctif de présentation solo/entreprise.

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

## Lot — Sécurisation de la gratuité et du délai de réponse dans les contenus publics

**Statut : fait.**

Nom précis à conserver partout où ce lot est référencé — ce n'est **pas** "toutes
les promesses commerciales sécurisées" (voir périmètre non couvert ci-dessous).

`resolveCommercialPromises()` (`src/lib/commercial-promises.ts`) devient la seule
source des affirmations de gratuité et de délai de réponse sur le site public — 15
emplacements qui affirmaient localement "devis gratuit" ou un délai, sans tenir
compte de `quote_is_free`/`quote_response_delay_hours`, lisent désormais ce
resolver. Séparé volontairement de `resolveEditorialTexts()`
(`src/lib/editorial-texts.ts`) : le texte de bouton/bannière est une voix de
marque, pas un fait commercial — mais un `cta_text` libre qui affirme la
gratuité sans confirmation (`quote_is_free !== true`) est neutralisé vers le
libellé neutre par défaut plutôt que publié tel quel.

### Ce que ce lot simplifie

- 15 emplacements qui décidaient chacun localement d'une promesse → 1 seul
  resolver de vérité, réutilisé partout (Hero, CTABanner ×6 pages, Header, FAQ,
  contact, meta descriptions service×ville, FloatingCTA, HowItWorks, SeoLongText).
- FAQ : question stable ("Quelles sont les conditions du devis ?") dans les 3
  états de `quote_is_free`, seule la réponse varie — au lieu d'une question qui
  devenait maladroite une fois la gratuité confirmée.
- Contact : 1 titre de badge délai (`responseTimeHeading`) factuel au lieu d'un
  titre statique "Réponse rapide" affirmé dans tous les cas.

### Ce que ce lot supprime

- Le badge "Devis personnalisé" / "Adapté à votre besoin" sur la page Contact —
  formulation creuse, valable pour pratiquement tout devis, supprimée plutôt que
  remplacée. Le badge devis n'existe plus du tout quand `quote_is_free !== true`.
- "et sans engagement" dans la FAQ et "Sans engagement de votre part" sur la page
  Contact — `quote_is_free = true` confirme la gratuité, pas l'absence
  d'engagement ultérieur ; aucune donnée ne confirme cette seconde affirmation.
- Le fallback qualitatif "Nous vous répondons rapidement." quand le délai n'est
  pas confirmé — remplacé par une formulation factuelle ("Nous étudions votre
  demande et revenons vers vous.").

### Ce qui reste à migrer

**Périmètre non couvert, à nommer explicitement partout où ce lot est cité** :
seules la gratuité et le délai de réponse sont protégés. `cta_text` reste un
champ libre pour toute autre promesse — vérifié directement sur le validateur
réel, aucun des quatre cas suivants n'est aujourd'hui détecté ni neutralisé :

| Texte libre | Risque | Donnée tenant disponible |
|---|---|---|
| "Intervention sous 24h" | délai d'intervention inventé | aucune |
| "Dépannage en urgence" | urgence non confirmée | `emergency_service_available`, mais non relié au CTA |
| "Disponible 24/7" | disponibilité absolue | aucune donnée suffisamment précise |
| "Réponse garantie" | garantie contractuelle | aucune |

Voir le lot séparé ci-dessous.

### Risques connus

- Build, typecheck et 32 tests unitaires vérifiés ; pas de test en navigateur
  connecté (identifiants non disponibles dans cet environnement) — vérifié à la
  place par exécution directe des resolvers réels (pas une simulation) sur les
  trois états `true`/`false`/`null`, y compris le cas `cta_text` contradictoire.
- Le titre statique "Réponse rapide" a été retiré de Contact, mais un texte
  équivalent ("sans engagement", délais chiffrés non confirmés) peut encore
  exister ailleurs dans du contenu non audité par ce lot précis (portée du grep :
  "gratuit", "urgence", "24h/48h", "garanti" uniquement).

## Lot (différé) — Promesses libres dans `cta_text`

**Statut : à faire — backlog P0/P1, aucun code avant validation.**

Le lot précédent ne neutralise que la gratuité (`mentionsFreeQuote` ne teste que
`/gratuit/i`). Les quatre cas du tableau ci-dessus restent publiables sans
aucune vérification. Compromis retenu : un filtre lexical conservateur sur
`cta_text`, pas un moteur linguistique généraliste.

**Definition of Done proposée :**

- détecter chacune des formulations ci-dessus et leurs variantes proches
  (urgent, dépannage immédiat, 24h/24, 7j/7, garantie de réponse, formes "sous
  Xh"/"en X heures"/"dans la journée") ;
- si une donnée tenant exacte la confirme (`emergency_service_available` pour
  l'urgence), l'autoriser ; sinon neutraliser le rendu public, comme la
  gratuité aujourd'hui ;
- créer une anomalie Pilotage à chaque neutralisation, jamais une tolérance
  silencieuse ;
- ne jamais déduire qu'une promesse est vraie à partir d'une donnée seulement
  approximative (`opening_hours` ne prouve pas "24/7", par exemple).

**Tests minimum attendus** : les 4 cas du tableau ci-dessus, avec et sans la
donnée tenant correspondante quand elle existe.

## Lot — Photo de service : combler le trou invisible du resolver

**Statut : fait.**

Cause racine identifiée en base réelle, pas supposée : `ServiceMedia` (le
composant partagé, déjà unique sur les cartes services) appelle
`resolveMedia(category: "service")`, dont la hiérarchie ignorait totalement
`portfolio` — elle ne consultait que `tenant_media` (vide pour la plupart des
tenants tant qu'aucun écran d'upload dédié n'existe) puis
`trade_template_id` (souvent `null` — EASYDEP notamment). Un tenant peut donc
avoir des illustrations de service en base, explicitement rattachées à un
service, sans qu'aucune ne s'affiche jamais nulle part. Ce n'est pas un trou
EASYDEP, c'est un trou du moteur — corrigé une fois pour tous les tenants
présents et futurs, catégorie **A**.

**Vocabulaire à respecter partout où ce lot est cité** : `content_kind =
'illustration'` produit une **illustration de service** — une image
représentative, jamais une preuve terrain. Seul `content_kind =
'real_project'`, fourni ou confirmé par le tenant, constitue une **photo de
réalisation réelle**. Ne jamais écrire "vraie photo" ou "image réelle" pour
un média `illustration`, même quand son rendu à l'écran est identique à une
vraie photo — la distinction est sur ce que le média affirme, pas sur son
rendu visuel.

**Nouveau niveau 1.5** dans `resolveMedia()` (`src/lib/media-resolver.ts`),
entre le niveau 1 (`tenant_media`) et le niveau 2 (bibliothèque métier) :
`portfolio` où `service_id` correspond exactement au service ET
`content_kind = 'illustration'` — jamais `real_project`, pour qu'une photo de
réalisation réelle ne se retrouve jamais réutilisée comme simple illustration
ailleurs. Aucune condition sur `is_published` : cette colonne gouverne la
grille "Réalisations" (une affirmation de travail réellement effectué), pas
l'éligibilité d'une image à illustrer le service lui-même. L'`alt` ne lit
jamais `portfolio.title` (qui peut nommer une ville) — toujours le nom du
service, pour ne jamais inventer un chantier ou une localisation. Le rendu
public peut légitimement utiliser ces illustrations sur les pages Services ;
ce que l'interface, la documentation et les textes ne doivent jamais laisser
entendre, c'est qu'un chantier a été réalisé par le tenant à l'endroit ou
dans les conditions que le média suggère.

**Deux surfaces qui n'affichaient tout simplement aucune image, pas un
problème de résolveur** : `/services/$serviceSlug` et `/$slug` (page
service×ville) n'avaient aucun `<ServiceMedia>` dans leur hero — corrigé en
leur ajoutant la même colonne image que les cartes, sur le modèle déjà en
place. `/` (cartes vedettes) et `/services` utilisaient déjà `ServiceMedia` —
ils bénéficient du niveau 1.5 automatiquement, aucun changement de composant
nécessaire.

### Ce que ce lot simplifie

- 1 seul point de résolution d'image pour les 4 surfaces publiques
  (`ServiceMedia`, déjà partagé) — confirmé qu'aucune des 4 ne dupliquait sa
  propre logique d'image, seules 2 sur 4 n'appelaient simplement pas le
  composant.
- 0 dépendance obligatoire à `trade_template_id` pour qu'un tenant obtienne
  une illustration de service sur ses cartes — le niveau 1.5 fonctionne sans.

### Ce que ce lot supprime

Rien — correctif additif, aucun comportement existant retiré.

### Ce qui reste à migrer

**Pour EASYDEP précisément** — vérifié en base, pas supposé, état final après
les associations manuelles faites en Super Admin : sur 16 services, **5**
affichent une illustration de service (Unsplash, `content_kind =
'illustration'`, jamais un chantier réel d'EASYDEP), **11** restent sur le
dégradé + icône. `tenants.trade_template_id` est `null` pour EASYDEP, donc le
niveau 2 (bibliothèque métier) ne peut jamais se déclencher pour les 11
restants. Les 5 associations ont été faites une par une, uniquement quand le
titre et la description du média désignaient un service sans ambiguïté —
aucune image dupliquée sur plusieurs services pour combler l'espace. Aucune
de ces 5 images n'est, ni ne doit jamais être présentée comme, une
réalisation réelle d'EASYDEP.

Pour de vraies photos de réalisations EASYDEP, la seule voie légitime reste
que le tenant (ou l'agence en son nom) fournisse ses propres photos —
`content_kind` par défaut est déjà `'real_project'` sur toute nouvelle ligne
`portfolio`, aucun changement de code nécessaire pour ce cas.

### Risques connus

- Build, typecheck et 32 tests (suite existante, inchangée) vérifiés ;
  vérification du niveau 1.5 faite par requête directe en base réelle
  (lecture seule) sur les 16 services d'EASYDEP, pas par un test unitaire
  dédié — `resolveMedia()` dépend du client Supabase, aucune infrastructure
  de mock n'existe dans ce projet et n'a pas été construite pour ce seul lot.
- Rendu visuel des deux nouvelles colonnes image (hero service et
  service×ville) non vérifié en navigateur connecté — même limite que tous
  les lots précédents dans cet environnement.

## Lot — Photo par service : upload et retrait depuis l'Admin

**Statut : fait, dans `/admin/services` uniquement.**

Le niveau 1.5 du resolver (lot précédent) ne comble le trou visuel d'un
tenant que si une illustration exploitable existe déjà et peut être
rattachée à la main en Super Admin, ligne par ligne, en base — ce qui a
permis de traiter EASYDEP, mais n'est pas un chemin utilisable par un futur
client ou par l'agence au quotidien. Corrigé : chaque ligne de
`/admin/services` propose désormais une vignette (le même composant partagé
`ServiceMedia` que le rendu public — jamais de logique dupliquée), un bouton
appareil photo pour déposer/remplacer une image, et un bouton retirer quand
une photo propre au service existe déjà.

Écrit dans `tenant_media` (catégorie `service`, `target_id` = le service) —
le niveau 1, le plus prioritaire, du resolver déjà en place. Retirer la
photo ne supprime rien d'autre : le resolver retombe sur l'illustration
liée si elle existe, puis la bibliothèque métier, puis le fallback neutre,
exactement comme avant qu'une photo propre existe.

**Vérifié** : RLS de `tenant_media` relue avant d'écrire le code — la
politique `tenant_media_owner` (`ALL`, sur `tenant_id` du membre connecté)
autorise déjà l'écriture pour un vrai `tenant_admin`, sans changement de
policy nécessaire. Build, typecheck, 32 tests (suite existante) verts.

### Ce que ce lot simplifie

- 0 moyen d'attacher une photo à un service depuis l'Admin → 1, cohérent
  avec ce qui existe déjà pour les réalisations (même geste : vignette +
  ajouter + retirer).
- Toujours 1 seul composant de rendu (`ServiceMedia`) pour la vignette Admin
  et le rendu public — la vignette montre exactement ce que le visiteur
  verra, jamais une prévisualisation différente du résultat réel.

### Ce que ce lot supprime

Rien.

### Ce qui reste à migrer

- **Super Admin** : la fiche `super-admin.tenants.$tenantId.tsx` a son propre
  écran Services, codé séparément de `/admin/services` (constat déjà
  documenté, Lot B) — ce correctif ne s'y applique pas encore. Tant que
  Lot B n'est pas fait, l'agence intervenant pour un client doit encore
  passer par "Gérer ce site" (impersonation) pour attacher une photo de
  service à sa place.
- Pas de sélection parmi les illustrations existantes du tenant depuis cet
  écran (seulement upload direct) — l'association reste manuelle en base
  pour ce cas, comme pour EASYDEP.
- Pas de bouton "restaurer le défaut" séparé — retirer la photo *est* déjà
  la restauration, aucune étape supplémentaire nécessaire.

### Risques connus

- Rendu visuel non vérifié en navigateur connecté — même limite que tous
  les lots précédents dans cet environnement. Le chemin d'upload réutilise
  cependant mot pour mot celui déjà en production pour les réalisations
  (`admin.portfolio.tsx`), pas un nouveau mécanisme non éprouvé.

## Lot (P0) — Boucle de redirection `/login` pour un utilisateur authentifié sans rôle

**Statut : à faire — backlog P0, aucun code avant validation.**

Découvert en conditions réelles (compte `tpetit1979@gmail.com` sans ligne
`user_roles`, corrigé par écriture directe le 5 août 2026) : un utilisateur
authentifié dont le rôle ne correspond à aucune garde (`/admin` : ni
`tenant_admin` ni `super_admin` en impersonation ; `/super-admin` : pas
`super_admin`) est renvoyé vers `/login?redirect=<route protégée>`.
`login.tsx` fait alors confiance à `search.redirect` dès que
`isAuthenticated` est vrai, sans revérifier que le rôle donne accès à cette
cible — d'où l'aller-retour `/login?redirect=X` → `X` → `/login?redirect=X`
à l'infini, jusqu'au crash React ("Maximum update depth exceeded").

**Definition of Done proposée :**

- un utilisateur authentifié sans rôle valide pour la route demandée voit un
  écran "Accès refusé" (avec lien de déconnexion), jamais une boucle vers
  `/login` ;
- `login.tsx` ne redirige vers `search.redirect` qu'après avoir vérifié que
  le rôle résolu autorise effectivement cette cible ;
- test couvrant explicitement le cas "authentifié + rôle `null`".

Lot séparé, à ne pas mélanger avec la sécurisation des URLs sociales
(Lot en cours) ni avec aucun autre chantier de ce backlog.

**Portée** : catégorie A — améliore tous les tenants, pas seulement EASYDEP.

## Lot (dette, différé) — `AiTab` peut relire un cache IA périmé après une écriture Services/Zones

**Statut : dette documentée, non bloquante — aucun code avant que le chantier IA/onboarding ne soit repris.**

Découvert en auditant le partage `ServicesManager`/`ZonesManager` entre Admin
et Super Admin (`super-admin.tenants.$tenantId.tsx`). `AiTab` charge ses
propres `sa-services-for-ai`/`sa-areas-for-ai`, distincts des clés
`admin-services`/`admin-service-areas` que `ServicesManager`, `ZonesManager`
et le badge de complétion partagent désormais. Une écriture faite dans
l'onglet Services ou Zones n'invalide jamais `sa-services-for-ai`/
`sa-areas-for-ai` ; le `QueryClient` global a un `staleTime` de 2 minutes
(`src/router.tsx:43`), donc rouvrir l'onglet IA dans les 2 minutes suivant
sa dernière lecture peut afficher une liste de services/zones périmée.

Préexistant, pas introduit par l'unification Services/Zones : l'ancien
`ServicesTab` n'invalidait déjà que `sa-services`, jamais `sa-services-for-ai`.

**À ne pas faire** : ne pas faire dépendre `ServicesManager`/`ZonesManager`
de clés spécifiques à l'IA pour corriger ça — recoupler le composant
partagé à `AiTab` irait à l'encontre de la simplification faite.

**Pistes pour le futur chantier IA/onboarding**, à trancher à ce moment-là,
pas maintenant :
- `AiTab` consomme directement `admin-services`/`admin-service-areas` ; ou
- `AiTab` refetch explicitement à l'ouverture de l'onglet.

**Portée** : catégorie A, mais rattachée au chantier IA/onboarding (branche
`claude/generate-tenant-gemini-adapter`), pas à Lot B.
