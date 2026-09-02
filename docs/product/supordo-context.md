# SUPORDO — CONTEXTE MAÎTRE PRODUIT, MARQUE ET RENAMING

> Document de contexte destiné à Claude.
>
> Ce document ne constitue PAS une demande d'implémentation.
> Il sert à comprendre le produit, sa trajectoire, son architecture conceptuelle,
> son positionnement et le changement de marque en cours.
>
> IMPORTANT :
> - ne modifier aucun fichier sur la seule base de ce document ;
> - ne créer aucune table, migration, route, fonctionnalité ou abstraction ;
> - ne pas interpréter une vision future comme une fonctionnalité existante ;
> - distinguer systématiquement `[RÉEL]`, `[DÉCIDÉ]`, `[CIBLE]` et `[EXPLORATOIRE]` ;
> - en cas de contradiction avec le code ou la base, le runtime réel prévaut et
>   l'écart doit être signalé.

---

# 1. Résumé exécutif

Le projet évolue vers une plateforme européenne destinée aux :

- artisans ;
- TPE ;
- PME du bâtiment ;
- entreprises de maintenance ;
- entreprises d'installation ;
- entreprises de dépannage ;
- entreprises de services terrain ;
- plus largement, professionnels dont l'activité combine commerce, bureau et terrain.

Le projet possède deux grandes dimensions qui ont historiquement été développées séparément :

1. **une plateforme de génération et de gestion de sites web professionnels multi-tenant ;**
2. **un CRM / mini-ERP métier destiné à gérer l'activité quotidienne de l'entreprise.**

La direction stratégique est de les rapprocher progressivement sous une même marque et, à terme, dans un écosystème cohérent.

Le nom de marque retenu à ce stade est :

# SUPORDO

SUPORDO doit être compris comme la **marque ombrelle**.

Exemples de nomenclature possibles :

- SUPORDO
- SUPORDO Sites
- SUPORDO CRM
- SUPORDO Business

Ces appellations ne doivent pas être considérées automatiquement comme des noms
de produits définitivement figés dans le code.

La marque doit pouvoir continuer à fonctionner même lorsque la plateforme dépassera
le simple site web ou le simple CRM.

---

# 2. Renaming — contexte important

Le projet a connu plusieurs noms de travail.

Le nom **LIGNIA** a notamment été utilisé dans une partie importante de la documentation,
du code, des réflexions produit et des échanges historiques.

Il ne faut donc PAS considérer toutes les occurrences historiques de `Lignia`,
`LIGNIA`, ou d'anciens noms comme décrivant une marque différente ou un autre produit
sans examiner leur contexte.

Une direction intermédiaire, **OBRALTO**, a ensuite été étudiée et a fait l'objet d'un
contexte maître dédié. Cette direction est désormais abandonnée : OBRALTO n'est plus
la marque retenue. Les traces d'OBRALTO dans le code, les documents ou l'historique
Git ne doivent pas être effacées rétroactivement — elles décrivent une étape réelle
de la réflexion de marque, pas une erreur à dissimuler.

## Nouvelle direction

La marque destinée à remplacer progressivement l'ancien naming est :

# SUPORDO

SUPORDO doit devenir la marque commerciale ombrelle.

Le changement de marque ne signifie PAS qu'il faut immédiatement renommer :

- toutes les variables ;
- tous les dossiers ;
- toutes les tables ;
- toutes les fonctions ;
- toutes les Edge Functions ;
- toutes les références historiques ;
- tous les documents techniques ;
- tous les domaines ;
- toutes les constantes.

Le renaming technique devra être traité séparément et de manière contrôlée.

## Doctrine

**Renaming commercial ≠ migration technique immédiate.**

Avant toute modification technique liée au naming :

1. inventorier les occurrences ;
2. distinguer branding public, documentation, code, infrastructure et identifiants ;
3. identifier les références dont le changement pourrait casser le runtime ;
4. proposer un plan de migration ;
5. ne rien exécuter sans validation explicite.

## Ligne de partage

**A — BRANDING VISIBLE** (renommable en premier, faible risque) : nom affiché, logo,
textes UI, emails transactionnels, metadata, favicon, manifest, pages marketing,
documentation publique.

**B — IDENTIFIANTS TECHNIQUES** (migration séparée, uniquement sur raison réelle
démontrée) : nom du repository, packages, variables, constantes, tables, colonnes,
buckets Storage, Edge Functions, routes/URLs, secrets, noms de domaines, clés de
configuration.

> **Interdiction absolue : aucun search-replace global Lignia → Supordo /
> LIGNIA → SUPORDO, ni Obralto → Supordo / OBRALTO → SUPORDO, dans un sens
> comme dans l'autre. Tout renommage technique passe par inventaire →
> classification → analyse d'impact runtime → plan → validation explicite.
> Un renommage cosmétique ne doit jamais provoquer une régression technique.**

