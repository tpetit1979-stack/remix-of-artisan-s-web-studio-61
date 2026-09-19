# Architecture globale de supordo.com

Audit du dépôt puis architecture tranchée. Aucun fichier du produit n'a été modifié.

---

## 1. État actuel du dépôt

### Routes existantes

| URL | Rôle actuel | Hôte | État | Décision |
|---|---|---|---|---|
| `/` | Double : landing SUPORDO si hôte plateforme, sinon site artisan | les deux | Header + Hero + Métiers | MODIFY |
| `/services`, `/services/:slug`, `/:slug`, `/realisations`, `/contact`, `/mentions-legales` | Pages du site d'un artisan | tenant uniquement | complet | KEEP (hors périmètre marketing) |
| `/robots.txt`, `/sitemap.xml`, `/llms.txt` | SEO par artisan | tenant | complet côté artisan, **vide ou 404 sur supordo.com** | MODIFY |
| `/login`, `/forgot-password`, `/update-password`, `/accept-invite` | Accès à l'espace | plateforme | complet | KEEP |
| `/admin/*` (9 écrans) | Espace client | session | complet | KEEP |
| `/super-admin/*` (7 écrans) | Console SUPORDO | session | complet | KEEP |

### Contrainte d'architecture majeure (découverte de l'audit)

Sur supordo.com, **seule l'adresse `/` est réservée à SUPORDO**. Toutes les autres adresses appartiennent au vocabulaire des sites artisans : `/contact`, `/services`, `/realisations`, `/mentions-legales` existent déjà et renvoient une erreur sur supordo.com faute d'artisan à résoudre.

Conséquence tranchée : **aucune page marketing ne doit réutiliser un de ces noms**. Chaque page marketing doit soit porter un nom distinct, soit vivre sous un préfixe dédié. Recommandation : préfixe `/supordo/…` écarté (lourd commercialement), on choisit des noms distincts qui n'entrent pas en collision.

### Incohérences relevées

1. Le menu affiche « Sites / CRM / Tarifs / Ressources » sans destination — dont un produit qui n'existe pas.
2. Les deux boutons du Hero sont inertes (aucune action).
3. Aucun pied de page sur la landing : ni mentions légales, ni phrase de marque.
4. `supordo.com/sitemap.xml` renvoie un plan de site vide, `supordo.com/llms.txt` renvoie une erreur.
5. Hero et Métiers utilisent la même structure (petit label, grand titre, paragraphe) — risque de monotonie pour les actes suivants.

### Ce que le produit sait réellement faire

| Capacité | Statut | Peut être montrée ? |
|---|---|---|
| Services | PROUVÉ | oui |
| Zones d'intervention | PROUVÉ | oui |
| Réalisations : photo, titre, ville, service, publication | PROUVÉ | oui — cœur de la démonstration |
| Équipe | PROUVÉ | oui |
| Marques, logos partenaires | PROUVÉ | oui |
| Demandes reçues (formulaire de contact) | PROUVÉ | oui |
| Informations d'entreprise | PARTIEL — téléphone, email, texte d'accueil, couleurs, référencement ; pas d'adresse ni de mentions administratives | à formuler prudemment |
| Logo de l'entreprise | NON DISPONIBLE côté client — géré par SUPORDO | ne pas promettre |
| Certifications / RGE | NON DISPONIBLE côté client — saisi par SUPORDO | affichable comme « pris en charge par SUPORDO » |
| Aperçu / brouillon avant publication | PARTIEL — un lien ouvre le site réel ; publication au cas par cas pour les réalisations seulement | ne pas promettre d'aperçu |
| Espace client sur téléphone | PARTIEL — menu adapté, formulaires longs non vérifiés | ne pas montrer d'écran produit sur téléphone avant vérification |
| Connexion et redirection selon le rôle | PROUVÉ | oui |

---

## 2. Plan de site cible

```
supordo.com
├── /                      KEEP + MODIFY   page commerciale unique
├── /exemples              LATER           vrais sites clients, quand l'accord existe
├── /demarrer              MODIFY (à créer) unique parcours de prise de contact
├── /tarifs                LATER           seulement si l'offre est figée
├── /metiers/<metier>      LATER           1 page pilote d'abord, jamais 10 d'un coup
├── /supordo-mentions-legales   MODIFY (à créer)  légal plateforme
├── /confidentialite       MODIFY (à créer) obligatoire dès le premier formulaire
└── /login                 KEEP            accès à l'espace client
```

