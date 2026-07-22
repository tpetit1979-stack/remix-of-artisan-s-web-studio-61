## Objectif

Appliquer les 4 correctifs identifiés par l'audit Claude Code, dans l'ordre, avec un diff avant chaque commit.

---

### 1. Badge "Service phare" unique — `src/components/public/FeaturedServices.tsx`

État actuel (lignes 80-81, 105-110) : la logique `firstFeaturedIndex = items.findIndex(...)` existe déjà, et le badge est conditionné à `s.is_featured && idx === firstFeaturedIndex`.

**Action :** aligner strictement sur la formulation demandée par Claude (renommer `firstFeaturedIndex` → `featuredIndex`, calculer sur `services` en amont du slice, garder la garde `featuredIndex !== -1`). Comportement identique, code identique à la spec fournie.

Commit : `fix(services): show 'Service phare' badge only on first featured card`

---

### 2. StatsCounter en bande translucide dans le hero — `src/components/public/HeroSection.tsx`

État actuel : `StatsCounter` est déjà appelé avec `variant="hero-band"` en fin de `<section>` du hero (ligne 190), et rend une bande `bg-foreground/40 backdrop-blur-sm py-5` (StatsCounter.tsx ligne 62).

**Action :**
- Ajuster la bande translucide aux specs demandées : `bg-black/20`, `text-white`, `py-2` (au lieu de `bg-foreground/40` et `py-5/6`).
- Ajouter la condition d'affichage globale : la bande ne s'affiche que si au moins une valeur est non nulle parmi `years_experience`, `google_rating`, ou `services.length > 0`. Le filtre `stats.length === 0 → return null` couvre déjà les 3 premières mais pas `google_rating` (absent de stats aujourd'hui). On étend la garde en amont.
- Ne pas toucher à la variante `card` (utilisée nulle part actuellement d'après `index.tsx`) pour éviter les régressions.

Commit : `refactor(hero): tighten translucent stats band styling + visibility guard`

---

### 3. Icônes Lucide par mot-clé sur cards sans image — `src/components/public/FeaturedServices.tsx`

État actuel (lignes 28-58, 152-160) : mapping `TRADE_ICONS` par slug de métier du tenant → une seule icône pour toutes les cards du tenant. Dégradé `from-primary/15 via-primary/5 to-primary/10`.

**Action :**
- Remplacer la logique "icône par métier tenant" par "icône par mot-clé dans `service.name`" (case-insensitive, accents normalisés) selon le mapping exact demandé :
  - `ramon` | `poêle` | `cheminée` → `Flame`
  - `clim` | `climatisation` | `froid` → `Wind`
  - `entretien` | `maintenance` | `sav` → `Wrench`
  - `installation` | `pose` → `Settings`
  - `plomb` | `eau` → `Droplets`
  - `électr` | `elec` → `Zap`
  - défaut → `Wrench` (Lucide n'expose pas `Tool` ; `Wrench` est l'équivalent canonique — je le signale)
- Mettre à jour le dégradé : `from-primary/20 to-primary/5`.
- Supprimer la query `trade-slug` et le mapping `TRADE_ICONS` devenus inutiles dans ce composant (le hero garde sa propre logique).

Commit : `feat(services): keyword-based icon fallback on cards without image`

**Point à confirmer :** OK pour utiliser `Wrench` comme défaut (Lucide n'a pas `Tool`) ?

---

### 4. Micro-interactions cards services — `src/components/public/FeaturedServices.tsx`

État actuel (ligne 101) : `hover:border-primary/30 hover:shadow-elegant`, pas de scale, pas de restriction desktop.

**Action :** ajouter `lg:hover:shadow-md lg:hover:scale-[1.01] transition-transform duration-200` sur la Card, en gardant les hovers existants. Le préfixe `lg:hover:` isole l'effet au desktop pour éviter le "sticky hover" mobile.

Commit : `feat(services): add desktop-only hover micro-interactions on cards`

---

### Vérification

Après chaque étape : `bun run build` doit passer, puis diff présenté avant commit. Points 1, 3 et 4 touchent le même fichier — je les livre en 3 diffs successifs pour respecter la demande "diff avant chaque commit".

### Hors scope

Points 3–7 de l'audit Claude (partners, SeoLongText, HowItWorks, espacement FAQ, hero image placeholder) : non demandés dans ce lot, non traités.