---

# 3. SUPORDO comme nom propre

SUPORDO n'a pas d'étymologie officielle à ce stade et ne doit pas s'en voir inventer
une a posteriori. En particulier, une lecture du type `SUP + ORDER/ORDRE + DO` ne doit
jamais être présentée comme une vérité de marque — c'est, au mieux, une piste
mnémotechnique, jamais une explication actée.

SUPORDO doit d'abord fonctionner comme un **nom propre** :

- professionnel ;
- mémorisable ;
- européen ;
- suffisamment abstrait pour dépasser le bâtiment ;
- compatible avec un logiciel ;
- compatible avec une entreprise technologique de taille importante.

Le territoire de marque peut en revanche continuer à se construire autour de thèmes,
sans les rattacher au nom lui-même :

- maîtrise tranquille ;
- entreprise sous contrôle ;
- organisation ;
- continuité bureau ↔ terrain ;
- mémoire de l'entreprise ;
- travail réel ;
- preuve par les photos ;
- simplicité ;
- technologie utile ;
- IA comme couche invisible.

« Tout est dans SUPORDO » peut servir de **test conceptuel interne** pour évaluer si
une fonctionnalité renforce la continuité du produit — ce n'est pas, à ce stade, un
slogan retenu ni une promesse commerciale actée.

---

# 4. Vision à long terme

La vision n'est pas de construire :

- seulement un générateur de sites ;
- seulement un CRM ;
- seulement un logiciel de devis ;
- seulement un ERP ;
- seulement un outil IA.

La vision est de construire progressivement un :

# système d'exploitation des entreprises de terrain

SUPORDO doit pouvoir accompagner l'entreprise depuis sa visibilité commerciale jusqu'au
pilotage quotidien de son activité.

Schématiquement :

VISIBILITÉ
↓
PROSPECT
↓
DEMANDE / LEAD
↓
QUALIFICATION
↓
CLIENT
↓
DEVIS
↓
VISITE / INTERVENTION
↓
PLANNING
↓
CHANTIER
↓
ACHATS
↓
FACTURATION
↓
PAIEMENT
↓
MAINTENANCE / SAV
↓
FIDÉLISATION

Le site web et le CRM/mini-ERP ne sont donc pas deux idées arbitrairement accolées.

Ils couvrent progressivement deux parties d'un même cycle :

> **être trouvé → être contacté → vendre → réaliser → facturer → suivre → fidéliser.**

---

# 5. Les deux piliers actuels du projet

# PILIER A — SUPORDO SITES

## Rôle

Créer rapidement des sites vitrines professionnels pour artisans et entreprises locales.

Il s'agit d'une plateforme **multi-tenant**.

Ce n'est PAS :

> un dépôt GitHub par artisan.

L'architecture repose sur :

- un moteur partagé ;
- des composants partagés ;
- des templates / règles partagés ;
- des données propres à chaque tenant ;
- une résolution du tenant ;
- un rendu dynamique du site correspondant.

Le même moteur doit pouvoir servir de nombreux métiers.

Ordre de grandeur fonctionnel envisagé :

**environ 34 métiers**, sans créer une architecture spécifique pour chacun.

Exemples :

- plombier ;
- chauffagiste ;
- installateur de poêles ;
- ramoneur ;
- climaticien ;
- installateur PAC ;
- électricien ;
- couvreur ;
- menuisier ;
- maçon ;
- paysagiste ;
- etc.

**Précision de périmètre** : ce pilier Sites correspond exactement au projet dans ce
repository (GitHub, Lovable et Supabase propres à ce projet). Voir section 11 pour la
séparation avec le pilier CRM.

---

# 6. SUPORDO Sites — modèle commercial

Une caractéristique importante du modèle commercial est :

# construire avant de vendre

L'objectif n'est pas nécessairement de contacter un artisan en lui disant :

> « Voulez-vous que je vous crée un site ? »

L'approche peut être :

1. identifier une entreprise intéressante ;
2. récupérer/préparer les informations publiques pertinentes ;
3. générer une première version qualitative de son futur site ;
4. effectuer une vérification / personnalisation humaine ;
5. présenter concrètement le résultat au prospect ;
6. transformer ce prototype en véritable site client s'il accepte.

Formulation commerciale :

> « J'ai préparé ce que pourrait être votre nouveau site. »

Doctrine :

> **L'automatisation prépare la vente ; l'humain transforme le prototype en vrai site.**

Le prospect ne doit PAS être recréé dans un système complètement différent lorsqu'il devient client.

