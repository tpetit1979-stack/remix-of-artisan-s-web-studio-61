# Plan directeur du site commercial SUPORDO — version canonique

Source de vérité unique avant les prompts d'exécution. Aucun fichier du produit n'a été modifié.

**Où conserver ce document** : chemin recommandé `docs/product/plan-directeur-supordo-com.md`, à créer lors du Lot 1. Ce plan n'existe aujourd'hui que dans `.lovable/plan.md`.

**Statuts** — `[FAIT]` vérifié dans le dépôt · `[RETENU]` décidé, à ne pas rouvrir · `[À FIGER]` recommandation issue de l'analyse, à valider une fois puis à traiter comme règle · `[OUVERT]` décision humaine requise · `[REPOUSSÉ]` volontairement différé.

---

## 1. Faits vérifiés dans le dépôt

### Routes

| URL | Rôle | Hôte |
|---|---|---|
| `/` | Double : landing SUPORDO sur l'hôte plateforme, site artisan sinon | les deux |
| `/services`, `/services/:slug`, `/:slug`, `/realisations`, `/contact`, `/mentions-legales` | Pages du site d'un artisan | artisan uniquement |
| `/robots.txt`, `/sitemap.xml`, `/llms.txt` | Référencement par artisan | artisan |
| `/login`, `/forgot-password`, `/update-password`, `/accept-invite` | Accès à l'espace | plateforme |
| `/admin/*` (9 écrans) · `/super-admin/*` (7 écrans) | Espace client · console SUPORDO | session |

### Composants marketing

`SupordoLanding` assemble `SupordoHeader` → `SupordoHero` → `SupordoTrades`. Rien d'autre. Aucun pied de page.

### Séparation des trois couches — conforme

Les tokens `--supordo-*` et Manrope sont portés par la seule classe `.supordo-brand`, appliquée uniquement aux composants marketing. Aucun site artisan, aucune page `/admin` ou `/super-admin` ne porte cette classe. Non-contamination garantie techniquement. **Rien à modifier.**

### Contextes de routage

Sur supordo.com, **seule l'adresse `/` est réservée à SUPORDO aujourd'hui**. Les noms `/contact`, `/services`, `/realisations`, `/mentions-legales` appartiennent déjà au vocabulaire des sites artisans et renvoient une erreur sur supordo.com faute d'artisan à résoudre. Architecture conservée telle quelle.

Trois contextes distincts coexistent :

- **Hôte marketing SUPORDO** : la landing, `/demarrer`, `/legal/...`, les futures pages marketing.
- **Hôte site artisan** : `/`, `/services`, `/services/:slug`, `/realisations`, `/contact`, `/mentions-legales`, etc.
- **Plateforme et authentification** : `/login`, `/forgot-password`, `/update-password`, `/accept-invite`.
- **Espace authentifié** : `/admin/*`, `/super-admin/*`. La session est une condition d'accès, pas un hôte.

**Règle non négociable** : toute nouvelle adresse marketing doit être résolue sans modifier le comportement de secours ni celui des adresses des sites artisans.

### Capacités réelles du produit

| Capacité | Statut | Promesse autorisée |
|---|---|---|
| Services : nom, description, photo, marques associées, ordre géré automatiquement | PROUVÉ — le client édite ; les champs techniques (adresse de page, modèles de référencement) sont réservés à SUPORDO | oui — **objet retenu pour l'Acte 3** |
| Zones d'intervention | PROUVÉ | oui |
| Réalisations : photo, titre, ville, service, publication au cas par cas | PROUVÉ | oui — objet de l'Acte 4 |
| Équipe, marques, logos partenaires | PROUVÉ | oui |
| Demandes reçues via le formulaire du site artisan | PROUVÉ — insertion dans `contacts`, consultable dans `/admin/contacts`, notification e-mail tentée si l'adresse du tenant est configurée (question 11 fermée, voir §18) | ne jamais promettre une notification garantie, ni un suivi humain par SUPORDO |
| Connexion et redirection selon le rôle | PROUVÉ | oui |
| Informations d'entreprise | PARTIEL : téléphone, email, texte d'accueil, couleurs, référencement. Pas d'adresse ni de mentions administratives | formuler prudemment |
| Logo de l'entreprise | NON DISPONIBLE côté client, géré par SUPORDO | ne pas promettre |
| Certifications et qualifications | Capacité technique existante, **mais saisie exclusivement par SUPORDO** | promesse suspendue jusqu'à la question 6 |
| Aperçu ou brouillon avant mise en ligne | PARTIEL : un lien ouvre le site réel ; publication au cas par cas pour les réalisations seulement | ne jamais promettre un aperçu |
| Espace client sur téléphone | PARTIEL : menu adapté, formulaires longs non vérifiés | vérification obligatoire avant le Lot 3 (question 8) |

### Anomalies constatées, non corrigées

1. Le menu affiche quatre entrées sans destination, dont un produit inexistant.
2. Boutons du Hero. **Action principale** : doit devenir « Demander mon site » → `/demarrer` au Lot 1. **Action secondaire « Voir un exemple »** : masquée tant qu'aucune destination réelle ni démonstration explicitement assumée n'existe.
3. Aucun pied de page, donc aucune mention légale accessible.
4. `supordo.com/sitemap.xml` renvoie un plan de site vide.
5. `supordo.com/llms.txt` renvoie une erreur — **anomalie technique secondaire, aucune priorité marketing** : traitée en fin de Lot 5 ou en maintenance, après les sujets de référencement qui comptent (adresse canonique, plan de site, métadonnées, aperçus sociaux, liens internes, bon fonctionnement des pages).
6. Le contraste de la palette n'a jamais été vérifié formellement.
7. Un guide média porte encore l'ancien nom du projet.

---

## 2. Décisions retenues, à ne pas rouvrir `[RETENU]`

**Marque et produit** : SUPORDO est la marque mère · SUPORDO Sites est le seul produit commercialisé · le futur second produit n'apparaît ni dans la navigation, ni dans le récit, ni dans le pied de page.

**Adresses** : `/` vend SUPORDO Sites · pas de `/sites` · pas de `/crm` · pas d'entrée « Ressources » · `/demarrer` est le parcours commercial unique · `/contact` n'est pas utilisée côté SUPORDO · `/exemples` seulement avec de vrais sites et les accords écrits · `/tarifs` autonome seulement si la complexité de l'offre le justifie · pages métier plus tard, une page pilote d'abord.

**Récit** : logique Marque → Produit → Résultat — je reconnais mon métier (Acte 2), je vois ce que SUPORDO organise (Acte 3), je vois ce que mon client final verra (Acte 4) · Hero puis Métiers conservés, non redessinés · Acte 3 avant Acte 4 · **l'Acte 3 et l'Acte 4 portent sur la même entreprise de démonstration et le même univers métier, mais sur deux objets différents** · le site public reste visuellement dominant · l'Acte 4 est une démonstration, pas la définition du produit · réassurance et action finale fusionnées · la page ne vend pas d'abord un abonnement logiciel : résultat visible (Actes 3-4), puis fonctionnement crédible (Acte 5), puis prise en charge claire (Acte 5), puis abonnement compréhensible (Acte 6) — l'ordre des actes l'incarne déjà, ce principe le rend explicite.

