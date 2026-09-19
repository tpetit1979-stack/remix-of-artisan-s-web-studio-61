# Plan directeur du site commercial SUPORDO — version canonique

Source de vérité unique avant les prompts d'exécution. Aucun fichier du produit n'a été modifié.

**Où conserver ce document** : chemin recommandé `docs/product/plan-directeur-supordo-com.md`, à créer lors du Lot 1, aux côtés de la constitution et du backlog d'exécution. Aucun autre fichier de documentation n'est nécessaire. Ce plan n'existe aujourd'hui que dans `.lovable/plan.md`.

**Statuts utilisés** — `[FAIT]` vérifié dans le dépôt · `[RETENU]` décidé, à ne pas rouvrir · `[À FIGER]` recommandation issue de cette analyse, à valider une fois puis à traiter comme règle · `[OUVERT]` décision humaine requise · `[REPOUSSÉ]` volontairement différé.

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

Les tokens `--supordo-*` et Manrope sont portés par la seule classe `.supordo-brand`, appliquée uniquement aux composants marketing. Aucun site artisan, aucune page `/admin` ou `/super-admin` ne porte cette classe. La non-contamination est garantie techniquement, pas seulement par convention. **Rien à modifier.**

### Contrainte de routage (découverte de l'audit)

Sur supordo.com, **seule l'adresse `/` est réservée à SUPORDO**. Les noms `/contact`, `/services`, `/realisations`, `/mentions-legales` appartiennent déjà au vocabulaire des sites artisans et renvoient une erreur sur supordo.com faute d'artisan à résoudre. Toute page commerciale portant l'un de ces noms devrait embarquer une double logique selon le domaine. Architecture conservée telle quelle.

### Capacités réelles du produit

| Capacité | Statut | Promesse autorisée |
|---|---|---|
| Services, zones d'intervention, équipe, marques, logos partenaires | PROUVÉ | oui |
| Réalisations : photo, titre, ville, service, publication au cas par cas | PROUVÉ | oui, cœur de la démonstration |
| Demandes reçues via le formulaire du site | PROUVÉ | oui |
| Connexion et redirection selon le rôle | PROUVÉ | oui |
| Informations d'entreprise | PARTIEL : téléphone, email, texte d'accueil, couleurs, référencement. Pas d'adresse ni de mentions administratives | formuler prudemment |
| Logo de l'entreprise | NON DISPONIBLE côté client, géré par SUPORDO | ne pas promettre |
| Certifications et qualifications | NON DISPONIBLE côté client, saisi par SUPORDO | présentable comme pris en charge par SUPORDO |
| Aperçu ou brouillon avant mise en ligne | PARTIEL : un lien ouvre le site réel ; publication au cas par cas pour les réalisations seulement | ne jamais promettre un aperçu |
| Espace client sur téléphone | PARTIEL : menu adapté, formulaires longs non vérifiés | ne pas le montrer avant vérification |

### Incohérences constatées, non corrigées

1. Le menu affiche quatre entrées sans destination, dont un produit inexistant.
2. Les deux boutons du Hero sont inertes.
3. Aucun pied de page, donc aucune mention légale accessible.
4. `supordo.com/sitemap.xml` renvoie un plan de site vide ; `supordo.com/llms.txt` renvoie une erreur.
5. Le contraste de la palette n'a jamais été vérifié formellement (noté dans les documents de marque).
6. Un guide média porte encore l'ancien nom du projet.

---

## 2. Décisions retenues, à ne pas rouvrir `[RETENU]`

**Marque et produit** : SUPORDO est la marque mère · SUPORDO Sites est le seul produit commercialisé · le futur second produit n'apparaît ni dans la navigation, ni dans le récit commercial, ni dans le pied de page.

**Adresses** : `/` vend SUPORDO Sites aujourd'hui · pas de `/sites` · pas de `/crm` · pas d'entrée « Ressources » · `/demarrer` est le parcours commercial unique · `/contact` n'est pas utilisée côté SUPORDO à cause du routage artisan · `/exemples` seulement avec de vrais sites et les accords écrits · `/tarifs` autonome seulement si la complexité de l'offre le justifie · pages métier plus tard, une page pilote avant toute industrialisation.

