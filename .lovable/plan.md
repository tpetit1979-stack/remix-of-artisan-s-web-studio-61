# Plan directeur du site commercial SUPORDO

Audit du dépôt, puis architecture, grammaire visuelle et sémantique. Aucun fichier du produit n'a été modifié.

Codes de statut utilisés : **[F]** factuel vérifié dans le code · **[D]** décision déjà prise · **[P]** proposition · **[Q]** question ouverte.

---

## 1. État factuel actuel

### Routes existantes [F]

| URL | Rôle | Hôte | Décision |
|---|---|---|---|
| `/` | Double : landing SUPORDO si hôte plateforme, sinon site artisan | les deux | MODIFY |
| `/services`, `/services/:slug`, `/:slug`, `/realisations`, `/contact`, `/mentions-legales` | Pages du site d'un artisan | artisan uniquement | KEEP, hors périmètre |
| `/robots.txt`, `/sitemap.xml`, `/llms.txt` | Référencement par artisan | artisan | MODIFY côté SUPORDO |
| `/login`, `/forgot-password`, `/update-password`, `/accept-invite` | Accès à l'espace | plateforme | KEEP |
| `/admin/*` (9 écrans) | Espace client | session | KEEP |
| `/super-admin/*` (7 écrans) | Console SUPORDO | session | KEEP |

### Composants marketing existants [F]

`SupordoLanding` assemble `SupordoHeader` → `SupordoHero` → `SupordoTrades`. Aucun autre composant marketing. Pas de pied de page. Tokens `--supordo-*` définis et strictement portés par la classe `.supordo-brand` dans les styles globaux, avec Manrope : aucune page artisan, `/admin` ou `/super-admin` ne porte cette classe. **La séparation des trois couches demandée au point 13 est donc respectée aujourd'hui, et garantie techniquement, pas seulement par convention.**

### Contrainte d'architecture majeure (découverte de l'audit) [F]

Sur supordo.com, **seule l'adresse `/` est réservée à SUPORDO**. Les noms `/contact`, `/services`, `/realisations`, `/mentions-legales` appartiennent déjà au vocabulaire des sites artisans et renvoient une erreur sur supordo.com faute d'artisan à résoudre.

Conséquence tranchée : **aucune page commerciale ne doit réutiliser un de ces noms**, sinon chaque page devra porter une double logique selon le domaine. Cela écarte `/contact` comme adresse commerciale et impose un nom distinct pour les mentions légales de SUPORDO.

### Ce que le produit sait réellement faire [F]

| Capacité | Statut | Peut-on la promettre ? |
|---|---|---|
| Services, zones d'intervention, équipe, marques, logos partenaires | PROUVÉ | oui |
| Réalisations : photo, titre, ville, service, publication au cas par cas | PROUVÉ | oui, cœur de la démonstration |
| Demandes reçues (formulaire de contact du site) | PROUVÉ | oui |
| Connexion et redirection selon le rôle | PROUVÉ | oui |
| Informations d'entreprise | PARTIEL : téléphone, email, texte d'accueil, couleurs, référencement. Pas d'adresse ni de mentions administratives | formuler prudemment |
| Logo de l'entreprise | NON DISPONIBLE côté client, géré par SUPORDO | ne pas promettre |
| Certifications et qualifications | NON DISPONIBLE côté client, saisi par SUPORDO | présentable comme pris en charge par SUPORDO |
| Aperçu ou brouillon avant mise en ligne | PARTIEL : un lien ouvre le site réel ; publication au cas par cas pour les réalisations seulement | ne jamais promettre un aperçu |
| Espace client sur téléphone | PARTIEL : menu adapté, formulaires longs non vérifiés | ne pas montrer d'écran produit sur téléphone avant vérification |

### Incohérences relevées, non corrigées [F]

1. Le menu affiche « Sites / CRM / Tarifs / Ressources » sans aucune destination, dont un produit qui n'existe pas.
2. Les deux boutons du Hero sont inertes.
3. Aucun pied de page : ni mentions légales, ni phrase de marque.
4. `supordo.com/sitemap.xml` renvoie un plan de site vide, `supordo.com/llms.txt` renvoie une erreur.
5. Les documents de marque notent que le contraste de la palette n'a jamais été vérifié formellement.
6. Un guide média porte encore l'ancien nom du projet — signalé, non corrigé.

