# SUPORDO — Marketing Visual Foundations v0.1

Système visuel unique, applicable à `supordo.com`, SUPORDO Sites et SUPORDO CRM. Ce document est la planche écrite ; la planche visuelle l'accompagne. Aucune modification du dépôt.

## 1. Couleurs

| Nom | Hex | Rôle | Autorisé | Interdit | Texte recommandé |
|---|---|---|---|---|---|
| Forest 950 | `#07140D` | Masse la plus sombre | Footer, grande section de contraste | Texte courant, petites cartes | Blanc / Mint 100 |
| Forest 900 | `#10291C` | Texte principal, navigation | Titres, nav, bordure forte à faible opacité | Grands aplats de fond | Warm 50 |
| Green 700 | `#14663E` | Interaction forte secondaire | Hover du bouton primaire, lien actif, eyebrow | Fond de section | Blanc |
| Green 500 | `#1E9E5A` | Couleur de marque | Bouton primaire, lien, signature, puce | Fond de section, texte long | Blanc |
| Green 300 | `#7ACB9C` | Illustration, éléments secondaires | Trait d'illustration, anneau de focus, texte secondaire sur Forest | Texte sur fond clair | Forest 900 |
| Mint 200 | `#CFE8D8` | Surfaces mises en avant | Bordure discrète, badge, surface soulignée | Fond général | Forest 900 |
| Mint 100 | `#EAF4EE` | Backgrounds doux | Section alternée, surface de carte calme | Bouton | Forest 900 |
| Warm 50 | `#FAF8F4` | Fond général, légèrement chaud | Fond de page par défaut | Carte posée sur Warm 50 | Forest 900 |
| White | `#FFFFFF` | Cards, surfaces ponctuelles | Carte, panneau produit | Fond de page entier | Forest 900 |
| Graphite | `#3A403B` | Texte quand Forest est trop dur | Paragraphes, métadonnées, annotations | Titres principaux | — |
| Clay 500 | `#C4622D` | Accent fonctionnel unique | Un seul état : « à faire », point d'alerte | Décoration, second vert, bouton | Blanc |

Règles : aucun bleu, aucun violet, aucun gris-bleu, aucun gradient. Clay n'apparaît jamais deux fois sur le même écran.

## 2. Typographie — 7 styles, pas plus

Une seule famille sans-serif contemporaine (Inter). Jamais de serif, jamais de condensé.

| Style | Poids | Desktop | Mobile | Interligne | Interlettrage | Largeur max |
|---|---|---|---|---|---|---|
| Display / H1 | 700 | 56 px | 36 px | 1,08 | −0,03 em | 14 mots |
| H2 | 600 | 36 px | 28 px | 1,15 | −0,02 em | 16 mots |
| H3 | 600 | 24 px | 21 px | 1,3 | −0,01 em | 18 mots |
| Body Large | 450 | 19 px | 17 px | 1,55 | 0 | 62 caractères |
| Body | 400 | 16 px | 16 px | 1,6 | 0 | 68 caractères |
| Small | 400 | 13 px | 13 px | 1,55 | 0 | 68 caractères |
| Label / eyebrow | 600 | 11 px | 11 px | 1,2 | 0,12 em, capitales | 6 mots |

## 3. Boutons

Géométrie commune : hauteur 44 px desktop / 48 px mobile, rayon 6 px, padding X 24 px (20 px mobile), corps 15 px / 600, jamais d'ombre, jamais de pill, jamais de gradient.

| Type | Normal | Hover | Focus | Désactivé |
|---|---|---|---|---|
| Primaire | fond Green 500, texte blanc | fond Green 700 | anneau 2 px Green 300, décalage 2 px | fond Mint 200, texte Green 300 |
| Secondaire | bordure 1 px Forest 900, texte Forest 900 | fond Mint 100 | même anneau | bordure et texte Mint 200 |
| Tertiaire / texte | texte Green 500 + flèche | texte Green 700, flèche avancée de 2 px | anneau autour du libellé | texte Mint 200 |
| Primaire sur Forest 950 | fond Green 500, texte blanc | fond Green 300, texte Forest 950 | anneau blanc à 40 % | fond blanc à 12 % |

Une icône au maximum, 16 px, toujours à droite, jamais décorative. Même système en marketing et dans le CRM.

## 4. Rayons, bordures, ombres

