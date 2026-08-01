# Guide de style média LIGNIA — V1

Référence unique pour toute production de média destiné à `trade_media_library`
(photo réelle ou génération IA), quel que soit le métier. Objectif : qu'un
visiteur reconnaisse la "patte" LIGNIA en parcourant des sites de métiers
différents, sans jamais avoir l'air d'un stock générique interchangeable.

Ce document complète la doctrine de gouvernance (MEDIA-001 : `source_type`,
`review_status`, nommage) — il ne la remplace pas. Un média peut respecter
ce guide de style et rester `pending` tant qu'il n'a pas été qualifié en
provenance.

---

## 1. Identité visuelle LIGNIA

- **Lumineux, jamais sombre** — même les scènes de conduit de cheminée ou de
  sous-sol technique doivent être correctement éclairées (lumière d'appoint
  acceptée), jamais une ambiance sombre/anxiogène.
- **Angle légèrement en contre-plongée** — valorise l'artisan et son geste,
  évite l'angle plongeant qui écrase le sujet.
- **Outils visibles mais peu nombreux** — 1 à 3 outils identifiables dans le
  cadre suffisent à ancrer le métier ; un établi encombré de dizaines
  d'objets distrait du sujet.
- **Artisan propre et rassurant** — tenue de travail correcte, geste maîtrisé,
  jamais négligé ni mis en scène de façon caricaturale.
- **Couleurs naturelles** — colorimétrie fidèle, pas de filtre saturé,
  pas de virage teinte artificiel.
- **Profondeur de champ modérée** — léger flou d'arrière-plan acceptable
  pour isoler le sujet, jamais un bokeh extrême façon portrait studio.
- **Pas de HDR excessif** — aucun halo, aucun contraste local exagéré.
- **Ambiance premium, jamais low-cost** — cadrage soigné, pas de photo prise
  "sur le vif" avec un téléphone dans de mauvaises conditions.

## 2. Style photo réelle

- Focale standard à légèrement grand-angle (équivalent 24-50mm), jamais de
  fisheye ni de téléobjectif compressé.
- Lumière naturelle ou lumière de chantier/atelier correctement équilibrée
  (température de couleur cohérente, pas de dominante orange/verte).
- Sujet net, arrière-plan qui peut être légèrement flou mais reste identifiable
  (on doit comprendre où la scène se déroule).
- Aucune personne réelle non consentante reconnaissable. Un modèle avec
  release, un artisan flouté au visage, ou une scène sans personne sont tous
  acceptables.

## 3. Style IA (génération)

La génération IA est une source légitime (`source_type = 'ai_generated'`),
à condition de respecter strictement ce guide — un rendu IA ne doit jamais
être identifiable comme tel au premier regard.

**Structure de prompt recommandée** (à adapter par métier/service) :

```
Photo réaliste, style reportage professionnel, [métier] en action
sur [contexte précis du service], lumière naturelle douce,
angle légèrement en contre-plongée, profondeur de champ modérée,
couleurs naturelles, ambiance premium et rassurante,
1 à 2 outils visibles, tenue de travail propre,
pas de texte, pas de logo, pas de watermark,
format [ratio cible], haute résolution, sans artefacts,
pas de style illustration, pas de rendu 3D stylisé
```

Exemple concret (ramonage, service_card) :
```
Photo réaliste, style reportage professionnel, ramoneur en action
nettoyant un conduit de cheminée depuis un toit en ardoise,
lumière naturelle douce de fin de matinée, angle légèrement
en contre-plongée, profondeur de champ modérée, couleurs naturelles,
ambiance premium et rassurante, brosse de ramonage visible,
tenue de travail propre, pas de texte, pas de logo, pas de watermark,
ratio 4:3, haute résolution, sans artefacts, pas de style illustration
```

**Interdits spécifiques à l'IA** : mains/doigts mal formés, texte halluciné
dans l'image, logos inventés, visages trop lisses/synthétiques, symétrie
suspecte, plusieurs versions de la même scène trop similaires dans la
bibliothèque (varier composition et cadrage entre générations).

**Modèles de référence** : privilégier un modèle image récent à haute
fidélité (tier Imagen/Flux ou équivalent — voir MEDIA-001A pour le choix de
fournisseur). Toujours enregistrer `metadata.model` et `metadata.prompt_version`
pour traçabilité.

## 4. Ratios et résolutions (rappel MEDIA-001, ne pas dévier)

| media_type | Ratio | Dimension cible | Poids max |
|---|---|---|---|
| hero | 16:9 | 1600×900 px | 500 Ko |
| service_card | 4:3 | 1200×900 px | 300 Ko |
| proof | 4:3 | 1200×900 px | 300 Ko |
| gallery | 4:3 | 1200×900 px | 300 Ko |

Format de publication : WebP, profil sRGB, métadonnées EXIF supprimées.

## 5. Recadrage

- Le sujet principal occupe 40-60% du cadre — ni trop serré (perd le
  contexte), ni trop large (perd l'impact).
- Marge de sécurité de 10% sur les bords pour absorber un recadrage
  responsive sans couper le sujet.
- Horizon toujours droit (tolérance 1-2°) sur les scènes d'extérieur.

## 6. Plans autorisés

- Plan rapproché sur le geste technique (main + outil + matière travaillée).
- Plan large montrant l'artisan dans son environnement de travail.
- Plan sur le résultat/l'équipement installé, sans l'artisan (accepté pour
  `proof`/`gallery`).

## 7. Erreurs interdites (rejet automatique si présentes)

- Watermark, filigrane de banque d'images, ou signature visible.
- Logo de marque commerciale identifiable (fabricant, distributeur) sans
  autorisation documentée — voir BRAND-001.
- Visage reconnaissable d'une personne réelle sans consentement documenté.
- Texte incrusté dans l'image (titres, légendes brûlées dans le pixel).
- Scène domestique ambiguë sans rapport clair avec le métier.
- Résolution en dessous de la dimension cible du `media_type`.
- Format autre que WebP au moment de la publication finale.
- Deux médias quasi identiques (même cadrage, même sujet) approuvés pour
  le même métier — nuit à la variété perçue.

---

Ce guide s'applique à toute nouvelle production. Les 4 médias legacy
(`legacy_unknown`/`pending`) seront évalués contre cette grille lors de leur
audit visuel individuel, pas rétroactivement présumés conformes.