---

## 2. Décisions à conserver, à ne plus rouvrir [D]

- Manrope, et la palette Brand Green `#00875A`, Forest `#10291C`, Forest Dark `#07140D`, Warm `#FAF8F4`, Mint clair et Mint bordure.
- Tokens scopés à la classe de marque : le design SUPORDO ne contamine jamais les sites artisans.
- Rayons faibles, aucune ombre décorative, aucun gradient, aucun effet de verre, aucun écran incliné.
- Hero et Métiers : composition validée, à ne pas redessiner.
- L'ordre Hero → Métiers.
- « SUPORDO ne décore pas le réel. Il l'organise. »
- Aucune preuve inventée : ni témoignage, ni chiffre, ni client, ni réalisation fictive.
- Le futur second produit n'est pas vendu aujourd'hui.

---

## 3. Problèmes à résoudre

1. Le menu promet quatre destinations qui n'existent pas.
2. Les boutons du Hero ne mènent nulle part : il n'existe aucun parcours de prise de contact.
3. Rien ne prouve encore la différence SUPORDO : le visiteur n'a vu ni un vrai site, ni l'espace client.
4. Aucun pied de page, donc aucune mention légale accessible : bloquant dès le premier formulaire.
5. Le domaine SUPORDO n'a ni plan de site, ni image d'aperçu social.
6. L'offre n'est pas tranchée, ce qui bloque deux sections de la page.
7. Les formulations « faire vivre », « espace SUPORDO », « sans avoir à gérer votre site » et « simple » restent à corriger dans une passe ultérieure : la troisième crée une ambiguïté réelle puisque le client renseigne bien ses contenus.
8. Hero et Métiers partagent la même structure ; les actes suivants doivent rompre ce rythme.
9. Aucun média n'existe pour les actes 3 et 4 : ni photographie de marque, ni capture produit.
10. Le contraste de la palette n'a jamais été vérifié.

---

## 4. Architecture commerciale

```
supordo.com
├── /                            P0   page commerciale unique
├── /demarrer                    P0   unique parcours de prise de contact
├── /supordo-mentions-legales    P0   légal plateforme
├── /confidentialite             P0   obligatoire dès le premier formulaire
├── /exemples                    P1   vrais sites clients, avec accord
├── /tarifs                      P1   seulement si l'offre le justifie
├── /metiers/<metier>            P2   une page pilote, jamais dix
└── /login                       existant, accès client
```

| URL | Rôle | Intention visiteur | Contenu | Action | Preuve requise | Priorité |
|---|---|---|---|---|---|---|
| `/` | Vendre SUPORDO Sites | « qu'est-ce que c'est et est-ce pour moi ? » | 8 actes, voir bloc 5 | Démarrer | site réel + espace réel | P0 |
| `/demarrer` | Recueillir une demande qualifiée | « comment ça commence ? » | formulaire court + déroulé factuel | Envoyer | déroulé réel uniquement | P0 |
| `/supordo-mentions-legales` | Obligation légale | « qui est derrière ? » | mentions fournies | aucune | — | P0 |
| `/confidentialite` | Obligation légale | « que faites-vous de mes données ? » | politique fournie | aucune | — | P0 |
| `/exemples` | Prouver le résultat | « à quoi ressemblera mon site ? » | sites clients réels | Démarrer | accord écrit de chaque artisan | P1 |
| `/tarifs` | Lever l'objection prix | « combien et quelles conditions ? » | offre unique + conditions | Démarrer | conditions tranchées | P1 |
| `/metiers/<metier>` | Capter une recherche métier | « site internet pour <métier> » | contenu et exemple propres au métier | Démarrer | exemple réel du métier | P2 |

Écartées, avec justification :
- **`/sites` : supprimée aujourd'hui** — voir l'arbitrage au bloc 11.
- **`/crm` : supprimée** — aucune réservation de place ; une page inachevée abîme plus la marque qu'une absence.
- **`/contact` : remplacée par `/demarrer`** — collision de nom avec les sites artisans, et « démarrer » décrit l'action réelle. Un seul parcours.
- **`/cookies`, conditions de vente : P2** — seulement si un paiement en ligne ou un traceur non essentiel apparaît.
- **Dix pages métier : refusées** — une page pilote mesurée d'abord.

---

## 5. Page d'accueil, acte par acte

### Acte 1 — Hero [existant]