**Intégrité** : aucune preuve, statistique, interface, réalisation ni témoignage inventé · aucune grille artificielle de forfaits ou de fonctionnalités.

**Fondations visuelles** : Manrope · Brand Green `#00875A`, Forest `#10291C`, Forest Dark `#07140D`, Warm `#FAF8F4`, Mint clair `#EAF4EE`, Mint bordure `#CFE8D8`, Graphite `#3A403B` · tokens scopés · rayons faibles · aucun gradient, effet de verre, blob, écran incliné, ombre décorative · « SUPORDO ne décore pas le réel. Il l'organise. »

---

## 3. Sitemap cible

```
supordo.com
├── /                            LOT 1-4  page commerciale unique, livrée acte par acte
├── /demarrer                    LOT 1    parcours de prise de contact
├── /demarrer/confirmation       LOT 1    accusé de réception, non indexée
├── /legal/mentions-legales      LOT 1    légal plateforme
├── /legal/confidentialite       LOT 1    légal plateforme
├── /exemples                    LOT 5    vrais sites clients, avec accord
├── /tarifs                      LOT 5    conditionnelle
├── /metiers/<metier>            REPOUSSÉ une page pilote, hors lots
└── /login                       existant, inchangé
```

**`/` — Lots 1 à 4 : livraison progressive par actes, validation après chaque lot. Aucun lot ne rend visible une section dont la preuve, le contenu ou la destination réelle n'est pas disponible.**

**Pages légales — préfixe retenu : `/legal/`** `[À FIGER]`. Aucune route artisan ni plateforme ne commence par `/legal`, alors que `/mentions-legales` est déjà la page légale des sites artisans ; le préfixe isole durablement tout le légal de la plateforme. **Le nom exact reste une convention technique proposée**, renommable au Lot 1 sans conséquence tant que le préfixe reste distinct du vocabulaire artisan.

**Cookies et traceurs** : la nécessité d'un mécanisme de consentement dépend uniquement de la présence effective de traceurs non essentiels — jamais d'un paiement. Un **inventaire des traceurs** est donc à faire avant le lancement : mesure d'audience, pixels publicitaires, outils marketing, contenus tiers intégrés, vidéos externes, messagerie en ligne, autres scripts tiers. Sans traceur soumis à consentement, aucun bandeau n'est créé par principe. Avec traceurs, le mécanisme adapté est prévu.

**Conditions générales de vente** `[REPOUSSÉ]` : sujet distinct, lié au mode réel de commercialisation et de contractualisation.

---

## 4. Page d'accueil, acte par acte

### Acte 1 — Hero `[FAIT]`

Question : « Qu'est-ce que c'est ? » · Message : un vrai site professionnel · Desktop : deux colonnes, image à droite, hauteur du premier écran · Mobile : texte puis image, **action principale en pleine largeur** · Manque : la photographie éditoriale.

**Doctrine V1 des actions du Hero** : une seule action visible, « Demander mon site » → `/demarrer`. L'action secondaire « Voir un exemple » est masquée tant qu'aucune destination réelle ni démonstration explicitement assumée n'existe — elle n'existe donc visuellement, y compris sur téléphone, que lorsqu'une vraie preuve est disponible. Correction éditoriale minimale intégrée au Lot 1, voir 1.6.

### Acte 2 — Métiers `[FAIT]`

Question : « Est-ce fait pour une entreprise comme la mienne ? » · Preuve : dix métiers reconnaissables · Desktop : 4 cartes et amorce de la 5ᵉ · Mobile : une carte dominante et ~22 % de la suivante · Aucune action, délibérément.

### Acte 3 — Ce que vos clients voient, ce que vous renseignez

Question : « Qu'est-ce que j'obtiens réellement, et qu'est-ce qui est différent ? »

Message : ce que vous renseignez est présenté proprement à vos clients.

**Objet retenu : un service, éventuellement accompagné de sa zone d'intervention — pas une réalisation photographique.** Le service est l'objet le plus adapté : le client le saisit réellement (nom, description, photo), et il alimente une présentation publique identifiable. Ce choix évite de dépenser la démonstration photo dès l'Acte 3 et prouve d'emblée que SUPORDO ne concerne pas seulement les photos.

Preuve : un même service — par exemple « Installation de poêle à bois » — d'un côté tel qu'il est renseigné dans l'espace, de l'autre tel qu'il est présenté sur le site public. Même libellé, même information, même entreprise de démonstration que l'Acte 4.

**Dépendance obligatoire avant production des captures** : vérifier dans le produit réel que le service choisi alimente effectivement une présentation publique identifiable — on doit retrouver côté public le même nom de service, le contenu correspondant, et une structure reconnaissable comme issue de ce service. Si cette correspondance n'existe pas réellement, **ne fabriquer aucune relation artificielle « fiche → page »** : réévaluer l'objet de l'Acte 3 à partir d'une autre capacité réellement branchée au site public.

Fonction de l'acte : expliquer la correspondance entre une donnée renseignée et sa présentation publique. Ton : produit, compréhension.

Desktop : composition asymétrique, le site public occupe environ deux tiers du poids visuel, la capture de l'espace un tiers, sur fond blanc. Aucune flèche, aucune numérotation, aucun cadre de navigateur : le lien est le contenu identique.

Mobile : **jamais deux interfaces côte à côte.** Résultat public d'abord, pleine largeur ; fiche renseignée ensuite, recadrée sur les seuls champs utiles.

Action : aucune, ou un lien discret vers l'acte suivant.

### Acte 4 — Démonstration signature, la réalisation

Question : « Est-ce vraiment simple dans mon quotidien ? »

Message : votre travail devient une preuve visible. La phrase de généralisation reste utile mais **peut désormais être discrète**, puisque l'Acte 3 a déjà démontré un autre type de contenu.

Preuve : chantier terminé → photo → fiche réalisation → résultat public. Même entreprise de démonstration que l'Acte 3, **objet différent**.

Desktop : trois états côte à côte, largeurs égales, légende factuelle sous chacun. Mobile : trois états empilés. **Aucune action visible dans l'Acte 4 en V1** ; une action pourra être ajoutée plus tard uniquement si elle possède une destination réelle et distincte.

Fonction de l'acte : raconter une situation de terrain et sa transformation en preuve commerciale. Ton : réel, chantier, résultat.

**Règle Acte 3 ≠ Acte 4** : les deux actes ne se distinguent pas seulement par l'objet montré, mais par leur fonction et leur composition. Ne pas réutiliser la même composition, le même rythme, le même type de titre ni la même mise en scène.

**Dépendance bloquante** : la représentation de l'étape « fiche réalisation » dépend de la vérification d'ergonomie mobile (question 8). Le scénario « chantier terminé » suggère naturellement une action sur le terrain, donc sur téléphone. Si l'expérience mobile n'est pas suffisamment exploitable, **aucune scène mobile fictive ne sera fabriquée** : la représentation sera honnêtement adaptée, par exemple en montrant l'étape sur ordinateur.

