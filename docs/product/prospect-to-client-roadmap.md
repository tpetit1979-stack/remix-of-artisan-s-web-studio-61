# Doctrine commerciale — préparer avant de vendre

Doctrine versionnée, distincte de `constitution.md` (principes produit généraux),
de `execution-backlog.md` (état lot par lot) et de `seo-local-architecture.md`
(doctrine SEO local — référencée ici, jamais recopiée). Ne se modifie pas au fil
de l'eau — toute révision crée une nouvelle version numérotée ci-dessous, sans
réécrire l'historique des versions précédentes.

**Version 1 — figée le 2026-08-27**, à partir d'un audit lecture seule confrontant
dix idées inspirées d'un concurrent (Artizo) à l'état réel du repo et de la base
(`bygdvkpjreuilqghtnka`). Artizo est une source d'idées, jamais une spécification
— rien dans ce document ne vise à reproduire Artizo.

## 1. VISION PRODUIT

Lignia prépare le site **avant** la vente, pas après. L'automatisation produit
une première version crédible à environ 80 % ; l'humain contrôle, personnalise
et authentifie les 20 % qui font la différence commerciale. Après signature, on
ne recrée pas le site : le même tenant évolue progressivement vers un vrai actif
numérique du client (compte activé, domaine connecté, informations vérifiées,
vraies photos, publication définitive).

Lignia n'est pas un générateur massif de mini-sites. Le pitch visé est :
**« J'ai préparé ce que pourrait être votre nouveau site »**, suivi d'une preview
concrète, qualitative, déjà personnalisée — pas une promesse abstraite.

## 2. PRINCIPES À NE PAS PERDRE

- Données métier séparées de la présentation ; un moteur de rendu commun.
- Variantes visuelles possibles à terme, mais limitées en nombre et gouvernées
  — jamais une personnalisation libre.
- Hiérarchie des contenus potentiellement adaptée au métier (`trade_template`),
  distincte du template visuel.
- Génération IA de données structurées, jamais de HTML ou de page libre.
- Preview commerciale partageable avant toute signature.
- Le même tenant évolue de prospect à client — jamais recréé.
- Images métier temporaires autorisées pour démontrer, jamais présentées comme
  des réalisations réelles.
- Provenance et authenticité des contenus traçables, au moins pour les médias.
- Contrôle humain avant toute livraison ou utilisation commerciale d'un dossier
  prospect.
- Dossier prospect automatisable à terme, par orchestration de briques
  existantes — pas un nouveau système.
- Domaine automatisable plus tard seulement, jamais avant que ce soit un vrai
  coût opérationnel.
- Aucun maillage SEO artificiel entre tenants — cohérent avec les invariants et
  anti-dérives de `seo-local-architecture.md`.

Deux principes formulés explicitement, à citer tels quels dans toute discussion
future sur ce sujet :

> **L'automatisation prépare la vente ; l'humain transforme le prototype en
> vrai site.**

> **Une donnée générée permet de démarrer ; une donnée authentique doit
> progressivement la remplacer.**

## 3. ÉTAT RÉEL DE LIGNIA (audit du 2026-08-27)

Classification : `[DÉJÀ SOLIDE]` / `[PARTIEL]` / `[MANQUANT]` / `[FUTUR POSSIBLE]`
/ `[À NE PAS FAIRE MAINTENANT]`. Snapshot daté — à revérifier avant de s'y fier
si beaucoup de temps s'est écoulé ou si le schéma a changé.

**Preview commerciale — `[PARTIEL]`, fondation déjà là.**
`?tenant=<slug>` (`usePreviewTenantSearch`, `src/hooks/use-tenant.tsx`) permet
déjà de prévisualiser un tenant sans domaine posé, indépendamment de la
résolution par hostname. Pensé pour le dev/preview interne, pas encore packagé
comme outil commercial (pas de bouton "copier le lien" côté Super Admin).