Question : « Qu'est-ce que c'est ? » · Message : un vrai site professionnel · Preuve : la photographie de marque, encore absente · Desktop : deux colonnes, photo à droite, hauteur du premier écran · Mobile : texte puis photo, boutons empilés pleine largeur · Action : Démarrer + Voir un exemple · Manque : la photographie et les destinations.

### Acte 2 — Métiers [existant]

Question : « Est-ce fait pour une entreprise comme la mienne ? » · Message : un site adapté à votre activité · Preuve : dix métiers reconnaissables · Desktop : rail horizontal, 4 cartes et amorce de la 5ᵉ · Mobile : une carte dominante et ~22 % de la suivante · Action : aucune, délibérément · Manque : rien.

### Acte 3 — Ce que vos clients voient, ce que vous renseignez [absent, section la plus importante]

Question : « Qu'est-ce que j'obtiens réellement, et qu'est-ce qui est différent ? »

Message : votre entreprise évolue, votre site suit. Le contenu que vous renseignez est présenté proprement à vos clients.

Preuve : **une seule et même réalisation**, montrée deux fois. Même photo, même titre, même commune, par exemple « Installation d'un poêle à bois — Aubagne ». À gauche, la page publique. À droite, la fiche telle qu'elle est renseignée dans l'espace.

Desktop : composition asymétrique, le site public occupe environ deux tiers de la largeur visuelle, la capture de l'espace un tiers, légèrement plus basse, sur fond blanc. Aucune flèche, aucune numérotation, aucun cadre de navigateur. Le lien entre les deux est le contenu identique, rien d'autre.

Mobile : **jamais deux interfaces côte à côte.** Le résultat public d'abord, pleine largeur ; la fiche renseignée ensuite, recadrée sur les seuls champs utiles (photo, titre, ville, service).

Action : aucune, ou un lien discret vers l'acte 4.

Éléments réels nécessaires : une capture de l'écran des réalisations recadrée sur une fiche, et la capture de la page publique correspondante, issues d'un site client réel avec accord, ou d'un compte de démonstration.

### Acte 4 — Démonstration signature [absent]

Question : « Est-ce vraiment simple dans mon quotidien ? »

Message : votre travail devient une preuve visible. Puis, discrètement : « Vos réalisations. Mais aussi vos services, vos zones et votre équipe. » Cette phrase de généralisation est indispensable : sans elle, SUPORDO ressemble à une application photo.

Preuve : trois états, une seule et même réalisation que celle de l'acte 3. Chantier terminé, fiche renseignée, résultat en ligne.

Desktop : trois états côte à côte, largeurs égales, une légende factuelle sous chacun. Aucune flèche animée, aucune automatisation suggérée.

Mobile : trois états empilés, chacun pleine largeur, légende sous chaque.

Action : secondaire.

### Acte 5 — Qui fait quoi [absent]

Question : « Concrètement, qui fait quoi ? »

Message : SUPORDO s'occupe de la présentation du site, vous renseignez votre entreprise.

Deux ensembles, strictement limités aux capacités prouvées :

- **SUPORDO** : crée et met en ligne le site, héberge, sécurise, maintient, organise la présentation, fait évoluer le socle commun, saisit les qualifications professionnelles.
- **Vous** : vos services, vos zones d'intervention, vos réalisations et leurs photos, votre équipe, vos marques et partenaires, vos coordonnées.

Preuve : l'exactitude même de la liste. Aucun visuel. Typographie seule, deux colonnes.

Desktop : deux colonnes. Mobile : deux blocs empilés, titres nettement distincts.

Action : aucune.

### Acte 6 — Offre [absent, bloqué]

Question : « Combien et qu'est-ce qui est compris ? » · Message : une offre unique · Desktop et mobile : un seul bloc centré, 640 px maximum, prix en premier, périmètre ensuite, conditions en dernier · Action : Démarrer · Bloqué par les questions 1 et 2 du bloc 13. Structure conçue pour une offre unique : **aucune grille de trois forfaits.**

### Acte 7 — Réassurance et décision [absent]

Question : « Où est le piège ? »

Questions à traiter, avec leur statut :