Direction stratégique :

> **prospect → client = continuité du même actif / tenant lorsque l'architecture le permet.**

---

# 7. SUPORDO Sites — philosophie produit

Le produit ne doit pas devenir un WordPress simplifié ou un CMS généraliste.

Doctrine :

# SUPORDO n'est pas un CMS.

L'artisan doit pouvoir gérer les informations qui relèvent réellement de son entreprise :

- coordonnées ;
- téléphone ;
- horaires ;
- services ;
- zones d'intervention ;
- photos ;
- réalisations ;
- certifications ;
- marques ;
- partenaires ;
- équipe ;
- contenus métier pertinents ;
- paramètres commerciaux utiles.

Il ne doit pas avoir à devenir expert en :

- SEO technique ;
- slugs ;
- schema.org ;
- ordre technique des routes ;
- données structurées ;
- canonical ;
- sitemap ;
- optimisation des images ;
- architecture web ;
- composants ;
- CSS.

Le produit doit absorber cette complexité.

---

# 8. SUPORDO Sites — état réel

L'état réel du socle fonctionnel (ce qui est construit, ce qui est absent ou partiel)
n'est plus décrit ici — cette description datait et vieillissait à chaque évolution du
code.

Source unique : `docs/audit/etat-reel.md`.

Même ce fichier ne dispense pas de vérifier le runtime : il doit être régénéré à
chaque audit, jamais supposé à jour par défaut.

---

# 10. Doctrine média et authenticité

SUPORDO doit distinguer clairement :

## illustration

Image générique permettant de présenter proprement un métier ou un service.

## réalisation réelle

Photo provenant réellement du travail de l'entreprise.

Une illustration ne doit jamais être transformée en fausse preuve sociale.

Doctrine :

> **Une donnée générée permet de démarrer ; une donnée authentique doit progressivement la remplacer.**

Interdiction produit / marketing :

- inventer des chantiers ;
- inventer des réalisations ;
- inventer des témoignages ;
- présenter une image générique comme une réalisation client réelle.

Le système peut aider à démarrer.

Il ne doit jamais fabriquer de fausse confiance.

---

# 11. PILIER B — SUPORDO CRM / MINI-ERP

Le second pilier est un logiciel métier de gestion destiné aux entreprises de terrain.

Le terme le plus juste à ce stade est :

# CRM métier + mini-ERP opérationnel

Il ne faut pas présenter SUPORDO comme un ERP comptable complet.

La plateforme doit gérer le **cycle opérationnel** de l'entreprise et pouvoir échanger
avec les outils spécialisés qui restent nécessaires.

**Séparation technique explicite** : ce pilier CRM/mini-ERP vit dans un projet
**totalement distinct** de celui de ce repository — GitHub séparé, Lovable séparé,
Supabase séparé, architecture séparée. SUPORDO peut devenir la marque commune aux
deux piliers, et certaines données ou expériences pourront un jour être partagées
(voir section 24), **sans que cela n'autorise jamais une fusion technique des deux
projets**. Ce document ne doit jamais être lu comme une instruction de fusionner les
bases de code ou les bases de données.

---

# 12. Rôle du CRM / mini-ERP

Le logiciel doit progressivement centraliser :

- prospects ;
- clients ;
- contacts ;
- projets ;
- opportunités ;
- qualification ;
- devis ;
- planning ;
- visites ;
- interventions ;
- chantiers ;
- équipes ;
- documents ;
- photos ;
- commandes fournisseurs ;
- catalogue ;
- facturation ;
- paiements / état d'encaissement ;
- maintenance ;
- parc installé ;
- SAV ;
- relances ;
- historique client ;
- indicateurs de pilotage.

L'objectif n'est pas de reproduire SAP pour un artisan.

L'objectif est :

> **le minimum d'ERP nécessaire pour faire fonctionner correctement une entreprise de terrain.**

---

# 13. Pipeline métier

Le pipeline commercial/opérationnel de référence actuellement envisagé est :

LEADS
→
À QUALIFIER
→
DEVIS
→
VISITE
→
CHANTIERS
→
FACTURÉ

Ce pipeline doit rester compréhensible pour un artisan.

Le logiciel ne doit pas imposer le vocabulaire d'un CRM de grand groupe.

---

# 14. Particularité du cycle de vente

Le produit doit tenir compte d'un comportement métier réel :

un devis estimatif peut être réalisé très tôt.

Exemple :

1. appel téléphonique ;
2. passage showroom ;
3. qualification rapide ;
4. devis estimatif ;
5. visite technique ;
6. vérification de faisabilité ;
7. devis final.

Le devis estimatif et le devis final ne doivent donc pas être confondus.