**Récit** : Hero puis Métiers conservés, non redessinés · Acte 3 avant Acte 4 · l'Acte 3 montre la même information dans le site public et dans l'espace SUPORDO · le site public reste visuellement dominant · l'Acte 4 est une démonstration, pas la définition du produit · réassurance et action finale fusionnées en un seul acte.

**Intégrité** : aucune preuve, statistique, interface, réalisation ni témoignage inventé · aucune grille artificielle de forfaits ou de fonctionnalités.

**Fondations visuelles** : Manrope · Brand Green `#00875A`, Forest `#10291C`, Forest Dark `#07140D`, Warm `#FAF8F4`, Mint clair `#EAF4EE`, Mint bordure `#CFE8D8`, Graphite `#3A403B` · tokens scopés à la classe de marque · rayons faibles · aucun gradient, effet de verre, blob, écran incliné, ombre décorative · « SUPORDO ne décore pas le réel. Il l'organise. »

---

## 3. Sitemap cible

```
supordo.com
├── /                            LOT 1-4  page commerciale unique
├── /demarrer                    LOT 1    parcours de prise de contact
├── /demarrer/confirmation       LOT 1    accusé de réception
├── /legal/mentions-legales      LOT 1    légal plateforme
├── /legal/confidentialite       LOT 1    légal plateforme
├── /exemples                    LOT 5    vrais sites clients, avec accord
├── /tarifs                      LOT 5    conditionnelle
├── /metiers/<metier>            REPOUSSÉ une page pilote, hors lots
└── /login                       existant, inchangé
```

**Pages légales — route retenue : le préfixe `/legal/`.** `[À FIGER]`

Pourquoi il n'y a pas de collision : aucune route artisan ni plateforme ne commence par `/legal`, alors que `/mentions-legales` est déjà la page légale des sites artisans. Le préfixe isole durablement tout le légal de la plateforme, quel que soit le nombre de documents ajoutés ensuite.

**Le nom exact reste une convention technique proposée, pas une décision de marque** : `/legal/mentions-legales` et `/legal/confidentialite` peuvent être renommés au Lot 1 sans conséquence, tant que le préfixe reste distinct du vocabulaire artisan. Ce point n'est pas une question ouverte bloquante.

`[REPOUSSÉ]` : conditions générales de vente et page cookies — seulement si un paiement en ligne ou un traceur non essentiel apparaît.

---

## 4. Page d'accueil, acte par acte

### Acte 1 — Hero `[FAIT]`

Question : « Qu'est-ce que c'est ? » · Message : un vrai site professionnel · Desktop : deux colonnes, image à droite, hauteur du premier écran · Mobile : texte puis image, boutons empilés · Action : Démarrer + Voir un exemple · Manque : la photographie et les destinations des boutons.

### Acte 2 — Métiers `[FAIT]`

Question : « Est-ce fait pour une entreprise comme la mienne ? » · Message : un site adapté à votre activité · Preuve : dix métiers reconnaissables · Desktop : 4 cartes et amorce de la 5ᵉ · Mobile : une carte dominante et ~22 % de la suivante · Action : aucune, délibérément.

### Acte 3 — Ce que vos clients voient, ce que vous renseignez

Question : « Qu'est-ce que j'obtiens réellement, et qu'est-ce qui est différent ? »

Message : votre entreprise évolue, votre site suit. Ce que vous renseignez est présenté proprement à vos clients.

Preuve : **une seule et même réalisation, montrée deux fois.** Même photo, même titre, même commune — par exemple « Installation d'un poêle à bois — Aubagne ». D'un côté la page publique, de l'autre la fiche telle qu'elle est renseignée dans l'espace.

Desktop : composition asymétrique, le site public occupe environ deux tiers du poids visuel, la capture de l'espace un tiers, sur fond blanc. Aucune flèche, aucune numérotation, aucun cadre de navigateur : le lien est le contenu identique, rien d'autre.

Mobile : **jamais deux interfaces côte à côte.** Résultat public d'abord, pleine largeur ; fiche renseignée ensuite, recadrée sur photo, titre, ville, service.

Action : aucune, ou un lien discret vers l'acte suivant.

Éléments réels nécessaires : capture de l'écran des réalisations recadrée sur une fiche, et capture de la page publique correspondante — question ouverte 5.

### Acte 4 — Démonstration signature

Question : « Est-ce vraiment simple dans mon quotidien ? »