| Question du visiteur | Statut |
|---|---|
| Dois-je créer moi-même mon site ? | RÉPONSE CONNUE : non |
| Dois-je savoir utiliser un logiciel ? | RÉPONSE CONNUE : non, saisie de champs simples |
| Puis-je modifier mes informations ? | RÉPONSE CONNUE : oui, celles listées à l'acte 5 |
| Le site fonctionne-t-il sur téléphone ? | RÉPONSE CONNUE : oui |
| Qui s'occupe de la maintenance ? | RÉPONSE CONNUE : SUPORDO |
| Que se passe-t-il si je ne publie jamais rien ? | RÉPONSE CONNUE : le site reste en ligne et complet |
| J'ai déjà un nom de domaine, que se passe-t-il ? | DÉCISION COMMERCIALE À PRENDRE |
| Puis-je partir, et que deviennent mon domaine et mes contenus ? | DÉCISION COMMERCIALE À PRENDRE |
| Combien de temps pour être en ligne ? | DÉCISION COMMERCIALE À PRENDRE |

Aucune réponse ne sera rédigée avant d'être tranchée. Desktop : une colonne de 760 px. Mobile : accordéon, zones tactiles de 48 px. Action finale : identique à celle du Hero.

### Acte 8 — Pied de page [absent]

Voir bloc 10.

**Architecture validée, avec deux ajustements** : l'acte 3 précède l'acte 4, car il faut comprendre le principe avant d'en voir la démonstration ; réassurance et appel final sont fusionnés en un seul acte, pour éviter trois fins de page successives. Aucune section ajoutée : ni témoignages, ni chiffres, ni logos clients, ni bandeau de fonctionnalités.

---

## 6. Autres pages

### `/demarrer` — P0

Objectif : recueillir une demande qualifiée. Promesse : vous décrivez votre activité, SUPORDO prépare le site. Sections : titre court · formulaire (entreprise, métier, ville, téléphone, email, message) · ce qui se passe ensuite, en trois étapes factuelles · rappel de ce qui est pris en charge. Aucun visuel, ou une seule illustration métier. Action unique : envoyer. Titre de page : « Démarrer avec SUPORDO Sites ». H1 : « Parlons de votre site. » Page de confirmation non indexée. Dépend de la question 4 du bloc 13.

### `/exemples` — P1

Objectif : prouver le résultat. Sections : introduction courte · grille de sites réels (nom, métier, commune, lien) · appel à l'action. **Condition bloquante : accord écrit de chaque artisan. Sans accord, la page n'existe pas.** H1 : « Des sites déjà en ligne. » En attendant, le bouton « Voir un exemple » du Hero peut pointer vers un site client réel, avec accord.

### `/tarifs` — P1, conditionnelle

N'existe que si l'offre comporte plusieurs niveaux de lecture ou des conditions trop longues pour une section. Avec une offre unique, le prix reste dans l'acte 6. H1 : « Une offre, tout compris. »

### `/metiers/<metier>` — P2

Justifiée uniquement si trois conditions sont réunies : un contenu propre au métier, un exemple réel de ce métier, et aucune phrase recopiée d'une autre page métier. Une seule page pilote, chauffagiste, mesurée avant toute extension. Sans ces conditions, ce sont dix pages faibles qui se cannibalisent.

### Pages légales — P0

Contenu fourni par SUPORDO, jamais inventé. Indexées, sans appel à l'action.

---

## 7. Design system marketing

### A — Typographie

Manrope, sous la classe de marque uniquement.

| Rôle | Mobile | Tablette | Desktop | Interligne |
|---|---|---|---|---|
| H1 | 36 px | 44 px | 56 px | 1,08 · interlettrage −0,02em |
| H2 | 32 px | 40 px | 48 px | 1,12 |
| H3 | 20 px | 22 px | 24 px | 1,25 |
| Corps | 16 px | 16 px | 18 px | 1,6 |
| Petit label | 12 px | 12 px | 14 px | gras, majuscules, interlettrage 0,14em, en vert |
| Légende | 13 px | 13 px | 14 px | gris graphite |

Un seul H1 par page. Un seul petit label par section. Poids utilisés : 400, 500, 600, 800 — rien d'autre.

### B — Grille

Largeur de contenu 1200 px. Largeur de texte 650 à 760 px maximum, jamais au-delà. Marges latérales 20 px sur téléphone, 32 px à partir de la tablette. Douze colonnes sur desktop, gouttière 32 px ; six colonnes sur tablette ; une seule sur téléphone. Rythme vertical entre sections : 64 px téléphone, 80 px tablette, 96 px desktop. Points de rupture : uniquement ceux déjà utilisés dans le code, `sm`, `md`, `lg`.