**Cycle de vie prospect → client — `[PARTIEL]`, pas un enum manquant.**
`tenants.is_active` est un simple booléen. Mais `checkTenantProvisioningStatus()`
(`src/lib/tenant-provisioning.ts`) dérive déjà `compte: "aucun compte" |
"invitation envoyée" | "prêt"` à partir de `tenant_members`/`user_roles`, sans
stocker d'état — c'est déjà, de facto, un signal de cycle de vie, dans la
continuité de la convention déjà choisie ce trimestre (dérivé, jamais stocké).

**Bibliothèque métier temporaire — `[DÉJÀ SOLIDE]`.**
`trade_media_library` + vue `public_trade_media` (filtrée sur `is_active` et
`review_status='approved'`), gouvernance complète : `source_type`
(`unclassified/legacy_unknown/licensed_stock/ai_generated/owned/
manufacturer_authorized`), `license_code`, `author_credit`, `review_status`
(`pending/approved/rejected`), avec contrainte SQL empêchant qu'une image reste
approuvée si elle redevient `unclassified`. Écran de gouvernance :
`super-admin.media-library.tsx`. Resolver (`src/lib/media-resolver.ts`) suit
déjà exactement la hiérarchie tenant réel → illustration du tenant → bibliothèque
métier → placeholder neutre, avec un champ `source` explicite. **Ne pas
reconstruire un second système.**

**Provenance/authenticité des médias — `[DÉJÀ SOLIDE]` côté médias, `[MANQUANT]`
côté texte.**
`portfolio.media_origin` (`template`/`tenant`), `portfolio.content_kind`
(`illustration`/`real_project`), `portfolio.source_template_media_id`,
`tenant_media.source_template_media_id`. `PortfolioManager.tsx` convertit déjà
automatiquement `illustration → real_project` et `template → tenant` dès que
l'admin remplace l'image — le principe "l'authentique remplace le généré" est
déjà **codé**, pas seulement documenté. Aucun équivalent pour le texte
(`tenants.tagline`, `services.description`, `seo_boost_text` générés par
`generate-tenant` n'ont aucun marqueur généré/relu/confirmé).

**Génération IA structurée — `[PARTIEL]`, patron déjà correct.**
`supabase/functions/generate-tenant/index.ts` utilise un tool call strict
(`suggest_tenant_config`), jamais de HTML. Couverture actuelle : identité
entreprise, hero, CTA, couleur, SEO, services (nom/description/featured),
villes. Pas encore : arguments/"pourquoi nous", checklist, FAQ — et ces champs
n'existent pas non plus dans le modèle de données aujourd'hui.

**Dossier prospect automatisé — `[PARTIEL]`, briques dispersées.**
Google Business Profile déjà intégré (`google-places` Edge Function,
`TenantGooglePlacesManager.tsx`, `tenants.google_place_id/google_rating/
google_review_count`). Logo → palette (`analyze-logo`, `LogoAnalyzer`). Import
média externe (`media-import`, fournisseur Pixabay). Génération de contenu
initial (`generate-tenant`). Aucune orchestration en un seul flux ; pas de
récupération automatique des photos du site actuel d'un artisan.

**Hiérarchie de site adaptée au métier — `[PARTIEL]`, données riches, rendu
générique.**
`trade_templates`, `trade_service_templates` (avec `priority_score` pour une
sélection "Pareto top"), `tenant_trade_activations` (multi-métiers par tenant,
un `is_primary` + compléments) — plus riche que ce que l'idée d'origine
demandait. Mais `src/routes/index.tsx` ne référence `trade_template` nulle
part : l'ordre des blocs publics est fixe, pas dérivé du métier.

**Compositions visuelles officielles — `[MANQUANT]`.**
Le principe "données ≠ présentation" est déjà l'architecture (moteur unique,
aucun HTML par tenant). Mais aucune notion de composition/variante de mise en
page n'existe — seuls logo, couleurs dérivées et hero/CTA texte varient. Même
point d'entrée de rendu que la hiérarchie métier ci-dessus : **un seul et même
chantier futur, pas deux**.