Direction métier :

PROSPECT
→ QUALIFICATION RAPIDE
→ DEVIS ESTIMATIF
→ VISITE TECHNIQUE
→ VALIDATION TECHNIQUE
→ DEVIS FINAL

Pour certains métiers techniques, la validation peut un jour intégrer des règles normatives
ou calculs spécifiques.

---

# 15. Métiers techniques initiaux

Le CRM a historiquement été pensé très profondément pour certains métiers du chauffage
et de la fumisterie :

- poêles ;
- cheminées ;
- fumisterie ;
- ramonage ;
- chaudières ;
- chauffage bois ;
- granulés.

Avec extension possible vers :

- PAC ;
- climatisation ;
- plomberie ;
- électricité ;
- autres métiers techniques.

Cette origine explique la présence de concepts métier avancés dans certains pans du
produit (projet CRM distinct — voir section 11) :

- visite technique ;
- appareils ;
- fumisterie ;
- catalogue fournisseur ;
- DTU ;
- calculs ;
- installation ;
- numéro de série ;
- maintenance ;
- ramonage ;
- entretien.

Mais SUPORDO ne doit pas être enfermé commercialement dans la fumisterie.

---

# 16. Devis

Le devis constitue un objet central du CRM.

La trajectoire produit distingue notamment :

## devis estimatif / QuickQuote

Objectif :

produire rapidement une première proposition.

## devis final

Produit après validation technique lorsque le métier l'exige.

Le système doit pouvoir conserver une logique de snapshot :

les informations commerciales utilisées dans un devis doivent rester historiquement cohérentes,
même si le catalogue évolue ensuite.

---

# 17. Catalogue et fournisseurs

Une partie importante du projet concerne les catalogues fournisseurs.

Le besoin dépasse l'affichage d'une liste de produits.

Le catalogue doit progressivement permettre :

- recherche produit ;
- sélection dans le devis ;
- prix ;
- coût d'achat ;
- remises fournisseur ;
- marge ;
- TVA ;
- références ;
- informations techniques ;
- préparation de commande fournisseur ;
- historique du devis.

Doctrine importante :

> **vérité technique ≠ vérité commerciale ≠ vérité d'achat.**

Un même produit peut être disponible auprès de plusieurs distributeurs.

Le catalogue doit donc éviter de confondre :

- fabricant ;
- marque ;
- fournisseur ;
- distributeur ;
- prix public ;
- prix d'achat ;
- conditions propres au tenant.

---

# 18. Achats fournisseurs

La trajectoire mini-ERP prévoit :

DEVIS ACCEPTÉ
→
BESOINS MATÉRIELS
→
COMMANDES FOURNISSEURS
→
RÉCEPTION
→
CHANTIER

À terme, SUPORDO doit réduire les doubles saisies entre :

- devis ;
- catalogue ;
- achats ;
- chantier.

Ce domaine ne doit pas être déclaré complet sans vérification du runtime.

---

# 19. Planning et terrain

SUPORDO doit fonctionner à la fois :

## au bureau

- commercial ;
- assistante ;
- dirigeant ;
- administratif.

## sur le terrain

- artisan solo ;
- technicien ;
- poseur ;
- ramoneur ;
- chef d'équipe.

Le produit doit donc privilégier :

- mobile ;
- lisibilité ;
- rapidité ;
- actions fréquentes courtes ;
- continuité bureau/terrain ;
- fonctionnement robuste lorsque les conditions ne sont pas parfaites.

Une trajectoire offline/PWA existe côté CRM mais son état exact doit être vérifié avant
toute affirmation.

---

# 20. Maintenance et récurrence

SUPORDO ne s'arrête pas à la facture.

Pour les métiers concernés, le système doit pouvoir gérer le parc installé :

INSTALLATION
→
ÉQUIPEMENT
→
NUMÉRO DE SÉRIE
→
DATE D'INSTALLATION
→
PROCHAINE ÉCHÉANCE
→
RELANCE
→
RDV
→
INTERVENTION
→
ATTESTATION
→
NOUVELLE ÉCHÉANCE

Cela permet notamment :

- entretien ;
- ramonage ;
- maintenance ;
- SAV ;
- récurrence commerciale.

C'est une dimension importante de la valeur long terme du CRM.

---

# 21. Comptabilité et logiciels de gestion

Point stratégique important :

# SUPORDO n'a pas vocation, à court terme, à remplacer le logiciel du comptable.

Le mini-ERP doit produire une donnée propre et exploitable.

La trajectoire recherchée est :

SUPORDO
→
EXPORT / API / CONNECTEUR
→
LOGICIEL DE GESTION / COMPTABILITÉ
→
CABINET COMPTABLE