Message : votre travail devient une preuve visible. Puis, discrètement : « Vos réalisations. Mais aussi vos services, vos zones et votre équipe. » **Cette phrase de généralisation est obligatoire** : sans elle, SUPORDO passe pour une application photo.

Preuve : trois états — chantier terminé, fiche renseignée, résultat en ligne — sur la même réalisation que l'acte 3.

Desktop : trois états côte à côte, largeurs égales, légende factuelle sous chacun. Mobile : trois états empilés, pleine largeur. Action : secondaire.

### Acte 5 — Qui fait quoi

Question : « Concrètement, qui fait quoi ? » · Message : SUPORDO s'occupe de la présentation du site, vous renseignez votre entreprise.

- **SUPORDO** : crée et met en ligne le site, héberge, sécurise, maintient, organise la présentation, fait évoluer le socle commun, saisit les qualifications professionnelles.
- **Vous** : vos services, vos zones d'intervention, vos réalisations et leurs photos, votre équipe, vos marques et partenaires, vos coordonnées.

Preuve : l'exactitude de la liste, strictement limitée aux capacités PROUVÉES du bloc 1. Aucun visuel. Desktop : deux colonnes. Mobile : deux blocs empilés, titres distincts. Action : aucune.

### Acte 6 — Offre

Question : « Combien et qu'est-ce qui est compris ? » · Un seul bloc centré de 640 px maximum : prix, puis périmètre, puis conditions. **Aucune grille de forfaits.** Action : Démarrer. Bloqué par les questions ouvertes 1 et 2.

### Acte 7 — Réassurance et décision

| Question du visiteur | Statut |
|---|---|
| Dois-je créer moi-même mon site ? | RÉPONSE CONNUE : non |
| Dois-je savoir utiliser un logiciel ? | RÉPONSE CONNUE : non, saisie de champs simples |
| Puis-je modifier mes informations ? | RÉPONSE CONNUE : oui, celles listées à l'acte 5 |
| Le site fonctionne-t-il sur téléphone ? | RÉPONSE CONNUE : oui |
| Qui s'occupe de la maintenance ? | RÉPONSE CONNUE : SUPORDO |
| Que se passe-t-il si je ne publie jamais rien ? | RÉPONSE CONNUE : le site reste en ligne et complet |
| J'ai déjà un nom de domaine, que se passe-t-il ? | DÉCISION À PRENDRE, question 2 |
| Puis-je partir, et que deviennent mon domaine et mes contenus ? | DÉCISION À PRENDRE, question 2 |
| Combien de temps pour être en ligne ? | DÉCISION À PRENDRE, question 2 |

Aucune réponse rédigée avant d'être tranchée. Desktop : colonne de 760 px. Mobile : accordéon, zones tactiles de 48 px. Action finale identique à celle du Hero.

### Acte 8 — Pied de page

Voir bloc 7.

---

## 5. Pages secondaires

**`/demarrer` — Lot 1.** Recueillir une demande qualifiée. Sections : titre court · formulaire (entreprise, métier, ville, téléphone, email, message) · ce qui se passe ensuite, en trois étapes factuelles · rappel de ce qui est pris en charge. Aucun visuel, ou une seule illustration métier. Action unique : envoyer. H1 : « Parlons de votre site. » Dépend de la question 4.

**`/demarrer/confirmation` — Lot 1.** Accusé de réception, non indexée, sans action.

**`/legal/mentions-legales` et `/legal/confidentialite` — Lot 1.** Contenu fourni par SUPORDO, jamais inventé. Sans action.

**`/exemples` — Lot 5.** Introduction courte · grille de sites réels (nom, métier, commune, lien) · action finale. **Condition bloquante : accord écrit de chaque artisan.** H1 : « Des sites déjà en ligne. » En attendant, le bouton « Voir un exemple » du Hero peut pointer vers un site client réel avec accord — question 3.

**`/tarifs` — Lot 5, conditionnelle.** N'existe que si l'offre comporte plusieurs niveaux de lecture ou des conditions trop longues pour une section. Avec une offre unique, le prix reste dans l'acte 6, et cette page n'est pas créée. H1 : « Une offre, tout compris. »

**`/metiers/<metier>` — `[REPOUSSÉ]`, hors lots.** Justifiée seulement si trois conditions sont réunies : contenu propre au métier, exemple réel de ce métier, aucune phrase recopiée d'une autre page métier. Une seule page pilote, chauffagiste, mesurée avant toute extension.