### Acte 5 — Qui fait quoi

Question : « Concrètement, qui fait quoi ? » · Message : SUPORDO s'occupe de la présentation du site, vous renseignez votre entreprise.

**Chaque formulation doit passer par ce tableau avant d'être écrite** ; aucun verbe large n'est autorisé tel quel.

| Formulation | Preuve technique | Limite à énoncer ou à vérifier |
|---|---|---|
| « SUPORDO prépare votre site à partir des informations de votre entreprise, avec l'aide de l'IA » | question 9 fermée (voir §18) — `super-admin.onboarding.tsx`, `generate-tenant`, domaine natif `{slug}.supordo.com` créé avec le tenant | ne jamais écrire « vérifié avant mise en ligne » comme procédure qualité distincte ; ne promettre aucun délai ; ne jamais laisser entendre une création ou un accès autonome de l'artisan — l'invitation de l'artisan est une étape séparée |
| Héberge le site | infrastructure gérée par SUPORDO | pas de promesse de disponibilité chiffrée sans engagement défini |
| Chiffre les échanges (à la place de « sécurise ») | certificat et connexion chiffrée | **ne jamais laisser entendre une garantie générale de cybersécurité** |
| Assure la maintenance technique | mises à jour du socle commun | **distinguer explicitement maintenance technique et modification de contenu** : la seconde appartient au client |
| Organise la présentation du site | mise en page produite par le produit | — |
| Fait évoluer le socle commun | améliorations communes à tous les sites | ne promettre aucune fonctionnalité future nommée |
| Saisit les qualifications professionnelles | capacité réelle côté SUPORDO | **retirée de l'Acte 5 tant que la question 6 n'est pas tranchée** |

Côté client, question 10 fermée (voir §18) : services, réalisations, partenaires et coordonnées ont un contrôle de visibilité ou un effet public réel et immédiat (`ServicesManager.tsx`, `PortfolioManager.tsx`, `PartnersManager.tsx`) ; les zones d'intervention sont publiques dès l'ajout, sans bascule (aucune colonne de publication sur `service_areas`) ; l'équipe reste gérée par le client mais son affichage général dépend d'un réglage réservé à SUPORDO (`site_settings.team_presentation_mode`) ; les marques peuvent être saisies mais **n'ont aujourd'hui aucun rendu public** — ne jamais les citer comme visibles sur le site. Ne jamais généraliser « vos photos remplacent automatiquement les illustrations » comme promesse transverse — c'est vrai service par service, pas une promesse globale.

Aucun visuel. Desktop : deux colonnes. Mobile : deux blocs empilés. Action : aucune.

### Acte 6 — Offre

Un seul bloc centré de 640 px maximum : prix, puis périmètre, puis conditions. **Aucune grille de forfaits.** Bloqué par les questions 1 et 2 (question 9 fermée, voir §18).

### Acte 7 — Réassurance et décision

| Question du visiteur | Statut |
|---|---|
| Dois-je créer moi-même mon site ? | RÉPONSE CONNUE : non |
| Dois-je savoir utiliser un logiciel ? | RÉPONSE CONNUE : non, saisie de champs simples |
| Puis-je modifier mes informations ? | RÉPONSE CONNUE : oui, celles listées à l'acte 5 |
| Le site fonctionne-t-il sur téléphone ? | RÉPONSE CONNUE : oui |
| Qui s'occupe de la maintenance ? | RÉPONSE CONNUE : SUPORDO, pour la maintenance technique |
| Que se passe-t-il si je ne publie jamais rien ? | RÉPONSE CONNUE, formulation factuelle imposée : « Le site reste en ligne avec les informations déjà renseignées. » Le mot « complet » est interdit. |
| Mes contenus apparaissent-ils tout de suite ? | RÉPONSE CONNUE, question 10 fermée : oui pour services, réalisations, partenaires, coordonnées et zones ; l'équipe dépend d'un réglage activé avec l'agence ; les marques n'ont aujourd'hui aucun rendu public |
| Combien de temps pour être en ligne ? | RÉPONSE CONNUE en partie, question 9 fermée sur le principe : le site est en ligne dès sa création par SUPORDO, sur une adresse SUPORDO ; aucun délai chiffré n'est mesuré, ne pas en promettre un |
| J'ai déjà un nom de domaine, que se passe-t-il ? | DÉCISION À PRENDRE, question 2 |
| Puis-je partir, et que deviennent mon domaine et mes contenus ? | DÉCISION À PRENDRE, question 2 |

Aucune réponse rédigée avant d'être tranchée. Desktop : colonne de 760 px. Mobile : accordéon, zones tactiles de 48 px. Action finale identique à celle du Hero.

### Acte 8 — Pied de page

Voir bloc 7.

---

## 5. Pages secondaires

**`/demarrer` — Lot 1.** Recueillir une demande qualifiée. Sections : titre court · formulaire (entreprise, métier, ville, téléphone, email, message) · ce qui se passe ensuite, en trois étapes factuelles · rappel de ce qui est pris en charge. Aucun visuel, ou une seule illustration métier. Action unique : envoyer. H1 : « Parlons de votre site. »

**Points à définir avant de construire le formulaire** (question 4 élargie) : destination des demandes · notification et destinataire · stockage éventuel · personnes ayant accès · durée de conservation en cas de stockage · message de succès · comportement en cas d'erreur · protection anti-spam · mention d'information sur les données personnelles. **Aucune table n'est créée automatiquement** : le choix entre email, base de données ou autre est tranché avant l'implémentation, et un stockage en base doit être justifié par un besoin réel.

**`/demarrer/confirmation` — Lot 1.** Accusé de réception, non indexée, sans action.

**`/legal/mentions-legales` et `/legal/confidentialite` — Lot 1.** Contenu fourni par SUPORDO, jamais inventé. **Ces pages sont publiques, facilement accessibles depuis le pied de page et correctement renseignées.** Le choix d'indexation relève d'une décision de référencement après rédaction et vérification du contenu : ni l'indexation ni son inverse ne constituent une obligation légale.

**`/exemples` — Lot 5.** Introduction courte · grille de sites réels (nom, métier, commune, lien) · action finale. **Condition bloquante : accord écrit de chaque artisan.** H1 : « Des sites déjà en ligne. »

**`/tarifs` — Lot 5, conditionnelle.** N'existe que si l'offre comporte plusieurs niveaux de lecture ou des conditions trop longues pour une section. Avec une offre unique, le prix reste dans l'acte 6.

**`/metiers/<metier>` — `[REPOUSSÉ]`, hors lots.** Justifiée seulement si : contenu propre au métier, exemple réel de ce métier, aucune phrase recopiée. Une page pilote, chauffagiste, mesurée avant toute extension.

---

## 6. En-tête

`[FAIT]` : collant, 64 px sur téléphone, 72 px sur desktop, fond Warm légèrement translucide, contour de focus visible.

