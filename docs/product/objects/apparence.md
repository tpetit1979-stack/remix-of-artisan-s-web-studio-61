# Apparence

| Champ | Valeur |
|---|---|
| Propriétaire | Plateforme pour le logo (verrouillé à l'écran, message explicite au client) — hybride pour les couleurs (dérivées du logo par l'IA, puis appliquées librement par le tenant) — Tenant pour le hero et le CTA |
| Écran référent | `admin.settings.tsx` (aujourd'hui, cumulé avec Entreprise et SEO) → écran "Apparence" dédié (cible, lot F) |
| Composant référent | Section design de `admin.settings.tsx`, `LogoAnalyzer` pour l'analyse IA du logo |
| Routes | `/admin/settings` (client) · onglet "Design" de `super-admin.tenants.$tenantId.tsx` (agence, `SettingsTab`) → à unifier lot B |
| Permissions | `tenant_admin` : écriture couleurs/hero/CTA, logo affiché en lecture seule avec message "géré par votre agence" · `super_admin` : écriture complète y compris logo |
| IA | `LogoAnalyzer` propose une palette dérivée du logo (couleur, dégradé, police, style d'en-tête) que le client applique ou ajuste |
| Roadmap | Faire du verrou du logo une règle au niveau de la donnée (comme le nom légal et le domaine), pas seulement de cet écran |

**Statut** : attend le lot F (séparation) puis le lot B.