### C — Couleurs, par fonction et fréquence

| Couleur | Fonction | Fréquence | Où |
|---|---|---|---|
| Warm `#FAF8F4` | fond de marque, respiration | ~40 % des sections | Hero, actes narratifs |
| Blanc | fond de preuve | ~40 % | actes 3, 4, 6 — tout ce qui montre le produit |
| Forest `#10291C` | texte de titre, et un seul fond | titres partout, fond une seule fois | pied de page |
| Forest Dark `#07140D` | variante de contraste | rare | texte sur fond Forest |
| Brand Green `#00875A` | accent, bouton principal, petits labels, contour de focus | ~10 % de la surface | jamais en grande surface |
| Mint clair `#EAF4EE` | surface fonctionnelle, réserve d'image | ponctuel | emplacements produit |
| Mint bordure `#CFE8D8` | toutes les bordures | systématique | **remplace les ombres** |
| Graphite `#3A403B` | texte courant | partout | paragraphes, navigation |

Alternance imposée : deux sections voisines ne partagent jamais le même fond. Forest n'apparaît qu'une fois par page.

### D — Boutons : trois seulement

1. **Principal** : fond vert plein, texte blanc, rayon 6 px, hauteur 48 px (52 px sur desktop). Un seul par section.
2. **Secondaire** : fond blanc, bordure Mint, texte Forest ; au survol, bordure et texte passent au vert.
3. **Lien textuel** : Forest souligné au survol, pour les actions mineures et le pied de page.

Contour de focus visible obligatoire sur les trois. Aucune autre variante, aucun bouton à icône seule, aucun bouton fantôme.

### E — Images : quatre catégories, jamais interchangeables

| Catégorie | Rôle | Où | Interdit |
|---|---|---|---|
| Illustration 3D SUPORDO | univers métier, reconnaissance | Métiers, éventuellement `/demarrer` | jamais présentée comme une réalisation client |
| Photographie réelle | preuve, travail réalisé | Hero, acte 4 | jamais une banque d'images générique |
| Capture produit réelle | montrer comment l'information est organisée | actes 3 et 4 | jamais une interface inventée |
| Site public réel | le résultat acheté | actes 3 et 4, `/exemples` | jamais un faux site |

Une illustration ne remplace jamais une photographie de preuve : c'est la règle la plus facile à enfreindre et la plus coûteuse en crédibilité.

### F — Captures produit : comment montrer une vraie interface

- **Recadrage** : sur une seule tâche, un seul objet. Jamais un écran entier réduit.
- **Cadre** : bordure de 1 px Mint, rayon 10 px. Aucun cadre de navigateur, aucune barre d'adresse, aucun faux bouton de fenêtre.
- **Ombre** : aucune. Au maximum, une ombre presque invisible si la capture se confond avec le fond blanc.
- **Perspective** : aucune. Toujours droite, de face.
- **Données** : réelles, ou explicitement de démonstration. Jamais un chiffre inventé.
- **Annotations** : au maximum une légende sous l'image, en texte courant. Aucune bulle, aucune flèche.
- **Relation avec le résultat public** : le lien se fait par le contenu identique, jamais par un connecteur graphique.
- **Téléphone** : ne montrer l'espace client sur téléphone qu'après vérification d'ergonomie (question 8).

### G — Mouvement : il explique, il ne décore pas

Trois mouvements autorisés, et rien d'autre :

1. Le rail Métiers, défilement au doigt, déjà en place.
2. Une apparition douce des sections au défilement, jamais nécessaire à la compréhension.
3. Dans l'acte 3 ou 4 uniquement : une seule transition qui fait apparaître le même contenu de la fiche vers la page publique. Déclenchée une fois, courte, jamais en boucle, jamais suggérant une publication automatique.

Le réglage de réduction des animations désactive les points 2 et 3. Toute information reste compréhensible sans aucun mouvement.

### H — Responsive

| Section | Desktop | Tablette | Mobile |
|---|---|---|---|
| Hero | deux colonnes, premier écran | deux colonnes resserrées | texte, puis photo, boutons empilés |
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

## 8. Système de sections : six familles, pas plus