---

## 6. En-tête

`[FAIT]` : collant, 64 px sur téléphone, 72 px sur desktop, fond Warm légèrement translucide, contour de focus visible.

`[À FIGER]` :

- Marque SUPORDO à gauche, lien vers l'accueil.
- Liens au centre, desktop uniquement : **Exemples · Tarifs**, chacun seulement quand sa page existe. « CRM » et « Ressources » supprimés `[RETENU]`.
- À droite : bouton principal « Démarrer », puis lien « Se connecter » vers `/login`, visuellement plus discret. Les deux populations — prospect et client — sont servies sans ambiguïté.
- Téléphone : marque et « Démarrer » uniquement ; « Se connecter » descend dans le pied de page.
- Au défilement : une bordure basse apparaît. Aucun rétrécissement, aucune ombre, aucun changement de couleur.
- Aucun grand menu déroulant.
- Évolution future, quand un second produit existera : une entrée « Produits » ouvrant une liste de deux lignes. Rien à préparer aujourd'hui.

---

## 7. Pied de page `[À FIGER]`

Fond Forest, quatre groupes, pas un de plus :

1. **Marque** : « SUPORDO développe des produits simples pour les entreprises de terrain. »
2. **Produit** : SUPORDO Sites, Exemples, Tarifs — selon existence.
3. **Légal** : mentions légales, confidentialité.
4. **Accès client** : Se connecter.

Aucune mention du futur produit `[RETENU]`. Aucun réseau social sans compte réel. Aucun faux plan de site.

---

## 8. Design system marketing — statut de chaque règle

### Statut des sept points signalés

| Règle | Statut | Précision |
|---|---|---|
| Photographie réelle dans le Hero | `[RETENU]` — l'emplacement et l'intention existent déjà dans le code, et les documents de marque notent l'absence de la photo | seul l'asset manque |
| Alternance des fonds | `[À FIGER]` — recommandation de cette analyse | deux sections voisines ne partagent jamais le même fond |
| Forest réservé au pied de page | `[À FIGER]` — recommandation de cette analyse | Forest reste la couleur des titres partout ; c'est son usage **en fond** qui est limité à une seule occurrence par page |
| Bordure Mint systématique en remplacement des ombres | `[À FIGER]`, mais fondé sur un constat `[FAIT]` : aucune ombre n'existe dans les trois composants actuels, et toutes les bordures sont déjà Mint | formalise une pratique existante |
| Tailles typographiques exactes | `[À FIGER]` — les valeurs du Hero et des Métiers sont `[FAIT]`, l'échelle complète (H3, corps, légende) est une extrapolation | à valider une fois, puis figée |
| Rayons exacts 6 px et 10 px | `[FAIT]` — déjà les seules valeurs présentes dans le code | formalisation |
| Animations autorisées | `[À FIGER]` — seul le rail Métiers existe `[FAIT]` ; l'apparition au défilement et la transition de contenu sont des propositions | la transition fiche → site est à valider au Lot 2 ou 3 |

### A — Typographie `[À FIGER]`

Manrope, sous la classe de marque uniquement.

| Rôle | Mobile | Tablette | Desktop | Interligne |
|---|---|---|---|---|
| H1 | 36 px | 44 px | 56 px | 1,08 · interlettrage −0,02em |
| H2 | 32 px | 40 px | 48 px | 1,12 |
| H3 | 20 px | 22 px | 24 px | 1,25 |
| Corps | 16 px | 16 px | 18 px | 1,6 |
| Petit label | 12 px | 12 px | 14 px | gras, majuscules, interlettrage 0,14em, en vert |
| Légende | 13 px | 13 px | 14 px | graphite |

Un seul H1 par page. Un seul petit label par section. Poids : 400, 500, 600, 800 — rien d'autre.

### B — Grille `[À FIGER]`, largeur de contenu `[FAIT]`

Contenu 1200 px `[FAIT]`. Texte 650 à 760 px maximum. Marges latérales 20 px téléphone, 32 px à partir de la tablette `[FAIT]`. Douze colonnes desktop, gouttière 32 px ; six sur tablette ; une sur téléphone. Rythme vertical entre sections : 64 / 80 / 96 px. Points de rupture : uniquement `sm`, `md`, `lg` `[FAIT]`.

### C — Couleurs `[À FIGER]` sur la fonction, `[RETENU]` sur les valeurs