Décisions écartées :
- **`/sites` : REMOVE.** Un seul produit est vendu ; une page produit identique à l'accueil créerait une duplication. L'accueil vend SUPORDO Sites. Quand un second produit existera, l'accueil deviendra un carrefour et `/sites` naîtra à ce moment-là.
- **`/crm` : REMOVE.** Aucune réservation de place.
- **`/contact` : REMOVE au profit de `/demarrer`.** `/contact` est déjà le nom d'une page des sites artisans, et « démarrer » décrit l'action réelle.
- **`/cookies`, `/cgv` : LATER.** Seulement si un paiement en ligne ou un traceur non essentiel apparaît.
- **`/mentions-legales` marketing : impossible sous ce nom** (collision), d'où `/supordo-mentions-legales`.

---

## 3. Architecture de la page d'accueil

| Acte | Question du visiteur | Message | Preuve | Visuel | Appel à l'action | État |
|---|---|---|---|---|---|---|
| 1. Hero | Qu'est-ce que j'achète ? | Un vrai site pro. Un espace simple pour le faire vivre. | — | photographie métier (manquante) | principal + « Voir un exemple » | existant, photo absente |
| 2. Métiers | Est-ce fait pour une entreprise comme la mienne ? | Un site adapté à votre activité | 10 métiers | illustrations SUPORDO | aucun | existant |
| 3. Le site et l'espace reliés | En quoi est-ce différent d'un site classique ? | Votre entreprise évolue, votre site suit | une même réalisation visible dans l'espace puis sur le site | capture produit recadrée + page publique réelle | aucun ou lien vers l'acte 4 | absent |
| 4. Démonstration signature | Qu'est-ce que ça change dans mon quotidien ? | Votre travail devient une preuve visible | trois états : chantier, mise en forme, résultat en ligne | photo réelle + composant réel + page publique | secondaire | absent |
| 5. Qui fait quoi | Que prenez-vous en charge, que puis-je gérer ? | SUPORDO s'occupe du site, vous gardez la main sur les faits | deux colonnes strictement limitées aux capacités prouvées | typographie seule, aucun visuel | aucun | absent |
| 6. Offre | Combien, et qu'est-ce qui est compris ? | Une offre unique | prix + périmètre + conditions | un seul bloc, pas de grille | principal | bloqué par la décision tarifaire |
| 7. Confiance et décision | Puis-je leur confier mon site ? | Réponses aux objections réelles | questions-réponses courtes | aucun visuel | principal identique au Hero | absent |
| 8. Pied de page | Qui est SUPORDO ? | Phrase institutionnelle + légal + accès client | — | — | — | absent |

Architecture validée telle quelle, avec deux ajustements par rapport à la version de référence :
- l'acte 3 arrive bien avant l'acte 4 (comprendre le principe avant la démonstration) ;
- réassurance, questions-réponses et appel final sont fusionnés en un seul acte 7, pour éviter trois fins de page successives.

Rien à ajouter : ni témoignages, ni chiffres, ni logos clients, ni bandeau de fonctionnalités.

---

## 4. Fiche de chaque autre page

### `/demarrer` — priorité lancement

- **Objectif** : recueillir une demande qualifiée et la transmettre à SUPORDO.
- **Intention d'entrée** : « je veux un site, comment ça commence ? »
- **Promesse** : vous décrivez votre activité, SUPORDO prépare le site.
- **Sections** : titre et rappel de ce qui suit · formulaire court (entreprise, métier, ville, téléphone, email, message) · ce qui se passe après en trois étapes factuelles · rappel de ce qui est pris en charge.
- **Preuve requise** : uniquement des faits vérifiables sur le déroulé réel.
- **Visuels** : aucun, ou une seule illustration métier.
- **Action principale** : envoyer la demande. Pas d'action secondaire.
- **Liens entrants** : tous les appels à l'action de l'accueil. **Sortants** : accueil, légal.
- **Titre** : « Démarrer avec SUPORDO Sites ». **H1** : « Parlons de votre site. »
- **Indexation** : oui, page de confirmation en non-indexée.
- **Données nécessaires** : une destination réelle pour les demandes (à trancher, décision 4).
- **État** : absent.