| Famille | Objectif | Structure | Densité | Visuel | Mobile | Quand l'utiliser | Quand ne pas l'utiliser |
|---|---|---|---|---|---|---|---|
| **Ouverture éditoriale** | poser la promesse | label, titre, paragraphe, actions, image dominante | faible | photo réelle | texte puis image | une fois par page, en tête | jamais deux fois |
| **Reconnaissance** | « c'est pour moi » | label, titre, paragraphe, rail d'images | moyenne | illustrations | rail au doigt | après l'ouverture | jamais pour présenter une fonction |
| **Preuve appariée** | montrer l'entrée et le résultat | titre court, deux surfaces asymétriques reliées par le même contenu | moyenne | capture produit + site réel | empilée, résultat d'abord | actes 3 et 4 | jamais sans contenu réel identique |
| **Partage typographique** | clarifier qui fait quoi | titre, deux colonnes de listes | faible | aucun | deux blocs | une fois par page | jamais pour une liste de fonctions |
| **Bloc de décision** | prix, ou action finale | titre, bloc unique encadré, action | très faible | aucun | pleine largeur | une à deux fois en fin de page | jamais sous forme de grille de forfaits |
| **Questions-réponses** | lever les objections | titre, accordéon | forte en texte | aucun | accordéon | une fois, avant l'action finale | jamais au milieu du récit |

Règle anti-monotonie : deux familles identiques ne se suivent jamais, et le fond change à chaque section. La famille « preuve appariée » est le geste propriétaire de SUPORDO ; elle ne doit apparaître qu'aux actes 3 et 4, sinon elle devient un tic.

Explicitement refusé : toute famille « trois ou quatre cartes avec une icône dans un carré ». C'est la forme qui rendrait SUPORDO interchangeable.

---

## 9. Système sémantique

### Vocabulaire recommandé

entreprise · métier · chantier · réalisation · client · commune · zone d'intervention · site · photo · travail réalisé · renseigner · mettre à jour · en ligne · pris en charge.

### Vocabulaire interdit

digital · solution · plateforme · booster · présence en ligne · expérience digitale · révolutionner · tout-en-un · puissant · innovant · en quelques clics · sur-mesure · clé en main · visibilité · sans effort.

Interdits supplémentaires propres à ce projet, parce qu'ils décrivent le logiciel plutôt que le métier : CMS, back-office, tableau de bord, éditeur, constructeur de site, module, fonctionnalité.

### Audit des formulations actuelles

| Mot ou phrase | Verdict |
|---|---|
| « site pro » | **à conserver.** C'est l'objet acheté, dit dans les mots du client. |
| « pensé pour votre métier » | **à conserver**, parce que les dix illustrations le prouvent immédiatement. Sans cette preuve, ce serait une phrase creuse. |
| « espace SUPORDO » | **à conserver, mais à prouver visuellement avant d'y attacher la valeur.** Peut devenir un nom propre au produit, à condition que l'acte 3 le montre. Employé seul, il ne veut rien dire. |
| « faire vivre » | **à remplacer à terme.** Compréhensible mais générique, et non mesurable. Piste : « mettre à jour », « renseigner », « tenir à jour ». |
| « simple » | **à employer avec parcimonie, et jamais comme différenciation.** Tous les concurrents le disent. La simplicité se démontre à l'acte 4, elle ne s'affirme pas. |
| « sans avoir à gérer votre site » | **à corriger.** Ambigu : le client renseigne bien ses contenus. Piste : « sans avoir à construire ni mettre en page votre site ». |

Ces corrections appartiennent à une passe ultérieure, pas à cette mission.

### Ton

Phrases courtes. Voix active. Le verbe « renseigner » du côté du client, « présenter » du côté de SUPORDO. Aucun superlatif. Aucun point d'exclamation. Le conditionnel uniquement quand une chose dépend d'une validation réelle : « elle peut ensuite apparaître sur votre site » plutôt que « elle apparaît automatiquement ».

---

## 10. Navigation et pied de page

### En-tête

Collant, 64 px sur téléphone, 72 px sur desktop, fond Warm légèrement translucide — déjà en place.