| Couleur | Fonction | Fréquence |
|---|---|---|
| Warm | fond de marque, respiration | ~40 % des sections |
| Blanc | fond de preuve | ~40 % |
| Forest | texte de titre partout ; fond une seule fois par page | — |
| Forest Dark | contraste sur fond Forest | rare |
| Brand Green | accent, bouton principal, petits labels, contour de focus | ~10 % de la surface, jamais en grande surface |
| Mint clair | surface fonctionnelle, réserve d'image | ponctuel |
| Mint bordure | toutes les bordures, en remplacement des ombres | systématique |
| Graphite | texte courant | partout |

### D — Boutons : trois, pas plus `[FAIT]` pour les deux premiers

1. **Principal** : vert plein, texte blanc, rayon 6 px, hauteur 48 px (52 px desktop).
2. **Secondaire** : blanc, bordure Mint, texte Forest ; au survol, bordure et texte passent au vert.
3. **Lien textuel** `[À FIGER]` : Forest, souligné au survol, pour les actions mineures et le pied de page.

Contour de focus visible obligatoire sur les trois `[FAIT]`. Aucune autre variante, aucun bouton à icône seule, aucun bouton fantôme.

### E — Images : quatre catégories, jamais interchangeables `[RETENU]`

| Catégorie | Rôle | Où | Interdit |
|---|---|---|---|
| Illustration 3D SUPORDO | univers métier, reconnaissance | Métiers, éventuellement `/demarrer` | jamais présentée comme une réalisation client |
| Photographie réelle | preuve, travail réalisé | Hero, acte 4 | jamais une banque d'images générique |
| Capture produit réelle | montrer comment l'information est organisée | actes 3 et 4 | jamais une interface inventée |
| Site public réel | le résultat acheté | actes 3 et 4, `/exemples` | jamais un faux site |

### F — Captures produit `[À FIGER]`

Recadrage sur une seule tâche, jamais un écran entier réduit · bordure 1 px Mint, rayon 10 px, aucun cadre de navigateur ni faux bouton de fenêtre · aucune ombre, au maximum une ombre presque invisible si la capture se confond avec le fond blanc · aucune perspective, toujours de face · données réelles ou explicitement de démonstration · au maximum une légende sous l'image, aucune bulle, aucune flèche · le lien avec le résultat public se fait par le contenu identique, jamais par un connecteur graphique · l'espace client sur téléphone ne se montre qu'après la question 8.

### G — Mouvement `[À FIGER]`

Trois mouvements autorisés : le rail Métiers `[FAIT]` · une apparition douce des sections au défilement · aux actes 3 ou 4 uniquement, **une seule** transition faisant apparaître le même contenu de la fiche vers la page publique, déclenchée une fois, courte, jamais en boucle, jamais suggérant une publication automatique. Le réglage de réduction des animations désactive les deux derniers. Toute information reste compréhensible sans aucun mouvement.

---

## 9. Responsive `[À FIGER]`, sauf Hero et Métiers `[FAIT]`

| Section | Desktop | Tablette | Mobile |
|---|---|---|---|
| Hero | deux colonnes, premier écran | deux colonnes resserrées | texte, puis image, boutons empilés |
| Métiers | 4 cartes + amorce | 3 cartes | 1 carte + ~22 % de la suivante |
| Acte 3 | asymétrie deux tiers / un tiers | idem, écart réduit | résultat public seul, puis fiche recadrée |
| Acte 4 | trois états en ligne | trois états sur deux lignes | trois états empilés |
| Acte 5 | deux colonnes | deux colonnes | deux blocs empilés |
| Offre | bloc centré 640 px | idem | pleine largeur, prix en premier |
| Réassurance | colonne 760 px | idem | accordéon |
| En-tête | liens visibles | liens visibles | marque + Démarrer |
| Pied de page | 4 colonnes | 2 colonnes | 1 colonne |

Non négociable : aucun texte de capture illisible, aucun débordement horizontal, zones tactiles de 44 px minimum, respect de la zone sûre en bas d'écran.

---

## 10. Matrice visuelle