Selon les besoins futurs, cela pourra concerner :

- factures ;
- avoirs ;
- clients ;
- règlements ;
- TVA ;
- journaux ;
- pièces ;
- exports comptables ;
- formats réglementaires ;
- Factur-X ;
- API de logiciels de gestion.

La stratégie est donc :

> **gérer l'opérationnel dans SUPORDO et transmettre proprement la donnée aux systèmes comptables spécialisés.**

Ne pas créer une comptabilité générale complète sans décision produit explicite.

---

# 22. Facturation électronique

La trajectoire française doit tenir compte de :

- Factur-X ;
- facturation électronique ;
- obligations réglementaires applicables aux entreprises françaises.

SUPORDO doit être conçu de manière à ne pas créer une impasse future sur ces sujets.

Cela ne signifie pas que toute la conformité ou toute l'intégration est déjà construite.

Toujours distinguer architecture anticipée et fonctionnalité opérationnelle.

---

# 23. Relation entre Sites et CRM

C'est l'un des éléments les plus importants pour comprendre la stratégie SUPORDO.

Aujourd'hui, les deux produits ont des histoires techniques distinctes — deux projets
séparés (voir section 11), pas deux modules d'un même repository.

À terme, ils doivent pouvoir devenir complémentaires **au niveau de la marque et de
l'expérience**, sans que cela ne présuppose une architecture technique commune.

Exemple cible :

SITE SUPORDO
↓
VISITEUR
↓
FORMULAIRE / APPEL / RDV
↓
LEAD
↓
SUPORDO CRM
↓
QUALIFICATION
↓
DEVIS
↓
CLIENT
↓
INTERVENTION / CHANTIER
↓
FACTURATION
↓
MAINTENANCE

Le site n'est donc potentiellement pas seulement une vitrine.

Il peut devenir progressivement :

# la porte d'entrée commerciale du CRM.

---

# 24. Principe de connexion future

La connexion entre Sites et CRM doit être pensée comme une trajectoire.

Ne pas fusionner brutalement les architectures.

Ne pas inventer maintenant une architecture d'intégration non demandée.

Mais conserver le principe suivant :

> **une demande créée depuis un site SUPORDO doit pouvoir devenir un lead SUPORDO sans ressaisie inutile.**

À terme, certaines données pourraient être partagées ou synchronisées — par une
intégration explicite entre les deux projets distincts, jamais par une fusion de
leurs bases :

- identité entreprise ;
- coordonnées ;
- services ;
- demandes ;
- clients ;
- rendez-vous ;
- avis ;
- réalisations ;
- données commerciales pertinentes.

La source de vérité de chaque domaine devra être définie explicitement avant intégration.

---

# 25. Boucle produit potentielle

La combinaison Sites + CRM crée une boucle stratégique intéressante :

SUPORDO aide l'entreprise à être visible
↓
elle reçoit davantage de demandes
↓
SUPORDO aide à transformer ces demandes
↓
SUPORDO aide à réaliser le travail
↓
le travail produit des photos / réalisations / avis
↓
ces preuves améliorent le site
↓
le site génère de nouvelles demandes

Cette boucle peut devenir un avantage structurel de la plateforme.

Elle ne doit cependant jamais conduire à publier automatiquement une donnée privée ou une
photo client sans règles explicites.

---

# 26. Intelligence artificielle

L'IA est une couche du produit.

Elle n'est PAS la marque.

Elle ne doit pas devenir une justification pour ajouter des fonctionnalités gadgets.

Principe :

> **l'IA doit supprimer du travail, pas ajouter une nouvelle interface à gérer.**

Usages potentiels :

- génération structurée de contenu ;
- préparation de sites prospects ;
- assistance à la qualification ;
- aide au devis ;
- extraction d'informations ;
- classification ;
- résumé ;
- automatisation documentaire ;
- assistance vocale future ;
- amélioration des contenus web ;
- aide à la préparation administrative.

Toute fonctionnalité IA doit être évaluée sur un critère :

> combien de minutes, de saisies ou d'erreurs évite-t-elle réellement ?

---

# 27. Données générées vs données authentiques

Doctrine transverse Sites + CRM :

> **une donnée générée permet de commencer ;
> une donnée authentique doit progressivement devenir la vérité.**

Exemples :

- texte initial généré → corrigé avec les informations réelles ;
- illustration métier → remplacée par vraie réalisation ;
- coordonnées publiques → validées par l'entreprise ;
- service supposé → confirmé ;
- contenu SEO généré → enrichi par réalité terrain.

L'automatisation ne doit jamais devenir une usine à fabriquer de faux faits.

---

# 28. SEO local

Le SEO local constitue une composante importante de SUPORDO Sites.

