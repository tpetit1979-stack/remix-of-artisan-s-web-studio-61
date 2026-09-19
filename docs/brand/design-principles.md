# Design Principles — décisions transverses SUPORDO

Document canonique minimal destiné à guider Claude Code, Lovable ou tout futur
agent lorsqu'une décision visuelle ou d'interface doit être rattachée à la
bonne couche. Référence les documents existants plutôt que de reformuler ce
qu'ils disent déjà.

## Les trois couches — jamais interchangeables

| Couche | Périmètre | Référence de doctrine |
|---|---|---|
| **A — SUPORDO Brand/Marketing** | `supordo.com`, communication SUPORDO, pages produits SUPORDO | `docs/brand/visual-direction.md` |
| **B — SUPORDO Product UI** | Espace SUPORDO Sites (Admin/Super Admin), futur SUPORDO CRM, interfaces opérationnelles | Ce document, section suivante — aucune direction artistique n'existe encore, volontairement |
| **C — Tenant Public Sites** | EASYDEP et tous les futurs sites artisans, sur leurs domaines/sous-domaines | `TenantTheme.tsx` (mécanisme), `docs/runtime/media/MEDIA_STYLE_GUIDE_V1.md` (doctrine photo) |

Une même règle ne s'applique jamais silencieusement à deux couches à la fois.
Un token, un composant ou une doctrine écrite pour une couche ne migre vers
une autre que par une décision explicite, jamais par défaut.

### Couche B — principe, pas direction artistique

Aucune nouvelle direction artistique Product UI n'est actée par ce document.
Principe à retenir : la Product UI appartient à la même famille de marque
SUPORDO que la Couche A, mais privilégie clarté, efficacité, prévisibilité,
lisibilité et densité fonctionnelle maîtrisée plutôt que l'expressivité d'une
landing. Une landing marketing peut être plus expressive qu'une interface
métier quotidienne — ce n'est pas une incohérence, c'est un choix de registre
délibéré selon la fonction de l'écran.

### Couche C — garantie technique de non-contamination

`TenantTheme.tsx` reste la fondation technique de la personnalisation par
tenant (couleur, police, radius, gradient dérivés d'un hex unique par
tenant). Un plombier, un couvreur, un paysagiste ou un chauffagiste doit
pouvoir exprimer sa propre identité — l'identité SUPORDO ne doit jamais la
contaminer automatiquement. Ceci est déjà garanti techniquement, pas
seulement souhaité : les tokens de marque SUPORDO (`--supordo-*`) sont scopés
à la classe `.supordo-brand`, appliquée uniquement aux composants sous
`src/components/marketing/` — aucun tenant, aucune page `/admin` ou
`/super-admin` ne porte cette classe. Les illustrations métier marketing
SUPORDO ne deviennent jamais automatiquement les images publiques d'un
tenant ; le resolver média (`src/lib/media-resolver.ts`) et
`MEDIA_STYLE_GUIDE_V1.md` restent la seule voie pour les photos/réalisations
des artisans.

## shadcn/Radix : fondations, jamais identité

shadcn/ui et Radix sont des fondations techniques et d'accessibilité. Ils ne
constituent l'identité visuelle d'aucune des trois couches, et ne doivent
imposer une esthétique générique ni à SUPORDO ni aux sites tenants. Leurs
primitives sont conservées lorsqu'elles sont pertinentes ; leur expression
(couleur, radius, densité) est personnalisée selon le contexte produit ou
métier qui la justifie. Ce principe a déjà été établi par un audit dédié de
cette même série de missions — non reformulé en détail ici.

## Responsive et accessibilité

- Toute nouvelle surface (Couche A, B ou C) suit le standard déjà en place
  côté tenant : priorité mobile réelle, jamais une version desktop réduite.
- Le focus clavier visible est non négociable — déjà respecté dans les
  composants marketing actuels (`focus-visible:outline-2` systématique dans
  `SupordoHeader.tsx`/`SupordoHero.tsx`).
- Le contraste des nouveaux tokens de couleur (Couche A) doit être vérifié
  au seuil WCAG AA avant tout usage en texte — **non encore formellement
  vérifié** sur la palette `--supordo-*` actuelle ; à faire séparément, ce
  document n'en tient pas lieu.

## Authenticité des données et des preuves

Principe transverse aux trois couches, déjà en vigueur et à ne jamais
affaiblir : une preuve affichée doit être réelle ou explicitement présentée
comme non vérifiée — jamais une illustration générique présentée comme un
fait, jamais un chiffre inventé. Déjà en place côté tenant via
`src/lib/commercial-promises.ts` et la distinction `portfolio.content_kind`
(`illustration` / `real_project`). S'applique de la même façon à toute future
communication SUPORDO elle-même (Couche A) : pas de faux témoignage, pas de
fausse statistique, conformément aux territoires à éviter de
`visual-direction.md`.

## Standardiser le fonctionnement, personnaliser la perception

Doctrine issue de l'audit multi-métier de cette même série de missions.
`TenantTheme.tsx`, `media-resolver.ts`, `trade-wording.ts` et la logique de
certifications sont de bonnes fondations : **elles doivent être étendues à
terme, pas reconstruites.**

**Doctrine Pareto à respecter pour toute évolution future de la Couche C** :
chercher d'abord quelques variations visuelles gouvernées et réellement
utiles plutôt qu'un moteur combinatoire universel. Une variation doit
répondre à un besoin métier ou commercial réel, jamais produire
artificiellement des sites différents pour la seule différence.

**Rappel explicite — ce qui reste à l'état d'hypothèse, jamais de décision** :
les pistes suivantes, issues de l'audit multi-métier, ne sont pas actées et
ne doivent pas être traitées comme telles par un futur agent : 8 variantes de
hero, `secondary_color`, `heading_font_family`, `button_style`, `card_style`,
`image_style`, `section_shape`, `hero_variant`, `density_level`,
`animation_level`, `icon_style`, `trust_badge_style`, la saisonnalité, le
profil client, un moteur automatique de sélection de layout. Aucune de ces
pistes n'implique de migration Supabase, de nouveau composant ou de
modification de `site_settings` tant qu'elle n'a pas fait l'objet d'un GO
explicite et séparé.

## Principes produit/UX déjà actés — référencés, non reformulés

Voir `docs/product/constitution.md` §32 pour les principes UX déjà établis
(le métier avant le logiciel, le fréquent doit être évident, mobile
réellement utilisable, progressive disclosure, un seul endroit évident par
action). Ces principes s'appliquent aux trois couches sans exception et ne
sont pas reformulés ici.

## Statut

Document de principes décisionnels, pas de spécification visuelle. Toute
contradiction future entre ce document, `visual-direction.md`,
`brand-foundation.md` et le code doit être signalée avant d'être résolue
silencieusement — même règle que pour tout audit de ce produit.