| Section | Illustration | Photo réelle | Capture produit | Site public réel | À produire |
|---|---|---|---|---|---|
| Hero | non | **oui** | non | non | photographie horizontale d'un professionnel au travail, lumière naturelle, propriété SUPORDO |
| Métiers | **oui** | non | non | non | rien, les dix illustrations existent |
| Acte 3 | non | non | **oui** | **oui** | capture de l'écran des réalisations recadrée sur une fiche ; capture de la page publique correspondante |
| Acte 4 | non | **oui** | **oui** | **oui** | une photo de chantier, la même fiche, la même réalisation en ligne — même photo, même titre, même ville |
| Actes 5, 6, 7, pied de page | non | non | non | non | aucun visuel |

---

## 11. Système de sections : six familles

| Famille | Objectif | Densité | Visuel | Mobile | Ne pas utiliser |
|---|---|---|---|---|---|
| Ouverture éditoriale | poser la promesse | faible | photo réelle | texte puis image | jamais deux fois par page |
| Reconnaissance | « c'est pour moi » | moyenne | illustrations | rail au doigt | jamais pour présenter une fonction |
| Preuve appariée | montrer l'entrée et le résultat | moyenne | capture + site réel | empilée, résultat d'abord | jamais sans contenu réel identique ; jamais ailleurs qu'aux actes 3 et 4 |
| Partage typographique | clarifier qui fait quoi | faible | aucun | deux blocs | jamais pour une liste de fonctions |
| Bloc de décision | prix, ou action finale | très faible | aucun | pleine largeur | jamais sous forme de grille de forfaits |
| Questions-réponses | lever les objections | forte en texte | aucun | accordéon | jamais au milieu du récit |

Règle anti-monotonie : deux familles identiques ne se suivent jamais, et le fond change à chaque section. Explicitement refusé : toute famille « trois ou quatre cartes avec une icône dans un carré ».

---

## 12. Système sémantique

**Recommandé** : entreprise · métier · chantier · réalisation · client · commune · zone d'intervention · site · photo · travail réalisé · renseigner · mettre à jour · en ligne · pris en charge.

**Interdit** : digital · solution · plateforme · booster · présence en ligne · expérience digitale · révolutionner · tout-en-un · puissant · innovant · en quelques clics · sur-mesure · clé en main · visibilité · sans effort. Et, parce qu'ils décrivent le logiciel plutôt que le métier : CMS · back-office · tableau de bord · éditeur · constructeur de site · module · fonctionnalité.

**Audit des formulations actuelles** — corrections à traiter dans une passe ultérieure, hors des cinq lots :

| Formulation | Verdict |
|---|---|
| « site pro » | à conserver : c'est l'objet acheté, dans les mots du client |
| « pensé pour votre métier » | à conserver, parce que les dix illustrations le prouvent immédiatement |
| « espace SUPORDO » | à conserver, mais à prouver visuellement à l'acte 3 avant d'y attacher la valeur |
| « faire vivre » | à remplacer à terme : compréhensible mais générique. Pistes : « mettre à jour », « tenir à jour » |
| « simple » | à employer avec parcimonie, jamais comme différenciation : la simplicité se démontre à l'acte 4 |
| « sans avoir à gérer votre site » | à corriger : ambigu, le client renseigne bien ses contenus. Piste : « sans avoir à construire ni mettre en page votre site » |

**Ton** : phrases courtes, voix active. « Renseigner » du côté du client, « présenter » du côté de SUPORDO. Aucun superlatif, aucun point d'exclamation. Le conditionnel uniquement quand une chose dépend d'une validation réelle.

---

## 13. Référencement structurel

### Doctrine d'indexation — unique

**Les deux pages légales sont indexées ; seule la page de confirmation de `/demarrer` est non indexée.** Une mention légale est une information publique qu'un prospect a le droit de trouver, alors qu'une page de confirmation n'a aucun sens hors de son parcours.

### Accueil ou page produit

`[RETENU]` : l'accueil vend SUPORDO Sites aujourd'hui, et `/sites` n'est pas créée — une page identique à l'accueil serait une duplication pénalisée et sans intérêt pour le visiteur. Deux règles d'écriture préparent la suite sans rien coûter : le pied de page porte la phrase de marque mère, et chaque acte reste un composant autonome, déplaçable tel quel vers `/sites` le jour où un second produit existera.

### À créer côté supordo.com

Un plan de site propre au domaine SUPORDO — aujourd'hui vide · une adresse canonique par page, et un choix unique entre `supordo.com` et `www.supordo.com` (question 7) · une image d'aperçu social réelle pour l'accueil — absente aujourd'hui · un seul H1 par page.