Sur le plan doctrinal, il repose conceptuellement sur des mécanismes tels que :

- metadata ;
- données structurées / schema.org ;
- sitemap ;
- pages locales ;
- services ;
- zones d'intervention.

L'état réellement implémenté de ces mécanismes n'est pas décrit ici — voir
`docs/audit/etat-reel.md`, à vérifier dans le runtime avant toute affirmation.

Mais doctrine importante :

# ne pas créer une ferme de pages service × ville.

Toutes les combinaisons possibles ne doivent pas automatiquement devenir indexables.

La stratégie doit privilégier :

- utilité ;
- contenu suffisamment différencié ;
- réalité de la zone desservie ;
- pertinence locale ;
- qualité ;
- absence de doorway pages.

Le document :

`docs/product/seo-local-architecture.md`

peut exister localement/non tracké selon l'état du repo.

Ne pas supposer son statut Git.

---

# 29. Architecture Sites connue

Stack principale du projet Sites :

- TanStack Start ;
- React ;
- TypeScript ;
- shadcn/ui ;
- Tailwind ;
- Supabase ;
- RLS ;
- Cloudflare Workers / SSR ;
- Lovable ;
- Claude / Claude Code dans le workflow de développement.

Architecture :

- multi-tenant ;
- résolution par hostname en production ;
- mécanismes de preview tenant ;
- contenu data-driven ;
- SSR obligatoire.

Contrainte importante :

# éviter les tables Supabase supplémentaires sans justification forte.

---

# 30. Architecture CRM connue

Le CRM repose historiquement sur :

- React ;
- TypeScript ;
- shadcn ;
- Tailwind ;
- Supabase/PostgreSQL ;
- RLS multi-tenant ;
- Storage ;
- Edge Functions ;
- composants offline/PWA selon les domaines déjà construits ;
- intégrations futures / existantes selon vérification runtime.

Rappel (section 11) : cette stack tourne sur un Supabase et un Lovable **distincts**
de ceux du projet Sites, même si les deux stacks se ressemblent techniquement.

Claude doit considérer le repo et Supabase du projet sur lequel il travaille comme
sources de vérité techniques, pas les anciennes spécifications, et ne jamais
supposer un accès à l'autre projet depuis celui-ci.

---

# 31. Multi-tenant et sécurité

Une règle fondamentale :

> **une restriction dans l'interface n'est pas une règle de sécurité.**

Si un tenant ne doit pas pouvoir modifier quelque chose :

- vérifier serveur ;
- vérifier RLS ;
- vérifier RPC ;
- vérifier contraintes DB ;
- vérifier ownership.

Masquer un champ dans React n'est pas suffisant.

Même doctrine pour les relations :

un `service_id`, `portfolio_id`, `tenant_id`, etc. doit respecter les frontières tenant
au niveau réellement autoritaire.

---

# 32. Principes UX

SUPORDO est destiné à des utilisateurs qui n'ont pas envie d'apprendre un logiciel complexe.

L'UX doit donc suivre quelques règles fortes :

## 1. Le métier avant le logiciel

Employer :

- client ;
- devis ;
- chantier ;
- intervention ;
- facture ;
- planning.

Éviter lorsque cela n'apporte rien :

- entity ;
- workflow ;
- pipeline automation ;
- object ;
- orchestration.

## 2. Le fréquent doit être évident

Une fonction utilisée dix fois par jour doit être accessible plus facilement qu'un réglage
utilisé deux fois par an.

## 3. Mobile réellement utilisable

Le terrain n'est pas une version miniature du desktop.

## 4. Progressive disclosure

Ne pas afficher toute la puissance du système à un artisan solo qui n'en a pas besoin.

## 5. Un seul endroit évident pour chaque action importante

Éviter les interfaces où l'utilisateur doit comprendre l'architecture interne du produit.

---

# 33. Utilisateurs de référence

Le produit doit fonctionner pour plusieurs niveaux de maturité.

## Artisan solo

Exemple :

- téléphone Android ;
- Gmail ;
- peu de temps administratif ;
- devis le soir ;
- planning simple ;
- besoin de rapidité.

## Petite entreprise

Exemple :

- commercial ;
- assistante ;
- poseurs / techniciens ;
- plusieurs agendas ;
- commandes ;
- suivi des devis ;
- besoin de coordination.

## PME structurée

Jusqu'à plusieurs dizaines de salariés :

- rôles ;
- équipes ;
- responsabilités ;
- planning ;
- achats ;
- suivi commercial ;
- pilotage ;
- maintenance.

SUPORDO doit commencer simplement sans devenir inutilisable lorsque l'entreprise grandit.

---

