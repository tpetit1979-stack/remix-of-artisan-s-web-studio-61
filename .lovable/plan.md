## Analyse

La table `tenant_partners` existe déjà (id, tenant_id, name, logo_url, website_url, sort_order, is_active). Je reproduis le pattern déjà éprouvé de la feature "Équipe" (team) : couche data → composant admin partagé → route admin dédiée → onglet super-admin → section publique. Cela garantit cohérence UX et minimise le code neuf.

Le drag & drop pour `sort_order` demande une dépendance (`@dnd-kit/core` + `@dnd-kit/sortable`). Si tu préfères éviter la dépendance, je peux fallback sur des boutons flèches ↑/↓ + input numérique (comme TeamManager aujourd'hui). Par défaut le plan prévoit **@dnd-kit** puisque tu l'as demandé explicitement.

## Fichiers à créer

1. **`src/lib/partners.ts`** — couche data (types + CRUD Supabase), calqué sur `src/lib/team.ts`. Fonctions : `fetchPartners`, `fetchActivePartners`, `insertPartner`, `updatePartner`, `deletePartner`, `reorderPartners` (bulk update sort_order).

2. **`src/components/admin/PartnersManager.tsx`** — composant CRUD partagé (props: `tenantId`), calqué sur `TeamManager.tsx`. Upload logo via `media-upload` (bucket `media`, subFolder `partners`), champs nom + URL, switch actif, drag & drop via @dnd-kit. Réutilisé à l'identique par admin client et super-admin.

3. **`src/components/public/PartnersSection.tsx`** — bannière publique. Requête `fetchActivePartners`. Retourne `null` si liste vide. Logos en `grayscale opacity-70`, `hover:grayscale-0 hover:opacity-100`, transition douce. Layout :
   - ≤ 6 logos : grille statique centrée
   - > 6 logos : marquee CSS auto-scroll infini (pure CSS keyframes, pas de JS)
   - Titre discret "Ils nous font confiance"
   - Chaque logo est un `<a href={website_url} target="_blank" rel="noopener">` si URL fournie, sinon `<div>`

4. **`src/routes/admin.partners.tsx`** — route admin client, mince (identique à `admin.team.tsx`) : `AdminPageHeader` + `<PartnersManager tenantId={tenant.id} />`.

## Fichiers à modifier

5. **`src/components/admin/AdminSidebar.tsx`** — ajouter entrée `{ label: "Partenaires", to: "/admin/partners", icon: Handshake }` (lucide) après "Équipe".

6. **`src/routes/super-admin.tenants.$tenantId.tsx`** — ajouter onglet `TabsTrigger value="partners"` (icône Handshake) + `TabsContent` rendant `<PartnersManager tenantId={tenantId} />`. Insérer entre "team" et "booking".

7. **`src/routes/index.tsx`** — importer `PartnersSection` et l'insérer entre `<FeaturedServices />` et `<HowItWorks />` (position demandée : après services, avant "Comment ça se passe").

## Dépendance à installer

- `@dnd-kit/core` + `@dnd-kit/sortable` (`bun add`). Confirme si tu préfères la version boutons ↑/↓ sans dépendance.

## Points d'attention

- **RLS/GRANTS** : je suppose que la migration qui a créé `tenant_partners` a déjà posé les `GRANT` + policies (INSERT/UPDATE/DELETE scoped par `tenant_id`, SELECT public sur `is_active=true`). Si ce n'est pas le cas les mutations retourneront un permission denied — dis-le moi et je fournis le SQL.
- **Types générés** : `tenant_partners` n'étant probablement pas encore dans `src/integrations/supabase/types.ts`, je passe par un cast `(supabase as any).from("tenant_partners")` comme dans `src/lib/team.ts`.
- **Storage** : réutilise le bucket `media` existant, préfixe `partners/{tenant_id}/{uuid}.{ext}` via `buildMediaPath({ scope: tenantId, kind: "partner", subFolder: "partners", file })`.
- **Cache invalidation** : après mutation j'invalide `["partners", tenantId]` (admin) et `["public-partners", tenantId]` (public), comme pour team.
- **Aucune modification** du SSR loader d'`index.tsx` — les partenaires se chargent client-side (comme la section équipe aujourd'hui). Si tu veux qu'ils soient dans le HTML SSR, dis-le et j'ajoute le fetch au loader.

Confirme (et précise pour @dnd-kit vs boutons ↑/↓) et je code.