`[À FIGER]` :

- Marque SUPORDO à gauche, lien vers l'accueil.
- Liens au centre, desktop uniquement : **Exemples · Tarifs**, chacun seulement quand sa page existe `[RETENU]`. « CRM » et « Ressources » supprimés `[RETENU]`.
- À droite sur desktop : bouton principal, puis lien « Se connecter » vers `/login`, visuellement plus discret.
- **Téléphone** : marque · bouton principal · **et un accès compact à « Se connecter », visible dans l'en-tête ou dans un menu minimal ouvert depuis l'en-tête**. Un client existant ne doit jamais avoir à parcourir toute la page pour atteindre sa connexion. Présentation discrète pour ne pas concurrencer le bouton prospect. Aucun grand menu déroulant.
- Au défilement : une bordure basse apparaît. Aucun rétrécissement, aucune ombre.
- Évolution future : une entrée « Produits » quand un second produit existera. Rien à préparer aujourd'hui.

### Libellé de l'action principale `[RETENU]`

**« Demander mon site » → `/demarrer`.** Identique partout en V1 : en-tête, Hero, offre, action finale. Décision fermée, plus aucune variante à l'étude.

Action secondaire : « Voir un exemple » **masquée** tant qu'aucune destination réelle et crédible n'existe. Jamais de `/exemples` vide, jamais de bouton inerte, jamais de faux client.

---

## 7. Pied de page `[À FIGER]`

Fond Forest, quatre groupes :

1. **Marque** : « SUPORDO développe des produits simples pour les entreprises de terrain. »
2. **Produit** : SUPORDO Sites, Exemples, Tarifs — selon existence.
3. **Légal** : mentions légales, confidentialité.
4. **Accès client** : Se connecter.

Aucune mention du futur produit `[RETENU]`. Aucun réseau social sans compte réel.

---

## 8. Design system marketing — statut de chaque règle

| Règle | Statut | Précision |
|---|---|---|
| Photographie éditoriale dans le Hero | `[RETENU]` — emplacement et intention déjà dans le code | seul l'asset manque |
| Alternance des fonds | `[À FIGER]` — règle de travail, pas une fondation produit ; à valider visuellement pendant l'exécution | deux sections voisines ne partagent en principe pas le même fond, **sans appliquer mécaniquement Warm → blanc → Warm → blanc si la narration demande autre chose** |
| Forest en fond : une seule occurrence par page | `[À FIGER]` | Forest reste la couleur des titres partout |
| Bordure Mint systématique en remplacement des ombres | `[À FIGER]`, fondé sur un constat `[FAIT]` | formalise une pratique existante |
| Tailles typographiques exactes | `[À FIGER]` — Hero et Métiers sont `[FAIT]`, l'échelle complète est une extrapolation | à valider une fois |
| Rayons 6 px et 10 px | `[FAIT]` | formalisation ; règle générale, exceptions fonctionnelles possibles si elles restent cohérentes avec la direction existante |
| Animations autorisées | `[À FIGER]` — seul le rail Métiers existe `[FAIT]` | la transition contenu → site est à valider au Lot 2 |

### A — Typographie `[À FIGER]`

| Rôle | Mobile | Tablette | Desktop | Interligne |
|---|---|---|---|---|
| H1 | 36 px | 44 px | 56 px | 1,08 · interlettrage −0,02em |
| H2 | 32 px | 40 px | 48 px | 1,12 |
| H3 | 20 px | 22 px | 24 px | 1,25 |
| Corps | 16 px | 16 px | 18 px | 1,6 |
| Petit label | 12 px | 12 px | 14 px | gras, majuscules, interlettrage 0,14em, en vert |
| Légende | 13 px | 13 px | 14 px | graphite |

Un seul H1 par page. Un seul petit label par section. Poids : 400, 500, 600, 800.

### B — Grille

Contenu 1200 px `[FAIT]` — norme d'usage marketing, pas un dogme absolu : un média peut occuper davantage de largeur si la composition le justifie. Texte 650 à 760 px maximum `[À FIGER]`, et reste toujours plus étroit que les médias qui l'entourent. Marges 20 px / 32 px `[FAIT]`. Douze colonnes desktop, gouttière 32 px ; six tablette ; une téléphone. Rythme vertical 64 / 80 / 96 px. Points de rupture `sm`, `md`, `lg` `[FAIT]`.

### C — Couleurs `[À FIGER]` sur la fonction, `[RETENU]` sur les valeurs

| Couleur | Fonction | Fréquence |
|---|---|---|
| Warm | fond de marque, respiration | ~40 % des sections |
| Blanc | fond de preuve | ~40 % |
| Forest | titres partout ; fond une fois par page | — |
| Forest Dark | contraste sur fond Forest | rare |
| Brand Green | accent, bouton principal, petits labels, focus | ~10 %, jamais en grande surface |
| Mint clair | surface fonctionnelle, réserve d'image | ponctuel |
| Mint bordure | toutes les bordures | systématique |
| Graphite | texte courant | partout |

### D — Boutons : trois, pas plus

1. **Principal** `[FAIT]` : vert plein, texte blanc, rayon 6 px, 48 px (52 px desktop).
2. **Secondaire** `[FAIT]` : blanc, bordure Mint, texte Forest ; survol vert.
3. **Lien textuel** `[À FIGER]` : Forest, souligné au survol.

Contour de focus obligatoire `[FAIT]`. Aucune autre variante, aucun bouton à icône seule, aucun bouton fantôme.

### E — Cinq catégories d'images, jamais interchangeables `[RETENU]`

| Catégorie | Rôle | Où | Interdit |
|---|---|---|---|
| Illustration 3D SUPORDO | univers métier, reconnaissance | Métiers, éventuellement `/demarrer` | jamais présentée comme une réalisation client |
| **Photo éditoriale de marque** | incarner le métier et la marque | **Hero uniquement** | **n'est pas une réalisation client et ne doit jamais être présentée comme telle** |
| **Photo de preuve / réalisation** | montrer un vrai travail réalisé | Acte 4, éventuellement `/exemples` | doit être réelle et autorisée par écrit |
| Capture produit réelle | montrer comment l'information est organisée | Actes 3 et 4 | jamais une interface inventée |
| Site public réel | le résultat acheté | Actes 3 et 4, `/exemples` | jamais un faux site |

### F — Captures produit `[À FIGER]`

Recadrage sur une seule tâche — une donnée ou une tâche réelle et ciblée, jamais un tableau de bord complet ou une interface fictive lorsqu'une vue simple suffit à la preuve · bordure 1 px Mint, rayon 10 px, aucun cadre de navigateur · **les composants marketing n'utilisent aucune ombre décorative ; une capture produit peut recevoir une séparation visuelle minimale uniquement si nécessaire à sa lisibilité, sans créer d'effet de profondeur** · aucune perspective · données réelles ou explicitement de démonstration · au maximum une légende sous l'image · le lien avec le résultat public se fait par le contenu identique · l'espace client sur téléphone ne se montre qu'après la question 8.

### G — Mouvement `[À FIGER]`