- Marque SUPORDO à gauche, lien vers l'accueil.
- Liens au centre, desktop uniquement : **Exemples · Tarifs**, et chacun seulement quand sa page existe. « CRM » et « Ressources » sont supprimés.
- À droite : bouton principal « Démarrer », puis lien « Se connecter » vers `/login`, visuellement plus discret que le bouton. Les deux populations sont servies sans ambiguïté.
- Téléphone : marque et « Démarrer » uniquement. « Se connecter » descend dans le pied de page, ou dans un menu simple si les liens du centre existent.
- Au défilement : une bordure basse apparaît. Aucun rétrécissement, aucune ombre, aucun changement de couleur.
- Aucun grand menu déroulant.
- **Évolution future** : quand un second produit existera, une seule entrée « Produits » remplacera « Exemples » et ouvrira une liste de deux lignes. Rien à préparer aujourd'hui.

### Pied de page

Fond Forest, quatre groupes, pas un de plus :

1. **Marque** : « SUPORDO développe des produits simples pour les entreprises de terrain. »
2. **Produit** : SUPORDO Sites, Exemples, Tarifs — selon existence.
3. **Légal** : mentions légales, confidentialité.
4. **Accès client** : Se connecter.

Aucune mention du futur produit. Aucun réseau social sans compte réel. Aucun faux plan de site.

---

## 11. Référencement et arbitrage accueil / page produit

### Accueil ou page produit : les trois options

| | Avantages | Risques | Conversion | Référencement | Futur second produit | Coût aujourd'hui |
|---|---|---|---|---|---|---|
| **A — accueil = SUPORDO Sites** | une seule page à soigner, message immédiat, aucun clic perdu | l'accueil devra être refondu quand un second produit arrivera | la meilleure : pas d'étape intermédiaire | la meilleure : toute l'autorité sur une seule adresse | refonte à prévoir | nul |
| **B — accueil de marque + page `/sites`** | prêt pour plusieurs produits, marque mère lisible | l'accueil devient une page de tri sans argument ; deux pages presque identiques | la plus faible : un clic de plus avant le premier argument | mauvaise : deux pages sur le même sujet se cannibalisent | prêt | élevé, pour un bénéfice nul aujourd'hui |
| **C — accueil Sites, structuré pour évoluer** | conversion de A, migration préparée | demande de la discipline d'écriture | équivalente à A | équivalente à A | migration en une passe | quasi nul |

**Recommandation : option C.** L'accueil vend SUPORDO Sites aujourd'hui, mais deux règles d'écriture préparent la suite sans rien coûter : le pied de page porte la phrase de marque mère, et chaque acte de l'accueil reste un composant autonome, si bien qu'il pourra être déplacé tel quel vers `/sites` le jour où un second produit existera. **`/sites` n'est pas créée aujourd'hui** : une page identique à l'accueil est une duplication, pénalisée par les moteurs et sans intérêt pour le visiteur.

### Conséquences pour le référencement

Déjà en place, mais **pour les sites artisans uniquement** : titre et description par page, aperçus sociaux, données structurées, plan de site, robots.

À créer côté supordo.com :

- un plan de site propre au domaine SUPORDO — aujourd'hui vide ;
- une adresse canonique par page, et un choix unique entre `supordo.com` et `www.supordo.com` (question 7) ;
- une image d'aperçu social réelle pour l'accueil — absente aujourd'hui ;
- pages légales et page de confirmation en non-indexées ;
- un seul H1 par page.

| Page | Intention de recherche | H1 | Sujet dominant | Risque de cannibalisation |
|---|---|---|---|---|
| `/` | site internet pour artisan, agence web artisan | « Un vrai site pro… » | le site professionnel | avec `/sites` si elle existait, et avec `/tarifs` |
| `/demarrer` | aucune, page de conversion | « Parlons de votre site. » | prise de contact | aucun |
| `/exemples` | exemple de site artisan | « Des sites déjà en ligne. » | la preuve | aucun |
| `/tarifs` | prix site internet artisan | « Une offre, tout compris. » | le prix | avec l'acte 6 de l'accueil : la section devra alors se réduire à un résumé |
| `/metiers/<metier>` | site internet pour <métier> | « Un site pour votre activité de <métier>. » | le métier | fort entre pages métier si le texte est recopié |

Données structurées : seulement l'identité de l'entreprise SUPORDO, et seulement quand les mentions légales existent. Rien d'autre à déclarer.

---

## 12. Risques

