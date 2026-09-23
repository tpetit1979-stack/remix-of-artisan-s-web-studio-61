# Bibliothèque générique multi-tenant — alimentation depuis la photothèque SUPORDO

## Ce que ce document est

La liste exacte des images de la photothèque SUPORDO (lot `generic-library`)
destinées à la table existante `trade_media_library` et au bucket existant
`trade-media`. Aucune table, aucun bucket, aucune colonne nouvelle.

Ce n'est pas un audit éditorial : l'audit est fait, il vit dans le manifeste
du pack (`manifests/media-manifest.csv`).

## La règle qui commande tout

Le manifeste marque les 33 images `can_use_as_customer_project_proof = false`.
Une image générée peut illustrer **une prestation** ou **une entreprise de
démonstration**. Elle ne peut jamais tenir lieu de chantier réalisé pour un
client réel.

Le code applique cette règle à la source : `templateMediaTypesFor()` dans
`src/lib/media-resolver.ts` ne propose plus aucun média de la bibliothèque
aux catégories `portfolio` et `gallery` — les deux emplacements qu'un
visiteur lit comme « nos réalisations ». Un tenant sans photographie de
chantier affiche donc une section vide, et c'est la bonne réponse.

Conséquence pratique : n'insérer dans `trade_media_library` que des
`media_type` `hero` et `service_card`. Un `gallery` ou un `proof` inséré là
ne serait servi nulle part.

## Ce qui reste à faire, et par qui

L'envoi des binaires dans le bucket `trade-media` passe par la policy
`trade_media_super_admin_insert`, réservée au rôle `authenticated` porteur
de `is_super_admin()`. Il se fait donc depuis l'écran Super Admin
« Bibliothèque média », pas depuis un script.

Les fichiers sont dans le pack livré, dossier `generic-library/`. Dix d'entre
eux sont aussi dans le dépôt (`src/assets/marketing/generic-library/`) parce
que la landing les utilise ; ce sont les mêmes binaires, pas des variantes.

## Table d'import

`trade_template_id` est donné par `select id from trade_templates where slug = …`.

| Fichier                                                       | slug métier   | `media_type`   | `alt_text`                                                                         |
| ------------------------------------------------------------- | ------------- | -------------- | ---------------------------------------------------------------------------------- |
| `plumbing-heating-thermodynamic-water-heater-service-01.webp` | `plomberie`   | `service_card` | Un technicien contrôle un chauffe-eau thermodynamique dans un garage domestique.   |
| `roofing-zinc-service-01.webp`                                | `couverture`  | `service_card` | Un couvreur travaille une finition en zinc au bord d'une toiture.                  |
| `roofing-leak-diagnostic-service-01.webp`                     | `couverture`  | `service_card` | Un professionnel inspecte des traces d'humidité sur la charpente dans des combles. |
| `roofing-finished-tile-roof-gallery-01.webp`                  | `couverture`  | `hero`         | Maison résidentielle avec une toiture en tuiles terminée.                          |
| `electrical-ev-charger-service-01.webp`                       | `electricite` | `service_card` | Un électricien contrôle le raccordement d'une borne de recharge résidentielle.     |
| `electrical-panel-service-01.webp`                            | `electricite` | `hero`         | Deux électriciens interviennent sur un tableau électrique résidentiel ouvert.      |
| `electrical-panel-service-02.webp`                            | `electricite` | `service_card` | Deux électriciens travaillent dans une entrée autour d'un tableau électrique.      |
| `electrical-renovation-service-01.webp`                       | `electricite` | `service_card` | Deux électriciens tirent et préparent des câbles dans une maison en rénovation.    |
| `electrical-renovation-service-02.webp`                       | `electricite` | `service_card` | Deux électriciens rénovent le réseau d'un salon en chantier.                       |
| `electrical-panel-finished-gallery-01.webp`                   | `electricite` | `service_card` | Tableau électrique résidentiel terminé dans une entrée lumineuse.                  |
| `electrical-lighting-finished-gallery-01.webp`                | `electricite` | `service_card` | Salon et salle à manger éclairés par plusieurs luminaires résidentiels.            |
| `electrical-company-van-gallery-01.webp`                      | `electricite` | `service_card` | Deux électriciens préparent du câble et des outils à l'arrière d'un fourgon.       |

Les trois fichiers nommés `…-finished-…` et `…-van-…` changent de `media_type`
par rapport à leur nom : le suffixe `gallery` décrit ce que montre l'image,
pas l'emplacement où le produit a le droit de la servir.

Colonnes à renseigner à l'insertion, et elles seules :
`trade_template_id`, `media_type`, `image_path`, `alt_text`, `title`,
`source_type = 'generated'`, `license_code`, `review_status`, `is_active`,
`sort_order`. Les quinze champs du manifeste n'ont pas vocation à devenir
quinze colonnes : le manifeste reste la source d'audit, la table reste un
index de service.

## Ce que ce document ne couvre pas

Les neuf images du lot `demos` ne vont pas dans le bucket. Elles portent une
entreprise fictive nommée — fourgon, signature — et n'ont de sens que sur la
landing, où elles vivent dans `src/assets/marketing/demos/`. Les donner à la
bibliothèque générique les rendrait proposables à un vrai artisan.

Les douze illustrations 3D du lot `brand` non plus : ce sont des assets de
marque SUPORDO, pas des photographies de métier.

## Observation en passant

`trade_templates` contient des doublons apparents (`electricien` et
`electricite`, `plomberie` et `plombier`). L'import doit viser un seul des
deux par métier, sinon la moitié des tenants ne verra rien. Ce n'est pas
traité ici.