Trois mouvements autorisés : le rail Métiers `[FAIT]` · une apparition douce au défilement · aux actes 3 ou 4 uniquement, **une seule** transition faisant apparaître le même contenu de la fiche vers la page publique, déclenchée une fois, jamais en boucle, jamais suggérant une publication automatique. Le réglage de réduction des animations désactive les deux derniers.

---

## 9. Responsive `[À FIGER]`, sauf Hero et Métiers `[FAIT]`

| Section | Desktop | Tablette | Mobile |
|---|---|---|---|
| Hero | deux colonnes, premier écran | deux colonnes resserrées | texte, puis image, action principale en pleine largeur (aucune action secondaire en V1) |
| Métiers | 4 cartes + amorce | 3 cartes | 1 carte + ~22 % de la suivante |
| Acte 3 | asymétrie deux tiers / un tiers | idem, écart réduit | résultat public seul, puis fiche recadrée |
| Acte 4 | trois états en ligne | trois états sur deux lignes | trois états empilés |
| Acte 5 | deux colonnes | deux colonnes | deux blocs empilés |
| Offre | bloc centré 640 px | idem | pleine largeur, prix en premier |
| Réassurance | colonne 760 px | idem | accordéon |
| En-tête | liens + connexion discrète | idem | marque, action principale, accès connexion compact |
| Pied de page | 4 colonnes | 2 colonnes | 1 colonne |

Non négociable : aucun texte de capture illisible, aucun débordement horizontal, zones tactiles de 44 px minimum, respect de la zone sûre en bas d'écran.

---

## 10. Matrice visuelle

| Section | Illustration 3D | Photo éditoriale | Photo de preuve | Capture produit | Site public réel | À produire |
|---|---|---|---|---|---|---|
| Hero | non | **oui** | non | non | non | photographie horizontale d'un professionnel au travail, propriété SUPORDO |
| Métiers | **oui** | non | non | non | non | rien |
| Acte 3 | non | non | non | **oui** | **oui** | capture d'un service dans l'espace ; capture de la page publique du même service |
| Acte 4 | non | non | **oui** | **oui** | **oui** | photo de chantier autorisée ; fiche réalisation ; réalisation en ligne |
| Actes 5, 6, 7, pied de page | non | non | non | non | non | aucun visuel |

---

## 11. Système de sections : six familles

| Famille | Objectif | Densité | Visuel | Mobile | Ne pas utiliser |
|---|---|---|---|---|---|
| Ouverture éditoriale | poser la promesse | faible | photo éditoriale | texte puis image | jamais deux fois par page |
| Reconnaissance | « c'est pour moi » | moyenne | illustrations | rail au doigt | jamais pour présenter une fonction |
| Preuve appariée | montrer l'entrée et le résultat | moyenne | capture + site réel | empilée, résultat d'abord | jamais sans contenu réel identique ; jamais ailleurs qu'aux actes 3 et 4 |
| Partage typographique | clarifier qui fait quoi | faible | aucun | deux blocs | jamais pour une liste de fonctions |
| Bloc de décision | prix, ou action finale | très faible | aucun | pleine largeur | jamais sous forme de grille de forfaits |
| Questions-réponses | lever les objections | forte en texte | aucun | accordéon | jamais au milieu du récit |

Deux familles identiques ne se suivent jamais, et le fond change à chaque section. Refusé : toute famille « trois ou quatre cartes avec une icône dans un carré ».

---

## 12. Système sémantique

**Recommandé** : entreprise · métier · chantier · réalisation · client · commune · zone d'intervention · service · site · photo · travail réalisé · renseigner · mettre à jour · en ligne · pris en charge.

**Interdit** : digital · solution · plateforme · booster · présence en ligne · expérience digitale · révolutionner · tout-en-un · puissant · innovant · en quelques clics · sur-mesure · clé en main · visibilité · sans effort · complet. Et, parce qu'ils décrivent le logiciel plutôt que le métier : CMS · back-office · tableau de bord · éditeur · constructeur de site · module · fonctionnalité.

| Formulation | Verdict |
|---|---|
| « site pro » | à conserver |
| « pensé pour votre métier » | à conserver, prouvé par les dix illustrations |
| « espace SUPORDO » | à conserver, prouvé visuellement à l'Acte 3 |
| « faire vivre » | à remplacer à terme. Pistes : « mettre à jour », « tenir à jour ». Hors Lot 1 |
| « simple » | avec parcimonie, jamais comme différenciation |
| « sans avoir à gérer votre site » | **à corriger dans le Lot 1**, sous-tâche 1.6 |

**Ton** : phrases courtes, voix active. « Renseigner » du côté du client, « présenter » du côté de SUPORDO. Aucun superlatif, aucun point d'exclamation. Le conditionnel dès qu'une chose dépend d'une validation réelle.

---

## 13. Référencement structurel

**Accueil ou page produit** `[RETENU]` : l'accueil vend SUPORDO Sites, `/sites` n'est pas créée. Deux règles d'écriture préparent la suite : le pied de page porte la phrase de marque mère, et chaque acte reste un composant autonome, déplaçable tel quel le jour où un second produit existera.

**Priorités, dans cet ordre** : adresse canonique · plan de site · métadonnées · aperçus sociaux · liens internes · bon fonctionnement des pages · puis seulement les fichiers secondaires comme `llms.txt`.

À créer côté supordo.com : un plan de site propre au domaine — aujourd'hui vide · une adresse canonique par page et un choix unique entre `supordo.com` et `www.supordo.com` (question 7) · une image d'aperçu social réelle pour l'accueil · un seul H1 par page.

| Page | Intention de recherche | H1 | Cannibalisation |
|---|---|---|---|
| `/` | « site internet artisan », « site internet pour artisan » — descriptif et neutre. **« agence web artisan » est retirée** : aucune recherche n'a démontré l'intérêt de ce positionnement, et le produit ne doit pas être enfermé sémantiquement dans « agence web » | « Un vrai site pro… » | avec `/tarifs` si elle est créée |
| `/demarrer` | aucune, page de conversion | « Parlons de votre site. » | aucune |
| `/exemples` | exemple de site artisan | « Des sites déjà en ligne. » | aucune |
| `/tarifs` | prix site internet artisan | « Une offre, tout compris. » | avec l'acte 6 : la section se réduirait alors à un résumé |
| `/metiers/<metier>` | site internet pour <métier> | « Un site pour votre activité de <métier>. » | forte entre pages métier si le texte est recopié |

Données structurées : uniquement l'identité de l'entreprise SUPORDO, quand les mentions légales existent.

---

## 14. Risques

1. **Le plus probable** : construire les actes 3 et 4 sans capture réelle ni accord, et fabriquer une interface de démonstration.
2. La famille « preuve appariée » répétée partout : le geste devient un tic.
3. Les actes 3 et 4 centrés sur le même objet : la preuve est dépensée deux fois et SUPORDO passe pour une application photo.
4. L'acte 5 qui dérive vers une liste de fonctions, ou qui emploie un verbe large non prouvé.
5. Publier une offre dont les conditions ne sont pas tranchées.
6. Une transition animée qui laisse croire à une publication automatique.
7. Dix pages métier au contenu proche.
8. Une phrase de marque mère trop appuyée avant qu'un second produit existe.
9. Fabriquer une scène mobile de l'espace client sans avoir vérifié son ergonomie.
10. Laisser un seul bouton inerte, ou un libellé d'action qui surpromet.