### `/exemples` — après lancement

- **Objectif** : prouver le résultat par de vrais sites clients.
- **Sections** : introduction courte · grille de sites réels (nom, métier, ville, lien) · appel à l'action.
- **Condition bloquante** : accord écrit de chaque artisan. Sans accord, la page n'existe pas. Aucun exemple fabriqué.
- **Titre** : « Exemples de sites SUPORDO ». **H1** : « Des sites déjà en ligne. »
- **État** : absent. Aujourd'hui, le bouton « Voir un exemple » du Hero peut pointer vers un site client réel, avec accord.

### `/tarifs` — après lancement, conditionnelle

- N'existe que si l'offre comporte plusieurs niveaux de lecture ou des conditions trop longues pour une section. Avec une offre unique, le prix reste dans l'acte 6 de l'accueil.
- **H1** : « Une offre, tout compris. » **État** : absent, bloqué par la décision 1.

### `/metiers/<metier>` — futur, une page pilote

- **Objectif** : capter les recherches « site internet pour <métier> ».
- **Condition** : contenu spécifique au métier, exemple réel du métier, aucune phrase recopiée d'une autre page métier.
- **Règle** : une seule page pilote (chauffagiste), mesurée avant toute extension. Jamais dix pages générées.
- **État** : absent.

### `/supordo-mentions-legales` et `/confidentialite` — priorité lancement

- Obligatoires dès qu'un formulaire collecte des données. Contenu fourni par SUPORDO, pas inventé. Indexées, sans appel à l'action.

---

## 5. En-tête et pied de page

**En-tête** — collant, hauteur 64 px sur téléphone, 72 px sur ordinateur, fond Warm légèrement translucide (déjà en place).

- Marque SUPORDO à gauche, lien vers l'accueil.
- Liens au centre, ordinateur uniquement : **Exemples · Tarifs** — et chacun uniquement quand la page existe. « CRM » et « Ressources » sont supprimés.
- À droite : bouton principal « Démarrer » + lien « Se connecter » vers `/login`.
- Téléphone : marque + « Démarrer ». « Se connecter » passe dans un menu simple ou dans le pied de page. Pas de grand menu déroulant.
- Au défilement : simple bordure basse qui apparaît. Aucun rétrécissement, aucune ombre.

**Pied de page** — fond Forest, quatre groupes maximum :

1. **Marque** : « SUPORDO développe des produits simples pour les entreprises de terrain. »
2. **Produit** : SUPORDO Sites, Exemples, Tarifs (selon existence).
3. **Légal** : mentions légales, confidentialité.
4. **Accès client** : Se connecter.

Aucune mention du futur produit. Aucun réseau social sans compte réel.

---

## 6. Mini-spécification design (règles globales)

Reprises telles quelles des composants existants, désormais opposables :

- **Typographie** : Manrope, sous la classe de marque uniquement.
- **Couleurs** : Brand Green `#00875A` (survol `#006F4A`), Forest `#10291C`, Forest Dark `#07140D`, Warm `#FAF8F4`, Mint clair `#EAF4EE`, Mint bordure `#CFE8D8`, Graphite `#3A403B`.
- **Alternance des fonds** : Warm pour la marque et la respiration, blanc pour les actes qui montrent le produit, Forest une seule fois (pied de page), Mint réservé aux surfaces fonctionnelles.
- **Largeur de contenu** : 1200 px. **Largeur de texte** : 650 à 760 px maximum, jamais au-delà.
- **Marges latérales** : 20 px téléphone, 32 px à partir de la tablette.
- **Rythme vertical des sections** : 64 px téléphone, 80 px tablette, 96 px ordinateur.
- **Titres** : H1 36 / 44 / 56 px, interligne 1,08 ; H2 32 / 40 / 48 px, interligne 1,12 ; H3 20 / 24 px. Un seul H1 par page.
- **Petit label** : 12 px, gras, majuscules, interlettrage large, en vert. Un seul par section.
- **Rayons** : 6 px pour les boutons et cartes, 10 px pour les grandes surfaces d'image ou de capture. Rien au-delà.
- **Bordures** : 1 px Mint bordure, systématique. C'est ce qui remplace les ombres.
- **Ombres** : aucune, sauf une ombre presque invisible sous une capture produit si la lisibilité l'exige.
- **Boutons** : hauteur 48 px, 52 px sur ordinateur. Principal vert plein, secondaire blanc bordé. Contour de focus visible obligatoire.
- **Captures produit** : cadrées sur une seule tâche, jamais un écran entier réduit, toujours droites (aucune perspective), bordure fine + rayon 10 px, contenu réel ou explicitement d'exemple.
- **Illustrations métier** : format vertical 4/5, recadrage plein cadre centré, jamais de filtre, jamais de texte ajouté.
- **Animations** : uniquement une apparition douce au défilement, jamais indispensable à la compréhension, désactivée si la personne a réduit les animations.

