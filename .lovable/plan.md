## État actuel de `main` (vérifié dans le code)

1. **`<title>` EASYDEP en SSR** ✅ — `src/routes/index.tsx` résout le tenant côté serveur via `getTenantResolutionInput` + `resolveTenantForSsr`, puis `head()` génère le titre via `buildPageTitle(settings, tenant)`. Sur `?tenant=bfie-easydep`, le HTML SSR contient bien le title EASYDEP.
2. **`HowItWorks`** ✅ — importé et rendu dans `src/routes/index.tsx`.
3. **`FaqSection` dépliable** ✅ — importée et rendue, + JSON-LD FAQPage injecté dans `head().scripts`.
4. **`SeoLongText` bas de page** ✅ — importé et rendu entre FAQ et CTA banner.

## Modification à coder — CTA sticky mobile

Objectif : sur mobile uniquement (`md:hidden`), afficher une barre fixe en bas d'écran avec 2 boutons pleine largeur :
- **Gauche** : `tel:{tenant.phone}` — libellé « Appeler ». Masqué si `tenant.phone` est null → dans ce cas, « Devis gratuit » prend toute la largeur.
- **Droite** : lien `/contact` — libellé « Devis gratuit ».

### Fichier modifié : `src/components/public/FloatingCTA.tsx`

Remplacer le bouton téléphone rond flottant par une barre horizontale sticky. On garde le `BookingButton` floating existant (il gère déjà son propre positionnement `variant="floating"` au-dessus).

```tsx
import { Phone } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTenant } from "@/hooks/use-tenant";
import { BookingButton } from "./BookingButton";

export function FloatingCTA() {
  const { tenant } = useTenant();
  const phone = tenant?.phone?.trim();

  return (
    <>
      <BookingButton variant="floating" />
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-border bg-background/95 p-3 shadow-elegant backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
        {phone && (
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground active:scale-95"
            aria-label={`Appeler ${tenant?.company_name ?? ""}`}
          >
            <Phone className="h-4 w-4" />
            Appeler
          </a>
        )}
        <Link
          to="/contact"
          className="flex flex-1 items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground active:scale-95"
        >
          Devis gratuit
        </Link>
      </div>
    </>
  );
}
```

### Considérations
- **Padding-bottom du body** : la barre fait ~64 px. Le footer risque d'être masqué en fin de page. Ajout d'un `pb-20 md:pb-0` sur le wrapper `<div className="flex min-h-screen flex-col">` de `src/routes/index.tsx` — ou plus simple/global : gérer ça uniquement sur les pages publiques via une classe sur le `<main>`. Je propose l'option ciblée sur `index.tsx` d'abord (portée limitée, cohérent avec la demande).
- **BookingButton floating** : reste en place, se superpose au-dessus si activé (déjà géré par son propre offset).
- **Z-index** : `z-40` sous le header sticky (`z-50`).

### Message de commit
```
feat(mobile): add sticky bottom CTA bar (call + quote) on public site
```

Confirme et je passe en build.