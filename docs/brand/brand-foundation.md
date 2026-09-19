# Brand Foundation — SUPORDO

Document canonique minimal. Ne recopie pas la stratégie produit complète —
voir `docs/product/supordo-context.md` pour la vision, le marché, le
positionnement et la doctrine commerciale détaillés. Ce document se limite à
figer l'architecture de marque et la séparation marque / produits / tenants,
pour que Claude Code, Lovable ou tout futur agent ne confondent plus ces
niveaux.

## Architecture de marque

```
SUPORDO
├── SUPORDO Sites   (produit actuel, commercialisé, ce repository)
└── SUPORDO CRM     (produit futur, distinct, hors repository)
```

- **SUPORDO** est la marque mère. Elle doit pouvoir porter plusieurs produits
  dans la durée sans devenir synonyme d'un seul d'entre eux ("créateur de
  sites"). Voir `supordo-context.md` §1 et §37 pour le raisonnement complet
  sur l'architecture de marque et les appellations possibles.
- **SUPORDO Sites** est le seul produit réellement construit et disponible
  aujourd'hui — c'est le périmètre exact de ce repository (GitHub, Lovable,
  Supabase propres à ce projet). Voir `supordo-context.md` §5 et §11 pour la
  délimitation précise du pilier.
- **SUPORDO CRM** est un produit futur, techniquement distinct (repository,
  Lovable, Supabase séparés — voir `supordo-context.md` §11). **Il ne doit
  jamais être présenté comme disponible tant qu'il ne l'est pas réellement.**
  C'est une règle de communication, pas seulement une note d'architecture.

## Ce que cette séparation implique pour la communication actuelle

La landing SUPORDO peut et doit vendre principalement **SUPORDO Sites**,
puisque c'est le seul produit livrable aujourd'hui. C'est déjà le cas dans
l'implémentation actuelle : `src/components/marketing/SupordoHeader.tsx`
affiche "Sites" et "CRM" comme deux entrées de navigation, mais seule la
première a vocation à devenir un lien réel à court terme — le code documente
explicitement (commentaire du fichier) que "Sites / CRM / Tarifs /
Ressources" sont rendus en texte simple tant qu'aucune route correspondante
n'existe, pour ne jamais promettre une destination qui n'existe pas. Cette
prudence doit rester le standard : ne jamais faire pointer un CTA marketing
vers une capacité CRM non construite.

## Ce que SUPORDO est / n'est pas

Déjà établi et à ne pas rouvrir sans contradiction majeure démontrée — voir
`supordo-context.md` §34 pour la liste complète (ni CMS généraliste, ni
logiciel comptable complet, ni ERP de grand groupe miniaturisé, ni collection
de fonctionnalités IA, ni marketplace). Ce document ne la recopie pas.

## Séparation marque / produits / tenants

Trois niveaux distincts existent et ne doivent jamais être confondus :

1. **La marque SUPORDO** — l'identité mère, ce que ce document fixe.
2. **Les produits SUPORDO** (Sites aujourd'hui, CRM demain) — chacun a sa
   propre interface produit, sa propre maturité, son propre périmètre
   technique.
3. **Les sites que SUPORDO Sites génère pour ses clients artisans** — chacun
   porte l'identité du client, jamais celle de SUPORDO.

Le détail visuel de cette séparation (ce qui distingue chaque couche à
l'écran) vit dans `docs/brand/visual-direction.md` — ne pas le dupliquer ici.
Les principes de décision transverses (quand appliquer quelle couche) vivent
dans `docs/brand/design-principles.md`.

## Sources de vérité — ne pas dupliquer

- Positionnement, marché, doctrine commerciale, pipeline métier : `docs/product/supordo-context.md`.
- Règles produit/UX générales, Definition of Done, principes 1 à 11 : `docs/product/constitution.md`.
- État d'avancement lot par lot (y compris la landing SUPORDO et ses illustrations métier) : `docs/product/execution-backlog.md`.

## Statut

Architecture figée au sens de ce document. Reste ouvert : le moment et la
forme exacte sous laquelle SUPORDO CRM sera un jour présenté publiquement —
volontairement non tranché ici, voir `visual-direction.md` §"Points laissés
ouverts" et le rapport de la mission ayant produit ce document.