---

## 7. Différences ordinateur / tablette / téléphone

| Section | Ordinateur | Tablette | Téléphone |
|---|---|---|---|
| Hero | deux colonnes, photo à droite, hauteur du premier écran | deux colonnes resserrées | texte puis photo, boutons empilés pleine largeur |
| Métiers | rail horizontal, 4 cartes + amorce | 3 cartes visibles | 1 carte dominante + ~22 % de la suivante, défilement au doigt |
| Site + espace | composition asymétrique : page publique grande, capture produit plus petite en appui | même logique, écart réduit | **jamais deux interfaces côte à côte** : résultat public d'abord en pleine largeur, capture produit ensuite |
| Démonstration | trois états côte à côte | trois états en deux lignes | trois états empilés, chacun pleine largeur, légende sous chaque |
| Qui fait quoi | deux colonnes | deux colonnes | deux blocs empilés, titres distincts |
| Offre | un bloc centré, 640 px max | idem | pleine largeur, prix en premier |
| Questions-réponses | une colonne 760 px | idem | accordéon, zones tactiles 48 px |
| En-tête | liens visibles | liens visibles | marque + « Démarrer » |
| Pied de page | 4 colonnes | 2 colonnes | 1 colonne, accès client en dernier |

Règles non négociables : aucun texte de capture illisible, aucun débordement horizontal, zones tactiles 44 px minimum, respect de la zone sûre en bas d'écran.

---

## 8. Matrice visuelle

| Section | Illustration métier | Photo réelle | Capture produit | Page publique réelle | À produire |
|---|---|---|---|---|---|
| Hero | non | **oui** | non | non | photographie horizontale d'un professionnel au travail, lumière naturelle, propriété SUPORDO |
| Métiers | **oui** | non | non | non | rien, les 10 illustrations existent |
| Site + espace | non | non | **oui** | **oui** | capture de l'écran des réalisations recadrée sur une fiche ; capture de la page publique correspondante |
| Démonstration | non | **oui** | **oui** | **oui** | une photo de chantier, la même fiche dans l'espace, la même réalisation en ligne — même photo, même titre, même ville |
| Qui fait quoi | non | non | non | non | aucun visuel |
| Offre | non | non | non | non | aucun visuel |
| Questions-réponses | non | non | non | non | aucun visuel |
| Pied de page | non | non | non | non | aucun visuel |

Le lien entre l'acte 3 et l'acte 4 est le contenu lui-même : une seule et même réalisation traverse toute la page. C'est le geste graphique propriétaire de SUPORDO ; il ne coûte aucune décoration.

---

## 9. Conséquences pour le référencement

Déjà en place : titre et description par page, aperçus sociaux, données structurées, plan de site et robots — **mais uniquement pour les sites artisans**.

À créer, côté supordo.com :