| Page | Intention de recherche | H1 | Risque de cannibalisation |
|---|---|---|---|
| `/` | site internet pour artisan, agence web artisan | « Un vrai site pro… » | avec `/tarifs` si elle est créée |
| `/demarrer` | aucune, page de conversion | « Parlons de votre site. » | aucun |
| `/exemples` | exemple de site artisan | « Des sites déjà en ligne. » | aucun |
| `/tarifs` | prix site internet artisan | « Une offre, tout compris. » | avec l'acte 6 : la section devra alors se réduire à un résumé |
| `/metiers/<metier>` | site internet pour <métier> | « Un site pour votre activité de <métier>. » | fort entre pages métier si le texte est recopié |

Données structurées : uniquement l'identité de l'entreprise SUPORDO, et seulement quand les mentions légales existent.

---

## 14. Risques

1. **Le plus probable** : construire les actes 3 et 4 sans capture réelle ni accord client, et fabriquer une interface de démonstration. SUPORDO devient alors exactement ce qu'il refuse d'être.
2. La famille « preuve appariée » répétée à chaque section : le geste devient un tic.
3. L'acte 4 sans sa phrase de généralisation : SUPORDO passe pour une application photo.
4. L'acte 5 qui dérive vers une liste de fonctions : la page devient de la documentation.
5. Publier une offre dont les conditions ne sont pas tranchées : perte de confiance au moment décisif.
6. Une transition animée qui laisse croire à une publication automatique : promesse fausse.
7. Dix pages métier au contenu proche : dilution.
8. Une phrase de marque mère trop appuyée avant qu'un second produit existe : le visiteur ne sait plus ce qui est vendu.
9. Montrer l'espace client sur téléphone sans avoir vérifié son ergonomie.
10. Laisser un seul bouton inerte : le visiteur conclut que le produit n'existe pas.

---

## 15. Questions ouvertes `[OUVERT]`

1. **Tarif** : publie-t-on 49 € HT/mois et les 0 € de création, ou l'acte 6 reste-t-il sans chiffre au lancement ?
2. **Conditions de l'offre** : engagement, propriété du nom de domaine, cas d'un domaine déjà détenu, résiliation, récupération des contenus, support inclus, modifications comprises, suppléments facturés, délai de mise en ligne.
3. **« Voir un exemple »** : quel site client réel, avec quel accord écrit ?
4. **Destination des demandes `/demarrer`** : boîte email SUPORDO, ou enregistrement en base ? Aucune table commerciale n'existe aujourd'hui.
5. **Captures produit** : compte de démonstration dédié, ou capture d'un client réel avec accord ?
6. **Certifications** : assume-t-on publiquement qu'elles sont saisies par SUPORDO, ou reste-t-on silencieux ?
7. **Adresse canonique** : `supordo.com` ou `www.supordo.com` ?
8. **Espace client sur téléphone** : peut-on le montrer, ou attend-on une vérification d'ergonomie ?

---

## 16. Backlog d'exécution — un seul ordre, cinq lots

### LOT 1 — Rendre la page honnête et actionnable

Objectif : plus aucune promesse sans destination, et un parcours de contact qui fonctionne.

| Sous-tâche | Concerne | Dépend de |
|---|---|---|
| 1.1 Nettoyer l'en-tête : retirer CRM et Ressources, ajouter le bouton « Démarrer » | `SupordoHeader.tsx` | — |
| 1.2 Créer `/demarrer` et son formulaire | nouvelle route, nouveau composant | question 4 |
| 1.3 Créer `/demarrer/confirmation`, non indexée | nouvelle route | 1.2 |
| 1.4 Créer les deux pages sous `/legal/` | 2 nouvelles routes | textes fournis |
| 1.5 Créer le pied de page de marque | nouveau composant, `SupordoLanding.tsx` | 1.4 |
| 1.6 Rendre les boutons du Hero actifs | `SupordoHero.tsx` | 1.2, question 3 |
| 1.7 Déposer ce plan dans `docs/product/plan-directeur-supordo-com.md` | documentation | — |

Validation : aucun élément de menu ni bouton sans destination · une demande réelle arrive à destination · les mentions légales sont accessibles depuis l'accueil · les sites artisans et `/login` strictement inchangés.

### LOT 2 — La preuve appariée (acte 3)

