# SEO

| Champ | Valeur |
|---|---|
| Propriétaire | Tenant — entièrement libre, sans validation agence (décision assumée : une exception de gouvernance coûterait plus cher qu'elle ne protège) |
| Écran référent | Noyé dans `admin.settings.tsx` aujourd'hui → écran "SEO" dédié avec aperçu du résultat de recherche (cible, lot F) |
| Composant référent | Champs `seo_meta_title` / `seo_meta_description` dans `admin.settings.tsx` — à extraire lors du lot F |
| Routes | `/admin/settings` (client) · pas d'onglet dédié côté agence aujourd'hui (noyé dans "Design") |
| Permissions | `tenant_admin` : écriture complète · `super_admin` : écriture complète |
| IA | Générés une première fois pendant l'onboarding (étape "Génération IA") — pas de régénération à la demande aujourd'hui |
| Roadmap | Ajouter un bouton "régénérer par IA" sur l'écran dédié plutôt que de laisser un champ vide à remplir soi-même (principe 6) |

**Statut** : attend le lot F. Descendu de P0 à P1 dans la roadmap — l'IA couvre déjà
l'essentiel à la création, l'écran dédié améliore l'usage courant sans être urgent.