---

## 15. Questions ouvertes `[OUVERT]`

1. **Tarif** : publie-t-on 49 € HT/mois et les 0 € de création, ou l'acte 6 reste-t-il sans chiffre au lancement ?
2. **Conditions de l'offre** : engagement, propriété du nom de domaine, cas d'un domaine déjà détenu, résiliation, récupération des contenus, support inclus, modifications comprises, suppléments facturés.
3. **« Voir un exemple »** : quel site client réel, avec quel accord écrit ? Sans réponse, le bouton reste masqué en V1 — ne bloque plus le Lot 1.
4. **Traitement de `/demarrer` — partiellement tranché.** *Architecture RETENUE* : envoi par e-mail, aucune nouvelle table marketing, réutilisation de l'infrastructure d'envoi existante via une fonction serveur adaptée. **L'absence de stockage en base ne signifie pas absence de traitement ni de conservation : les informations du formulaire sont transmises et temporairement conservées dans la messagerie de destination, selon une règle documentée.** *Paramètres opérationnels encore à fournir* : destinataire, expéditeur, personnes ayant accès, durée ou règle de conservation, information sur les données personnelles, anti-spam, comportement en erreur.
5. **Captures produit** : compte de démonstration dédié, ou capture d'un client réel avec accord ?
6. **Certifications** : assume-t-on publiquement qu'elles sont saisies par SUPORDO ? Tant que non tranché, elles sont retirées de l'Acte 5.
7. **Adresse canonique** : `supordo.com` ou `www.supordo.com` ?
8. **Ergonomie mobile de l'espace client** — devenue un point de contrôle du Lot 3, plus une simple question. À vérifier réellement : création et modification d'une réalisation, ajout d'une photo, titre, ville, service, publication. Si l'expérience n'est pas exploitable, la représentation de l'Acte 4 est adaptée honnêtement.
9. **Création initiale du site** : intervention SUPORDO, automatisation, génération assistée, validation humaine, nombre d'allers-retours, délai. Cette réponse conditionne l'Acte 5, l'offre et `/demarrer`. — **fermée, voir §18.**
10. **Publication** : pour chaque contenu modifiable — saisie par le client, validation éventuelle, publication immédiate ou non, intervention SUPORDO éventuelle. **Aucune formulation ne doit laisser croire à une publication automatique si ce n'est pas le comportement réel.** — **fermée, voir §18.**
11. **Demandes reçues du site artisan** : où elles arrivent, qui les reçoit, si elles sont conservées, où elles sont consultables. **Ne jamais présenter cela comme un outil de gestion de clientèle si le produit ne le fait pas.** — **fermée, voir §18.**
13. **Inventaire des traceurs** : mesure d'audience, pixels, outils marketing, contenus tiers, vidéos, messagerie, autres scripts — détermine s'il faut un mécanisme de consentement.

---

## 16. Backlog d'exécution — un seul ordre, cinq lots

### GATE AVANT EXEC — à fournir ou trancher

| À trancher | Bloque |
|---|---|
| Paramètres opérationnels de `/demarrer` (question 4) : destinataire, expéditeur, accès, conservation, information sur les données | 1.2, 1.3 |
| Textes légaux fournis | 1.4 |

Les sous-tâches réellement indépendantes commencent sans attendre les autres. Aucun sixième lot n'est créé.

### LOT 1 — Rendre la page honnête et actionnable

| Sous-tâche | Concerne | Dépend de |
|---|---|---|
| 1.1 Nettoyer l'en-tête : retirer CRM et Ressources, ajouter « Demander mon site » → `/demarrer`, rendre « Se connecter » atteignable sur téléphone | `SupordoHeader.tsx` | — |
| 1.2 Créer `/demarrer` et son formulaire. Structure proposée : entreprise, métier, ville, email, téléphone, message. **Pendant l'exécution, chaque champ est classé obligatoire ou facultatif selon son utilité commerciale réelle — aucune donnée collectée « au cas où ».** | nouvelle route, nouveau composant | paramètres opérationnels de la question 4 |
| 1.3 Créer `/demarrer/confirmation`, non indexée | nouvelle route | 1.2 |
| 1.4 Créer les deux pages sous `/legal/` | 2 nouvelles routes | textes fournis, question 13 |
| 1.5 Créer le pied de page de marque | nouveau composant, `SupordoLanding.tsx` | 1.4 |
| 1.6 Activer « Demander mon site » vers `/demarrer`, masquer « Voir un exemple » tant qu'aucune destination réelle n'existe, et corriger la phrase ambiguë du Hero (« sans avoir à gérer votre site » → « sans avoir à construire ni mettre en page votre site » ou équivalent vérifié en contexte) sans modifier le H1. | `SupordoHero.tsx` | 1.2, afin que `/demarrer` soit réellement fonctionnel. Aucune dépendance à un exemple en V1. |
| 1.7 Déposer ce plan dans `docs/product/plan-directeur-supordo-com.md` | documentation | — |

Validation : aucun élément de menu ni bouton sans destination · une demande réelle arrive à destination · les mentions légales sont accessibles depuis le pied de page · un client existant atteint `/login` en un geste sur téléphone · les sites artisans et `/login` strictement inchangés.

### LOT 2 — La preuve appariée, Acte 3, sur un service

| Sous-tâche | Concerne | Dépend de |
|---|---|---|
| 2.1 Choisir l'entreprise de démonstration et le service, produire les deux captures | médias | question 5 |
| 2.2 Construire l'Acte 3 | nouveau composant, `SupordoLanding.tsx` | 2.1, Lot 1 |
| 2.3 Valider ou écarter la transition de contenu animée | même composant | 2.2 |

Validation : à froid, une personne comprend sans lire que ce qu'elle renseigne est présenté sur son site · l'objet montré est un service, pas une réalisation · aucune interface inventée · sur téléphone, jamais deux interfaces côte à côte.

### LOT 3 — Démonstration signature et partage des rôles, Actes 4 et 5

| Sous-tâche | Concerne | Dépend de |
|---|---|---|
| 3.0 **Vérifier l'ergonomie mobile de la création de réalisation** : ajout de photo, titre, ville, service, publication | vérification, aucune modification | — |
| 3.1 Obtenir la photo de chantier réelle et autorisée | médias | accord client |
| 3.2 Construire l'Acte 4, trois états, même entreprise que l'Acte 3, objet différent | nouveau composant | 3.0, 3.1 |
| 3.3 Construire l'Acte 5 après validation du tableau formulation → preuve → limite | nouveau composant | question 6 (questions 9, 10 fermées, voir §18) |

