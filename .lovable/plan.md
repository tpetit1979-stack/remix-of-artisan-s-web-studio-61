# Bug « • Qualification » sur /?tenant=sasu-energies-d-oc

## Réponse à ta question

Non. La section affiche toujours l'état dégradé. Test réel sur `/?tenant=sasu-energies-d-oc` :

```text
CERTIFICATIONS OFFICIELLES
Artisan certifié RGE

Qualification

logos <img>                        : 0
liens "Voir la qualification..."   : 0
```

Un seul groupe, sans titre, une seule puce « Qualification », aucun logo, aucun lien.

## Les données ne sont pas en cause

La base renvoie bien des lignes complètes et exploitables pour ce tenant (`af0210e9-...`) :

```text
Qualisol Combi                    code 12  logo /logos/qualisol.png  url ok
Ventilation +                     code 71  logo null                 url ok
QualiPAC module Chauffage et ECS  code 43  logo /logos/qualipac.png  url ok
QualiPAC module Chauffage et ECS  code 41  logo /logos/qualipac.png  url ok
QualiPV 36                        code ..  logo ...                  url ok
```

Soit bien 4 groupes distincts après regroupement par `certification_name`, avec `domaine`, `qualification_code`, `logo_url` et `url_qualification` renseignés.

## Cause réelle : deux requêtes différentes partagent la même clé de cache

Deux composants interrogent `tenant_certifications` avec la **même** `queryKey` mais un `select` différent :

- `src/routes/index.tsx`, `RgeCertificationsSection` (ligne 256) :
  `queryKey: ["certifications", tenant?.id]` avec `.select("id").limit(1)`
- `src/components/public/CertificationBadges.tsx` (ligne 60) :
  `queryKey: ["certifications", tenant?.id]` avec `.select("*")`

React Query déduplique sur la clé : la première requête montée gagne, et son résultat est servi aux deux composants. En pratique c'est la version `select("id").limit(1)` qui peuple le cache. `CertificationBadges` reçoit donc **une seule ligne ne contenant que `id`** :

- `certifications.length === 0` est faux, la section s'affiche ;
- `certification_name` est `undefined` → un seul groupe au titre vide ;
- `domaine`, `qualification_name`, `qualification_code` sont `undefined` → le libellé retombe sur le littéral `"Qualification"` (ligne 124) ;
- `logo_url` et `url_qualification` sont `undefined` → ni logo ni lien.

Cela explique très exactement les 4 symptômes observés, y compris le `limit(1)` qui produit un groupe unique.

## Correction proposée

Supprimer la requête redondante plutôt que de renommer les clés : `CertificationBadges` sait déjà se masquer seul (`if (certifications.length === 0) return null;`).

1. Dans `src/routes/index.tsx` : supprimer le composant `RgeCertificationsSection` et sa requête `["certifications", …]`. Déplacer son habillage (`<section className="border-t border-border bg-muted/30 py-16 lg:py-24">` + conteneur `max-w-3xl`) à l'intérieur de `CertificationBadges`, qui devient responsable de son propre rendu et de son propre masquage. La home appelle alors `<CertificationBadges />` directement.
2. Dans `src/components/public/CertificationBadges.tsx` : englober le rendu dans cette `<section>` et conserver le `return null` quand il n'y a aucune certification, afin qu'aucune bande vide n'apparaisse pour les tenants sans RGE.
3. Ne rien changer au `select` du `loader` de `index.tsx` (lignes 34-38) : il n'utilise pas React Query, ne participe pas à la collision, et alimente uniquement le JSON-LD.
4. Aucune modification de la logique de regroupement, de déduplication ou de résolution de tenant.

## Vérification après correction

Sur `/?tenant=sasu-energies-d-oc`, attendre :

- 4 blocs : QualiPAC module Chauffage et ECS, QualiPV 36, Qualisol Combi, Ventilation + ;
- 3 logos affichés, et l'icône bouclier de repli pour « Ventilation + » (`logo_url` est `null` en base) ;
- un lien « Voir la qualification officielle » par qualification ;
- le groupe QualiPAC listant bien ses deux qualifications (codes 41 et 43).

Contrôle de non-régression : sur un tenant sans certification active, aucune section ne doit apparaître.