1. **Le risque le plus probable** : construire les actes 3 et 4 sans capture réelle ni accord client, et fabriquer une interface de démonstration. SUPORDO devient alors exactement ce qu'il refuse d'être.
2. La famille « preuve appariée » répétée à chaque section : le geste devient un tic.
3. L'acte 4 sans sa phrase de généralisation : SUPORDO passe pour une application photo.
4. L'acte 5 qui dérive vers une liste de fonctions : la page devient de la documentation.
5. Publier une offre dont les conditions ne sont pas tranchées : perte de confiance au moment décisif.
6. Une transition animée entre la fiche et le site qui laisse croire à une publication automatique : promesse fausse.
7. Dix pages métier au contenu proche : dilution et pages faibles.
8. Une phrase de marque mère trop appuyée avant qu'un second produit existe : le visiteur ne sait plus ce qui est vendu.
9. Montrer l'espace client sur téléphone sans avoir vérifié son ergonomie.
10. Laisser un seul bouton inerte : le visiteur conclut que le produit n'existe pas.

---

## 13. Questions encore ouvertes

1. **Tarif** : publie-t-on 49 € HT/mois et les 0 € de création, ou l'acte 6 reste-t-il sans chiffre au lancement ?
2. **Conditions de l'offre** : durée d'engagement, propriété du nom de domaine, cas d'un domaine déjà détenu, résiliation, récupération des contenus, support inclus, modifications comprises, ce qui est facturé en plus, délai de mise en ligne.
3. **Bouton « Voir un exemple »** : quel site client réel, avec quel accord écrit ?
4. **Destination des demandes** : boîte email SUPORDO, ou enregistrement en base ? Aucune table commerciale n'existe aujourd'hui.
5. **Captures produit** : compte de démonstration dédié, ou capture d'un client réel avec accord ?
6. **Certifications** : assume-t-on publiquement qu'elles sont saisies par SUPORDO, ou reste-t-on silencieux ?
7. **Adresse canonique** : `supordo.com` ou `www.supordo.com` ?
8. **Espace client sur téléphone** : peut-on le montrer, ou attend-on une vérification d'ergonomie ?

---

## 14. Plan d'exécution, cinq lots

### Lot 1 — Rendre la page honnête et actionnable

Objectif : plus aucune promesse sans destination, et un parcours de contact qui fonctionne.
Concerne : l'en-tête, le Hero, un nouveau pied de page, la page `/demarrer` et sa confirmation, les deux pages légales.
Dépend de : questions 3, 4, 7 ; textes légaux fournis.
Validation : aucun élément de menu ni bouton sans destination ; une demande réelle arrive à destination ; les mentions légales sont accessibles depuis l'accueil.

### Lot 2 — La preuve appariée (acte 3)

Objectif : montrer la différence SUPORDO sans un mot de jargon.
Concerne : un nouveau composant, `SupordoLanding`, deux captures à produire.
Dépend de : lot 1, questions 5 et 8.
Validation : à froid, une personne comprend sans lire que ce qu'elle renseigne apparaît présenté sur son site ; aucune interface inventée ; sur téléphone, jamais deux interfaces côte à côte.

### Lot 3 — La démonstration signature (acte 4) et le partage des rôles (acte 5)

Objectif : prouver la simplicité au quotidien, puis clarifier qui fait quoi.
Concerne : deux nouveaux composants.
Dépend de : lot 2, question 6.
Validation : trois états et pas cinq ; la phrase de généralisation est présente ; chaque ligne de l'acte 5 correspond à une capacité prouvée par le code.

### Lot 4 — Offre et décision (actes 6 et 7)

Objectif : lever l'objection prix et les objections de sortie.
Concerne : deux nouveaux composants.
Dépend de : questions 1 et 2 — **lot bloqué tant qu'elles ne sont pas tranchées**.
Validation : une seule offre, aucun prix barré, aucune réponse inventée dans les questions-réponses.

### Lot 5 — Référencement du domaine SUPORDO et pages secondaires

Objectif : rendre le site commercial indexable et prouvable.
Concerne : les fichiers de référencement existants, `/exemples`, éventuellement `/tarifs`.
Dépend de : lots 1 à 4, accords clients.
Validation : un plan de site propre à SUPORDO, une image d'aperçu social réelle, **et un site artisan strictement inchangé** ; zéro exemple fabriqué.

La page métier pilote reste hors de ces cinq lots : elle n'est justifiée qu'après une mesure de trafic réel.
