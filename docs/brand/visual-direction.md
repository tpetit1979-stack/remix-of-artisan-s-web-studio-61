# Visual Direction — SUPORDO Brand / Marketing

Périmètre strict de ce document : la **Couche A** uniquement — `supordo.com`,
la communication SUPORDO, les pages produits SUPORDO, les assets marketing
SUPORDO. Ne concerne ni l'interface produit (Admin/Super Admin/futur CRM), ni
les sites publics des tenants (EASYDEP et les futurs artisans) — voir
`design-principles.md` pour la distinction explicite entre les trois couches.

Ce document documente une direction **déjà implémentée**, vérifiée dans le
code au moment de la rédaction (`80c6fe2bc468b148fa2d362143cd03d6d2fcdb43`,
`origin/main`) — il ne propose rien de nouveau.

## Principe de direction artistique

> **« SUPORDO ne décore pas le réel. Il l'organise. »**

Principe interne de direction artistique, pas nécessairement un slogan
commercial. Il se traduit concrètement dans le code actuel par l'absence
vérifiée de gradient décoratif, de blob, de glassmorphism ou de mockup
incliné dans les trois composants marketing existants (`SupordoHeader.tsx`,
`SupordoHero.tsx`, `SupordoTrades.tsx`) — fonds plats, rayons contrôlés
(`rounded-[6px]`/`rounded-[10px]`, jamais les valeurs par défaut shadcn),
boutons pleins et lisibles avec un seul niveau de hiérarchie visuelle par
écran.

## Typographie

**Manrope.** Chargée dans `src/routes/__root.tsx` (`head()`, via Google
Fonts, poids 400 à 800) et appliquée uniquement à l'intérieur de la classe
`.supordo-brand` (`src/styles.css`) :

```css
.supordo-brand {
  font-family: "Manrope", ui-sans-serif, system-ui, sans-serif;
}
```

Cette classe n'existe que sur les composants marketing (`SupordoLanding` et
ses enfants) — elle ne s'applique jamais à `/admin`, `/super-admin`, ni à un
site tenant, dont la police continue de venir exclusivement de
`TenantTheme.tsx`. C'est le mécanisme technique qui garantit la non-
contamination, pas seulement une convention.

## Palette

Valeurs réellement présentes dans `src/styles.css`, bloc `.supordo-brand`
(vérifiées dans le code, pas recopiées d'une proposition) :

| Token CSS | Valeur | Usage observé dans le code |
|---|---|---|
| `--supordo-green` | `#00875a` | Accent principal, CTA plein, focus ring |
| `--supordo-green-hover` | `#006f4a` | État hover du CTA plein |
| `--supordo-forest` | `#10291c` | Texte de marque (logo, titres) |
| `--supordo-forest-dark` | `#07140d` | Variante foncée, déclarée mais pas encore utilisée dans les 3 composants actuels |
| `--supordo-warm` | `#faf8f4` | Fond de page |
| `--supordo-mint-100` | `#eaf4ee` | Fond de vignette/emplacement image |
| `--supordo-mint-200` | `#cfe8d8` | Bordures |
| `--supordo-graphite` | `#3a403b` | Texte courant (paragraphes, navigation) |

**Écart de nommage à noter** : ce document nomme les tokens exactement comme
le code (`--supordo-forest`, `--supordo-forest-dark`), pas selon une
convention "Forest 900 / Forest 950" — cette convention n'existe pas dans le
code actuel. Voir la section Divergences du rapport de mission associé.

## Composition

Principes observés comme déjà respectés dans l'implémentation actuelle :

- métier et activité réelle comme matière visuelle (section Métiers du
  Hero : dix illustrations métier, jamais une icône ou un pictogramme
  abstrait) ;
- hiérarchie typographique forte (un seul H1 par page, tailles nettement
  différenciées entre titre/sous-titre/corps) ;
- composition structurée (grille à colonnes fixes, `max-w-[1200px]`) ;
- interfaces compréhensibles, faible dépendance aux artifices graphiques ;
- rayons contrôlés et modestes (6 à 10px, jamais les rayons larges par
  défaut de shadcn) ;
- ombres absentes des trois composants actuels — aucune ombre décorative
  observée ;
- boutons francs et lisibles (couleur pleine + libellé explicite, jamais une
  icône seule) ;
- responsive réellement pensé (ordre mobile explicite documenté en
  commentaire dans `SupordoHero.tsx`, rail horizontal avec `snap` sur mobile
  dans `SupordoTrades.tsx`).

## Territoires à éviter

Gradient SaaS décoratif · bleu/violet SaaS automatique · blobs décoratifs ·
glassmorphism gratuit · mockups inclinés génériques · blueprint/dossier
technique utilisé comme gimmick · accumulation de cards shadcn · fausses
statistiques · faux témoignages · fausses preuves · illustration abstraite
lorsqu'un métier réel est plus pertinent.

Constat : aucun de ces éléments n'a été trouvé dans les trois composants
marketing actuels — cette liste est une doctrine à maintenir, pas un
correctif d'un état actuel déficient.

## Photographie et illustration — deux familles distinctes, à ne jamais confondre

**Photographie de marque (Hero)** — `SupordoHero.tsx` réserve un emplacement
image (même ratio, même rayon que l'image finale) explicitement marqué
"Photographie métier SUPORDO — à fournir" dans le code. Aucune photographie
de marque définitive n'existe encore.

**Illustrations métier (section Métiers)** — dix illustrations déjà
intégrées (`src/assets/marketing/trades/*.webp.asset.json`, pointeurs CDN,
aucun binaire dans le repo), pour : chauffagiste, plombier, électricien,
ramoneur/cheminée, climaticien, couvreur, menuisier, maçon, paysagiste,
peintre. Le code les qualifie explicitement d'"assets de marque possédés par
SUPORDO" (commentaire de `SupordoTrades.tsx`) — **jamais un média tenant**.
Statut et historique de ce lot déjà documentés — voir
`docs/product/execution-backlog.md`, sections "Section Métiers — landing
SUPORDO Sites" et "Lot — Illustrations métier SUPORDO" ; ne pas les
redécrire ici.

**Règle non négociable** : ces deux familles d'assets marketing SUPORDO ne
deviennent jamais automatiquement le style ou les images d'un site tenant.
`docs/runtime/media/MEDIA_STYLE_GUIDE_V1.md` reste l'unique doctrine
photographique pour les médias tenants (hero, service_card, portfolio,
proof) — ce document ne le remplace pas et ne le duplique pas. Les vraies
photos de chantier d'un artisan restent prioritaires sur toute illustration,
conformément à ce guide et au resolver média (`src/lib/media-resolver.ts`).

## Points laissés ouverts

- **Nommage LIGNIA résiduel dans `MEDIA_STYLE_GUIDE_V1.md`** : ce guide porte
  encore le nom "LIGNIA" (titre et objectif de reconnaissance de "patte
  LIGNIA") alors que sa doctrine s'applique aujourd'hui à SUPORDO Sites.
  Volontairement **non renommé dans cette mission** : la mission est
  strictement documentaire et limitée à la création des trois documents de
  `docs/brand/`, un renommage de fichier existant en est délibérément exclu
  par prudence — action triviale mais distincte, à faire sur un GO séparé.
- La photographie de marque définitive du Hero reste à produire.
- Les destinations réelles des CTA ("Découvrir SUPORDO Sites", "Voir un
  exemple") et des entrées de navigation (Sites/CRM/Tarifs/Ressources)
  restent à construire — aucune route n'existe encore pour elles.