# 34. Ce que SUPORDO ne doit PAS devenir

SUPORDO ne doit pas devenir :

### un CMS généraliste

L'artisan ne doit pas construire lui-même son architecture web.

### un logiciel comptable complet

Les experts comptables et logiciels spécialisés doivent pouvoir recevoir les données.

### un ERP de grand groupe miniaturisé

La complexité n'est pas une preuve de puissance.

### une collection de fonctionnalités IA

L'IA est un moyen.

### un logiciel uniquement BTP

Le bâtiment est un marché initial très important, mais l'architecture de marque doit pouvoir
couvrir d'autres entreprises de terrain.

### une marketplace type ManoMano

SUPORDO équipe l'entreprise.

La vocation n'est pas de devenir une marketplace de bricolage ou de travaux.

---

# 35. Positionnement commercial

SUPORDO ne doit pas être vendu avec :

> « transformation digitale »

ou :

> « ERP intelligent omnicanal alimenté par IA ».

Le discours doit partir des problèmes réels :

- devis faits le soir ;
- clients oubliés ;
- appels non suivis ;
- planning éclaté ;
- informations dans WhatsApp ;
- photos introuvables ;
- commandes ressaisies ;
- factures en retard ;
- relances oubliées ;
- site internet vieillissant ;
- manque de visibilité locale.

Puis montrer ce qui change.

---

# 36. Proposition de valeur globale

Une formulation possible :

> **SUPORDO aide les artisans et les entreprises de terrain à être trouvés,
> gagner leurs clients et mieux faire tourner leur entreprise.**

Trois verbes structurants :

# ÊTRE VISIBLE

Site web, SEO local, image professionnelle.

# GAGNER

Demandes, prospects, qualification, devis, suivi commercial.

# PILOTER

Planning, interventions, chantiers, achats, facturation, maintenance.

---

# 37. Architecture de marque potentielle

La marque ombrelle est :

# SUPORDO

Les appellations suivantes sont des pistes fonctionnelles :

## SUPORDO Sites

Présence digitale et acquisition.

## SUPORDO CRM

Relation client et activité commerciale/opérationnelle.

## SUPORDO Business

Nom potentiel pour un périmètre plus large si le produit dépasse progressivement le CRM.

Ne pas multiplier prématurément les sous-marques.

Principe :

> **une marque forte avant une collection de produits.**

---

# 38. Ton de marque

SUPORDO doit être :

- solide ;
- direct ;
- humain ;
- professionnel ;
- concret ;
- européen ;
- moderne sans être startup caricaturale.

SUPORDO ne doit pas parler comme si les artisans étaient en retard technologiquement.

Le professionnel connaît son métier.

Le rôle de SUPORDO est de lui fournir de meilleurs outils.

---

# 39. Principe stratégique

SUPORDO ne doit pas chercher à impressionner par le nombre de fonctions.

Le véritable produit est la continuité :

SITE
→
LEAD
→
CLIENT
→
DEVIS
→
CHANTIER
→
FACTURE
→
MAINTENANCE

avec le moins possible :

- de ressaisies ;
- de ruptures ;
- de fichiers ;
- de logiciels ;
- d'informations perdues.

---

# 40. Doctrine de développement

Pour toute future mission concernant SUPORDO :

## Avant de proposer une modification

1. lire le code concerné ;
2. vérifier l'état réel ;
3. identifier la source de vérité ;
4. distinguer bug, dette, manque réel et idée future ;
5. vérifier si une solution existe déjà ;
6. privilégier la modification minimale.

## Interdictions par défaut

Ne pas :

- créer une nouvelle architecture pour anticiper hypothétiquement le futur ;
- ajouter une table sans nécessité démontrée ;
- dupliquer une source de vérité ;
- créer un deuxième système média ;
- construire un module simplement parce qu'il figure dans une vision ;
- modifier des contrats runtime sans analyse d'impact ;
- confondre UI protection et sécurité ;
- transformer un audit en chantier d'implémentation.

---

# 41. Doctrine de preuve pour Claude

Dans les audits, utiliser :

## `[RÉEL]`

Observé directement dans :

- code ;
- base ;
- migration ;
- configuration ;
- runtime ;
- test reproductible.

## `[PARTIEL]`

Une partie existe mais la promesse complète n'est pas démontrée.

## `[ABSENT]`

Aucune implémentation correspondante trouvée après recherche raisonnable.

## `[DÉCIDÉ]`

Décision produit explicitement actée mais pas nécessairement implémentée.

## `[CIBLE]`

Direction souhaitée à terme.

## `[EXPLORATOIRE]`

Hypothèse ou piste non actée.

Ne jamais transformer :

`[CIBLE]`

en :

`[RÉEL]`.