Validation : trois états et pas cinq · aucune scène mobile fictive · la phrase de généralisation présente mais discrète · chaque ligne de l'Acte 5 adossée à une preuve technique et à sa limite · les qualifications absentes tant que la question 6 n'est pas tranchée.

### LOT 4 — Offre et décision, Actes 6 et 7

**Bloqué tant que les questions 1 et 2 ne sont pas tranchées** (question 9 fermée, voir §18).

| Sous-tâche | Concerne | Dépend de |
|---|---|---|
| 4.1 Construire l'Acte 6, offre unique | nouveau composant | questions 1, 2 |
| 4.2 Construire l'Acte 7, questions-réponses et action finale | nouveau composant | question 2 |

Validation : une seule offre, aucun prix barré, aucune réponse inventée, aucun emploi du mot « complet ».

### LOT 5 — Référencement du domaine SUPORDO et pages secondaires

| Sous-tâche | Concerne | Dépend de |
|---|---|---|
| 5.1 Adresse canonique et plan de site du domaine SUPORDO. **Le plan de site marketing ne contient que les adresses publiques destinées à être explorées** : exclure `/demarrer/confirmation`, `/login`, l'administration, la super-administration, toute adresse privée, toute adresse de site artisan et toute page future inexistante. | fichiers de référencement existants | question 7 |
| 5.2 Image d'aperçu social réelle pour l'accueil | médias, en-tête de page | Lot 3 |
| 5.3 Créer `/exemples` | nouvelle route | accords clients |
| 5.4 Créer `/tarifs` uniquement si l'offre le justifie | nouvelle route | Lot 4 |
| 5.5 Corriger l'anomalie `llms.txt` sur le domaine SUPORDO — dernière priorité | fichier existant | 5.1 |

Validation : plan de site propre à SUPORDO · aperçu social réel · **un site artisan strictement inchangé** · zéro exemple fabriqué.

### Hors lots `[REPOUSSÉ]`

Page métier pilote · remplacement de « faire vivre » · vérification de contraste de la palette · renommage du guide média · conditions générales de vente. Chacun nécessitera son propre feu vert.

---

## Patch appliqué

Sections modifiées : capacités du produit (service qualifié d'objet de l'Acte 3, qualifications et demandes reçues requalifiées) · anomalies (llms.txt déclassé) · décisions retenues (deux objets distincts pour les Actes 3 et 4) · sitemap (traceurs découplés du paiement, inventaire ajouté) · Acte 3 (objet = service) · Acte 4 (réalisation réservée, point de contrôle mobile) · Acte 5 (tableau formulation → preuve → limite, qualifications retirées) · Acte 7 (« complet » supprimé, deux questions ajoutées) · `/demarrer` (neuf points à définir) · pages légales (accessibilité distinguée de l'indexation) · en-tête (connexion mobile, libellé de l'action) · matrice d'images (cinq catégories, photo éditoriale distinguée de la photo de preuve) · sémantique (« complet » interdit, correction du Hero rapatriée dans le Lot 1) · référencement (« agence web artisan » retirée, ordre de priorité) · risques · questions ouvertes (13 au lieu de 8) · backlog (point de contrôle avant exec, 3.0 ajoutée, 5.5 ajoutée).

## Décisions qui restent ouvertes

Tarif · conditions de l'offre · vrai exemple pour le bouton secondaire · traitement complet de `/demarrer` · captures produit · communication sur les qualifications · adresse canonique · ergonomie mobile de l'espace client · libellé de l'action principale · inventaire des traceurs. (Création initiale du site, règles de publication et circuit des demandes reçues : fermées, voir §18.)

## Impact sur les cinq lots

Lot 1 : le libellé de l'action et la correction éditoriale du Hero entrent dans le lot. Lot 2 : porte désormais sur un service, plus sur une réalisation. Lot 3 : gagne un point de contrôle bloquant, la vérification mobile ; les questions 9 et 10 pour l'Acte 5 sont fermées (§18), seule la question 6 le bloque encore. Lot 4 : n'est plus bloqué par la question 9. Lot 5 : accueille la correction `llms.txt` en dernière priorité.

## Prêt pour EXEC ?

**OUI.**

Peuvent commencer immédiatement : **1.7** (déposer le plan dans le dépôt) et **1.5** dans sa structure, en attendant les adresses légales. **3.0**, la vérification d'ergonomie mobile, peut également être menée dès maintenant en parallèle, puisqu'elle n'exige aucune décision.

Attendent une décision : 1.1 et 1.6 (libellé de l'action, et disponibilité d'un exemple) · 1.2 et 1.3 (traitement des demandes) · 1.4 (textes légaux et inventaire des traceurs).

---

## 17. Gate du Lot 1 — fermé le 19/09/2026

### Décisions humaines désormais prises `[RETENU]`

- **Libellé de l'action principale V1 : « Demander mon site »**, route `/demarrer`. Identique dans l'en-tête, le Hero, l'offre et l'action finale. « Démarrer » n'est plus utilisé comme action commerciale principale en V1. — remplace la question 12, qui est fermée.
- **Action secondaire « Voir un exemple » : masquée** tant qu'aucun exemple réel ou site de démonstration explicitement assumé n'existe. Ni `/exemples` vide, ni bouton inerte, ni faux client. `/exemples` reste prévue au Lot 5. — remplace la question 3 pour le Lot 1.
- **Traitement V1 de `/demarrer` : envoi par e-mail vers une adresse SUPORDO, aucune nouvelle table.** — ferme la question 4 sur le principe ; restent les paramètres d'implémentation ci-dessous.

### Chemin technique minimal pour `/demarrer`

