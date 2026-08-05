# Entreprise

| Champ | Valeur |
|---|---|
| Propriétaire | Plateforme pour l'identité (nom, slug, domaine) — Tenant pour le contact (téléphone, email, horaires) |
| Écran référent | `admin.settings.tsx` (aujourd'hui, cumulé avec Apparence et SEO) → écran "Mon entreprise" dédié (cible, lot F) |
| Composant référent | Formulaire tenant dans `admin.settings.tsx` — à extraire en composant propre lors du lot F |
| Routes | `/admin/settings` (client) · onglet "Entreprise" de `super-admin.tenants.$tenantId.tsx` (agence, `TenantTab`) → à unifier lot B |
| Permissions | `tenant_admin` : lecture identité, écriture téléphone/email/horaires uniquement (verrouillé au niveau base de données) · `super_admin` : écriture complète |
| IA | Aucune aujourd'hui sur cet écran — le nom/ville/téléphone sont proposés une seule fois, pendant l'onboarding |
| Roadmap | Ajouter horaires et réseaux sociaux (déjà en base, juste sans écran) — voir backlog Pareto |

**Statut** : attend le lot F (séparation) puis le lot B (fusion Admin/Super Admin).