## Format de livrable d'audit obligatoire

Tout audit produit un tableau selon ce format :

| Élément | Statut | Preuve (fichier / DB / runtime) | Dette / conséquence |
|---|---|---|---|

Règles :

- la colonne Preuve doit contenir un chemin de fichier, un nom de table/migration,
  ou une observation runtime reproductible ;
- une ligne sans preuve vérifiable ne peut pas porter le statut `[RÉEL]` ;
- interdiction d'écrire « SUPORDO permet X » si la seule source est le présent
  document de contexte ;
- en cas de contradiction entre ce document et le code, le runtime prévaut et
  l'écart doit être signalé explicitement.

---

# 42. Priorité actuelle

Le projet ne doit pas être transformé en immense roadmap parce que cette vision est large.

La priorité reste :

# rendre excellentes quelques boucles essentielles avant d'élargir.

Principe de Pareto :

> **mieux vaut une boucle prospect → devis → chantier réellement excellente
> que quinze modules à moitié terminés.**

Même principe pour Sites :

> **mieux vaut générer rapidement un site réellement vendable et crédible
> que construire prématurément une plateforme CMS universelle.**

---

# 43. Vision de convergence

La convergence Sites + CRM doit se faire progressivement.

### Étape conceptuelle 1

SUPORDO aide l'entreprise à exister professionnellement en ligne.

### Étape conceptuelle 2

SUPORDO transforme les demandes reçues en prospects structurés.

### Étape conceptuelle 3

SUPORDO aide à convertir ces prospects en clients.

### Étape conceptuelle 4

SUPORDO accompagne l'exécution du travail.

### Étape conceptuelle 5

SUPORDO accompagne facturation, maintenance et fidélisation.

La valeur ne vient donc pas simplement du nombre de modules.

Elle vient de la continuité de la donnée.

---

# 44. North Star

La question qui doit guider les décisions produit n'est pas :

> « Que pourrait encore faire SUPORDO ? »

Mais :

> **« Quelle prochaine friction importante pouvons-nous supprimer dans la journée réelle de l'entreprise ? »**

Et avant toute nouvelle fonctionnalité :

1. le problème existe-t-il réellement ?
2. est-il fréquent ?
3. coûte-t-il du temps, de l'argent ou des opportunités ?
4. SUPORDO possède-t-il déjà une partie de la solution ?
5. peut-on résoudre 80 % du problème avec 20 % de complexité ?
6. cela renforce-t-il la continuité Sites → CRM → opérations ?
7. est-ce suffisamment important pour mériter de la dette supplémentaire ?

---

# 45. Résumé en une phrase

# SUPORDO est une plateforme destinée aux artisans et entreprises de terrain qui combine progressivement présence web, acquisition client, CRM métier et mini-ERP opérationnel, tout en restant capable d'échanger avec les logiciels spécialisés — notamment comptables — plutôt que de chercher à tout remplacer.

---

# 46. Ce que Claude doit retenir

1. **SUPORDO est le nom de marque retenu.** LIGNIA et OBRALTO sont deux directions
   antérieures, abandonnées, dont les traces peuvent subsister dans le code et la
   documentation sans qu'il faille les effacer rétroactivement.
2. Ne pas effectuer un renaming technique automatique.
3. Le projet comprend un **générateur/gestionnaire de sites web multi-tenant**.
4. Il existe séparément un **CRM métier / mini-ERP**, dans un projet technique
   distinct (GitHub, Lovable, Supabase propres).
5. Ces deux univers doivent progressivement converger **en marque et en expérience**,
   jamais automatiquement en architecture technique.
6. Le site peut devenir la porte d'entrée commerciale du CRM.
7. Le CRM couvre progressivement prospect → devis → terrain → facturation → maintenance.
8. SUPORDO doit pouvoir exporter/connecter ses données aux logiciels de gestion et de comptabilité.
9. SUPORDO n'a pas vocation à reconstruire immédiatement une comptabilité générale.
10. Le bâtiment est le marché initial majeur, mais la marque vise plus largement les entreprises de terrain.
11. L'IA est une couche d'automatisation, pas la promesse centrale.
12. Le produit doit rester simple pour l'artisan solo et capable d'accompagner une PME.
13. Les données authentiques doivent progressivement remplacer les données générées.
14. Toute affirmation sur l'état du produit doit être vérifiée dans le code/runtime.
15. Une vision produit n'est jamais une autorisation d'implémentation.
16. Avant toute modification : **preuve → diagnostic → proposition minimale → validation → exécution.**
17. SUPORDO n'a pas d'étymologie officielle — ne jamais en inventer une (voir section 3).

---

# FIN DU CONTEXTE MAÎTRE