**Provisioning commercial du domaine — `[MANQUANT]`, explicitement pas urgent.**
Aucune suggestion/vérification/achat de domaine dans le repo. Le domaine est
saisi manuellement par le Super Admin, verrouillé en base une fois posé
(`docs/product/objects/domaine.md`).

**Maillage réseau calculé — `[MANQUANT]`, `[À NE PAS FAIRE MAINTENANT]`.**
`partenaires` désigne des partenaires réels déclarés par le tenant lui-même
(`docs/product/objects/partenaires.md`), pas un maillage calculé entre tenants
Lignia. Contraire aux anti-dérives de `seo-local-architecture.md` si construit
pour "remplir" plutôt que pour une valeur éditoriale réelle.

## 4. ROADMAP PAR HORIZON

### Horizon A — avant / autour des premiers clients
- Preview commerciale partageable (exploiter `?tenant=`, un bouton côté Super
  Admin).
- Rendre lisible l'état prospect/compte déjà dérivé par
  `checkTenantProvisioningStatus()` — sans nouveau modèle DB.
- Utiliser/gouverner la bibliothèque métier existante (peupler du contenu,
  pas du code).

### Horizon B — entre 10 et 50 clients
- Dossier prospect orchestré (assembler les briques existantes : Google
  Places, logo, génération IA, import média).
- Variantes visuelles et hiérarchie métier étudiées comme un seul chantier
  (même point d'entrée de rendu).
- Provenance/relecture du texte généré, si des cas réels le justifient.
- Statut de cycle de vie plus complet, seulement si `is_active` + dérivé ne
  suffit plus à un cas réel.

### Horizon C — après validation du modèle
- Automatisation du domaine (suggestion, disponibilité, achat).
- Autres automatisations administratives (ex. email professionnel).
- Réseau/partenariats entre tenants, uniquement fondé sur des relations
  réelles — jamais un maillage généré.
- Optimisations d'échelle validées par l'usage réel, pas anticipées.

## 5. ANTI-ROADMAP

Décidé explicitement de **ne pas construire maintenant** — à ne pas ressortir
comme des tâches oubliées sans qu'un déclencheur (section 6) soit devenu vrai :

- 4 compositions visuelles immédiatement.
- Un nouvel enum complet de cycle de vie (`prospect/onboarding/active/
  suspended`).
- Un scraper universel de sites tiers pour construire le dossier prospect.
- Un achat/une configuration automatique de domaines.
- Un réseau de crosslinks artificiels entre tenants.
- Toute génération de fausses réalisations ou de fausses preuves.
- Un second système de bibliothèque média — `trade_media_library` existe déjà.
- Toute fonctionnalité construite uniquement parce qu'Artizo (ou un autre
  concurrent) la possède.

## 6. DÉCLENCHEURS

Pour chaque chantier d'Horizon B/C, la condition observable qui doit devenir
vraie avant de le lancer — pas une échéance arbitraire.

| Chantier | Déclencheur |
|---|---|
| Variantes visuelles | Plusieurs vrais prospects/clients trouvent les sites trop similaires entre eux. |
| Hiérarchie métier dans le rendu public | Un artisan ou un prospect signale explicitement qu'un bloc mal placé nuit à la lecture du site. |
| Automatisation domaine | La gestion manuelle des domaines devient un coût opérationnel mesurable (temps agence). |
| Dossier prospect automatisé | La préparation manuelle répétée de prospects devient un goulot d'étranglement. |
| Provenance du texte | On observe réellement du contenu IA non relu resté en production au-delà de la démonstration. |
| Statut de cycle de vie complet | `is_active` + les états dérivés ne suffisent plus à représenter un cas métier réel rencontré. |
| Maillage réseau | Une relation de partenariat réelle entre deux tenants existe et a une valeur éditoriale démontrable — jamais pour du volume. |

## Statut

**Doctrine, pas une spécification d'implémentation.** Aucun code, migration ou
modification de fichier applicatif ne découle automatiquement de ce document.
Chaque chantier listé en Horizon B/C attend son propre lot, cadré et validé
séparément, une fois son déclencheur observé.