**`[FAIT — INFRASTRUCTURE RÉUTILISABLE]`** : Resend est déjà utilisé dans le projet · la fonction serveur `notify-contact` existe · les secrets serveur nécessaires (`RESEND_API_KEY`, adresse d'expédition) existent et ne sont jamais exposés au navigateur.

**`[À CRÉER]`** : une fonction dédiée aux demandes commerciales SUPORDO, sans dépendance à une ligne de contacts artisan, sans nouvelle table marketing. `notify-contact` est adossé à la table `contacts` d'un artisan (il « réclame » une ligne existante pour garantir un seul envoi) et ne convient donc pas tel quel.

Flux recommandé, sans table :

1. Formulaire sur `/demarrer`, validation par schéma côté client et côté serveur (longueurs, format d'adresse, champs obligatoires).
2. Une fonction serveur dédiée à l'envoi, sur le modèle de `notify-contact` : appel Resend avec la même clé et la même adresse d'expéditeur, destinataire = adresse SUPORDO.
3. Anti-spam sans service tiers, donc sans nouveau traceur : champ leurre invisible, délai minimal avant soumission, limitation du nombre d'envois par adresse IP dans la fonction.
4. Message de succès explicite, message d'erreur explicite invitant à téléphoner ou écrire directement — **jamais d'échec silencieux** : si l'envoi échoue, l'interface le dit.
5. Redirection vers `/demarrer/confirmation`, non indexée.
6. Mention d'information sur les données personnelles sous le formulaire, avec lien vers la page de confidentialité.

Point de vigilance, sans changer la doctrine : l'e-mail seul n'offre aucune trace de rattrapage si Resend échoue définitivement. Le risque est accepté en V1 à condition que l'échec soit visible par le visiteur, et que l'adresse de destination soit une boîte réellement surveillée. Deux paramètres restent à fournir : **l'adresse de destination**, et **si l'expéditeur actuel convient ou s'il faut une adresse d'expédition SUPORDO dédiée**.

### Inventaire des traceurs `[FAIT]` — aucun bandeau créé

| Élément | Présent | Fichier | Chargé sur supordo.com | Finalité | Analyse de consentement |
|---|---|---|---|---|---|
| Google Analytics, Tag Manager | absent | — | — | — | non |
| Pixel Meta / Facebook | absent | — | — | — | non |
| Plausible, Matomo, PostHog, Hotjar, Clarity | absents | — | — | — | non |
| Outils publicitaires, scripts marketing | absents | — | — | — | non |
| Messagerie ou widget externe | absent | — | — | — | non |
| Google Fonts (Manrope distante) | **présent** | en-tête du document racine | **oui** | police de la marque | **dépendance tierce à documenter, et éventuellement à remplacer par un hébergement local ; aucun bandeau de consentement créé sur ce seul constat.** Décision repoussée avant lancement public, ne bloque pas le Lot 1. Pendant l'exécution : vérifier le mode de chargement actuel, vérifier si une version locale exploitable et licenciée est déjà présente ; si le passage en local est trivial et sûr, le recommander ; sinon conserver l'état actuel. Aucun fichier de police n'est partagé ni exporté. |
| Carte Google Maps intégrée | présent | page contact d'un **site artisan** | **non** | localiser l'entreprise | hors périmètre supordo.com ; à traiter dans le légal des sites artisans |
| Stockage navigateur de la session de connexion | présent | client Supabase | oui, sur `/login` et l'espace | maintenir la session | strictement nécessaire, pas de consentement |
| Cookie d'état du menu latéral | présent | composant d'interface | espace client uniquement | confort d'affichage | strictement nécessaire |

**Conclusion : aucun traceur soumis à consentement sur supordo.com. Aucun bandeau n'est à créer.** La police distante est une dépendance tierce à documenter, pas un traceur soumis à consentement ; le choix entre police distante et hébergement local reste à trancher avant le lancement public et ne bloque pas le Lot 1.

### Informations légales

**A — déjà disponibles dans le dépôt** : l'hébergement est assuré par Supabase et Cloudflare (déjà écrit dans la page légale des sites artisans) · l'envoi d'e-mails passe par Resend · le stockage des fichiers et la base de données sont chez Supabase · la seule donnée personnelle collectée par `/demarrer` sera celle saisie dans le formulaire.

**B — à fournir, rien ne peut être inventé** :

1. Dénomination sociale exacte, forme juridique et capital le cas échéant.
2. Adresse du siège.
3. Numéro SIRET ou SIREN, et numéro de TVA intracommunautaire s'il existe.
4. Nom du responsable de la publication.
5. Adresse e-mail et téléphone de contact à publier.
6. Numéro d'inscription au registre du commerce, si applicable.
7. Adresse de destination des demandes `/demarrer`, et adresse d'expédition souhaitée.
8. Durée de conservation des demandes reçues par e-mail, et personnes y ayant accès.
9. Adresse à laquelle une personne peut exercer ses droits sur ses données.
10. Nom d'un éventuel sous-traitant supplémentaire non listé en A.
11. Décision sur Google Fonts : distant ou hébergé localement.

### Questions fermées par ce gate

3 (pour le Lot 1), 4 (sur le principe), 12, 13.

### Questions encore ouvertes, inchangées

1, 2, 5, 6, 7, 8, 9, 10, 11 — aucune ne bloque le Lot 1.

---

## 18. Gate Q9/Q10/Q11 — fermé le 19/09/2026

Vérification en lecture seule du comportement réel du produit (code actuel,
pas les documents), à partir du code de création de tenant, des composants
d'administration et du flux de contact. Aucun fichier produit modifié pour
produire ce gate.

### Décisions désormais actées `[RETENU]`

- **Question 9 — Création initiale.** La création d'un tenant est réservée
  au Super Admin (`super-admin.onboarding.tsx`). L'IA propose une première
  version à partir d'un brief (`generate-tenant`) ; chaque champ reste
  modifiable par le Super Admin avant la soumission finale, qui crée le
  tenant, `site_settings`, les services et les zones en un seul bloc,
  **actif immédiatement** (`is_active: true`) sur une adresse SUPORDO
  native (`{slug}.supordo.com`, créée avec le tenant). L'invitation de
  l'artisan (accès à son espace) est une action **séparée et manuelle**,
  jamais automatique (`invite-tenant-admin`, `tenant-provisioning.ts`).
  Formulation retenue : **« SUPORDO prépare votre site à partir des
  informations de votre entreprise, avec l'aide de l'IA. »** Ne jamais
  écrire « vérifié avant mise en ligne » comme procédure qualité distincte
  — cette étape n'existe pas séparément de la relecture par le Super Admin
  pendant l'assistant. Ne jamais promettre de délai chiffré, ni un accès ou
  une création autonome par l'artisan.
- **Question 10 — Publication.** Comportement réel par contenu, jamais une
  règle unique :
  - services, réalisations, partenaires, coordonnées : contrôle de
    visibilité ou effet public réel et immédiat, à la main du client
    (`ServicesManager.tsx`, `PortfolioManager.tsx`, `PartnersManager.tsx`) ;
  - zones d'intervention : publiques dès l'ajout, sans bascule
    (`service_areas` ne porte aucune colonne de publication) ;
  - équipe : membres gérés par le client, mais l'affichage général de la
    section reste conditionné par `site_settings.team_presentation_mode`,
    verrouillé au `super_admin`/`service_role` ;
  - marques : saisie possible côté client, **aucun rendu public
    aujourd'hui** (aucun composant équivalent à `PartnersSection.tsx`
    n'existe pour les marques) — ne rien promettre publiquement ;
  - photos : « remplacent automatiquement les illustrations » reste vrai
    service par service, jamais une promesse transverse.
- **Question 11 — Demandes reçues.** Le formulaire du site artisan insère
  directement dans `contacts`, consultable dans `/admin/contacts`
  (marquage lu/non lu). Une notification e-mail est tentée en
  fire-and-forget vers l'adresse du tenant si elle est configurée ; sans
  adresse configurée, l'envoi est ignoré proprement ; un échec d'envoi est
  silencieux côté visiteur mais la demande reste enregistrée. Le Super
  Admin ne dispose que d'un compteur agrégé, pas d'un écran de détail sans
  impersonation. Ne jamais promettre une notification garantie ni un suivi
  humain assuré par SUPORDO.

### Questions fermées par ce gate

9, 10, 11.

### Questions encore ouvertes, inchangées

1, 2, 5, 6, 7, 8, 13 — aucune ne bloque l'Acte 5 tel que construit.