- Rayon S 4 px (champs, badges) · M 6 px (boutons, cartes, photos) · L 10 px (grandes surfaces produit). Rien d'autre.
- Bordure discrète : 1 px Mint 200. Bordure forte : 1 px Forest 900 à 12 %.
- Ombre 1 : `0 1px 2px` Forest 950 à 5 % — pose un élément. Ombre 2 : `0 6px 16px -6px` Forest 950 à 10 % — ne s'utilise que lorsqu'une surface chevauche une photo. Aucune autre ombre ; jamais d'esthétique de cartes flottantes.

## 5. Espacement et grille

Largeur max 1200 px · 12 colonnes · gouttières 32 px desktop, 24 px tablette, 16 px mobile · marges latérales 32 / 24 / 20 px. Section standard 96 px (72 px mobile), section compacte 64 px (48 px mobile). Rythme vertical par pas de 8 px. Header, hero, sections et footer partagent le même axe gauche et la même mesure.

## 6. Header

Desktop, hauteur 72 px : marque SUPORDO à gauche, navigation Sites · CRM · Tarifs · Ressources, puis « Se connecter » en lien texte et un seul bouton primaire. Fond Warm 50 sans bordure au repos ; au scroll, fond blanc et bordure basse 1 px Mint 200. Mobile, hauteur 64 px : marque + bouton menu, navigation en panneau plein écran sur Warm 50, zones tactiles 44 px minimum.

## 7. Cartes

Padding 32 px (24 px mobile), rayon M, bordure discrète, ombre 1.
- Carte simple : titre H3, un paragraphe Body, éventuel lien flèche.
- Carte produit : photo en haut ou à gauche, eyebrow, titre, métadonnée sur une ligne.
- Carte témoignage : fond Mint 100, citation en Body Large, prénom et métier en Small. Jamais de citation inventée.
- Surface produit intégrée : rayon L, ombre 2, chevauche la photo à plat, jamais inclinée.

## 8. Petits éléments

Eyebrow (Label, Green 700). Badge : Mint 200, texte Green 700, 11 px, rayon S. Chip : bordure Mint 200 sur blanc. Séparateur : 1 px Mint 200. Lien flèche : Green 500, flèche qui avance de 2 px au survol. Anneau de focus : 2 px Green 300 avec 2 px de décalage, partout. Mini-indicateur : point 6 px, Clay 500 pour un seul état. Icônes : trait 1,5 px, 20 px, angles nets, jamais remplies. Aucun vocabulaire blueprint ou dossier technique.

## 9. Photographie

Ratios autorisés : 4:5 (portrait dominant), 16:9 (bande), 1:1 (petite vignette). Rayon M, jamais de bordure, jamais de filtre vert — couleurs naturelles. Cadrage sur le geste et la matière ; jamais d'artisan posé face caméra. Une surface produit peut chevaucher la photo à angle droit, avec ombre 2. Légende optionnelle en Small Graphite sous l'image. Sur mobile, la photo passe pleine largeur et le ratio remonte vers 4:5.

## 10. Rythme des surfaces

Séquence type : Warm 50 → Mint 100 → Warm 50 → Forest 950 → Warm 50 → Mint 100 → Forest 950 (footer). Jamais plus de deux sections claires consécutives sans respiration ; une seule grande masse Forest avant le footer.

## 11. Footer

Grande surface Forest 950, 96 px de respiration haute. Marque SUPORDO en grand, puis colonnes Sites · CRM · Produit · Ressources · Entreprise, plus Connexion et mentions légales sur la ligne basse séparée par une bordure blanche à 10 %. Vert utilisé avec parcimonie : un seul lien d'action en Green 300. Le footer termine la page visuellement.

## 12. Mouvement

Hover bouton 140 ms ease-out (couleur seule). Lien 120 ms. Carte 180 ms, élévation de l'ombre 1 vers l'ombre 2, aucun déplacement vertical au-delà de 2 px. Apparition d'une photo ou d'une surface produit : fondu 260 ms. Navigation mobile 200 ms. Aucun rebond, aucun parallaxe, aucune animation gadget.

## Points à trancher

- Accent Clay 500 conservé ou système strictement vert ?
- Marque écrite SUPORDO seul, ou SUPORDO suivi de Sites / CRM selon la page ?
- CRM figure dans la navigation comme destination de marque ; aucune fonctionnalité CRM n'est présentée comme disponible.