Objectif : montrer la différence SUPORDO sans un mot de jargon.

| Sous-tâche | Concerne | Dépend de |
|---|---|---|
| 2.1 Produire les deux captures sur une même réalisation | médias | questions 5 et 8 |
| 2.2 Construire l'acte 3 | nouveau composant, `SupordoLanding.tsx` | 2.1, Lot 1 |
| 2.3 Valider ou écarter la transition de contenu animée | même composant | 2.2 |

Validation : à froid, une personne comprend sans lire que ce qu'elle renseigne apparaît présenté sur son site · aucune interface inventée · sur téléphone, jamais deux interfaces côte à côte.

### LOT 3 — Démonstration signature et partage des rôles (actes 4 et 5)

| Sous-tâche | Concerne | Dépend de |
|---|---|---|
| 3.1 Produire la photographie de chantier réelle | médias | Lot 2 |
| 3.2 Construire l'acte 4, trois états, avec la phrase de généralisation | nouveau composant | 3.1 |
| 3.3 Construire l'acte 5, deux colonnes | nouveau composant | question 6 |

Validation : trois états et pas cinq · la phrase de généralisation est présente · chaque ligne de l'acte 5 correspond à une capacité PROUVÉE du bloc 1 · aucune automatisation suggérée.

### LOT 4 — Offre et décision (actes 6 et 7)

**Lot bloqué tant que les questions 1 et 2 ne sont pas tranchées.**

| Sous-tâche | Concerne | Dépend de |
|---|---|---|
| 4.1 Construire l'acte 6, offre unique | nouveau composant | questions 1 et 2 |
| 4.2 Construire l'acte 7, questions-réponses et action finale | nouveau composant | question 2 |

Validation : une seule offre, aucun prix barré, aucune réponse inventée.

### LOT 5 — Référencement du domaine SUPORDO et pages secondaires

| Sous-tâche | Concerne | Dépend de |
|---|---|---|
| 5.1 Plan de site et adresse canonique du domaine SUPORDO | fichiers de référencement existants | question 7 |
| 5.2 Image d'aperçu social réelle pour l'accueil | médias, en-tête de page | Lot 3 |
| 5.3 Créer `/exemples` | nouvelle route | accords clients, question 3 |
| 5.4 Créer `/tarifs` uniquement si l'offre le justifie | nouvelle route | Lot 4 |

Validation : un plan de site propre à SUPORDO · une image d'aperçu réelle · **un site artisan strictement inchangé** · zéro exemple fabriqué.

### Hors lots `[REPOUSSÉ]`

La page métier pilote, la correction des formulations du bloc 12, la vérification de contraste de la palette, et le renommage du guide média. Chacune nécessitera son propre feu vert.

---

## Contradictions résolues

1. **Indexation des pages légales** — les deux affirmations contradictoires sont supprimées. Doctrine unique : les pages légales sont indexées, seule la page de confirmation est non indexée.
2. **Deux ordres d'exécution parallèles** — le système P0/P1/P2 est supprimé. Les anciennes références sont devenues les sous-tâches numérotées des cinq lots.
3. **Adresse des mentions légales SUPORDO** — le nom isolé `/supordo-mentions-legales` est remplacé par le préfixe `/legal/`, qui règle aussi le cas de la confidentialité et de tout document légal ultérieur.
4. **Forest « réservé au pied de page »** — formulation ambiguë corrigée : Forest reste la couleur des titres partout ; c'est son usage en fond qui est limité à une occurrence par page.
5. **Statut des règles de design** — les propositions issues de cette analyse ne sont plus présentées au même niveau que les fondations réellement présentes dans le code.
6. **Page de confirmation** — elle n'était mentionnée qu'en passant ; elle devient une adresse explicite du sitemap.

---

## Prêt pour EXEC ?

**OUI.** Le Lot 1 peut démarrer.

Deux questions doivent être tranchées pendant le Lot 1, sans le bloquer au démarrage : la destination des demandes (question 4) avant la sous-tâche 1.2, et le site utilisé par « Voir un exemple » (question 3) avant la sous-tâche 1.6. Les textes légaux doivent être fournis avant la sous-tâche 1.4. Les sous-tâches 1.1, 1.5 et 1.7 ne dépendent d'aucune décision.

Les questions 1 et 2 bloquent uniquement le Lot 4.