- un plan de site propre au domaine SUPORDO (aujourd'hui vide) ;
- une adresse canonique par page marketing, et un choix unique entre `supordo.com` et `www.supordo.com` ;
- une image d'aperçu social réelle pour l'accueil (absente aujourd'hui) ;
- pages légales et page de confirmation en non-indexées ;
- un seul H1 par page, liens internes explicites entre accueil, exemples, tarifs et démarrer ;
- pas de données structurées avant d'avoir une information réelle à déclarer ; le cas échéant, uniquement l'identité de l'entreprise SUPORDO.

À ne pas faire : créer des pages métier avant d'avoir un contenu distinct ; réutiliser un texte d'une page sur une autre.

---

## 10. Ordre d'implémentation

| Réf. | Tâche | Fichiers probables | Dépend de | Risque | Validation |
|---|---|---|---|---|---|
| P0.1 | Nettoyer l'en-tête : retirer CRM et Ressources, ajouter le bouton « Démarrer » | `SupordoHeader.tsx` | — | faible | plus aucun élément de menu sans destination |
| P0.2 | Créer `/demarrer` + son formulaire et sa page de confirmation | nouvelle page, nouveau composant | décision 4 | moyen | une demande réelle arrive à destination |
| P0.3 | Rendre les boutons du Hero actifs | `SupordoHero.tsx` | P0.2, décision 3 | faible | aucun bouton inerte |
| P0.4 | Créer le pied de page de marque | nouveau composant, `SupordoLanding.tsx` | P0.6 | faible | légal accessible depuis l'accueil |
| P0.5 | Acte 3 : le site et l'espace reliés | nouveau composant | captures à produire | **élevé** — c'est la section la plus différenciante | la mécanique est comprise sans lire |
| P0.6 | Pages légales SUPORDO | 2 nouvelles pages | textes fournis | faible | indexation correcte, aucun texte inventé |
| P0.7 | Photographie du Hero | remplacement du bloc réservé | photo à produire | moyen | plus aucune mention « à fournir » |
| P1.1 | Acte 4 : démonstration signature | nouveau composant | P0.5, médias | moyen | trois états, aucune automatisation suggérée |
| P1.2 | Acte 5 : qui fait quoi | nouveau composant | décisions 5 et 6 | faible | chaque ligne correspond à une capacité prouvée |
| P1.3 | Plan de site et aperçus sociaux du domaine SUPORDO | fichiers SEO existants | — | moyen — ne pas casser les sites artisans | un site artisan reste inchangé |
| P1.4 | Acte 6 : offre | nouveau composant | décisions 1 et 2 | moyen | aucune promesse non tranchée |
| P1.5 | Acte 7 : confiance et appel final | nouveau composant | décision 2 | faible | objections réelles traitées |
| P2.1 | `/exemples` | nouvelle page | accords clients | faible | zéro exemple fabriqué |
| P2.2 | `/tarifs` autonome si nécessaire | nouvelle page | P1.4 | faible | aucune duplication avec l'accueil |
| P2.3 | Page métier pilote | nouvelle page | contenu réel | moyen | contenu spécifique mesurable |

---

## 11. Décisions à prendre avant de coder

1. **Tarif** : publie-t-on 49 € HT/mois et les 0 € de création, ou l'acte 6 reste-t-il sans chiffre au lancement ?
2. **Conditions de l'offre** : durée d'engagement, propriété du nom de domaine, résiliation, récupération du contenu, support inclus, modifications comprises, ce qui est facturé en plus.
3. **Bouton « Voir un exemple »** : quel site client réel, avec quel accord ?
4. **Destination des demandes** : boîte email SUPORDO, ou enregistrement dans la base existante ? (aucune table marketing n'existe aujourd'hui.)
5. **Certifications** : assume-t-on publiquement qu'elles sont saisies par SUPORDO, ou reste-t-on silencieux ?
6. **Aperçu avant publication** : le produit n'en a pas ; confirme-t-on qu'on ne l'évoque nulle part ?
7. **Adresse canonique** : `supordo.com` ou `www.supordo.com` ?
8. **Espace client sur téléphone** : peut-on le montrer, ou attend-on une vérification d'ergonomie ?

---

## 12. Ce que j'élimine

- **`/sites`** : doublon de l'accueil tant qu'un seul produit est vendu.
- **`/crm`** et l'entrée « CRM » du menu : un produit inexistant ne construit pas une marque, il signale une page inachevée.
- **`/contact`** en plus de `/demarrer` : deux parcours pour une seule action.
- **« Ressources »** dans le menu : aucune ressource n'existe.
- **Dix pages métier d'emblée** : une page pilote, mesurée.
- **Une grille de trois forfaits** : il n'y a qu'une offre.
- **Une section « fonctionnalités »** : l'acte 5 y répond mieux.
- **Une section de témoignages ou de chiffres** : rien de réel à montrer, et rien ne sera inventé.
- **Deux interfaces miniaturisées côte à côte sur téléphone** : illisible.
- **Toute page réservée « pour plus tard »** : une adresse n'existe que quand elle a quelque chose à dire.
