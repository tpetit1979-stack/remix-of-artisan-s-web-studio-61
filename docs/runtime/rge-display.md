# Affichage public des certifications RGE

Référence pour `src/components/public/CertificationBadges.tsx`.

## Champs autorisés à l'affichage

Sur `tenant_certifications`, seuls `domaine` et `certification_name` sont
rendus publiquement. `qualification_name` et `qualification_code` ne le sont
jamais.

- `qualification_name` provient du champ `nom_qualification` récupéré lors de
  l'import RGE. Des pertes d'accents ont été constatées dans les données
  stockées et affichées (`gnrateur`, `rseau`, `pole`). Leur origine exacte
  — source distante ou chaîne d'import — n'est pas encore localisée.
- `qualification_code` est une référence technique de qualification
  (par exemple `23`), utile à la traçabilité mais peu compréhensible pour un
  visiteur du site.
- `domaine` et `certification_name` n'ont montré aucune corruption dans les
  données inspectées. Ce sont les champs retenus pour le rendu public.

## Pourquoi `certification_name` est toujours affiché

Deux qualifications distinctes d'une même famille peuvent partager le même
`domaine`. Par exemple, `Qualisol CESI` et `Qualisol Combi` ont toutes deux
le domaine `Chauffage et/ou eau chaude solaire`.

Sans `certification_name` en complément, ces qualifications apparaîtraient
comme deux lignes identiques.

## Cas où `domaine` est absent

Le composant utilise le titre de famille fourni par
`getRgeFamilyDescriptor` dans `src/lib/rge-labels.ts`.

Il ne revient jamais au texte brut de `qualification_name` ni au
`qualification_code`.

## Incohérence de donnée observée, origine non confirmée

Au moins une ligne stockée a `certification_name = "Qualibois Eau"` alors que
son `qualification_name` décrit un appareil « indépendant ». Cette combinaison
paraît incohérente avec la distinction habituelle entre les modules Air et Eau.

L'origine de cette incohérence — source ADEME/Qualit'EnR ou chaîne d'import —
n'a pas encore été vérifiée.

Elle n'a toutefois pas d'impact sur ce composant : le rendu public regroupe
Air et Eau sous la famille générale « Chauffage au bois » et conserve le
`domaine` comme libellé principal.
